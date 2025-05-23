import express from 'express';
import Category from '../models/categoryModel.js';
const router = express.Router();

// Route to get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({});
        res.status(200).json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories', error: error.message });
    }
});

// Route to get a single category by ID
router.get('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ message: 'Failed to fetch category', error: error.message });
    }
});

// Route to create a new category
router.post('/categories', async (req, res) => {
    try {
        const newCategory = new Category(req.body);
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);
    } catch (error) {
        console.error('Error creating category:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return res.status(409).json({ message: 'Category name already exists' });
        }
        res.status(400).json({ message: 'Failed to create category', error: error.message });
    }
});

// Route to update an existing category by ID
router.put('/categories/:id', async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(updatedCategory);
    } catch (error) {
        console.error('Error updating category:', error);
        if (error.code === 11000 && error.keyPattern && error.keyPattern.name) {
            return res.status(409).json({ message: 'Category name already exists' });
        }
        res.status(400).json({ message: 'Failed to update category', error: error.message });
    }
});

// Route to delete a category by ID
router.delete('/categories/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);
        if (!deletedCategory) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Failed to delete category', error: error.message });
    }
});

export default router;