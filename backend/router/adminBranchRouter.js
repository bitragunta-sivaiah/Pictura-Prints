// routes/adminBranchStationRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { BranchStation } from '../models/BranchStation.js';
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
import User from '../models/userModel.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Create a new branch station (Admin only)
router.post('/', protect, admin, async (req, res) => {
    try {
        const branchStation = new BranchStation(req.body);
        const savedBranchStation = await branchStation.save();
        res.status(201).json(savedBranchStation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all branch stations (Admin only)
router.get('/', protect, async (req, res) => {
    try {
        const branchStations = await BranchStation.find().populate('manager', 'username email').populate('managerApplication.user'); // Populate manager details
        res.json(branchStations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get a single branch station by ID (Admin)
router.get('/:id', protect, async (req, res) => {
    try {
        const branchStation = await BranchStation.findById(req.params.id)
            .populate('manager', 'username email')
            .populate('orders')
            .populate('deliveryPartners', 'username email');

        if (!branchStation) {
            return res.status(404).json({ error: 'Branch Station not found' });
        }
        res.json(branchStation);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a branch station by ID (Admin)
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const branchStation = await BranchStation.findById(req.params.id);
        if (!branchStation) {
            return res.status(404).json({ error: 'Branch Station not found' });
        }
        const updatedBranchStation = await BranchStation.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
            .populate('manager', 'username email')
            .populate('orders')
            .populate('deliveryPartners', 'username email');
        res.json(updatedBranchStation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a branch station by ID (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const deletedBranchStation = await BranchStation.findByIdAndDelete(req.params.id);
        if (!deletedBranchStation) {
            return res.status(404).json({ error: 'Branch Station not found' });
        }
        res.json({ message: 'Branch Station deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get branch manager application for a branch (Admin)
// Get branch manager application for a branch (Admin)
router.get('/:id/applications', protect, admin, async (req, res) => {
    try {
        const branchStation = await BranchStation.findById(req.params.id).populate('managerApplication.user'); // Populate the 'user' field within managerApplication

        console.log('Fetched Branch Station:', branchStation); // For debugging
        console.log('Manager Application:', branchStation.managerApplication); // For debugging

        if (!branchStation) {
            return res.status(404).json({ error: 'Branch Station not found' });
        }

        if (branchStation.managerApplication) {
            console.log('Populated User:', branchStation.managerApplication.user); // For debugging
            res.json([branchStation.managerApplication]);
        } else {
            res.json([]);
        }

    } catch (error) {
        console.error('Error fetching branch application:', error);
        res.status(500).json({ error: error.message });
    }
});

// Approve a branch manager application (Admin)
router.put('/:branchId/applications/:userId/approve', protect, admin, async (req, res) => {
    try {
        const branchStation = await BranchStation.findById(req.params.branchId);
        if (!branchStation) {
            return res.status(404).json({ error: 'Branch Station not found' });
        }

        const userId = req.params.userId;
        const userToApprove = await User.findById(userId);
        if (!userToApprove) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!branchStation.managerApplication || branchStation.managerApplication.user?.toString() !== userId) {
            return res.status(400).json({ error: 'Application not found for this user and branch' });
        }

        // Update branch station
        branchStation.managerApplication.status = 'approved';
        branchStation.manager = userId; // set the manager
        await branchStation.save();

        // Update User
        userToApprove.role = 'branchManager';
        userToApprove.managedBranch = branchStation._id;
        if (userToApprove.managerApplication) {
            userToApprove.managerApplication.status = 'approved';
            await userToApprove.save();
        }

        res.json({ message: 'Application approved successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reject a branch manager application (Admin)
router.put('/:branchId/applications/:userId/reject', protect, admin, async (req, res) => {
    try {
        const branchStation = await BranchStation.findById(req.params.branchId);
        if (!branchStation) {
            return res.status(404).json({ error: 'Branch Station not found' });
        }

        const userId = req.params.userId;
        const userToReject = await User.findById(userId);
        if (!userToReject) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!branchStation.managerApplication || branchStation.managerApplication.user?.toString() !== userId) {
            return res.status(400).json({ error: 'Application not found for this user and branch' });
        }
        const { rejectionReason } = req.body;
        // Update branch station
        branchStation.managerApplication.status = 'rejected';
        branchStation.managerApplication.rejectionReason = rejectionReason;
        await branchStation.save();

        // Update User
        if (userToReject.managerApplication) {
            userToReject.managerApplication.status = 'rejected';
            userToReject.managerApplication.rejectionReason = rejectionReason;
            await userToReject.save();
        }

        res.json({ message: 'Application rejected successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/branch-stations/assign-order/:orderId
router.post("/assign-order/:orderId", protect, admin, asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { location: clientCurrentLocation } = req.body;

    // 1. Validate Order ID
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ message: "Invalid Order ID format." });
    }

    // 2. Find and Populate Order
    // Ensure we select shippingAddress.location.coordinates explicitly if the Address model stores location
    const order = await Order.findById(orderId).populate({
        path: "shippingAddress",
        select: "location", // Select the entire location object which contains type and coordinates
    }).populate('branchStation'); // Populate branchStation to check if already assigned

    if (!order) {
        return res.status(404).json({ message: "Order not found." });
    }

    let locationToFindBranch;
    let newOrderStatus;
    let newTrackingStatus;
    let trackingNotes;
    let isReturnPickup = false;

    // 3. Determine Assignment Logic based on Order Type (Return vs. New)
    if (order.isReturnRequested) {
        isReturnPickup = true;
        // Handle Return Orders: Assign to branch closest to customer for pickup
        if (!['pending', 'approved'].includes(order.returnStatus)) { // Removed 'picked_up' as re-assignment might need specific logic
            return res.status(400).json({
                message: `Return order in status '${order.returnStatus.replace(/_/g, ' ')}' cannot be assigned for pickup.`,
            });
        }

        // Ensure customer's shipping address coordinates are available for return pickup
        if (!order.shippingAddress?.location?.coordinates || !Array.isArray(order.shippingAddress.location.coordinates) || order.shippingAddress.location.coordinates.length !== 2) {
            return res.status(400).json({
                message: "Customer's shipping address coordinates are missing or invalid for return pickup location."
            });
        }

        locationToFindBranch = order.shippingAddress.location.coordinates;
        newOrderStatus = 'pending_pickup';
        newTrackingStatus = 'assigned_for_return_pickup';
        trackingNotes = `Return pickup assigned to branch for order ${order.orderNumber || order._id}.`;

    } else {
        // Handle Forward Orders (New Orders): Assign to branch closest to the origin (admin's current location)
        if (order.branchStation) {
            // Check if branchStation is populated and has a name before using it
            const branchName = order.branchStation?.name || 'an unknown branch';
            return res.status(400).json({
                message: `Order already assigned to branch ${branchName}.`,
                orderId: order._id,
                branchStationId: order.branchStation._id,
            });
        }

        // Validate that the admin's current location was sent from the frontend
        if (!clientCurrentLocation || !Array.isArray(clientCurrentLocation) || clientCurrentLocation.length !== 2) {
            return res.status(400).json({
                message: "Current location (longitude, latitude) is required for new order assignment. Please ensure location services are enabled."
            });
        }

        locationToFindBranch = clientCurrentLocation;
        newOrderStatus = 'shipped';
        newTrackingStatus = 'shipped';
        trackingNotes = `Order ${order.orderNumber || order._id} assigned to branch for shipping.`;
    }

    // 4. Find the Nearest Branch Station
    const nearestBranch = await BranchStation.findOne({
        location: {
            $near: {
                $geometry: { type: "Point", coordinates: locationToFindBranch },
                $maxDistance: 500000, // 500 km default max distance (adjust as needed)
            },
        },
    });

    if (!nearestBranch) {
        return res.status(404).json({ message: "No nearby branch station found for assignment within 500 km of the specified location. Please try a different location or check branch coverage." });
    }

    // 5. Update Order Details
    order.branchStation = nearestBranch._id;
    order.status = 'shipped';

    order.trackingDetails.push({
        status: 'shipped',
        date: new Date(),
        // Ensure location is formatted correctly and safely
        location: `Branch: ${nearestBranch.name} (${nearestBranch.location?.coordinates?.join(', ') || 'N/A'})`,
        notes: trackingNotes,
    });

    // 6. Handle Return Specific Tracking Details
    if (isReturnPickup) {
        order.returnTrackingDetails.push({
            status: 'pending_pickup',
            date: new Date(),
            location: `Branch: ${nearestBranch.name} (${nearestBranch.location?.coordinates?.join(', ') || 'N/A'})`,
            notes: `Return order assigned to branch for pickup.`,
        });
        order.returnStatus = 'pending_pickup';
    }

    await order.save();

    // 7. Update Branch Station's Assigned Orders (prevent duplicates)
    if (!nearestBranch.orders.includes(order._id)) {
        nearestBranch.orders.push(order._id);
        await nearestBranch.save();
    }

    // 8. Send Success Response
    return res.status(200).json({
        message: `Order ${order.orderNumber || order._id} successfully assigned to branch ${nearestBranch.name}.`,
        orderId: order._id,
        branchStation: {
            _id: nearestBranch._id,
            name: nearestBranch.name,
            location: nearestBranch.location
        },
        orderNewStatus: order.status,
    });
}));


// GET /api/admin/branch-stations/:branchId/orders
// Get all orders for a specific branch station (Admin only)
router.get('/:branchId/orders', protect, admin, async (req, res) => {
    try {
        const { branchId } = req.params;

        const branchStation = await BranchStation.findById(branchId);
        if (!branchStation) {
            return res.status(404).json({ message: 'Branch Station not found' });
        }

        const orders = await Order.find({ branchStation: branchId }).populate('user', 'username email');

        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders for branch:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/admin/branch-stations/:branchId/assigned-orders
// Get all orders assigned to a specific branch station (Admin only)
router.get('/:branchId/assigned-orders', protect, admin, async (req, res) => {
    try {
        const { branchId } = req.params;

        const branchStation = await BranchStation.findById(branchId);
        if (!branchStation) {
            return res.status(404).json({ message: 'Branch Station not found' });
        }

        const assignedOrders = await Order.find({ branchStation: branchId }).populate('user', 'username email');

        res.json(assignedOrders);
    } catch (error) {
        console.error('Error fetching assigned orders:', error);
        res.status(500).json({ message: 'Internal server error' });
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

export default router;