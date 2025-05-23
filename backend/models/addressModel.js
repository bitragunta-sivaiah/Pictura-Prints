import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming you have a User model
        required: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
    },
    streetAddress: {
        type: String,
        required: true,
        trim: true,
    },
    apartmentSuiteUnit: {
        type: String,
        trim: true, // Optional field for apartment, suite, or unit number
    },
    city: {
        type: String,
        required: true,
        trim: true,
    },
    state: {
        type: String,
        required: true,
        trim: true,
    },
    postalCode: {
        type: String,
        required: true,
        trim: true,
    },
    country: {
        type: String,
        required: true,
        trim: true,
        default: 'India', // You can set a default country
    },
    phone: {
        type: String,
        trim: true,
    },
    isDefault: {
        type: Boolean,
        default: false, // Option to mark an address as the default shipping address
    },
    notes: {
        type: String,
        trim: true, // Optional notes or delivery instructions
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            index: '2dsphere', // For geospatial queries
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

const Address = mongoose.model('Address', addressSchema);

export default Address;