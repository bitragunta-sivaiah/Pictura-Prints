import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import Address from '../models/addressModel.js';
import mongoose from 'mongoose';

const addressRouter = express.Router();

// --- Address Routes ---

/**
 * @route POST /api/addresses
 * @description Create a new address for the user
 * @access Private
 */
addressRouter.post('/', protect, async (req, res) => {
    try {
        // Basic validation
        if (!req.body.fullName || !req.body.streetAddress || !req.body.city || !req.body.state || !req.body.postalCode || !req.body.country) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const address = new Address({
            userId: req.user._id,
            fullName: req.body.fullName,
            streetAddress: req.body.streetAddress,
            apartmentSuiteUnit: req.body.apartmentSuiteUnit,
            city: req.body.city,
            state: req.body.state,
            postalCode: req.body.postalCode,
            country: req.body.country,
            phone: req.body.phone,
            isDefault: req.body.isDefault || false,
            notes: req.body.notes,
            location: {
                type: 'Point',
                coordinates: req.body.location?.coordinates || [0, 0], // Important: Get coordinates from request
            },
        });

        const createdAddress = await address.save();

        // If this is the first address, set it as default
        if (req.body.isDefault) {
            await Address.updateMany(
                { userId: req.user._id, _id: { $ne: createdAddress._id } },
                { $set: { isDefault: false } }
            );
        } else {
            const existingDefault = await Address.findOne({ userId: req.user._id, isDefault: true });
            if (!existingDefault) {
                await Address.findByIdAndUpdate(createdAddress._id, { isDefault: true });
            }
        }

        res.status(201).json({
            message: 'Address created successfully',
            address: createdAddress,
        });
    } catch (error) {
        console.error("Error creating address:", error);
        res.status(500).json({ message: 'Error creating address', error: error.message });
    }
});

/**
 * @route GET /api/addresses
 * @description Get all addresses for the logged-in user
 * @access Private
 */
addressRouter.get('/', protect, async (req, res) => {
    try {
        const addresses = await Address.find({ userId: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        console.error("Error fetching addresses:", error);
        res.status(500).json({ message: 'Error fetching addresses', error: error.message });
    }
});

/**
 * @route GET /api/addresses/:id
 * @description Get a single address by ID
 * @access Private
 */
addressRouter.get('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        // Check if the user owns the address
        if (address.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        res.json(address);
    } catch (error) {
        console.error("Error fetching address:", error);
        res.status(500).json({ message: 'Error fetching address', error: error.message });
    }
});

/**
 * @route PUT /api/addresses/:id
 * @description Update an existing address
 * @access Private
 */
addressRouter.put('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Check if the user owns the address
        if (address.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Update fields
        address.fullName = req.body.fullName || address.fullName;
        address.streetAddress = req.body.streetAddress || address.streetAddress;
        address.apartmentSuiteUnit = req.body.apartmentSuiteUnit || address.apartmentSuiteUnit;
        address.city = req.body.city || address.city;
        address.state = req.body.state || address.state;
        address.postalCode = req.body.postalCode || address.postalCode;
        address.country = req.body.country || address.country;
        address.phone = req.body.phone || address.phone;
        address.isDefault = req.body.isDefault || address.isDefault;
        address.notes = req.body.notes || address.notes;
        address.location = req.body.location || address.location; // Important: Update the entire location object
        address.updatedAt = Date.now();

        const updatedAddress = await address.save();

        if (req.body.isDefault) {
            await Address.updateMany(
                { userId: req.user._id, _id: { $ne: updatedAddress._id } },
                { $set: { isDefault: false } }
            );
        }

        res.json({ message: 'Address updated successfully', address: updatedAddress });
    } catch (error) {
        console.error("Error updating address:", error);
        res.status(500).json({ message: 'Error updating address', error: error.message });
    }
});

/**
 * @route DELETE /api/addresses/:id
 * @description Delete an address
 * @access Private
 */
addressRouter.delete('/:id', protect, async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // Check if the user owns the address
        if (address.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await Address.findByIdAndDelete(req.params.id);
        res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error("Error deleting address:", error);
        res.status(500).json({ message: 'Error deleting address', error: error.message });
    }
});

export default addressRouter;
