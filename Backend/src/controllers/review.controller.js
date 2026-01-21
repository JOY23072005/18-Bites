import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import { connectDB } from "../lib/db.js";
import mongoose from "mongoose";

export const addReview = async (req, res) => {
  const { productId, rating, comment } = req.body || {};

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5" });
  }

  try {
    await connectDB();

    const already = await Review.exists({
      user: req.userId,
      product: productId
    });

    if (already) {
      return res.status(400).json({ message: "Already reviewed" });
    }

    const review = await Review.create({
      user: req.userId,
      product: productId,
      rating,
      comment
    });

    await Product.findByIdAndUpdate(productId, {
      $inc: { numReviews: 1 }
    });

    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getReviewsByProduct = async (req, res) => {
  const { productId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    return res.status(400).json({ message: "Invalid product ID" });
  }

  try {
    await connectDB();

    const reviews = await Review.find({ product: productId })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteReview = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid review ID" });
  }

  try {
    await connectDB();

    const review = await Review.findById(id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.user.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await review.deleteOne();
    res.json({ success: true, message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
