import Category from "../models/category.model.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";

export const getCategories = async (req, res) => {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createCategory = async (req, res) => {
  const { name, slug } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    await connectDB();

    const exists = await Category.exists({ name });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name, slug });
    res.status(201).json({ success: true, category });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  try {
    await connectDB();

    const category = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json({ success: true, category });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid category ID" });
  }

  try {
    await connectDB();

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    category.isActive = false;
    await category.save();

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
