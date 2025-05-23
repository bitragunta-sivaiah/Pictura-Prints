import express from 'express';
import mongoose from 'mongoose';
import Customization from '../models/customizationModel.js';
import Product from '../models/productModel.js';
import { protect } from '../middleware/authMiddleware.js';

const customizationRouter = express.Router();
customizationRouter.use(express.json());

// Route to get a single Customization by ID
customizationRouter.get('/customizations/:id', protect, async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid Customization ID' });
        }

        const customization = await Customization.findById(id).populate('userId', 'name email').populate('productId', 'name description');

        if (!customization) {
            return res.status(404).json({ message: 'Customization not found' });
        }

        res.status(200).json(customization);
    } catch (error) {
        console.error('Error fetching customization by ID:', error);
        res.status(500).json({ message: 'Failed to fetch customization' });
    }
});

// Route to get a user's customization for a specific product
customizationRouter.get('/products/:productId/users/:userId/customization', protect, async (req, res) => {
    try {
        const { productId, userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const customization = await Customization.findOne({ productId: productId, userId: userId }).populate('productId');

        if (!customization) {
            return res.status(404).json({ message: 'Customization not found for this product and user' });
        }

        res.status(200).json(customization);
    } catch (error) {
        console.error('Error fetching customization:', error);
        res.status(500).json({ message: 'Failed to fetch customization' });
    }
});


// Route to save or update a user's customization for a specific product
customizationRouter.post('/products/:productId/customization', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;
        const customizationData = req.body;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Ensure only allowed customization data is saved
        const allowedAreas = ['front', 'back', 'leftSleeve', 'rightSleeve'];
        const filteredCustomizationData = {};
        allowedAreas.forEach(area => {
            if (customizationData[area]) {
                filteredCustomizationData[area] = customizationData[area];
            }
        });

        const existingCustomization = await Customization.findOne({ productId, userId });

        if (existingCustomization) {
            // Update existing customization
            existingCustomization.set(filteredCustomizationData);
            const updatedCustomization = await existingCustomization.save();
            const populatedCustomization = await updatedCustomization.populate('productId');
            res.status(200).json(populatedCustomization);
        } else {
            // Create new customization
            const newCustomization = new Customization({
                productId,
                userId,
                ...filteredCustomizationData,
            });

            try {
                const savedCustomization = await newCustomization.save();
                const populatedCustomization = await savedCustomization.populate('productId'); // Populate after saving
                res.status(201).json(populatedCustomization);
            } catch (saveError) {
                console.error("Error saving new customization:", saveError);
                return res.status(500).json({ message: 'Failed to save new customization', error: saveError }); // Return error
            }
        }
    } catch (error) {
        console.error('Error saving/updating customization:', error);
        res.status(500).json({ message: 'Failed to save/update customization', error }); // Include the error
    }
});

// Route to delete a user's customization for a specific product
customizationRouter.delete('/products/:productId/customization', protect, async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user._id;

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const deletedCustomization = await Customization.findOneAndDelete({ productId, userId });

        if (!deletedCustomization) {
            return res.status(404).json({ message: 'Customization not found for this product and user' });
        }

        res.status(200).json({ message: 'Customization deleted successfully' });
    } catch (error) {
        console.error('Error deleting customization:', error);
        res.status(500).json({ message: 'Failed to delete customization' });
    }
});

export default customizationRouter;