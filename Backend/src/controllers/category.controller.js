import Category from "../models/category.model.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";
import cloudinary from "../lib/cloudinary.js";
import streamifier from "streamifier";

export const getCategories = async (req, res) => {
  try {
    await connectDB();

    const {
      page = 1,
      limit = 10,
      search = "",
      home = "false",
      status = "active" // active | inactive | all
    } = req.query;

    const query = {};

    // Status filter
    if (status !== "all") {
      query.isActive = status === "active";
    }

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if(home==="true"){
      query.showHome = true;
    }

    const totalItems = await Category.countDocuments(query);

    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        categories,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (err) {
    console.error("getCategories:", err);
    res.status(500).json({ message: "Server error" });
  }
};


export const createCategory = async (req, res) => {
  const { name, slug,description } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: "Category name is required" });
  }

  try {
    await connectDB();

    const exists = await Category.exists({ name });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = await Category.create({ name, slug, description });
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

export const uploadCategoryImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image provided" });
    }

    await connectDB();

    const {id} = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Delete old image if exists
    if (category.image?.publicId) {
      await cloudinary.uploader.destroy(category.image.publicId);
    }

    // Upload new image using stream
    const uploadFromBuffer = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "18Bites/category-images",
            resource_type: "image",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await uploadFromBuffer();

    // Save in DB
    category.image = {
      url: result.secure_url,
      publicId: result.public_id,
    };

    await category.save();

    res.status(200).json({
      success: true,
      message: "Image updated successfully",
      image: category.image.url,
    });

  } catch (error) {
    console.error("uploadCategoryImage error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteCategoryImage = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 🔥 Try deleting from Cloudinary (if exists)
    if (category.image?.publicId) {
      try {
        const result = await cloudinary.uploader.destroy(
          category.image.publicId
        );

        if (result.result !== "ok" && result.result !== "not found") {
          console.warn("Cloudinary delete warning:", result);
        }
      } catch (cloudErr) {
        console.warn("Cloudinary deletion failed:", cloudErr.message);
        // Do NOT throw → continue
      }
    }

    // 🔥 Remove image from DB (always)
    category.image = null;
    await category.save();

    return res.json({
      success: true,
      message: "Category image removed successfully",
    });

  } catch (error) {
    console.error("deleteCategoryImage error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
