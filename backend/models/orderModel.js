import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
    {
        // --- Basic Order Information ---
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model
            required: true,
            index: true,
        },
        orderDate: {
            type: Date,
            default: Date.now,
        },
        status: { // Overall status of the order (forward and return journey)
            type: String,
            enum: [
                'pending',             // Order placed, waiting for payment confirmation
                'processing',          // Payment confirmed, order being processed
                'confirm',             // Order confirmed
                'shipped',             // Order shipped to the first branch station (assigned to branch)
                'at_branch',           // Order arrived at the destination branch
                'assigned',            // Order assigned to delivery partner
                'accepted',            // Delivery partner accepted the order
                'picked_up',           // Delivery partner picked up the order (for delivery)
                'in_transit',          // Order in transit to customer
                'out_for_delivery',    // Order is out for delivery
                'delivered',           // Order delivered to the customer
                'completed',           // Order is completed (e.g., after review or full process)
                'cancelled',           // Order cancelled by customer or admin
                'refunded',            // Order refunded (can be part of cancelled or returned)
                'failed',              // Order failed for various reasons (e.g., payment, stock)
                'failed_delivery',     // Delivery attempt failed
                'return_requested',    // Customer requested a return (new status)
                'pending_pickup',      // Return order waiting for pickup at customer location (assigned to DP for pickup)
                'pickup_failed',  
                "refund_initiated"   ,  // Return pickup attempt failed
                'picked_up_for_return',// Return picked up by delivery partner
                'in_transit_to_branch',// Return parcel in transit back to branch/warehouse
                'returned_to_branch',  // Return arrived back at a branch
                'delivered_to_warehouse', // Return arrived at the central warehouse
                'return_processing',   // Return being processed for refund/exchange
                'return_completed',    // Return process fully completed (refund/exchange done)
            ],
            default: 'pending',
            index: true,
        },
        orderNumber: { // Added orderNumber field
            type: String,
            unique: true,
            trim: true,
            index: true,
        },
        // --- Order Items ---
        items: [{
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // Reference to the Product model
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            basePrice: {         // Base price of the product at the time of order
                type: Number,
                required: true,
            },
            color: { type: String, trim: true },
            size: { type: String, trim: true },
            customizations: [{ // References to the Customization model
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Customization',
            }],
            finalPrice: {        // Price of this specific item (including customization)
                type: Number,
                required: true,
            }
        }],
        // --- Shipping Information ---
        shippingAddress: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address', // Reference to the Address model
            required: true
        },
        shippingMethod: {
            type: String,
            trim: true,
        },
        shippingCost: {
            type: Number,
            required: true,
            min: 0,
        },
        // --- Billing Information ---
        billingAddress: { // Separate billing address (optional, might be same as shipping)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Address', // Reference to the Address model
            required: true
        },
        // --- Payment Information ---
        paymentMethod: {
            type: String,
            enum: ['cod', 'paypal', 'stripe', 'other'], // Supported payment methods
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending',
            index: true,
        },
        transactionId: { // Store transaction ID from payment gateway (for PayPal, Stripe)
            type: String,
            trim: true,
        },
        // --- Totals ---
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        tax: {
            type: Number,
            default: 0,
            min: 0,
        },
        total: {         // calculated total
            type: Number,
            required: true,
            min: 0,
        },
        // --- Tracking Information (Forward Delivery) ---
        trackingNumber: {
            type: String,
            trim: true,
            index: true,
        },
        trackingDetails: [ // Array for forward delivery tracking updates
            {
                status: { type: String, trim: true, required: true },
                date: { type: Date, default: Date.now },
                location: { type: String, trim: true },
                notes: { type: String, trim: true }, // Added notes for more detail
            },
        ],
        // --- Delivery Partner Information ---
        deliveryPartner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Reference to the User model (deliveryPartner)
            index: true,
            default: null, // Initially no delivery partner assigned
        },
        deliveryOrderEarning:{
            type:Number // Changed to Number for calculation purposes
        },
        deliveryPartnerStatus: { // Status updates from the delivery partner for delivery
            type: String,
            enum: [
                'assigned',
                'accepted',         // Order assigned to delivery partner
                'picked_up',        // Delivery partner picked up the order
                'in_transit',       // Order in transit
                'out_for_delivery', // Order is out for delivery
                'delivered',        // Delivery partner delivered the order
                'failed_delivery',  // Delivery failed
                'returned',         // Order returned (e.g., undeliverable, customer refused)
                'picked_up_for_return', // DP picked up return item
                'in_transit_to_branch', // DP en route to branch with return
                'returned_to_branch', // DP delivered return to branch
                'pickup_failed' // DP failed to pickup return
            ],
            index: true,
        },
        deliveryPartnerTrackingId: { // Delivery partner's tracking ID (if different)
            type: String,
            trim: true
        },
        assignedToDeliveryPartnerBy: { // Who assigned the order to delivery partner
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Could be Branch Manager or Admin
            index: true,
        },
        assignedAt: { // Timestamp of when the order was last assigned to a delivery partner
            type: Date,
        },
        // --- Delivery Assignment Status (for tracking assignment attempts) ---
        deliveryAssignment: { // For tracking negotiation/assignment process with DPs
            deliveryPartner: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                index: true,
            },
            status: {
                type: String,
                enum: ['pending', 'offered', 'accepted', 'rejected'],
                default: 'pending',
                index: true,
            },
            assignedAt: {
                type: Date,
                default: Date.now,
            },
            responseAt: {
                type: Date,
            },
            rejectionReason: {
                type: String,
                trim: true,
            },
        },
        // --- COD Specific ---
        codVerificationCode: { // For COD verification
            type: String,
            trim: true,
        },
        codCollectedAmount: { // amount collected by delivery partner.
            type: Number,
            default: 0,
            min: 0
        },
        // --- Order Notes ---
        orderNotes: { // For any special instructions or notes
            type: String,
            trim: true,
        },
        // --- Return Information ---
        isReturnRequested: {
            type: Boolean,
            default: false,
            index: true
        },
        returnRequestDate: {
            type: Date
        },
        returnStatus: { // Overall status of the return process
            type: String,
            enum: [
                'pending',             // Return requested, waiting for approval
                'approved',            // Return approved, awaiting customer action/pickup
                'rejected',            // Return request rejected
                'pending_pickup',      // Return order waiting for pickup from customer
                'pickup_failed',       // Attempted pickup but failed
                'picked_up',           // Return picked up by delivery partner
                'in_transit',          // Return parcel in transit back to warehouse/branch
                'returned_to_branch',  // Return arrived back at a branch/local hub
                'delivered_to_warehouse', // Return arrived at the central warehouse
                'return_processing',   // Return being inspected/processed for refund/exchange
                'refund_initiated',    // Refund process has started
                'refunded',            // Refund completed
                'exchange_initiated',  // For exchanges, if applicable
                'exchanged',           // Exchange completed
                'closed',              // Return process completed
                'failed_delivery_to_warehouse', // Return shipment failed to reach warehouse
            ],
            default: 'pending',
            index: true
        },
        returnReason: { // General reason for the return (e.g., "damaged", "wrong size")
            type: String,
            trim: true
        },
        returnTrackingNumber: { // Main tracking number for the return shipment
            type: String,
            trim: true
        },
        returnLabelImageUrl: { // URL for the generated return shipping label
            type: String,
            trim: true
        },
        returnTrackingDetails: [ // Array for detailed return tracking updates
            {
                status: { type: String, trim: true, required: true }, // e.g., "Pickup Scheduled", "Item inspected"
                date: { type: Date, default: Date.now },
                location: { type: String, trim: true }, // e.g., "Customer Address", "Warehouse"
                notes: { type: String, trim: true }, // Additional details about the event
            },
        ],
        returnedItems: [{ // To track which specific items were returned and their condition/reason
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            },
            returnReason: { // Specific reason for *this item's* return (can override general returnReason)
                type: String,
                trim: true,
            },
            condition: { // Condition of the item upon return
                type: String,
                enum: ['good', 'damaged', 'used', 'missing_parts'],
                trim: true,
            },
        }],
        // --- Refund Information ---
        refundStatus: {
            type: String,
            enum: ['not_requested', 'requested', 'approved', 'processed', 'failed'],
            default: 'not_requested',
            index: true
        },
        refundAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        refundReason: { // Reason for the refund (might be same as returnReason or more specific)
            type: String,
            trim: true
        },
        refundInitiationDate: {
            type: Date
        },
        refundProcessedDate: {
            type: Date
        },
        refundTransactionId: { // Transaction ID for the refund
            type: String,
            trim: true
        },
        // --- Coupon Information ---
        coupon: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Coupon'
        },
         couponCodeUsed: { // Store the actual code used for reference
        type: String,
        trim: true,
        uppercase: true
    },
        discountAmount: {
            type: Number,
            default: 0,
            min: 0
        },
        // --- Branch Station Information ---
        branchStation: {         // Branch Station for this order (where it's processed/stored)
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BranchStation',
            index: true,
        },
        // --- Review Status ---
        isReviewed: {
            type: Boolean,
            default: false,
            index: true,
        },
    },
    {
        timestamps: true // Adds createdAt and updatedAt fields automatically
    }
);

// Middleware to set initial returnTrackingDetails when a return is requested
orderSchema.pre('save', function(next) {
    if (this.isModified('isReturnRequested') && this.isReturnRequested && this.returnTrackingDetails.length === 0) {
        this.returnTrackingDetails.push({
            status: 'Return request initiated',
            date: new Date(),
            location: 'Customer side',
            notes: 'Initial return request received.'
        });
    }
    next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;