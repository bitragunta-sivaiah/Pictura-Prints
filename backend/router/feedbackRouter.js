// src/routes/feedbackRoutes.js
import express from 'express';
import Feedback from '../models/feedbackModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose'; // Ensure mongoose is imported for ObjectId

const router = express.Router();

// Helper function to update product's average rating and review count
const updateProductStats = async (productId) => {
    try {
        // Consider public feedback for the specific product (from productFeedbacks array)
        const productFeedbacks = await Feedback.aggregate([
            { $match: { isPublic: true, "productFeedbacks.product": new mongoose.Types.ObjectId(productId) } }, // Use new for ObjectId
            { $unwind: "$productFeedbacks" },
            { $match: { "productFeedbacks.product": new mongoose.Types.ObjectId(productId), isPublic: true } }, // Ensure public and specific product
            {
                $group: {
                    _id: null,
                    totalRatings: { $sum: "$productFeedbacks.rating" },
                    numberOfReviews: { $sum: 1 }
                }
            }
        ]);

        let averageRating = 0;
        let numberOfReviews = 0;
        let totalRatings = 0; // Initialize totalRatings

        if (productFeedbacks.length > 0) {
            totalRatings = productFeedbacks[0].totalRatings;
            numberOfReviews = productFeedbacks[0].numberOfReviews;
            averageRating = numberOfReviews > 0 ? (totalRatings / numberOfReviews) : 0;
        }

        await Product.findByIdAndUpdate(productId, { averageRating: averageRating.toFixed(1), numberOfReviews: numberOfReviews });
    } catch (error) {
        console.error(`Error updating product stats for product ${productId}:`, error);
    }
};

// GET /api/feedback/product/:productId - Get all public feedback for a specific product
router.get('/product/:productId', async (req, res) => {
    try {
        const { productId } = req.params;
        const productExists = await Product.findById(productId);
        if (!productExists) return res.status(404).json({ message: 'Product not found.' });

        // Find feedback documents that contain feedback for this specific product and are public
        const feedback = await Feedback.find({
            "productFeedbacks.product": productId,
            isPublic: true
        })
            .populate('user', 'name avatar')
            .populate({
                path: 'productFeedbacks.product',
                select: 'name imageUrl'
            })
            .sort({ createdAt: -1 });

        // Filter and return only the relevant product feedback parts if needed, or the whole document
        // For now, sending the whole document and letting the frontend extract product specific parts
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching product feedback.' });
    }
});

// POST /api/feedback - Submit new comprehensive feedback
router.post('/', protect, async (req, res) => {
    const {
        order: orderId,
        overallRating,
        overallComment,
        overallAspects,
        overallIssues,
        deliveryFeedback, // This will be an object { deliveryPartner, rating, comment, aspects, issues }
        productFeedbacks, // This will be an array of objects for each product
    } = req.body;
    const userId = req.user._id;

    try {
        // 1. Validate overall order feedback
        if (!orderId || !overallRating) {
            return res.status(400).json({ message: 'Order ID and overall rating are required.' });
        }
        if (overallRating < 1 || overallRating > 5) {
            return res.status(400).json({ message: 'Overall rating must be between 1 and 5.' });
        }
        if (overallComment && overallComment.length > 1000) {
            return res.status(400).json({ message: 'Overall comment cannot exceed 1000 characters.' });
        }
        if (overallAspects && (!Array.isArray(overallAspects) || overallAspects.some(a => !Feedback.schema.path('overallAspects').caster.enumValues.includes(a)))) {
            return res.status(400).json({ message: 'Invalid overall aspect(s) provided.' });
        }
        if (overallIssues && (!Array.isArray(overallIssues) || overallIssues.some(i => !Feedback.schema.path('overallIssues').caster.enumValues.includes(i)))) {
            return res.status(400).json({ message: 'Invalid overall issue(s) provided.' });
        }


        const existingOrder = await Order.findOne({ _id: orderId, user: userId });
        if (!existingOrder) {
            return res.status(404).json({ message: 'Order not found or does not belong to you.' });
        }

        // Check for existing feedback for this order from this user
        const existingFeedback = await Feedback.findOne({ order: orderId, user: userId });
        if (existingFeedback) {
            return res.status(400).json({ message: 'You have already submitted feedback for this order. Please update existing feedback if needed.' });
        }

        // 2. Validate and process delivery feedback if provided
        let deliveryFeedbackData = null;
        if (deliveryFeedback) {
            const { deliveryPartner, rating, comment, aspects, issues } = deliveryFeedback;
            if (!deliveryPartner || !rating) {
                return res.status(400).json({ message: 'Delivery Partner ID and rating are required for delivery feedback.' });
            }
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: 'Delivery rating must be between 1 and 5.' });
            }
            // Optional: Check if the provided deliveryPartner matches the one in the order
            if (existingOrder.deliveryPartner && existingOrder.deliveryPartner.toString() !== deliveryPartner.toString()) {
                console.warn(`Delivery partner ID mismatch for order ${orderId}. Submitted: ${deliveryPartner}, Order DP: ${existingOrder.deliveryPartner}`);
                // return res.status(400).json({ message: 'The provided delivery partner does not match the one for this order.' });
            }

            deliveryFeedbackData = { deliveryPartner, rating, comment, aspects, issues };
        }

        // 3. Validate and process product feedback if provided
        const productFeedbacksData = [];
        if (productFeedbacks && Array.isArray(productFeedbacks)) {
            for (const pf of productFeedbacks) {
                const { product, rating, comment, aspects, issues, media } = pf;

                if (!product || !rating) {
                    return res.status(400).json({ message: `Product ID and rating are required for product feedback.` });
                }
                if (rating < 1 || rating > 5) {
                    return res.status(400).json({ message: `Product rating for ${product} must be between 1 and 5.` });
                }

                // Check if product exists and is part of the order
                const productExists = await Product.findById(product);
                if (!productExists) {
                    return res.status(404).json({ message: `Product with ID ${product} not found.` });
                }
                const productInOrder = existingOrder.items.some(item => item.product.toString() === product);
                if (!productInOrder) {
                    return res.status(400).json({ message: `Product with ID ${product} is not part of this order.` });
                }

                productFeedbacksData.push({ product, rating, comment, aspects, issues, media });
            }
        }

        // Create the new comprehensive feedback document
        const newFeedback = new Feedback({
            order: orderId,
            user: userId,
            overallRating,
            overallComment,
            overallAspects,
            overallIssues,
            deliveryFeedback: deliveryFeedbackData,
            productFeedbacks: productFeedbacksData,
            isPublic: false, // Default to private until admin review
        });

        const savedFeedback = await newFeedback.save();

        // --- NEW LOGIC: Push feedback ID to associated products ---
        if (savedFeedback.productFeedbacks && savedFeedback.productFeedbacks.length > 0) {
            for (const pf of savedFeedback.productFeedbacks) {
                await Product.findByIdAndUpdate(
                    pf.product,
                    { $addToSet: { feedback: savedFeedback._id } }, // Use $addToSet to prevent duplicates
                    { new: true, runValidators: true }
                );
            }
        }
        // --- END NEW LOGIC ---

        // Update product stats for all products included in the feedback
        // This only happens if the overall feedback is public, which is controlled by admin.
        // The `feedback` array on the product model should contain all feedback documents,
        // regardless of their `isPublic` status, as it's a reference to the comprehensive feedback.
        if (savedFeedback.isPublic) {
            for (const pf of savedFeedback.productFeedbacks) {
                await updateProductStats(pf.product);
            }
        }

        // Mark order as reviewed
        if (existingOrder.status === 'delivered') {
            existingOrder.isReviewed = true;
            await existingOrder.save();
        }

        res.status(201).json(savedFeedback);
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error while submitting feedback.' });
    }
});


// GET /api/feedback/my-feedback - Get all feedback submitted by the authenticated user
// This route now fetches the comprehensive feedback document
router.get('/my-feedback', protect, async (req, res) => {
    try {
        const feedback = await Feedback.find({ user: req.user._id })
            .populate('order', 'orderNumber status total')
            .populate('deliveryFeedback.deliveryPartner', 'name avatar') // Populate nested deliveryPartner
            .populate('productFeedbacks.product', 'name slug imageUrl') // Populate nested product
            .sort({ createdAt: -1 });
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching user feedback.' });
    }
});

// GET /api/feedback/:id - Get a single feedback entry by ID (user owns it or is admin)
router.get('/:id', protect, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id)
            .populate('order', 'orderNumber status total')
            .populate('user', 'name avatar')
            .populate('deliveryFeedback.deliveryPartner', 'name')
            .populate('productFeedbacks.product', 'name slug imageUrl');

        if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
        if (feedback.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized to view this feedback.' });
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching feedback.' });
    }
});

// PUT /api/feedback/:id - Update feedback (only by the user who submitted it)
// This update route now allows updating parts of the comprehensive feedback
router.put('/:id', protect, async (req, res) => {
    const {
        overallRating,
        overallComment,
        overallAspects,
        overallIssues,
        deliveryFeedback, // object for delivery feedback
        productFeedbacks, // array of objects for product feedback
        isPublic // User can't change this, but for completeness in admin toggle
    } = req.body;
    const userId = req.user._id;

    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
        if (feedback.user.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized to update this feedback.' });

        // Store old product IDs to potentially update their stats later
        const oldProductIds = new Set(feedback.productFeedbacks.map(pf => pf.product.toString()));

        // Update overall feedback fields
        if (overallRating !== undefined) {
            if (overallRating < 1 || overallRating > 5) return res.status(400).json({ message: 'Overall rating must be between 1 and 5.' });
            feedback.overallRating = overallRating;
        }
        if (overallComment !== undefined) feedback.overallComment = overallComment;
        if (overallAspects !== undefined) feedback.overallAspects = overallAspects;
        if (overallIssues !== undefined) feedback.overallIssues = overallIssues;


        // Update delivery feedback
        if (deliveryFeedback !== undefined) {
            if (deliveryFeedback === null) {
                feedback.deliveryFeedback = null;
            } else {
                // Ensure existing deliveryFeedback subdocument exists or create a new one
                if (!feedback.deliveryFeedback) {
                    feedback.deliveryFeedback = {};
                }
                if (deliveryFeedback.deliveryPartner !== undefined) feedback.deliveryFeedback.deliveryPartner = deliveryFeedback.deliveryPartner;
                if (deliveryFeedback.rating !== undefined) {
                    if (deliveryFeedback.rating < 1 || deliveryFeedback.rating > 5) return res.status(400).json({ message: 'Delivery rating must be between 1 and 5.' });
                    feedback.deliveryFeedback.rating = deliveryFeedback.rating;
                }
                if (deliveryFeedback.comment !== undefined) feedback.deliveryFeedback.comment = deliveryFeedback.comment;
                if (deliveryFeedback.aspects !== undefined) feedback.deliveryFeedback.aspects = deliveryFeedback.aspects;
                if (deliveryFeedback.issues !== undefined) feedback.deliveryFeedback.issues = deliveryFeedback.issues;
            }
        }

        // Update product feedback (this is more complex as it's an array)
        if (productFeedbacks !== undefined) {
            const updatedProductFeedbacks = [];
            const newProductIds = new Set(); // To track products in the updated feedback

            for (const pf of productFeedbacks) {
                const { product, rating, comment, aspects, issues, media } = pf;
                if (!product || !rating) {
                    return res.status(400).json({ message: `Product ID and rating are required for product feedback update.` });
                }
                if (rating < 1 || rating > 5) {
                    return res.status(400).json({ message: `Product rating for ${product} must be between 1 and 5.` });
                }
                updatedProductFeedbacks.push({ product, rating, comment, aspects, issues, media });
                newProductIds.add(product.toString());
            }
            feedback.productFeedbacks = updatedProductFeedbacks;

            // --- NEW LOGIC for PUT: Update product's feedback array references ---
            // Remove feedback ID from products that are no longer in the productFeedbacks array
            for (const oldId of oldProductIds) {
                if (!newProductIds.has(oldId)) {
                    await Product.findByIdAndUpdate(
                        oldId,
                        { $pull: { feedback: feedback._id } },
                        { new: true, runValidators: true }
                    );
                }
            }
            // Add feedback ID to new or existing products in the productFeedbacks array
            for (const newId of newProductIds) {
                await Product.findByIdAndUpdate(
                    newId,
                    { $addToSet: { feedback: feedback._id } },
                    { new: true, runValidators: true }
                );
            }
            // --- END NEW LOGIC for PUT ---
        }

        const updatedFeedback = await feedback.save();

        // Recalculate product stats for all affected products if the feedback is public
        // This includes products that were in the old feedback and those in the new feedback.
        const allAffectedProductIds = new Set([...oldProductIds, ...feedback.productFeedbacks.map(pf => pf.product.toString())]);

        if (updatedFeedback.isPublic) {
            for (const productId of allAffectedProductIds) {
                await updateProductStats(productId);
            }
        } else {
            // If feedback becomes private, ensure product stats are re-calculated to remove its influence
            for (const productId of allAffectedProductIds) {
                await updateProductStats(productId);
            }
        }

        res.status(200).json(updatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating feedback.' });
    }
});


// GET /api/feedback/admin/all - Get all feedback (for admin panel)
router.get('/admin/all', protect, admin, async (req, res) => {
    try {
        const feedback = await Feedback.find({})
            .populate('order', 'orderNumber status total')
            .populate('user', 'name email')
            .populate('deliveryFeedback.deliveryPartner', 'name email')
            .populate('productFeedbacks.product', 'name slug')
            .sort({ createdAt: -1 });
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching all feedback.' });
    }
});

// PUT /api/feedback/admin/:id/visibility - Toggle public visibility of feedback (Admin)
router.put('/admin/:id/visibility', protect, admin, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });

        const previousIsPublic = feedback.isPublic;
        feedback.isPublic = !feedback.isPublic;
        const updatedFeedback = await feedback.save();

        // Recalculate product stats if visibility changed and product feedback exists
        if (updatedFeedback.productFeedbacks.length > 0 && previousIsPublic !== updatedFeedback.isPublic) {
            for (const pf of updatedFeedback.productFeedbacks) {
                await updateProductStats(pf.product);
            }
        }
        res.status(200).json({ message: `Feedback visibility toggled to ${updatedFeedback.isPublic ? 'public' : 'private'}.`, feedback: updatedFeedback });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating feedback visibility.' });
    }
});

// PUT /api/feedback/admin/:id/resolve - Mark feedback as resolved and add admin notes (Admin)
router.put('/admin/:id/resolve', protect, admin, async (req, res) => {
    const { adminNotes, isResolved } = req.body;
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });
        feedback.adminNotes = adminNotes !== undefined ? adminNotes : feedback.adminNotes;
        feedback.isResolved = isResolved !== undefined ? isResolved : !feedback.isResolved;
        feedback.resolvedBy = req.user._id;
        feedback.resolvedAt = new Date();
        const updatedFeedback = await feedback.save();
        res.status(200).json(updatedFeedback);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while updating feedback resolution status.' });
    }
});

// DELETE /api/feedback/admin/:id - Delete feedback (Admin only)
router.delete('/admin/:id', protect, admin, async (req, res) => {
    try {
        const feedback = await Feedback.findByIdAndDelete(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found.' });

        // --- NEW LOGIC for DELETE: Remove feedback ID from associated products ---
        if (feedback.productFeedbacks && feedback.productFeedbacks.length > 0) {
            for (const pf of feedback.productFeedbacks) {
                await Product.findByIdAndUpdate(
                    pf.product,
                    { $pull: { feedback: feedback._id } },
                    { new: true, runValidators: true }
                );
            }
        }
        // --- END NEW LOGIC for DELETE ---

        // Recalculate product stats if this feedback contained public product feedback
        if (feedback.isPublic && feedback.productFeedbacks.length > 0) {
            for (const pf of feedback.productFeedbacks) {
                await updateProductStats(pf.product);
            }
        }
        res.status(200).json({ message: 'Feedback deleted successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while deleting feedback.' });
    }
});

export default router;