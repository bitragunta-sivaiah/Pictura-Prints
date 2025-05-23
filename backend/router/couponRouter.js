import express from 'express';
import { Coupon } from '../models/couponModel.js';  

const router = express.Router();

// Route to get all coupons (admin only - add authentication middleware)
router.get('/admin/coupons', async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Failed to fetch coupons' });
    }
});

// Route to get a specific coupon by code
router.get('/check/:code', async (req, res) => {
    const { code } = req.params;
    try {
        const coupon = await Coupon.findOne({ code });
        if (coupon && coupon.isActive && (!coupon.validFrom || coupon.validFrom <= new Date()) && (!coupon.validUntil || coupon.validUntil >= new Date()) && (coupon.usageLimit === undefined || coupon.usageCount < coupon.usageLimit)) {
            res.status(200).json(coupon);
        } else {
            res.status(404).json({ message: 'Invalid or expired coupon code' });
        }
    } catch (error) {
        console.error('Error checking coupon:', error);
        res.status(500).json({ message: 'Failed to check coupon' });
    }
});

// Route to create a new coupon (admin only - add authentication and validation middleware)
router.post('/admin/coupons', async (req, res) => {
    try {
        const newCoupon = new Coupon(req.body);
        const savedCoupon = await newCoupon.save();
        res.status(201).json(savedCoupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.code) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        res.status(500).json({ message: 'Failed to create coupon', error: error.message });
    }
});

// Route to update an existing coupon (admin only - add authentication and validation middleware)
router.put('/admin/coupons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
        if (updatedCoupon) {
            res.status(200).json(updatedCoupon);
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        console.error('Error updating coupon:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.code) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }
        res.status(500).json({ message: 'Failed to update coupon', error: error.message });
    }
});
// Route to delete a coupon (admin only - add authentication middleware)
router.delete('/admin/coupons/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(id);
        if (deletedCoupon) {
            res.status(200).json({ message: 'Coupon deleted successfully' });
        } else {
            res.status(404).json({ message: 'Coupon not found' });
        }
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Failed to delete coupon' });
    }
});

export default router;