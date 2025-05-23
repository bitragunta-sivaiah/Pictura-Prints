import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import Order from '../models/orderModel.js';

const router = express.Router();

router.post('/orders/:orderId/return', protect, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found.' });
        if (order.user.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized for this order.' });
        if (!['delivered', 'completed'].includes(order.status)) return res.status(400).json({ message: 'Only delivered or completed orders can be returned.' });
        if (order.isReturnRequested) return res.status(400).json({ message: 'Return for this order has already been requested.' });

        const { reason, returnItems } = req.body;
        if (!reason) return res.status(400).json({ message: 'Return reason is required.' });
        if (!returnItems || !Array.isArray(returnItems) || returnItems.length === 0) return res.status(400).json({ message: 'At least one item must be specified for return.' });

        const orderProductIds = order.items.map(item => item.product.toString());
        for (const rItem of returnItems) {
            if (!orderProductIds.includes(rItem.product.toString())) {
                return res.status(400).json({ message: `Returned item with ID ${rItem.product} is not part of this order.` });
            }
            const originalItem = order.items.find(item => item.product.toString() === rItem.product.toString());
            if (originalItem && rItem.quantity > originalItem.quantity) {
                return res.status(400).json({ message: `Return quantity for product ${rItem.product} exceeds original purchased quantity.` });
            }
        }

        order.isReturnRequested = true;
        order.returnRequestDate = new Date();
        order.returnStatus = 'pending';
        order.returnReason = reason;
        order.returnedItems = returnItems;

        order.status = 'return_requested';

        order.trackingDetails.push({
            status: 'return_requested',
            date: new Date(),
            location: 'Customer Request',
            notes: `Return requested. Reason: ${reason}`
        });

        order.returnTrackingDetails.push({
            status: 'return_requested',
            date: new Date(),
            location: 'Customer initiated',
            notes: `Reason: ${reason}`
        });

        const updatedOrder = await order.save();
        res.status(200).json({ message: 'Return request submitted successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error requesting return:', error);
        res.status(500).json({ message: 'Failed to submit return request.', error: error.message });
    }
});

router.get('/admin/returns', protect, admin, async (req, res) => {
    try {
        const returns = await Order.find({ isReturnRequested: true })
            .populate('user', 'username email')
            .populate('shippingAddress')
            .populate('billingAddress')
            .populate('items.product')
            .populate('coupon')
            .populate('branchStation')
            .populate('trackingDetails')
            .populate('returnTrackingDetails')
            .populate('returnedItems.product');

        res.status(200).json(returns);
    } catch (error) {
        console.error('Error fetching returns:', error);
        res.status(500).json({ message: 'Failed to fetch return requests.', error: error.message });
    }
});

router.get('/admin/returns/:orderId', protect, admin, async (req, res) => {
    try {
        const returnOrder = await Order.findById(req.params.orderId)
            .populate('user', 'username email')
            .populate('shippingAddress')
            .populate('billingAddress')
            .populate('items.product')
            .populate('coupon')
            .populate('branchStation')
            .populate('trackingDetails')
            .populate('returnTrackingDetails')
            .populate('returnedItems.product');

        if (!returnOrder || !returnOrder.isReturnRequested) {
            return res.status(404).json({ message: 'Return request not found.' });
        }
        res.status(200).json(returnOrder);
    } catch (error) {
        console.error('Error fetching return details:', error);
        res.status(500).json({ message: 'Failed to fetch return request details.', error: error.message });
    }
});

router.put('/admin/returns/:orderId/status', protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order || !order.isReturnRequested) {
            return res.status(404).json({ message: 'Return request not found.' });
        }

        const {
            returnStatus,
            returnTrackingNumber,
            returnLabelImageUrl,
            trackingEventStatus,
            trackingEventLocation,
            trackingEventNotes,
            returnedItemsUpdate
        } = req.body;

        let statusChanged = false;
        if (returnStatus && order.returnStatus !== returnStatus) {
            order.returnStatus = returnStatus;
            statusChanged = true;

            if (['pending_pickup', 'picked_up', 'in_transit', 'returned_to_branch', 'return_processing'].includes(returnStatus)) {
                order.status = returnStatus;
            } else if (returnStatus === 'refunded' || returnStatus === 'exchanged' || returnStatus === 'closed') {
                order.status = 'return_completed';
            } else if (returnStatus === 'rejected') {
                 order.status = 'delivered';
            }
        }

        if (returnTrackingNumber) {
            order.returnTrackingNumber = returnTrackingNumber;
        }
        if (returnLabelImageUrl) {
            order.returnLabelImageUrl = returnLabelImageUrl;
        }

        if (trackingEventStatus) {
            order.returnTrackingDetails.push({
                status: trackingEventStatus,
                date: new Date(),
                location: trackingEventLocation || 'Unknown',
                notes: trackingEventNotes || ''
            });
        } else if (statusChanged) {
            order.returnTrackingDetails.push({
                status: order.returnStatus,
                date: new Date(),
                location: 'Admin Update',
                notes: `Updated by ${req.user.username || 'Admin'}`
            });
        }

        if (returnedItemsUpdate && Array.isArray(returnedItemsUpdate)) {
            for (const update of returnedItemsUpdate) {
                const itemToUpdate = order.returnedItems.find(
                    ri => ri.product.toString() === update.product.toString()
                );
                if (itemToUpdate) {
                    if (update.condition) itemToUpdate.condition = update.condition;
                }
            }
        }

        const updatedOrder = await order.save();
        res.status(200).json({ message: 'Return status and tracking updated successfully', order: updatedOrder });
    } catch (error) {
        console.error('Error updating return status:', error);
        res.status(500).json({ message: 'Failed to update return status.', error: error.message });
    }
});

router.put('/admin/returns/:orderId/approval', protect, admin, async (req, res) => {
    try {
        const returnOrder = await Order.findById(req.params.orderId);
        if (!returnOrder || !returnOrder.isReturnRequested) {
            return res.status(404).json({ message: 'Return request not found.' });
        }

        const { isApproved } = req.body;
        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({ message: 'Invalid approval status. Must be true or false.' });
        }

        let newReturnStatus;
        let notes = '';

        if (isApproved === true) {
            newReturnStatus = 'approved';
            notes = 'Return request approved by admin.';
        } else {
            newReturnStatus = 'rejected';
            notes = 'Return request rejected by admin.';
        }

        if (returnOrder.returnStatus !== newReturnStatus) {
            returnOrder.returnStatus = newReturnStatus;
            
            if (newReturnStatus === 'approved') {
                returnOrder.status = 'return_requested';
            } else if (newReturnStatus === 'rejected') {
                returnOrder.status = 'delivered';
            }

            returnOrder.returnTrackingDetails.push({
                status: newReturnStatus.charAt(0).toUpperCase() + newReturnStatus.slice(1) + ' by Admin',
                date: new Date(),
                location: 'Admin Panel',
                notes: notes
            });
             returnOrder.trackingDetails.push({
                status: newReturnStatus,
                date: new Date(),
                location: 'Admin Panel',
                notes: notes
            });
        } else {
            return res.status(400).json({ message: `Return is already ${newReturnStatus}.` });
        }

        await returnOrder.save();
        res.status(200).json({ message: 'Return approval status updated.', orderId: returnOrder._id, returnStatus: returnOrder.returnStatus });
    } catch (error) {
        console.error('Error updating return approval:', error);
        res.status(500).json({ message: 'Failed to update return approval status.', error: error.message });
    }
});

router.put('/admin/returns/:orderId/refund', protect, admin, async (req, res) => {
    try {
        const returnOrder = await Order.findById(req.params.orderId);
        if (!returnOrder || !returnOrder.isReturnRequested) {
            return res.status(404).json({ message: 'Return request not found.' });
        }

        if (![ 'return_processing'].includes(returnOrder.returnStatus)) {
            return res.status(400).json({ message: 'Refund can only be initiated for returns that have reached the warehouse or are being processed.' });
        }

        const { refundStatus, refundAmount, refundReason, refundTransactionId } = req.body;

        if (refundStatus && returnOrder.refundStatus !== refundStatus) {
            returnOrder.refundStatus = refundStatus;
            returnOrder.returnTrackingDetails.push({
                status:  refundStatus,
                date: new Date(),
                location: 'Admin Panel',
                notes: `Refund updated by ${req.user.username || 'Admin'}`
            });
             returnOrder.trackingDetails.push({
                status:  refundStatus,
                date: new Date(),
                location: 'Admin Panel',
                notes: `Refund updated by ${req.user.username || 'Admin'}`
            });
        }

        if (refundAmount !== undefined) {
            returnOrder.refundAmount = refundAmount;
        }
        if (refundReason) {
            returnOrder.refundReason = refundReason;
        }
        if (refundTransactionId) {
            returnOrder.refundTransactionId = refundTransactionId;
        }

        if (refundStatus === 'initiated' && !returnOrder.refundInitiationDate) {
            returnOrder.refundInitiationDate = new Date();
        }
        if (refundStatus === 'processed' && !returnOrder.refundProcessedDate) {
            returnOrder.refundProcessedDate = new Date();
            returnOrder.paymentStatus = 'refunded';
            returnOrder.status = 'refunded';
        } else if (refundStatus === 'failed') {
             returnOrder.paymentStatus = 'failed';
        }

        await returnOrder.save();
        res.status(200).json({ message: 'Refund details updated.', orderId: returnOrder._id, refundStatus: returnOrder.refundStatus, refundAmount: returnOrder.refundAmount });
    } catch (error) {
        console.error('Error updating refund details:', error);
        res.status(500).json({ message: 'Failed to update refund details.', error: error.message });
    }
});

export default router;