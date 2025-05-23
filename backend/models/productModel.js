// src/models/productModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 255,
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        index: true,
    },
    description: {
        type: String,
        trim: true,
    },
    brand: {
        type: String,
        trim: true,
    },
    basePrice: {
        type: Number,
        required: true,
        min: 0,
    },
    availableColors: [{
        color: {
            type: String,
            trim: true,
            required: true,
        },
        images: {
            front: { type: String, comment: 'URL of the front view image.' },
            back: { type: String, comment: 'URL of the back view image.' },
            leftSleeve: { type: String, comment: 'URL of the left sleeve image (if applicable).' },
            rightSleeve: { type: String, comment: 'URL of the right sleeve image (if applicable).' },
            additional: [{ type: String, comment: 'Array of URLs for additional product images.' }],
        },
        printingPrices: {
            front: { type: Number, default: 0, min: 0, comment: 'Price for front printing (if applicable).' },
            back: { type: Number, default: 0, min: 0, comment: 'Price for back printing (if applicable).' },
            sleeve: { type: Number, default: 0, min: 0, comment: 'Price for sleeve printing (if applicable).' },
        },
        sizes: [{
            type: String,
            trim: true,
        }],
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        stock: { // Renamed from 'inventory' to 'stock'
            type: Number,
            default: 0,
            min: 0,
        },
    }],
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    tags: [{
        type: String,
        trim: true,
        index: true,
        comment: 'Keywords associated with the product, used for search and filtering.',
    }],
    // --- THIS IS THE CORRECTED PART ---
    feedback: [
        {
            type: mongoose.Schema.Types.ObjectId, // Correct type for an ObjectId
            ref: 'Feedback'                       // Direct reference to the 'Feedback' model
        }
    ],
    // --- END OF CORRECTED PART ---
    // Added for tracking average rating and review count
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    numberOfReviews: {
        type: Number,
        default: 0,
        min: 0,
    }
}, {
    timestamps: true,
});

productSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[\s-]+/g, '-');
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;