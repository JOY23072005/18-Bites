import User from "../models/user.model.js";
import { connectDB } from "../lib/db.js";

export const superAdminMiddleware = async (req, res, next) => {
  try {
    await connectDB();

    const user = await User.findById(req.userId);
    if (!user || user.role !== "super-admin") {
      return res.status(403).json({ message: "Super Admin access required" });
    }

    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
