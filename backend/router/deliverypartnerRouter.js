import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/userModel.js';
import { BranchStation } from '../models/BranchStation.js'; // Assuming BranchStation model exists and is correctly imported
import Order from '../models/orderModel.js';
import mongoose from 'mongoose';
import asyncHandler from 'express-async-handler';

const router = express.Router();

 

// Get all delivery partners (Admin only)
router.get('/', protect, asyncHandler(async (req, res) => {
   
    const deliveryPartners = await User.find({ role: 'deliveryPartner', deletedAt: null })
        .select('username email phoneNumber branchStation deliveryPartnerDetails.approvalStatus deliveryPartnerDetails.availability deliveryPartnerDetails.workingHours deliveryPartnerDetails.earnings deliveryPartnerDetails.totalEarnings')
       
    res.status(200).json({ success: true, data: deliveryPartners });
}));

// Get a single delivery partner by ID (Admin, Branch Manager, Delivery Partner)
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const deliveryPartner = await User.findById(req.params.id) 
    if (!deliveryPartner || deliveryPartner.deletedAt !== null) {
        return res.status(404).json({ success: false, message: 'Delivery Partner not found.' });
    }
    const user = req.user;
    if (
        user.role === 'admin' ||
        user._id.toString() === deliveryPartner._id.toString() ||
        (user.role === 'branchManager' && user.managedBranch?.toString() === deliveryPartner.branchStation?._id.toString())
    ) {
        res.status(200).json({ success: true, data: deliveryPartner });
    } 
}));

// Update a delivery partner by ID (Admin, Delivery Partner)
router.put('/:id', protect, asyncHandler(async (req, res) => {
    const deliveryPartner = await User.findById(req.params.id);
    if (!deliveryPartner || deliveryPartner.deletedAt !== null) {
        return res.status(404).json({ success: false, message: 'Delivery Partner not found.' });
    }
    const user = req.user;
    if (user.role === 'admin' || user._id.toString() === req.params.id) {
        const updates = {
            username: req.body.username,
            email: req.body.email,
            phoneNumber: req.body.phoneNumber,
        };

        if (req.body.avatar) {
            updates.avatar = req.body.avatar;
        }

        if (req.body.deliveryPartnerDetails) {
            if (user.role === 'admin') {
                updates.deliveryPartnerDetails = {
                    ...deliveryPartner.deliveryPartnerDetails.toObject(), // Convert to plain object for spreading
                    ...req.body.deliveryPartnerDetails,
                };
            } else if (user._id.toString() === req.params.id) {
                const allowedUpdates = {};
                if (req.body.deliveryPartnerDetails.workingHours) {
                    allowedUpdates.workingHours = req.body.deliveryPartnerDetails.workingHours;
                }
                if (req.body.deliveryPartnerDetails.availability !== undefined) {
                    allowedUpdates.availability = req.body.deliveryPartnerDetails.availability;
                }
                if (req.body.deliveryPartnerDetails.paymentDetails) {
                    allowedUpdates.paymentDetails = req.body.deliveryPartnerDetails.paymentDetails;
                }
                if (req.body.deliveryPartnerDetails.preferredDeliveryRadius !== undefined) {
                    allowedUpdates.preferredDeliveryRadius = req.body.deliveryPartnerDetails.preferredDeliveryRadius;
                }
                if (req.body.deliveryPartnerDetails.bio !== undefined) {
                    allowedUpdates.bio = req.body.deliveryPartnerDetails.bio;
                }
                if (req.body.deliveryPartnerDetails.location) {
                    allowedUpdates.location = req.body.deliveryPartnerDetails.location;
                }
                // Allow updating bank details by the delivery partner
                if (req.body.deliveryPartnerDetails.bankDetails) {
                    allowedUpdates.bankDetails = req.body.deliveryPartnerDetails.bankDetails;
                }
                if (req.body.deliveryPartnerDetails.operatingAreas) {
                    allowedUpdates.operatingAreas = req.body.deliveryPartnerDetails.operatingAreas;
                }


                updates.deliveryPartnerDetails = {
                    ...deliveryPartner.deliveryPartnerDetails.toObject(), // Convert to plain object for spreading
                    ...allowedUpdates,
                };
            }
        }

        const updatedDeliveryPartner = await User.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        res.status(200).json({ success: true, data: updatedDeliveryPartner });
    } else {
        return res.status(403).json({ success: false, message: 'Unauthorized. You do not have permission to update this profile.' });
    }
}));

// Delete a delivery partner by ID (Admin only)
router.delete('/:id', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized. Admin access required.' });
    }
    const deliveryPartnerToDelete = await User.findById(req.params.id);
    if (!deliveryPartnerToDelete || deliveryPartnerToDelete.deletedAt !== null) {
        return res.status(404).json({ success: false, message: 'Delivery Partner not found.' });
    }
    if (deliveryPartnerToDelete.role !== 'deliveryPartner') {
        return res.status(400).json({ success: false, message: 'User is not a delivery partner.' });
    }

    const deletedDeliveryPartner = await User.findByIdAndUpdate(
        req.params.id,
        { deletedAt: new Date() },
        { new: true }
    );

    if (deletedDeliveryPartner?.deliveryPartnerDetails?.branchStation) {
        await BranchStation.findByIdAndUpdate(
            deletedDeliveryPartner.deliveryPartnerDetails.branchStation,
            { $pull: { deliveryPartners: req.params.id } }
        );
    }

    res.status(200).json({ success: true, message: 'Delivery Partner deleted successfully.' });
}));

// Define the calculateDeliveryEarnings function outside the router.post block
// or ensure it's imported if it's in a separate utility file.
// For this example, I'm placing it directly above the router.post for clarity.
const calculateDeliveryEarnings = (total) => {
    if (total > 500) {
        return 50; // Earns 50 rupees if total is greater than 500
    } else {
        return 30; // Earns 30 rupees otherwise
    }
};


router.post('/orders/:orderId/update-status', protect, asyncHandler(async (req, res) => {
    // 1. Authorization Check: Only delivery partners can use this route
    if (req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ success: false, message: 'Unauthorized. You are not a delivery partner.' });
    }

    const { orderId } = req.params;
    const { status, location, notes } = req.body; // Added 'notes' for more flexible updates

    // 2. Input Validation
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid Order ID format.' });
    }
    if (!status) {
        return res.status(400).json({ success: false, message: 'Status is required.' });
    }

    // 3. Fetch Order and Delivery Partner Details
    const order = await Order.findById(orderId).populate('deliveryPartner'); // Populate deliveryPartner to compare
    const deliveryPartner = await User.findById(req.user._id); // Assuming User model has deliveryPartnerDetails

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
    }
    if (!deliveryPartner) {
        return res.status(404).json({ success: false, message: 'Delivery partner profile not found.' });
    }

    // 4. Verify Delivery Partner Assignment
    // Ensure the order is assigned AND it's assigned to the requesting delivery partner
    if (!order.deliveryPartner || order.deliveryPartner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized. This order is not assigned to you.' });
    }

    // 5. Define Allowed Status Transitions
    let allowedTransitions;
    let mainOrderFinalStates; // States after which DP cannot update (delivery/pickup complete)

    if (order.isReturnRequested) {
        // Transitions for **return pickup** orders by a delivery partner
        allowedTransitions = {
            'pending_pickup': ['picked_up', 'pickup_failed'], // DP acknowledges pickup start
            'picked_up_for_return': ['in_transit_to_branch'], // DP picked up, now moving to branch
            'in_transit_to_branch': ['returned_to_branch', 'pickup_failed'], // DP delivers to branch or fails
        };
        mainOrderFinalStates = ['returned_to_branch', 'pickup_failed'];
    } else {
        // Transitions for **forward delivery** orders by a delivery partner
        allowedTransitions = {
            // Only 'out_for_delivery' is allowed for forward orders for DP to update
            'out_for_delivery': ['delivered', 'failed_delivery'],
        };
        mainOrderFinalStates = ['delivered', 'failed_delivery'];
    }

    // Determine the current status for transition check
    let currentStatusForTransitionCheck;
    if (order.isReturnRequested) {
        // For return orders, get the last status from returnTrackingDetails
        currentStatusForTransitionCheck = order.returnTrackingDetails.length > 0 ?
            order.returnTrackingDetails[order.returnTrackingDetails.length - 1].status : 'pending_pickup'; // Default for new return
    } else {
        // For normal orders, get the last status from trackingDetails
        currentStatusForTransitionCheck = order.trackingDetails.length > 0 ?
            order.trackingDetails[order.trackingDetails.length - 1].status : 'assigned'; // Default for new order
    }

    // 6. Prevent Updates if Already in a Final State for DP
    if (mainOrderFinalStates.includes(currentStatusForTransitionCheck)) {
        return res.status(400).json({
            success: false,
            message: `Order is already in a final state ('${currentStatusForTransitionCheck.replace(/_/g, ' ')}') and cannot be updated further by delivery partner.`,
        });
    }

    // 7. Validate Requested Status Transition
    if (!allowedTransitions[currentStatusForTransitionCheck] || !allowedTransitions[currentStatusForTransitionCheck].includes(status)) {
        return res.status(400).json({
            success: false,
            message: `Invalid status transition for delivery partner from '${currentStatusForTransitionCheck.replace(/_/g, ' ')}' to '${status.replace(/_/g, ' ')}'.`,
            allowed: allowedTransitions[currentStatusForTransitionCheck] || [],
        });
    }

    // 8. Determine Tracking Location Format
    let trackingLocation = 'Unknown Location';
    if (location) {
        // Assuming 'location' from frontend might be a string "long,lat" or an object {latitude, longitude}
        if (typeof location === 'string' && location.includes(',')) {
            const [longitude, latitude] = location.split(',');
            if (!isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))) {
                trackingLocation = `Lat: ${parseFloat(latitude).toFixed(4)}, Lng: ${parseFloat(longitude).toFixed(4)}`;
            }
        } else if (typeof location === 'object' && location.latitude && location.longitude) {
            if (!isNaN(parseFloat(location.latitude)) && !isNaN(parseFloat(location.longitude))) {
                trackingLocation = `Lat: ${parseFloat(location.latitude).toFixed(4)}, Lng: ${parseFloat(location.longitude).toFixed(4)}`;
            }
        } else {
            console.warn(`Invalid location format provided for order ${orderId}:`, location);
        }
    }

    

    if (!order.isReturnRequested) {
        order.status = status; // For normal orders, update main status directly
        order.trackingDetails.push({
            status: status, // Use the new status for tracking details
            date: new Date(),
            location: trackingLocation,
            notes: notes || `Status updated by delivery partner ${deliveryPartner.username}` // Use provided notes or default
        });
    } else {
       
        order.status = status; // Update main status to reflect return status
        order.returnStatus = status; // Update the return-specific status
        order.returnTrackingDetails.push({
            status: status, // Use the new status for return tracking details
            date: new Date(),
            location: trackingLocation,
            notes: notes || `Return status updated by delivery partner ${deliveryPartner.username}`
        });
    }

    // 10. Handle Terminal States (Delivery/Pickup Completed or Failed)
    if (mainOrderFinalStates.includes(status)) {
        // Calculate and add earnings only if it's a successful delivery or successful return pickup
        if ((status === 'delivered' && !order.isReturnRequested) || (status === 'returned_to_branch' && order.isReturnRequested)) {
            let earningForThisAction = 0;
            if (!order.isReturnRequested) { // Forward delivery
                if (typeof order.deliveryOrderEarning !== 'number' || order.deliveryOrderEarning === 0) {
                    earningForThisAction = calculateDeliveryEarnings(order.total);
                    order.deliveryOrderEarning = earningForThisAction;
                    order.paymentStatus = 'paid'; // Mark payment status for delivered orders
                    order.deliveredAt = new Date(); // Set delivered timestamp
                }
            } else { // Return pickup completed
                // You might have a separate earning calculation for return pickups
                if (typeof order.returnOrderEarning !== 'number' || order.returnOrderEarning === 0) {
                    // Example: fixed fee for return pickup, or based on distance/item count
                    earningForThisAction = calculateDeliveryEarnings(0); // Pass 0 if earnings are fixed for returns
                    order.returnOrderEarning = earningForThisAction; // Assuming a field for return earnings
                    order.deliveredAtBranch = new Date(); // Timestamp when returned to branch
                }
            }

            if (earningForThisAction > 0) {
                deliveryPartner.deliveryPartnerDetails.earnings = (deliveryPartner.deliveryPartnerDetails.earnings || 0) + earningForThisAction;
                deliveryPartner.deliveryPartnerDetails.totalEarnings = (deliveryPartner.deliveryPartnerDetails.totalEarnings || 0) + earningForThisAction;
                await deliveryPartner.save();
            }
        }

        // Remove order from current orders of the delivery partner
        deliveryPartner.deliveryPartnerDetails.currentOrders = deliveryPartner.deliveryPartnerDetails.currentOrders.filter(
            (currentOrderId) => currentOrderId.toString() !== orderId
        );
        await deliveryPartner.save();
    }

    // 11. Save the Updated Order
    await order.save();

    // 12. Send Success Response
    res.status(200).json({
        success: true,
        message: `Order status updated to '${status.replace(/_/g, ' ')}' successfully.`,
        data: order,
        newStatus: order.status,
        newDeliveryPartnerStatus: order.deliveryPartnerStatus,
        newReturnStatus: order.isReturnRequested ? order.returnStatus : undefined
    });
}));

// User applies to become a delivery partner
router.post('/apply-delivery-partner', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'user') {
        return res.status(400).json({ success: false, message: 'Only regular users can apply to become delivery partners.' });
    }
    const { vehicleType, licenseNumber, licenseExpiryDate, insuranceNumber, insuranceExpiryDate, vehicleNumber, aadharNumber, documents, branchStation: branchStationId } = req.body;
    const branchStationExists = await BranchStation.findById(branchStationId);
    if (!branchStationExists) {
        return res.status(400).json({ success: false, message: 'Invalid branch station selected.' });
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            deliveryPartnerApplication: {
                status: 'processing',
                applicationDate: new Date(),
                vehicleType,
                licenseNumber,
                licenseExpiryDate,
                insuranceNumber,
                insuranceExpiryDate,
                vehicleNumber,
                aadharNumber,
                documents,
                branchStation: branchStationId,
            },
        },
        { new: true, runValidators: true }
    ).select('-password');
    if (updatedUser) {
        res.status(200).json({ success: true, message: 'Application submitted successfully.', data: updatedUser });
    } else {
        res.status(400).json({ success: false, message: 'Failed to submit application.' });
    }
}));

// Get all pending delivery partner applications for the managed branch (Branch Manager only)
router.get('/branch/delivery-partner-applications', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'branchManager') {
        return res.status(403).json({ success: false, message: 'Unauthorized. Branch Manager access required.' });
    }
    if (!req.user.managedBranch) {
        return res.status(400).json({ success: false, message: 'Branch Manager is not assigned to a branch.' });
    }
    const usersWithPendingApplications = await User.find({
        'deliveryPartnerApplication.status': 'processing',
        'deliveryPartnerApplication.branchStation': req.user.managedBranch,
        deletedAt: null,
    }).select('-password');
    res.status(200).json({ success: true, data: usersWithPendingApplications });
}));

// Approve a delivery partner application (Branch Manager only)
router.put('/branch/delivery-partner-applications/:userId/approve', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'branchManager') {
        return res.status(403).json({ success: false, message: 'Unauthorized. Branch Manager access required.' });
    }
    if (!req.user.managedBranch) {
        return res.status(400).json({ success: false, message: 'Branch Manager is not assigned to a branch.' });
    }
    const userToApprove = await User.findById(req.params.userId);
    if (!userToApprove || userToApprove.deletedAt !== null) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (
        userToApprove.deliveryPartnerApplication?.status !== 'processing' ||
        userToApprove.deliveryPartnerApplication.branchStation?.toString() !== req.user.managedBranch?.toString()
    ) {
        return res.status(400).json({ success: false, message: 'Application is not pending or not for your branch.' });
    }
    const { branchStation: assignedBranchStationId } = userToApprove.deliveryPartnerApplication;
    const branchStationExists = await BranchStation.findById(assignedBranchStationId);
    if (!branchStationExists) {
        return res.status(400).json({ success: false, message: 'Selected branch station does not exist.' });
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        {
            role: 'deliveryPartner',
            isDeliveryPartner: true,
            deliveryPartnerDetails: {
                vehicleType: userToApprove.deliveryPartnerApplication.vehicleType,
                licenseNumber: userToApprove.deliveryPartnerApplication.licenseNumber,
                licenseExpiryDate: userToApprove.deliveryPartnerApplication.licenseExpiryDate,
                insuranceNumber: userToApprove.deliveryPartnerApplication.insuranceNumber,
                insuranceExpiryDate: userToApprove.deliveryPartnerApplication.insuranceExpiryDate,
                vehicleNumber: userToApprove.deliveryPartnerApplication.vehicleNumber,
                aadharNumber: userToApprove.deliveryPartnerApplication.aadharNumber,
                documents: userToApprove.deliveryPartnerApplication.documents,
                approvalStatus: 'approved',
                branchStation: assignedBranchStationId,
                // Initialize earnings fields if they are not already
                earnings: 0,
                totalEarnings: 0,
            },
            deliveryPartnerApplication: null, // Clear the application details after approval
        },
        { new: true, runValidators: true }
    ).select('-password');
    if (updatedUser) {
        await BranchStation.findByIdAndUpdate(assignedBranchStationId, { $addToSet: { deliveryPartners: updatedUser._id } });
        res.status(200).json({ success: true, message: 'Delivery partner application approved successfully.', data: updatedUser });
    } else {
        res.status(400).json({ success: false, message: 'Failed to approve application.' });
    }
}));

// Reject a delivery partner application (Branch Manager only)
router.put('/branch/delivery-partner-applications/:userId/reject', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'branchManager') {
        return res.status(403).json({ success: false, message: 'Unauthorized. Branch Manager access required.' });
    }
    if (!req.user.managedBranch) {
        return res.status(400).json({ success: false, message: 'Branch Manager is not assigned to a branch.' });
    }
    const { rejectionReason } = req.body;
    const userToReject = await User.findById(req.params.userId);
    if (!userToReject || userToReject.deletedAt !== null) {
        return res.status(404).json({ success: false, message: 'User not found.' });
    }
    if (
        userToReject.deliveryPartnerApplication?.status !== 'processing' ||
        userToReject.deliveryPartnerApplication.branchStation?.toString() !== req.user.managedBranch?.toString()
    ) {
        return res.status(400).json({ success: false, message: 'Application is not pending or not for your branch.' });
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.params.userId,
        {
            'deliveryPartnerApplication.status': 'rejected',
            'deliveryPartnerApplication.rejectionReason': rejectionReason,
        },
        { new: true, runValidators: true }
    ).select('-password');
    if (updatedUser) {
        res.status(200).json({ success: true, message: 'Delivery partner application rejected successfully.', data: updatedUser });
    } else {
        res.status(400).json({ success: false, message: 'Failed to reject application.' });
    }
}));

// Get the profile of the logged-in delivery partner
router.get('/me/profile', protect, asyncHandler(async (req, res) => {
    

    const deliveryPartnerProfile = await User.findById(req.user._id)
        .select('-password -__v -createdAt -updatedAt'); // Exclude sensitive/unnecessary fields
    if (!deliveryPartnerProfile || deliveryPartnerProfile.deletedAt !== null) {
        return res.status(404).json({ success: false, message: 'Delivery partner profile not found.' });
    }

    res.status(200).json({ success: true, data: deliveryPartnerProfile });
}));

// Update delivery partner's availability and working hours (Delivery Partner only)
router.put(
    '/me/availability',
    protect, // Ensures user is authenticated
    asyncHandler(async (req, res) => {
        // 1. Authorization Check: Ensure the user is a delivery partner
        if (req.user.role !== 'deliveryPartner') {
            return res.status(403).json({ success: false, message: 'Unauthorized. You are not a delivery partner.' });
        }

        // 2. Destructure Data from Request Body
        // Ensure that the frontend sends a JSON object like:
        // {
        //   "availability": "available",
        //   "workingHours": { "Monday": { "startTime": "09:00", "endTime": "17:00", "isAvailable": true } }
        // }
        const { availability, workingHours } = req.body;

        // 3. Prepare Update Object
        const updateFields = {};

        // Only update 'availability' if provided in the request body
        if (availability !== undefined && ['available', 'on_delivery', 'offline', 'break'].includes(availability)) {
            updateFields['deliveryPartnerDetails.availability'] = availability;
        } else if (availability !== undefined) {
             // If availability is provided but not a valid enum value
            return res.status(400).json({ success: false, message: 'Invalid availability status provided.' });
        }

        // Only update 'workingHours' if provided and valid
        // You might want more robust validation for workingHours structure
        if (workingHours !== undefined && typeof workingHours === 'object' && workingHours !== null) {
            // Merge or replace working hours as per your requirement
            // For simplicity, we are replacing the entire workingHours object.
            // If you want to update individual days, you'd need more specific logic.
            updateFields['deliveryPartnerDetails.workingHours'] = workingHours;
        }

        // Check if any fields are present to update
        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ success: false, message: 'No valid fields provided for update.' });
        }

        // 4. Find and Update User
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            { $set: updateFields }, // Use $set to update specific nested fields
            { new: true, runValidators: true } // `new: true` returns the updated document, `runValidators: true` runs schema validators
        ).select('deliveryPartnerDetails.availability deliveryPartnerDetails.workingHours deliveryPartnerDetails.availableStatus'); // Select desired fields to return

        // 5. Respond to Client
        if (updatedUser) {
            res.status(200).json({
                success: true,
                message: 'Delivery partner profile updated successfully.',
                data: {
                    availability: updatedUser.deliveryPartnerDetails.availability,
                    workingHours: updatedUser.deliveryPartnerDetails.workingHours,
                    availableStatus: updatedUser.deliveryPartnerDetails.availableStatus // Also return this for consistency
                },
            });
        } else {
            // This case should ideally not be hit if user is found by protect middleware
            res.status(404).json({ success: false, message: 'Delivery partner not found.' });
        }
    })
);
// Update delivery partner's current location (Delivery Partner only)
router.put('/me/location', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ success: false, message: 'Unauthorized. You are not a delivery partner.' });
    }
    const { coordinates } = req.body;
    if (!Array.isArray(coordinates) || coordinates.length !== 2 || typeof coordinates[0] !== 'number' || typeof coordinates[1] !== 'number') {
        return res.status(400).json({ success: false, message: 'Invalid coordinates format [longitude, latitude].' });
    }
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            'deliveryPartnerDetails.location.coordinates': coordinates,
            'deliveryPartnerDetails.lastActive': new Date(),
        },
        { new: true, runValidators: true }
    ).select('deliveryPartnerDetails.location');
    if (updatedUser) {
        res.status(200).json({ success: true, message: 'Location updated successfully.', data: updatedUser.deliveryPartnerDetails.location });
    } else {
        res.status(400).json({ success: false, message: 'Failed to update location.' });
    }
}));

// Get nearby available delivery partners (Requires location query)
router.get('/nearby', protect, asyncHandler(async (req, res) => {
    const { longitude, latitude, maxDistance = 5000 } = req.query; // Default max distance is 5km
    if (!longitude || !latitude) {
        return res.status(400).json({ success: false, message: 'Longitude and latitude are required.' });
    }
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    if (isNaN(lng) || isNaN(lat)) {
        return res.status(400).json({ success: false, message: 'Invalid longitude or latitude.' });
    }

    const nearbyPartners = await User.find({
        role: 'deliveryPartner',
        'deliveryPartnerDetails.availability': true,
        'deliveryPartnerDetails.location': {
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [lng, lat],
                },
                $maxDistance: parseInt(maxDistance, 10),
            },
        },
        deletedAt: null,
    }).select('username avatar deliveryPartnerDetails.vehicleType deliveryPartnerDetails.rating deliveryPartnerDetails.location');

    res.status(200).json({ success: true, data: nearbyPartners });
}));

// Delivery partner accepts an offered order (or an order in 'pending' assignment)
router.post('/orders/:orderId/accept-assignment', protect, asyncHandler(async (req, res) => {
    // 1. Authorization Check
    if (req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ success: false, message: 'Unauthorized. Only delivery partners can accept assignments.' });
    }

    const orderId = req.params.orderId;

    // 2. Input Validation (Order ID)
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({ success: false, message: 'Invalid Order ID format.' });
    }

    // 3. Find the Order
    const order = await Order.findById(orderId);

    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // 4. Validate Assignment State
    // Check if there's a deliveryAssignment and if it's in a state that can be accepted.
    // 'offered' is the primary state for a new assignment to be accepted.
    // 'pending' might be used if an assignment is initially created without a specific DP, then offered.
    if (!order.deliveryAssignment || order.deliveryAssignment.status === 'accepted' || order.deliveryAssignment.status === 'rejected') {
        return res.status(400).json({ success: false, message: 'This order is not currently available for assignment acceptance.' });
    }

    // 5. Verify Delivery Partner Match
    // If the deliveryAssignment has a specific deliveryPartner assigned, ensure it's the current user.
    // If deliveryAssignment.deliveryPartner is null, it means it's a general offer (less common but possible depending on workflow).
    if (order.deliveryAssignment.deliveryPartner && order.deliveryAssignment.deliveryPartner.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'This assignment was not offered to you.' });
    }

    // 6. Handle Location Data (Improved Parsing)
    const { location } = req.body;
    let trackingLocation = 'Unknown Location'; // Default for safety

    if (location) {
        if (typeof location === 'string' && location.includes(',')) {
            const [longitude, latitude] = location.split(',').map(coord => parseFloat(coord.trim()));
            if (!isNaN(longitude) && !isNaN(latitude)) {
                trackingLocation = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            } else {
                console.warn(`Invalid numeric coordinates in string for order ${orderId}:`, location);
            }
        } else if (typeof location === 'object' && location.latitude != null && location.longitude != null) {
            const latitude = parseFloat(location.latitude);
            const longitude = parseFloat(location.longitude);
            if (!isNaN(latitude) && !isNaN(longitude)) {
                trackingLocation = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
            } else {
                console.warn(`Invalid numeric coordinates in object for order ${orderId}:`, location);
            }
        } else {
            // If location is provided but not in expected format, use it as a string
            trackingLocation = String(location).trim() || 'Unknown Location';
            console.warn(`Unexpected location format provided for order ${orderId}. Using as raw string:`, location);
        }
    }


    // 7. Update Order Document for Assignment Acceptance
    order.deliveryAssignment.status = 'accepted';
    order.deliveryAssignment.responseAt = new Date();
    order.deliveryPartner = req.user._id; // Assign the delivery partner to the order

    let newOrderStatus;
    let trackingStatus;
    let trackingNotes;

    // Determine statuses based on whether it's a return request or standard delivery
    if (order.isReturnRequested) {
        // Return Order Assignment Accepted Flow
        newOrderStatus = 'pending_pickup'; // Overall order status changes to indicate return is awaiting pickup
        trackingStatus = 'pending_pickup'; // Specific status for tracking log
        trackingNotes = `Delivery partner ${req.user.username} accepted the return pickup assignment for order ${order.orderNumber}.`;

        // Update return-specific fields
        order.returnStatus = 'pending_pickup'; // Update the return process status
        order.returnTrackingDetails.push({
            status: trackingStatus,
            date: new Date(),
            location: trackingLocation,
            notes: trackingNotes,
        });

    } else {
        // Standard Delivery Assignment Accepted Flow
        newOrderStatus = 'out_for_delivery'; // Order is now formally assigned to a DP, ready for pickup from branch
        trackingStatus = 'out_for_delivery';
        trackingNotes = `Delivery partner ${req.user.username} accepted the delivery assignment for order ${order.orderNumber}.`;
    }

    // Update main order status and delivery partner status (this reflects the DP's current state with the order)
    order.status = newOrderStatus;
    order.deliveryPartnerStatus = 'accepted'; // DP's internal status for this order

    // Add general tracking details for the order (relevant for both forward and return flows)
    order.trackingDetails.push({
        status: trackingStatus,
        date: new Date(),
        location: trackingLocation,
        notes: trackingNotes,
    });

    await order.save(); // Save the updated order document

    // 8. Update Delivery Partner's `currentOrders` (if applicable)
    try {
        const deliveryPartnerUser = await User.findById(req.user._id);
        if (deliveryPartnerUser && deliveryPartnerUser.deliveryPartnerDetails) {
            if (!deliveryPartnerUser.deliveryPartnerDetails.currentOrders) {
                deliveryPartnerUser.deliveryPartnerDetails.currentOrders = [];
            }
            // Add orderId only if not already present
            if (!deliveryPartnerUser.deliveryPartnerDetails.currentOrders.includes(orderId)) {
                deliveryPartnerUser.deliveryPartnerDetails.currentOrders.push(orderId);
                await deliveryPartnerUser.save();
            }
        }
    } catch (error) {
        console.error(`Error updating delivery partner ${req.user._id}'s current orders for order ${orderId}:`, error);
        // Do not block the main response if this update fails, but log it.
    }

    res.status(200).json({ success: true, message: 'Order assignment accepted successfully.', data: order });
}));


// Delivery partner rejects an offered order (or an order in 'pending' assignment)
router.post('/orders/:orderId/reject-assignment', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ success: false, message: 'Unauthorized. You are not a delivery partner.' });
    }

    const order = await Order.findById(req.params.orderId);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
    }

     
    if (order.deliveryPartner?.toString() !== req.user._id.toString() && order.deliveryAssignment?.deliveryPartner?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'This order was not assigned or offered to you.' });
    }

   
    if (!['offered', 'pending', 'assigned'].includes(order.deliveryAssignment?.status)) {
        return res.status(400).json({ success: false, message: 'This order is not in a state to be rejected by you.' });
    }

    order.deliveryAssignment.status = 'rejected';
    order.deliveryAssignment.responseAt = new Date();
    order.deliveryAssignment.rejectionReason = req.body.reason;
    order.deliveryPartner = null; // Clear the delivery partner from the order
    order.deliveryPartnerStatus = undefined; // Clear the delivery partner status
    order.status = 'assigned'; // Revert order status to 'assigned' for re-assignment
    await order.save();

    const deliveryPartner = await User.findById(req.user._id);
    if (deliveryPartner?.deliveryPartnerDetails?.currentOrders) {
        deliveryPartner.deliveryPartnerDetails.currentOrders = deliveryPartner.deliveryPartnerDetails.currentOrders.filter(
            (orderId) => orderId.toString() !== req.params.orderId
        );
        await deliveryPartner.save();
    }

    res.status(200).json({ success: true, message: 'Order assignment rejected successfully.', data: order });
}));

// Get today's active orders for a delivery partner assigned by a branch manager
router.get('/me/orders/active/today', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ success: false, message: 'Unauthorized. You are not a delivery partner.' });
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1); // Start of tomorrow

    const activeOrderStatusesForDeliveryPartner = [
        'assigned',
        "picked_up",
        'in_transit',
        'out_for_delivery',
        'pending_pickup',
        'return_in_transit',
        'accepted'
    ];

    const activeOrdersToday = await Order.find({
     
        deliveryPartner: req.user._id, 
        status: { $in: activeOrderStatusesForDeliveryPartner },
        updatedAt: { $gte: today, $lt: tomorrow },
    }).populate('user' )
      .populate('branchStation' )
      .populate('shippingAddress');

    res.status(200).json({ success: true, data: activeOrdersToday });
}));

// Get total orders assigned to a delivery partner by a branch manager
router.get('/me/orders/assigned/total', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ success: false, message: 'Unauthorized. You are not a delivery partner.' });
    }

    // Count all orders where this delivery partner is assigned, regardless of current status
    const totalAssignedOrders = await Order.countDocuments({
        deliveryPartner: req.user._id,
        // No need for assignedToDeliveryPartnerBy here, as deliveryPartner field itself signifies assignment.
        // If you specifically want orders assigned by a branch manager, keep it:
        // assignedToDeliveryPartnerBy: { $ne: null },
    });

    res.status(200).json({ success: true, data: { totalAssignedOrders } });
}));

// NEW: Get delivery partner's total earnings and total delivered orders
router.get('/me/revenue', protect, asyncHandler(async (req, res) => {
    if (req.user.role !== 'deliveryPartner') {
        return res.status(403).json({ success: false, message: 'Unauthorized. You are not a delivery partner.' });
    }

    const deliveryPartner = await User.findById(req.user._id)
        .select('deliveryPartnerDetails.earnings deliveryPartnerDetails.totalEarnings');

    if (!deliveryPartner) {
        return res.status(404).json({ success: false, message: 'Delivery partner profile not found.' });
    }

    // You might also want to count the number of successfully delivered orders here
    const totalDeliveredOrders = await Order.countDocuments({
        deliveryPartner: req.user._id,
        status: 'delivered'
    });

    res.status(200).json({
        success: true,
        data: {
            currentEarnings: deliveryPartner.deliveryPartnerDetails.earnings || 0,
            totalEarnings: deliveryPartner.deliveryPartnerDetails.totalEarnings || 0,
            totalDeliveredOrders: totalDeliveredOrders
        }
    });
}));

// Get all delivered orders for a delivery partner
router.get(
  "/me/orders/delivered",
  protect,
  asyncHandler(async (req, res) => {
    if (req.user.role !== "deliveryPartner") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized. You are not a delivery partner.",
        });
    }

    const deliveredOrders = await Order.find({
      deliveryPartner: req.user._id,
      status: "delivered",
    })
      .populate("user", "username email phoneNumber")
      .populate("branchStation", "name")
      .populate('items.product')
      .populate("shippingAddress")
      .sort({ deliveredAt: -1 }); // Sort by deliveredAt in descending order

    res.status(200).json({ success: true, data: deliveredOrders });
  })
);


export default router;