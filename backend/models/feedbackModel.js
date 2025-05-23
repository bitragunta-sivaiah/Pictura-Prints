// src/models/feedbackModel.js
import mongoose from 'mongoose';

const productFeedbackSubSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        trim: true,
        maxLength: 1000,
    },
    aspects: {
        type: [String],
        enum: [
            'product_quality',
            'product_accuracy',
            'pricing_value', // Can also apply to product
            'other_aspect'
        ],
        default: ['product_quality'],
    },
    issues: {
        type: [String],
        enum: [
            'item_damaged',
            'item_incorrect',
            'item_missing',
            'other_issue',
        ],
        default: [],
    },
    media: {
        type: [String],
        default: [],
    },
});

const deliveryFeedbackSubSchema = new mongoose.Schema({
    deliveryPartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Assuming delivery partners are also 'User' types
        required: true,
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
    },
    comment: {
        type: String,
        trim: true,
        maxLength: 1000,
    },
    aspects: {
        type: [String],
        enum: [
            'delivery_speed',
            'delivery_packaging',
            'delivery_partner_professionalism',
            'other_aspect'
        ],
        default: ['delivery_speed'],
    },
    issues: {
        type: [String],
        enum: [
            'delivery_late',
            'delivery_failed_attempt',
            'delivery_partner_behavior',
            'packaging_poor',
            'other_issue',
        ],
        default: [],
    },
});

const feedbackSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
            description: 'Reference to the user who submitted the feedback.',
        },
        // Overall order feedback fields
        overallRating: {
            type: Number,
            min: 1,
            max: 5,
            required: true, // The main rating for the order
            description: 'Overall rating given for the order.',
        },
        overallComment: {
            type: String,
            trim: true,
            maxLength: 1000,
            description: 'Optional: Free-text comment for the overall order experience.',
        },
        overallAspects: {
            type: [String],
            enum: [
                'overall_experience',
                'customer_service',
                'website_experience',
                'ease_of_ordering',
                'return_process',
                'refund_process',
                'other_aspect'
            ],
            default: ['overall_experience'],
            description: 'Aspects of the overall order experience.',
        },
        overallIssues: {
            type: [String],
            enum: [
                'website_technical_issue',
                'customer_service_unresponsive',
                'return_process_difficulty',
                'refund_delay',
                'other_issue',
            ],
            default: [],
            description: 'Issues related to the overall order experience.',
        },
        // Embedded document for delivery feedback
        deliveryFeedback: {
            type: deliveryFeedbackSubSchema,
            required: false,
            default: null,
        },
        // Embedded array for product-specific feedback
        productFeedbacks: {
            type: [productFeedbackSubSchema],
            default: [],
        },
        adminNotes: {
            type: String,
            trim: true,
            maxLength: 1000,
            description: 'Internal notes by administrators regarding this feedback.',
        },
        isPublic: {
            type: Boolean,
            default: false,
            description: 'Determines if this feedback is visible to other users (e.g., on product pages).',
        },
        isResolved: {
            type: Boolean,
            default: false,
            description: 'Indicates if the feedback issue (if any) has been addressed or resolved.',
        },
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
            description: 'Reference to the user who marked this feedback as resolved.',
        },
        resolvedAt: {
            type: Date,
            description: 'Timestamp when the feedback was marked as resolved.',
        },
    },
    {
        timestamps: true,
    }
);

// Add unique index to ensure one feedback per order per user
feedbackSchema.index({ order: 1, user: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;