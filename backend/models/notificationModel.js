import mongoose from 'mongoose';
const { Schema, model } = mongoose;

// Schema for the Notification model
const NotificationSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, required: true, trim: true },
        message: { type: String, required: true },
        orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
        customizationId: { type: Schema.Types.ObjectId, ref: 'Customization' },
        status: {
            type: String,
            trim: true,
            enum: [
                'pending', 'processing', 'shipped', 'delivered', 'cancelled',
                'design_created', 'design_approved', 'design_rejected', 'payment_received', 'payment_failed',
                'order_updated',
                'order_status_changed',
                'delivery_update',
                'return_requested',
                'return_approved',
                'return_rejected',
                'return_processed',
                'refund_requested',
                'refund_approved',
                'refund_processed',
                'customization_request',
                'customization_approved',
                'customization_rejected'
            ]
        },
        read: { type: Boolean, default: false },
        details: { type: Schema.Types.Mixed },
        relatedModel: {
            type: String,
            enum: ['Order', 'Customization', 'User', 'Product'],
            required: false
        },
        event: {
            type: String,
            trim: true,
            required: false
        },
        timestamp: {
            type: Date,
            default: Date.now,
            required: false
        },
    },
    {
        timestamps: true,
    }
);

// Create the Notification model
const NotificationModel = model('Notification', NotificationSchema);

export default NotificationModel;
