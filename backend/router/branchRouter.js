import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { BranchStation } from '../models/BranchStation.js';
import User from '../models/userModel.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Get the branch station managed by the current branch manager
router.get('/managed', protect, asyncHandler(async (req, res) => {
    // Ensure the user is a branch manager and their manager application is approved
    if (req.user.role !== 'branchManager' || req.user.managerApplication?.status !== 'approved') {
        return res.status(403).json({ message: 'Access Denied: You are not an approved branch manager.' });
    }

    // Find the BranchStation where the current user is the manager
    const branchStation = await BranchStation.findOne({ manager: req.user._id })
        .populate('manager') // Populate manager details (username, email)
        .populate({
            path: 'orders', // Populate all orders linked to this branch
            select: '_id customerName totalAmount status' // Select relevant order fields for table display
        })
        .populate({
            path: 'deliveryPartners', // Populate delivery partners linked to this branch
            select: 'username email deliveryPartnerDetails.availability deliveryPartnerDetails.currentOrders deliveryPartnerDetails.earnings deliveryPartnerDetails.totalDeliveries deliveryPartnerDetails.approvalStatus deliveryPartnerDetails.preferredDeliveryRadius deliveryPartnerDetails.workingHours deliveryPartnerDetails.rating deliveryPartnerDetails.totalEarnings deliveryPartnerDetails.vehicleType', // Select specific delivery partner details
            match: { 'deliveryPartnerDetails.approvalStatus': 'approved' } // Only include approved delivery partners
        });

    if (!branchStation) {
        // If no branch is found for the manager, it could be an issue with data setup
        return res.status(404).json({ message: 'No branch station found managed by this user.' });
    }

    // You might want to filter active orders and calculate revenue here or in the client
    // For simplicity, let's include basic aggregated data that can be computed on the server
    const allOrders = branchStation.orders || [];
    const activeOrders = allOrders.filter(order =>
        order.status === 'pending' || order.status === 'assigned' || order.status === 'processing'
    );

    // Calculate total revenue from all orders
    const totalRevenue = allOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Example for monthly revenue (you'll need to adjust this based on your Order schema's creation date)
    const monthlyRevenue = {};
    allOrders.forEach(order => {
        if (order.createdAt) { // Assuming order has a createdAt timestamp
            const month = new Date(order.createdAt).toLocaleString('en-US', { month: 'long', year: 'numeric' });
            monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (order.totalAmount || 0);
        }
    });

    const revenueChartData = Object.keys(monthlyRevenue).map(month => ({
        month: month,
        amount: monthlyRevenue[month]
    }));

    // Ensure the 'deliveryPartners' field on the returned branchStation only contains approved DPs
    // and that their availability is extracted correctly.
    const approvedDeliveryPartners = branchStation.deliveryPartners.map(dp => ({
        _id: dp._id,
        username: dp.username,
        email: dp.email,
        availability: dp.deliveryPartnerDetails?.availability,
        currentOrders: dp.deliveryPartnerDetails?.currentOrders?.length || 0,
        earnings: dp.deliveryPartnerDetails?.earnings || 0,
        totalEarnings: dp.deliveryPartnerDetails?.totalEarnings || 0,
        totalDeliveries: dp.deliveryPartnerDetails?.totalDeliveries || 0,
        approvalStatus: dp.deliveryPartnerDetails?.approvalStatus,
        preferredDeliveryRadius: dp.deliveryPartnerDetails?.preferredDeliveryRadius,
        workingHours: dp.deliveryPartnerDetails?.workingHours,
        rating: dp.deliveryPartnerDetails?.rating,
        vehicleType: dp.deliveryPartnerDetails?.vehicleType
    }));


    res.status(200).json({
        success: true,
        data: {
            ...branchStation.toObject(), // Convert mongoose document to plain object
            orders: allOrders,
            activeOrders: activeOrders,
            deliveryPartners: approvedDeliveryPartners,
            revenue: {
                total: totalRevenue,
                monthly: revenueChartData
            },
            // Include manager application status from the user model as it's the source of truth for the manager's role
            managerApplication: req.user.managerApplication // This is the user's application status
        }
    });
}));

// Get a single branch station by ID
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const branchStation = await BranchStation.findById(req.params.id)
        .populate('manager', 'username email')
        .populate('orders')
        .populate('deliveryPartners', 'username email');
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }
    if (
        req.user.role === 'admin' ||
        (req.user.role === 'branchManager' && branchStation.manager?.toString() === req.user._id.toString())
    ) {
        res.status(200).json({ success: true, data: branchStation });
    } 
}));

// User applies to become a branch manager for a specific branch
router.post('/:id/apply-manager', protect, asyncHandler(async (req, res) => {
    const branchStation = await BranchStation.findById(req.params.id);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
        return res.status(404).json({ message: 'User not found.' });
    }
    if (branchStation.managerApplication?.user?.toString() === req.user._id.toString()) {
        return res.status(400).json({ message: 'You have already applied to become a manager for this branch.' });
    }
    const applicationData = { user: req.user._id, status: 'pending', applicationDate: new Date(), reason: req.body.reason, documents: req.body.documents || [] };
    branchStation.managerApplication = applicationData;
    await branchStation.save();
    user.managerApplication = { branchStation: req.params.id, status: 'pending', applicationDate: new Date(), reason: req.body.reason, documents: req.body.documents || [] };
    await user.save();
    res.status(200).json({ success: true, message: 'Application submitted successfully' });
}));



// Get all orders for a specific branch station
router.get('/:id/orders', protect, asyncHandler(async (req, res) => {
    const branchStationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(branchStationId)) {
        return res.status(400).json({ message: 'Invalid Branch Station ID' });
    }

    const branchStation = await BranchStation.findById(branchStationId);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }

 

    const orders = await Order.find({ branchStation: branchStationId })
        .populate('user', 'username email')
        .populate('shippingAddress')
        .populate('billingAddress')
        .populate('items.product', 'name price')
        .populate('coupon')
        .populate('branchStation', 'name address')
        .populate('trackingDetails')
        .populate('deliveryPartner', 'username email');

    res.status(200).json({ success: true, data: orders, total: orders.length });
}));

// Get all active orders for a specific branch station for today
// Get all active orders for a specific branch station for today
router.get('/:id/orders/active/today', protect, asyncHandler(async (req, res) => {
    const branchStationId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(branchStationId)) {
        return res.status(400).json({ message: 'Invalid Branch Station ID' });
    }

    const branchStation = await BranchStation.findById(branchStationId);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Start of tomorrow

    // Define active statuses for both forward and return orders that are relevant to the branch
    const activeOrderStatuses = [
        'processing',
        'confirm',
        'shipped',         // Shipped to a branch or in transit to customer from a branch
        'at_branch',       // Arrived at the branch station
        'assigned',        // Assigned to a delivery partner
        'picked_up',       // Picked up by delivery partner (forward delivery)
        'in_transit',      // In transit to customer (forward delivery)
        'out_for_delivery', // Out for delivery
        // For Return Orders
        'return_requested',  // Return requested by customer
        'pending_pickup',    // Return waiting for pickup at customer location
        'return_picked_up',  // Return picked up by delivery partner
        'return_in_transit', // Return parcel in transit back to warehouse/branch
        'returned_to_branch',// Return arrived back at THIS branch
        'return_processing', // Return being processed (e.g., inspection)
    ];

    // Find orders that are active and associated with this branch station
    const todayActiveOrders = await Order.find({
        branchStation: branchStationId,
        status: { $in: activeOrderStatuses },
       
    })
    .populate('user', 'username email')
    .populate('shippingAddress')
    .populate('billingAddress')
    .populate('items.product', 'name price')
    .populate('coupon')
    .populate('branchStation', 'name address')
    .populate('deliveryPartner', 'username email')
    // Populate deliveryAssignment if you need details about the assignment process
    .populate('assignedToDeliveryPartnerBy', 'username email');
 

    res.status(200).json({
        success: true,
        data: todayActiveOrders,
        total: todayActiveOrders.length,
    });
}));
// Get all delivery partners for a specific branch station
router.get('/:id/delivery-partners', protect, asyncHandler(async (req, res) => {
    const branchStation = await BranchStation.findById(req.params.id);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }
  
    const deliveryPartners = await User.find({ _id: { $in: branchStation.deliveryPartners }, role: 'deliveryPartner' });
    res.status(200).json({ success: true, data: deliveryPartners });
}));

// Assign a delivery partner to an order (for both normal and return orders)
router.post('/:branchId/orders/:orderId/assign-delivery-partner', protect, asyncHandler(async (req, res) => {
    const { branchId, orderId } = req.params;
    const { deliveryPartnerId, location } = req.body;

    // Basic validation for IDs
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({ message: 'Invalid Branch ID format.' });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid Order ID format.' });
    }
    if (!mongoose.Types.ObjectId.isValid(deliveryPartnerId)) {
        return res.status(400).json({ message: 'Invalid Delivery Partner ID format.' });
    }

    const branchStation = await BranchStation.findById(branchId);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found.' });
    }

    // Ensure the assigning user is authorized for this branch (if applicable, e.g., branch manager)
    // For now, assuming `admin` middleware covers authorization.
    // You might add `branchManager` role check here or in authMiddleware.

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    // Ensure the order belongs to this branch if it's already assigned
    if (order.branchStation && order.branchStation.toString() !== branchId) {
        return res.status(400).json({ message: `Order is assigned to a different branch (${order.branchStation}).` });
    }

    const deliveryPartner = await User.findById(deliveryPartnerId);
    if (!deliveryPartner) {
        return res.status(404).json({ message: 'Delivery Partner not found.' });
    }

    if (deliveryPartner.role !== 'deliveryPartner') {
        return res.status(400).json({ message: 'User is not a delivery partner.' });
    }

    // Ensure the delivery partner is associated with this branch
    // This is crucial for managing DP operations within a branch
    if (!branchStation.deliveryPartners.includes(deliveryPartnerId)) {
        return res.status(400).json({ message: 'Delivery partner not associated with this branch.' });
    }

    // Prevent re-assignment if already assigned and in an active delivery/pickup state
    if (order.deliveryPartner && ['assigned', 'offered', 'accepted'].includes(order.deliveryPartnerStatus)) {
        return res.status(400).json({ message: 'Order already has an active delivery partner assignment. Use reassign if needed.' });
    }

    // Update order details
    order.deliveryPartner = deliveryPartnerId;
    order.deliveryPartnerStatus = 'assigned'; // Initial status when a manager assigns, waiting for DP acceptance
    order.assignedToDeliveryPartnerBy = req.user._id;
    order.deliveryAssignment = {
        deliveryPartner: deliveryPartnerId,
        status: 'offered',
        assignedAt: new Date(),
        responseAt: undefined,
        rejectionReason: undefined,
    };

    let newOrderStatus;
    let trackingStatus;
    let trackingNotes;

    if (order.isReturnRequested) {
        // Logic for return orders: DP is assigned for pickup
        if (!['approved', 'pending_pickup'].includes(order.returnStatus)) {
            return res.status(400).json({ message: `Return order in status '${order.returnStatus}' cannot be assigned for pickup.` });
        }
        newOrderStatus = 'pending_pickup'; // Main order status for return pickup
        trackingStatus = 'pending_pickup';
        trackingNotes = `Delivery partner ${deliveryPartner.username} assigned for return pickup.`;

        // Update return specific tracking
        order.returnTrackingDetails.push({
            status: 'refund_initiated',
            date: new Date(),
            location: location || 'Branch Station',
            notes: trackingNotes,
        });
        order.returnStatus = 'pending_pickup'; // Ensure return specific status is updated
    } else {
        // Logic for forward orders: DP is assigned for delivery
        if (!['shipped'].includes(order.status)) { // Ensure order is in a shippable state
            return res.status(400).json({ message: `Order in status '${order.status}' cannot be assigned for delivery.` });
        }
        newOrderStatus = 'in_transit'; // Main order status for delivery
        trackingStatus = 'in_transit';
        trackingNotes = `Delivery partner ${deliveryPartner.username} assigned for delivery.`;
    }

    order.status = newOrderStatus; // Update main order status

    // Add general tracking details
    order.trackingDetails.push({
        status: trackingStatus,
        date: new Date(),
        location: location || 'Branch Station', // Current location or branch as default
        notes: trackingNotes,
    });

    await order.save();

    // Update the delivery partner's active orders list
    if (deliveryPartner.deliveryPartnerDetails && !deliveryPartner.deliveryPartnerDetails.currentOrders.includes(order._id)) {
        deliveryPartner.deliveryPartnerDetails.currentOrders.push(order._id);
        await deliveryPartner.save();
    }

    res.status(200).json({ success: true, message: 'Delivery partner assigned successfully.', data: order });
}));

// Add a delivery partner to a branch
router.post('/:id/delivery-partners', protect, asyncHandler(async (req, res) => {
    const branchStation = await BranchStation.findById(req.params.id);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }
    if (req.user.role !== 'admin' && branchStation.manager?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to add delivery partners to this branch' });
    }
    const { deliveryPartnerId } = req.body;
    const deliveryPartner = await User.findById(deliveryPartnerId);
    if (!deliveryPartner) {
        return res.status(404).json({ message: 'Delivery Partner not found' });
    }
    if (deliveryPartner.role !== 'deliveryPartner') {
        return res.status(400).json({ message: 'User is not a delivery partner' });
    }
    if (branchStation.deliveryPartners.includes(deliveryPartnerId)) {
        return res.status(400).json({ message: 'Delivery partner already associated with this branch' });
    }
    branchStation.deliveryPartners.push(deliveryPartnerId);
    await branchStation.save();
    const updatedUser = await User.findByIdAndUpdate(deliveryPartnerId, { branchStation: branchStation._id }, { new: true });
    res.status(200).json({ success: true, data: updatedUser });
}));

// Remove a delivery partner from a branch
router.delete('/:id/delivery-partners/:userId', protect, asyncHandler(async (req, res) => {
    const branchStation = await BranchStation.findById(req.params.id);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }
  
    const { userId: userIdToRemove } = req.params;
    const userToRemove = await User.findById(userIdToRemove);
    if (!userToRemove) {
        return res.status(404).json({ message: 'User not found' });
    }
    if (userToRemove.role !== 'deliveryPartner') {
        return res.status(400).json({ message: 'User is not a delivery partner' });
    }
    const index = branchStation.deliveryPartners.indexOf(userIdToRemove);
    if (index === -1) {
        return res.status(400).json({ message: 'Delivery partner is not associated with this branch' });
    }
    branchStation.deliveryPartners.splice(index, 1);
    await branchStation.save();
    const updatedUser = await User.findByIdAndUpdate(userIdToRemove, { $unset: { branchStation: 1 } }, { new: true });
    res.status(200).json({ success: true, data: updatedUser });
}));

// Get revenue details for a branch
router.get('/:id/revenue', protect, asyncHandler(async (req, res) => {
    const branchStation = await BranchStation.findById(req.params.id);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found' });
    }
   
    const totalRevenueResult = await Order.aggregate([
        { $match: { branchStation: new mongoose.Types.ObjectId(req.params.id), paymentStatus: 'paid' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
    ]);
    const totalRevenue = totalRevenueResult[0]?.totalRevenue || 0;
    const revenueByPaymentMethod = await Order.aggregate([
        { $match: { branchStation: new mongoose.Types.ObjectId(req.params.id), paymentStatus: 'paid' } },
        { $group: { _id: '$paymentMethod', revenue: { $sum: '$total' } } },
    ]);
    res.status(200).json({ success: true, data: { totalRevenue, revenueByPaymentMethod, branchName: branchStation.name } });
}));

// Delivery partner rejects an assigned order
router.post('/orders/:orderId/reject-assignment', protect, asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found' });
    }

  

    if (order.deliveryAssignment?.status !== 'offered') {
        return res.status(400).json({ message: 'This order is not currently offered to you' });
    }

    order.deliveryAssignment.status = 'rejected';
    order.deliveryAssignment.responseAt = new Date();
    order.deliveryAssignment.rejectionReason = req.body.reason;
    order.deliveryPartner = null;
    order.deliveryPartnerStatus = undefined;
    await order.save();

    const branchStation = await BranchStation.findById(order.branchStation);
    if (branchStation) {
        await branchStation.save();
    }

    const deliveryPartner = await User.findById(req.user._id);
    if (deliveryPartner?.deliveryPartnerDetails?.currentOrders) {
        deliveryPartner.deliveryPartnerDetails.currentOrders = deliveryPartner.deliveryPartnerDetails.currentOrders.filter(
            (orderId) => orderId.toString() !== req.params.orderId
        );
        await deliveryPartner.save();
    }

    res.status(200).json({ success: true, data: order });
}));

// Branch Manager reassigns an order to a new delivery partner (for both normal and return orders)
router.post('/:branchId/orders/:orderId/reassign-delivery-partner', protect, asyncHandler(async (req, res) => {
    const { branchId, orderId } = req.params;
    const { newDeliveryPartnerId, location } = req.body;

    // Basic validation for IDs
    if (!mongoose.Types.ObjectId.isValid(branchId)) {
        return res.status(400).json({ message: 'Invalid Branch ID format.' });
    }
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: 'Invalid Order ID format.' });
    }
    if (!mongoose.Types.ObjectId.isValid(newDeliveryPartnerId)) {
        return res.status(400).json({ message: 'Invalid New Delivery Partner ID format.' });
    }

    const branchStation = await BranchStation.findById(branchId);
    if (!branchStation) {
        return res.status(404).json({ message: 'Branch Station not found.' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
    }

    // Ensure the order belongs to this branch if it's already assigned
    if (order.branchStation && order.branchStation.toString() !== branchId) {
        return res.status(400).json({ message: `Order is assigned to a different branch (${order.branchStation}).` });
    }

    const newDeliveryPartner = await User.findById(newDeliveryPartnerId);
    if (!newDeliveryPartner) {
        return res.status(404).json({ message: 'New Delivery Partner not found.' });
    }
    if (newDeliveryPartner.role !== 'deliveryPartner') {
        return res.status(400).json({ message: 'User is not a delivery partner.' });
    }
    if (!branchStation.deliveryPartners.includes(newDeliveryPartnerId)) {
        return res.status(400).json({ message: 'New delivery partner not associated with this branch.' });
    }

    // 1. Remove the order from the previous delivery partner (if any)
    if (order.deliveryPartner) {
        const previousDeliveryPartner = await User.findById(order.deliveryPartner);
        if (previousDeliveryPartner?.deliveryPartnerDetails?.currentOrders) {
            previousDeliveryPartner.deliveryPartnerDetails.currentOrders = previousDeliveryPartner.deliveryPartnerDetails.currentOrders.filter(
                (oId) => oId.toString() !== orderId
            );
            await previousDeliveryPartner.save();
        }
    }

    // 2. Assign the new delivery partner
    order.deliveryPartner = newDeliveryPartnerId;
    order.deliveryPartnerStatus = 'assigned'; // Initial status when a manager assigns, waiting for DP acceptance
    order.assignedToDeliveryPartnerBy = req.user._id;
    order.deliveryAssignment = {
        deliveryPartner: newDeliveryPartnerId,
        status: 'offered',
        assignedAt: new Date(),
        responseAt: undefined,
        rejectionReason: undefined,
    };

    // 3. Update order status and tracking details based on order type
    let trackingLocation = 'Branch Station'; // Default location
    if (location) {
        trackingLocation = location;
    }

    if (order.isReturnRequested) {
        // For return orders, when reassigned, it means it's pending pickup again by the new DP
        const returnTrackingStatus = 'pending_pickup'; 
        const returnTrackingNotes = `Return pickup reassigned to delivery partner ${newDeliveryPartner.username}.`;

        order.returnTrackingDetails.push({
            status: returnTrackingStatus,
            date: new Date(),
            location: trackingLocation,
            notes: returnTrackingNotes,
        });
        order.returnStatus = returnTrackingStatus; // Update return specific status
        // Update main order status to 'pending_pickup' or a relevant status for returns
        order.status = 'pending_pickup'; 
    } else {
        // For forward orders, when reassigned, it means it's assigned to the new DP
        const forwardTrackingStatus = 'assigned'; 
        const forwardTrackingNotes = `Delivery reassigned to delivery partner ${newDeliveryPartner.username}.`;

        order.status = forwardTrackingStatus; // Update main order status
        order.trackingDetails.push({
            status: forwardTrackingStatus,
            date: new Date(),
            location: trackingLocation,
            notes: forwardTrackingNotes,
        });
    }

    await order.save();

    // 4. Add the order to the new delivery partner's active orders list
    if (newDeliveryPartner.deliveryPartnerDetails && !newDeliveryPartner.deliveryPartnerDetails.currentOrders.includes(order._id)) {
        newDeliveryPartner.deliveryPartnerDetails.currentOrders.push(order._id);
        await newDeliveryPartner.save();
    }

    res.status(200).json({ success: true, message: 'Delivery partner reassigned successfully.', data: order });
}));

export default router;