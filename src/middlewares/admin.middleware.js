import User from "../models/user.model.js";
import { connectDB } from "../lib/db.js";

export const adminMiddleware = async (req, res, next) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin" && user.role !== "super-admin" ) {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
