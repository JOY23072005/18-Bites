import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";

/* Query params:
 *  - page
 *  - limit
 *  - search
 *  - category
 */

export const getAllProducts = async (req, res) => {
  try {
    await connectDB();

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search || "";
    const category = req.query.category;

    const filter = { isActive: true };

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category", "name")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      page,
      totalPages: Math.ceil(total / limit),
      totalProducts: total,
      products
    });
  } catch (err) {
    console.error("getAllProducts:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findOne({
      _id: id,
      isActive: true
    }).populate("category", "name");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ success: true, product });
  } catch (err) {
    console.error("getProductById:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProductsByCategory = async (req, res) => {
  try {
    await connectDB();

    const { categoryId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const products = await Product.find({
      category: categoryId,
      isActive: true
    }).sort({ createdAt: -1 });

    res.json({ success: true, products });
  } catch (err) {
    console.error("getProductsByCategory:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const createProduct = async (req, res) => {
  const { name, price, stock, category, description, images } = req.body || {};

  if (!name || !price || stock == null) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  try {
    await connectDB();

    if (category && !mongoose.Types.ObjectId.isValid(category)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const product = await Product.create({
      name,
      price,
      stock,
      category,
      description,
      images
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (err) {
    console.error("createProduct:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    Object.assign(product, updates);
    await product.save();

    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("updateProduct:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = false;
    await product.save();

    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("deleteProduct:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
