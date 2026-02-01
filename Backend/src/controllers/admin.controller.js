import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import Review from "../models/review.model.js";
import { connectDB } from "../lib/db.js";

/* =========================
   DASHBOARD STATS
========================= */
export const getDashboardStats = async (req, res) => {
  try {
    await connectDB();

    const [
      totalUsers,
      activeUsers,
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      totalReviews,
      revenueAgg
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ status: "active" }),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: "pending" }),
      Review.countDocuments(),
      Order.aggregate([
        { $match: { orderStatus: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalReviews,
        totalRevenue: revenueAgg[0]?.total || 0
      }
    });
  } catch (err) {
    console.error("getDashboardStats:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   ORDERS (ADMIN)
========================= */
export const getAdminOrders = async (req, res) => {
  try {
    await connectDB();

    const { page = 1, limit = 10, search = "", status } = req.query;

    const query = {};
    if (status) query.orderStatus = status;
    if (search && search.trim() !== "") {
      query.orderId = { $regex: search.trim(), $options: "i" };
    }

    const totalItems = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        orders,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (err) {
    console.error("getAdminOrders:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    await connectDB();

    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("updateOrderStatus:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   REVIEWS (ADMIN)
========================= */
export const getAdminReviews = async (req, res) => {
  try {
    await connectDB();

    const { page = 1, limit = 10, search = "", rating } = req.query;

    const query = {};
    if (rating) query.rating = rating;
    if (search) query.comment = { $regex: search, $options: "i" };

    const totalItems = await Review.countDocuments(query);

    const reviews = await Review.find(query)
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        reviews,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (err) {
    console.error("getAdminReviews:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   USERS (ADMIN)
========================= */
export const getAdminUsers = async (req, res) => {
  try {
    await connectDB();

    const { page = 1, limit = 10, search = "" } = req.query;

    const query = search
      ? { email: { $regex: search, $options: "i" } }
      : {};

    const totalItems = await User.countDocuments(query);

    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      data: {
        users,
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit)
      }
    });
  } catch (err) {
    console.error("getAdminUsers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const createAdminUser = async (req, res) => {
  try {
    await connectDB();

    const user = await User.create(req.body);
    res.status(201).json({ success: true, user });
  } catch (err) {
    console.error("createAdminUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateAdminUser = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error("updateAdminUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteAdminUser = async (req, res) => {
  try {
    await connectDB();

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    console.error("deleteAdminUser:", err);
    res.status(500).json({ message: "Server error" });
  }
};
