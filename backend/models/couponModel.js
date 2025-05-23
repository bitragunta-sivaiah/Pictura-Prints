// coupon.model.js
import mongoose, { Schema } from 'mongoose';

const couponSchema = new Schema(
    {
        code: { type: String, required: true, unique: true, trim: true, uppercase: true },
        description: { type: String },
        type: {
            type: String,
            enum: ['percentage', 'fixed_amount', 'free_shipping'],
            required: true,
            default: 'fixed_amount'
        },
        value: { type: Number, required: true, min: 0 },
        minOrderValue: { type: Number, default: 0, min: 0 },
        maxDiscountAmount: { type: Number, min: 0 }, // For percentage discounts
        usageLimit: { type: Number, min: 0 },
        usageCount: { type: Number, default: 0, min: 0 },
        validFrom: { type: Date },
        validUntil: { type: Date },
        isActive: { type: Boolean, default: true },
      
        applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }], // Optional: Apply to specific products
        applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }], // Optional: Apply to specific categories
        applicableUsers: [{ type: Schema.Types.ObjectId, ref: 'User' }], // Optional: Apply to specific users
    },
    { timestamps: true }
);

export const Coupon = mongoose.model('Coupon', couponSchema);