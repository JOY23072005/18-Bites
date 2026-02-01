import streamifier from "streamifier";
import csv from "csv-parser";
import mongoose from "mongoose";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import cloudinary from "../lib/cloudinary.js";
import { connectDB } from "../lib/db.js";
import { fromDecimal, toDecimal } from "../lib/utils/price.js";

/* Query params:
 *  - page
 *  - limit
 *  - search
 *  - category
 *  - SKU
 */

export const getAllProducts = async (req, res) => {
  try {
    await connectDB();

    const {
      page = 1,
      limit = 10,
      search = "",
      category,
      sku,
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

    // Category filter
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    }

    // SKU filter
    if (sku) {
      query.SKU = sku;
    }

    const totalItems = await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const formattedProducts = products.map(product => ({
      ...product,
      price:fromDecimal(product.price)
    }));

    res.json({
      success: true,
      data: {
        products:formattedProducts,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });

  } catch (err) {
    console.error("getAllProducts:", err);
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

export const uploadProductImages = async (req, res) => {
  const uploadedImages=[]
  try {
    await connectDB();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images provided" });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Upload all images in parallel
    const uploadPromises = req.files.map(file => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "18Bites/product-images",
            resource_type: "image",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else resolve({
              url: result.secure_url,
              publicId: result.public_id
            });
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });
    });

    uploadProductImages = await Promise.all(uploadPromises);

    // Append images
    product.images.push(...uploadedImages);
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product images uploaded successfully",
      images: product.images
    });

  } catch (error) {

    await Promise.all(
      uploadedImages.map(img =>
        cloudinary.uploader.destroy(img.publicId)
      )
    );

    console.error("uploadProductImages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProductImage = async (req, res) => {
  const { id } = req.params;
  const { publicId } = req.body;

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: "Product not found" });

  await cloudinary.uploader.destroy(publicId);

  product.images = product.images.filter(img => img.publicId !== publicId);
  await product.save();

  res.json({ success: true, images: product.images });
};

export const reorderProductImages = async (req, res) => {
  const { id } = req.params;
  const { order } = req.body;

  if (!Array.isArray(order)) {
    return res.status(400).json({ message: "Invalid order array" });
  }

  await connectDB();

  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  const imageMap = new Map(
    product.images.map(img => [img.publicId, img])
  );

  const reordered = [];
  for (const pid of order) {
    if (!imageMap.has(pid)) {
      return res.status(400).json({ message: "Invalid image reference" });
    }
    reordered.push(imageMap.get(pid));
  }

  product.images = reordered;
  await product.save();

  res.json({ success: true, images: product.images });
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

// ==> BULK PROCESSOR <==

export const uploadProductsCSV = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "CSV file required" });
  }

  await connectDB();

  const rows = [];

  // Parse CSV from memory buffer
  await new Promise((resolve, reject) => {
    streamifier
      .createReadStream(req.file.buffer)
      .pipe(csv())
      .on("data", (row) => rows.push(row))
      .on("end", resolve)
      .on("error", reject);
  });

  // 🔹 Group rows by SKU
  const grouped = {};
  for (const row of rows) {
    if (!row.SKU) continue;
    grouped[row.SKU] ??= [];
    grouped[row.SKU].push(row);
  }

  const results = {
    created: 0,
    failed: [],
  };

  // 🔹 Process each product group
  for (const key of Object.keys(grouped)) {
    try {
      const entries = grouped[key];

      const base = entries.find(r => r.name); // first row with product data
      if (!base) throw new Error("Base product row missing");

      // Resolve category
      let categoryId = null;
      if (base.categorySlug) {
        const category = await Category.findOne({ slug: base.categorySlug });
        if (!category) throw new Error("Invalid category slug");
        categoryId = category._id;
      }

      // Collect images
      const images = entries
        .filter(r => r.imageUrl)
        .sort((a, b) => Number(a.imagePosition) - Number(b.imagePosition))
        .map(r => ({
          url: r.imageUrl,
          publicId: null // optional (if pre-uploaded)
        }));

      // Create product
      await Product.create({
        SKU: key,
        name: base.name,
        description: base.description || "",
        price: toDecimal(base.price),
        stock: Number(base.stock),
        category: categoryId,
        isFeatured: base.isFeatured === "true",
        images,
        isActive: true
      });

      results.created++;

    } catch (err) {
      results.failed.push({
        SKU: key,
        error: err.message
      });
    }
  }

  res.json({
    success: true,
    summary: results
  });
};

export const getFeaturedProducts = async (req, res) => {
  try {
    await connectDB();

    const limit = Number(req.query.limit) || 10;

    const products = await Product.find({
      isActive: true,
      isFeatured: true
    })
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = products.map(p => ({
      ...p,
      price: Number(p.price.toString()),
      images: p.images.map(img => img.url)
    }));

    res.json({ success: true, products: formatted });

  } catch (err) {
    console.error("getFeaturedProducts:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTrendingProducts = async (req, res) => {
  try {
    await connectDB();

    const limit = Math.max(Number(req.query.limit) || 10, 5);

    // 1️⃣ First: real trending products
    let products = await Product.find({
      isActive: true,
      soldCount: { $gt: 0 }
    })
      .populate("category", "name")
      .sort({ soldCount: -1, lastSoldAt: -1 })
      .limit(limit)
      .lean();

    // 2️⃣ Fallback: fill remaining slots
    if (products.length < 5) {
      const remaining = 5 - products.length;

      const excludeIds = products.map(p => p._id);

      const fallbackProducts = await Product.find({
        isActive: true,
        _id: { $nin: excludeIds }
      })
        .populate("category", "name")
        .sort({ createdAt: -1 }) // newest / popular fallback
        .limit(remaining)
        .lean();

      products = [...products, ...fallbackProducts];
    }

    const formatted = products.map(p => ({
      ...p,
      price: Number(p.price),
      images: p.images.map(img => img.url)
    }));

    res.json({
      success: true,
      count: formatted.length,
      products: formatted
    });

  } catch (err) {
    console.error("getTrendingProducts:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const setTodaysHotDeal = async (req, res) => {
  try {
    await connectDB();

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    // Start of today (00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔥 Remove existing hot deal for today
    await Product.updateMany(
      { hotDealDate: today },
      { $unset: { hotDealDate: "" } }
    );

    // 🔥 Set new hot deal
    const product = await Product.findByIdAndUpdate(
      id,
      { hotDealDate: today },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      success: true,
      message: "Today's hot deal set successfully",
      productId: product._id
    });

  } catch (err) {
    console.error("setTodaysHotDeal:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTodaysHotDeal = async (req, res) => {
  try {
    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const product = await Product.findOne({
      isActive: true,
      hotDealDate: today
    })
      .populate("category", "name")
      .lean();

    if (!product) {
      return res.json({
        success: true,
        product: null
      });
    }

    res.json({
      success: true,
      product: {
        ...product,
        price: Number(product.price.toString()),
        images: product.images.map(img => img.url)
      }
    });

  } catch (err) {
    console.error("getTodaysHotDeal:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
