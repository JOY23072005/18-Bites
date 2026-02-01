import express from "express";
import {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getMyOrders,
  createAdmin,
  getRole
} from "../controllers/user.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { superAdminMiddleware } from "../middlewares/super_admin.middleware.js";

const UserRoutes = express.Router();

/**
 * =====================
 * USER ROUTES (AUTH)
 * =====================
 */

// GET /api/user/profile
UserRoutes.get("/profile", authMiddleware, getProfile);

// PUT /api/user/profile
UserRoutes.put("/profile", authMiddleware, updateProfile);
UserRoutes.put("/create-admin",authMiddleware, superAdminMiddleware, createAdmin);

// POST /api/user/address
UserRoutes.post("/address", authMiddleware, addAddress);

// PUT /api/user/address/:index
UserRoutes.put("/address/:index", authMiddleware, updateAddress);

// DELETE /api/user/address/:index
UserRoutes.delete("/address/:index", authMiddleware, deleteAddress);

// GET /api/user/orders
UserRoutes.get("/orders", authMiddleware, getMyOrders);

UserRoutes.get("/role",authMiddleware,getRole);
export default UserRoutes;
