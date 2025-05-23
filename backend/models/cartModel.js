import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    customizationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customization', default: null },
    color: { type: String, required: true },  
    size: { type: String, required: true },  
    totalPrice: { type: Number, required: true, min: 0 }
});

const cartSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [cartItemSchema],
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
});

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;