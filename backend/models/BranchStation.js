import mongoose from "mongoose";

const branchStationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    address: {
        type: String, // Assuming a simple string for now. Consider a separate Address model for more complex needs.
        required: true,
        trim: true
    },
    location: { // GeoJSON for location
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number],   // [longitude, latitude]
            required: true,
            index: '2dsphere', //   for geospatial queries
        },
    },
    city: { type: String, required: true, trim: true },
    email: {
        type: String,
    },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    imageUrl: {
        type: String,
    },
    manager: {   // Reference to the Branch Manager
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true,
    },
    contactPerson: {   // contact person
        type: String,
        trim: true
    },
    contactPhone: {   // contact phone
        type: String,
        trim: true
    },
    operatingRadius: {   // in KM
        type: Number,
        default: 10,
        min: 1
    },
    orders: [{ // Orders assigned to this branch
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    }],
    deliveryPartners: [{ // Delivery partners associated with this branch
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // --- Branch Manager Application ---
    managerApplication: {
        user: {   // User applying to be a manager
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Make it false initially, it will be populated on application
            index: true,
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true
        },
        applicationDate: { type: Date, default: Date.now },
        reason: { type: String, trim: true }, // Add a reason
        documents: [{ type: String }],
        rejectionReason: { type: String, trim: true },
    },
}, { timestamps: true });


// Ensure the 2dsphere index is created on the 'location' field
branchStationSchema.index({ location: '2dsphere' });

const BranchStation = mongoose.model('BranchStation', branchStationSchema);

export { BranchStation };