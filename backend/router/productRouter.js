import express from "express";
import mongoose from "mongoose";
import Product from "../models/productModel.js";
import Category from "../models/categoryModel.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route to get all products
router.get("/products", async (req, res) => {
  try {
    const products = await Product.find().populate("category");
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
});

// Route to get products by category slug
router.get("/categories/:categorySlug/products", async (req, res) => {
  const { categorySlug } = req.params;
  try {
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const products = await Product.find({ category: category._id }).populate(
      "category"
    );
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Failed to fetch products by category" });
  }
});

// Route to get a single product by ID
// Route to get a single product by ID
// Route to get a single product by ID
router.get("/products/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(productId)
      .populate("category")
      .populate({
        path: 'feedback', // This populates the 'feedback' array
        populate: {
          path: 'productFeedbacks.product', // This path correctly targets the 'product' inside 'productFeedbacks'
          model: 'Product', // Specify the model for 'productFeedbacks.product'
          select: 'name _id'
        }
      })
      .populate({
        path: 'feedback', // We need to populate 'feedback' again to access the 'user' field
        populate: {
          path: 'user', // This path correctly targets the 'user' field directly within the 'feedback' array
          model: 'User', // Specify the model for 'user'
          select: 'username avatar email'
        }
      });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Failed to fetch product" });
  }
});

// Route to get a single product by slug
router.get("/products/slug/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    const product = await Product.findOne({ slug }).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    res.status(500).json({ message: "Failed to fetch product by slug" });
  }
});

// Route to create a new product (requires authentication)
router.post("/products", protect, async (req, res) => {
  try {
    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to create product" });
  }
});

// Route to update an existing product by ID (requires authentication)
router.put("/products/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Failed to update product" });
  }
});

// Route to delete a product by ID (requires authentication)
router.delete("/products/:productId", protect, async (req, res) => {
  const { productId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(204).send(); // No content on successful deletion
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
});

// Route to get similar products
router.get("/products/:productId/similar", async (req, res) => {
  const { productId } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: product._id }, // Exclude the current product
      category: product.category._id, // Find products in the same category
      // You can add more criteria here for similarity, like brand or tags
      brand: product.brand, // Example: same brand
      tags: { $in: product.tags }, // Example: at least one common tag
    })
      .limit(5) // Limit the number of similar products
      .populate("category");

    res.status(200).json(similarProducts);
  } catch (error) {
    console.error("Error fetching similar products:", error);
    res.status(500).json({ message: "Failed to fetch similar products" });
  }
});

export default router;