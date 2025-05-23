import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const EventSchema = new Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
        type: String,
        enum: ['promotion', 'announcement', 'sale', 'customization_update', 'order_update', 'delivery_update', 'other'],
        required: true,
        trim: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    imageUrl: { type: String, trim: true },
    posterLinks: [{  // Added posterLinks
        url: { type: String, trim: true },
    }],
    targetAudience: {
        type: String,
        enum: ['all', 'users','specific_users' ,'specific_orders', 'specific_order_product'],
        
        trim: true
    },
    targetUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    relatedOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    isActive: { type: Boolean, default: true },
    details: [{ type: Schema.Types.Mixed }],
}, {
    timestamps: true
});

const EventModel = model('Event', EventSchema);

export default EventModel;
