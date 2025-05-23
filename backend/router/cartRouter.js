import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Cart from '../models/cartModel.js';

const router = express.Router();

/** 🛒 Add Standard Product to Cart */
router.post('/cart/standard', protect, async (req, res) => {
    try {
        const { productId, quantity, color, size } = req.body;
        const userId = req.user._id;

        const newItem = { productId, quantity, customizationId: null, totalPrice: 0, color, size };

        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $push: { items: newItem } },
            { new: true, upsert: true }
        );

        res.status(201).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/** 🎨 Add Customized Product to Cart */
router.post('/cart/customized', protect, async (req, res) => {
    try {
        const { productId, quantity, customizationId, color, size } = req.body;
        const userId = req.user._id;

        const newItem = { productId, quantity, customizationId, totalPrice: 0, color, size };

        const cart = await Cart.findOneAndUpdate(
            { userId },
            { $push: { items: newItem } },
            { new: true, upsert: true }
        );

        res.status(201).json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/** 🔍 Get Cart Details */
router.get('/cart', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user._id })
            .populate('items.productId')
            .populate('items.customizationId');

        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/** ✏️ Update Item Quantity in Cart */
router.put('/cart/item/:itemId', protect, async (req, res) => {
    try {
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be at least 1' });
        }

        const cart = await Cart.findOneAndUpdate(
            { userId: req.user._id, 'items._id': itemId },
            { $set: { 'items.$.quantity': quantity } },
            { new: true }
        );

        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/** ❌ Delete Item from Cart */
router.delete('/cart/item/:itemId', protect, async (req, res) => {
    try {
        const { itemId } = req.params;

        const cart = await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { $pull: { items: { _id: itemId } } },
            { new: true }
        );

        res.json(cart);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/** 🗑️ Clear the Entire Cart */
router.delete('/cart', protect, async (req, res) => {
    try {
        const cart = await Cart.findOneAndUpdate(
            { userId: req.user._id },
            { $set: { items: [] } },
            { new: true }
        );
        res.json({ message: 'Cart cleared successfully', cart });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

export default router;