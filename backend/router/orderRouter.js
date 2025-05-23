import express from 'express';
const router = express.Router();
import { protect, admin } from '../middleware/authMiddleware.js';
import Order from '../models/orderModel.js';
import paypal from 'paypal-rest-sdk';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

// Configure PayPal
paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET,
});

// Helper function to generate a unique order number
const generateOrderNumber = () => {
 return `ORDER-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
};

// @desc     Create new order and initiate payment (excluding Stripe)
// @route    POST /api/orders
// @access   Private
router.post('/', protect, async (req, res) => {
    try {
        const {
            items,
            shippingAddress,
            billingAddress,
            paymentMethod,
            coupon,
            discountAmount,
            shippingCost,
            orderNotes,
            shippingMethod: requestedShippingMethod, // Rename to avoid conflict
        } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No order items' });
        }
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address is required' });
        }
        if (!billingAddress) {
            return res.status(400).json({ message: 'Billing address is required' });
        }
        if (!['cod', 'paypal', 'other'].includes(paymentMethod)) {
            return res.status(400).json({ message: 'Invalid payment method' });
        }

        const orderItems = items.map(item => ({
            product: item.product,
            quantity: item.quantity,
            basePrice: item.basePrice,
            color: item.color,
            size: item.size,
            customizations: item.customizations || [],
            finalPrice: item.finalPrice,
        }));

        const subtotal = orderItems.reduce((acc, item) => acc + item.finalPrice * item.quantity, 0);
        const tax = 0; // Implement tax calculation if needed
        const total = parseFloat((subtotal + (shippingCost || 0) - (discountAmount || 0) + tax).toFixed(2));
        const orderNumber = generateOrderNumber();

        const newOrder = new Order({
            user: req.user._id,
            orderNumber,
            items: orderItems,
            shippingAddress,
            billingAddress,
            shippingMethod: requestedShippingMethod,
            shippingCost: shippingCost || 0,
            paymentMethod,
            subtotal,
            tax,
            total,
            coupon: coupon || null,
            discountAmount: discountAmount || 0,
            orderNotes: orderNotes || '',
            trackingDetails: [{ status: 'pending', date: new Date() }], // Initialize tracking with 'pending' status
        });

        if (paymentMethod === 'cod') {
            newOrder.paymentStatus = 'pending';
            newOrder.status='confirm'
             newOrder.trackingDetails.push({
        status: 'confirm',
        date: new Date(),
         
    });

            const createdOrder = await newOrder.save();
            return res.status(201).json(createdOrder);
        } else if (paymentMethod === 'paypal') {
            // PayPal payment initiation logic (as before)
            const create_payment_json = {
                intent: 'sale',
                payer: { payment_method: 'paypal' },
                redirect_urls: {
                    return_url: `${process.env.CLIENT}/paypal/success?orderId=${newOrder._id}`,
                    cancel_url: `${process.env.CLIENT}/checkout/cancel`
                },
                transactions: [{
                    item_list: {
                        items: orderItems.map(item => ({
                            name: item.product?.name?.substring(0, 127) || 'Product Name N/A',
                            sku: item.product?._id?.toString().substring(0, 127) || 'SKU N/A',
                            price: parseFloat(item.finalPrice).toFixed(2),
                            currency: 'USD',
                            quantity: item.quantity,
                        })),
                    },
                    amount: {
                        currency: 'USD',
                        total: parseFloat(total).toFixed(2),
                    },
                    description: `Order #${orderNumber} for user ${req.user._id}`,
                }],
            };

            console.log('Creating PayPal payment request:', JSON.stringify(create_payment_json, null, 2));

            paypal.payment.create(create_payment_json, async (error, payment) => {
                if (error) {
                    console.error('PayPal API Error:', error);
                    return res.status(500).json({ message: 'Error creating PayPal payment', error: error.message, details: error.response });
                } else {
                    newOrder.paymentStatus = 'pending';
                    newOrder.transactionId = payment.id;
                    const createdOrder = await newOrder.save();
                    const approveUrl = payment.links.find(link => link.rel === "approval_url")?.href;

                    if (approveUrl) {
                        res.status(201).json({ message: 'PayPal payment initiated', approveUrl, orderId: createdOrder._id });
                    } else {
                        console.error('Error finding approval URL from PayPal response:', payment);
                        return res.status(500).json({ message: 'Error getting PayPal approval URL', details: payment });
                    }
                }
            });
        } else {
            // Handle other payment methods (as before)
            newOrder.paymentStatus = 'pending';
            newOrder.status = 'processing';
            const createdOrder = await newOrder.save();
            return res.status(201).json(createdOrder);
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: error.message });
    }
});

// @desc     Capture PayPal payment and update order status
// @route    GET /api/orders/paypal/capture
// @access   Private
router.get('/paypal/capture', protect, async (req, res) => {
    const { paymentId, PayerID, orderId } = req.query;

    if (!paymentId || !PayerID || !orderId) {
        return res.status(400).json({ message: 'Missing paymentId, PayerID, or orderId' });
    }

    try {
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const execute_payment_json = {
            payer_id: PayerID,
            transactions: [{
                amount: { currency: 'USD', total: order.total.toFixed(2) },
            }],
        };

        paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
            if (error) {
                console.error('PayPal Execute Payment Error:', error);
                return res.status(500).json({ message: 'Error executing PayPal payment', error: error.message });
            } else {
                if (payment.state === 'approved') {
                    order.paymentStatus = 'Paid';
                    order.status = 'confirm';
                    order.trackingDetails.push({ status: 'confirm', date: new Date() }); // Add 'processing' to tracking
                    order.transactionId = payment.id;
                    await order.save();
                    res.json({ message: 'Payment successful', order });
                } else {
                    console.error('PayPal Payment Not Approved:', payment);
                    return res.status(400).json({ message: 'PayPal payment not approved', details: payment });
                }
            }
        });
    } catch (error) {
        console.error('Error capturing PayPal payment:', error);
        res.status(500).json({ message: 'Error capturing PayPal payment', error: error.message });
    }
});

// @desc     Get logged in user's orders
// @route    GET /api/orders/myorders
// @access   Private
router.get('/myorders', protect, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.product')
            .populate('shippingAddress')
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ message: 'Error fetching user orders', error: error.message });
    }
});

// @desc     Get order by ID
// @route    GET /api/orders/:id
// @access   Private
router.get('/:id', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'username email')
            .populate('shippingAddress')
            .populate('billingAddress')
            .populate('items.product')
            .populate('coupon')
            .populate('branchStation')
            .populate('trackingDetails')
            .populate('deliveryPartner')


        if (order && order.user.equals(req.user._id)) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found or unauthorized' });
        }
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: 'Error fetching order', error: error.message });
    }
});

// @desc     Get all orders (Admin only)
// @route    GET /api/orders
// @access   Private/Admin
router.get('/', protect, async (req, res) => {
    try {
        const orders = await Order.find({})
            .populate('user', 'username email')
            .populate('shippingAddress')
            .populate('billingAddress')
            .populate('items.product')
            .populate('coupon')
            .populate('branchStation')
            .populate('trackingDetails') // Include trackingDetails for admin view
            .sort({ orderDate: -1 });
        res.json(orders);
    } catch (error) {
        console.error('Error fetching all orders:', error);
        res.status(500).json({ message: 'Error fetching all orders', error: error.message });
    }
});

// @desc     Update order status (Admin only)
// @route    PATCH /api/orders/:id/status
// @access   Private/Admin
router.patch('/:id/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            order.trackingDetails.push({ status: req.body.status || order.status, date: new Date() }); // Add status to tracking
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Error updating order status', error: error.message });
    }
});

// @desc     Update order's delivery partner (Admin only)
// @route    PATCH /api/orders/:id/deliverypartner
// @access   Private/Admin
router.patch('/:id/deliverypartner', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.deliveryPartner = req.body.deliveryPartner || order.deliveryPartner;
            order.deliveryPartnerStatus = req.body.deliveryPartnerStatus || order.deliveryPartnerStatus;
            order.assignedToDeliveryPartnerBy = req.user._id;
            // Optionally add a tracking detail for assignment
            if (req.body.deliveryPartnerStatus === 'assigned') {
                order.trackingDetails.push({ status: 'assigned', date: new Date(), location: 'Admin Assignment' });
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating delivery partner:', error);
        res.status(500).json({ message: 'Error updating delivery partner', error: error.message });
    }
});

// @desc     Update order's tracking information (Admin or Delivery Partner)
// @route    PATCH /api/orders/:id/tracking
// @access   Private
router.patch('/:id/tracking', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            if (req.body.trackingNumber) {
                order.trackingNumber = req.body.trackingNumber;
            }
            // If a new tracking detail is provided, add it to the array
            if (req.body.status) {
                order.trackingDetails.push({
                    status: req.body.status,
                    date: new Date(),
                    location: req.body.location // Optional location
                });
                order.status = req.body.status; // Optionally update the main status as well
            }
            if (req.body.deliveryPartnerStatus) {
                order.deliveryPartnerStatus = req.body.deliveryPartnerStatus;
                // Optionally add a tracking detail for delivery partner status update
                order.trackingDetails.push({
                    status: req.body.deliveryPartnerStatus,
                    date: new Date(),
                    location: 'Delivery Partner Update' // Or get location if available
                });
            }
            if (req.body.deliveryPartnerTrackingId) {
                order.deliveryPartnerTrackingId = req.body.deliveryPartnerTrackingId;
            }
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error updating tracking information:', error);
        res.status(500).json({ message: 'Error updating tracking information', error: error.message });
    }
});

// @desc     Delete order (Admin only)
// @route    DELETE /api/orders/:id
// @access   Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            await order.deleteOne();
            res.json({ message: 'Order deleted successfully' });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ message: 'Error deleting order', error: error.message });
    }
});


router.patch('/:id/cancel', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Only allow cancellation if the order is in a 'pending', 'processing', or 'confirm' state
        const allowedStatusesForCancellation = ['pending', 'processing', 'confirm'];
        if (!allowedStatusesForCancellation.includes(order.status)) {
            return res.status(400).json({ message: `Order cannot be cancelled in '${order.status}' status.` });
        }

        // Ensure only the order creator or an admin can cancel
        if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to cancel this order' });
        }

        order.status = 'cancelled';
        order.paymentStatus = 'refunded'; // Assuming cancellation implies a refund if paid
        order.refundStatus = 'processed'; // Mark refund as processed immediately for cancellation
        order.refundProcessedDate = new Date();
        order.trackingDetails.push({ status: 'cancelled', date: new Date(), notes: 'Order cancelled by user/admin.' });

        const updatedOrder = await order.save();
        res.json({ message: 'Order cancelled successfully', order: updatedOrder });

    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Error cancelling order', error: error.message });
    }
});

export default router;