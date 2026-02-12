import express from "express";
import {
  getDashboardStats,
  getAdminOrders,
  updateOrderStatus,
  getAdminReviews,
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  createAdminReview,
  deleteAdminReview
} from "../controllers/admin.controller.js";

import {authMiddleware} from "../middlewares/auth.middleware.js";
import {adminMiddleware} from "../middlewares/admin.middleware.js";

const AdminRoutes = express.Router();

AdminRoutes.use(authMiddleware, adminMiddleware);

/* Dashboard */
AdminRoutes.get("/dashboard/stats", getDashboardStats);

/* Orders */
AdminRoutes.get("/orders", getAdminOrders);
AdminRoutes.patch("/orders/:id", updateOrderStatus);

/* Reviews */
AdminRoutes.get("/reviews", getAdminReviews);
AdminRoutes.post("/reviews", createAdminReview);      // ✅ create fake review
AdminRoutes.delete("/reviews/:id", deleteAdminReview); 

/* Users */
AdminRoutes.get("/users", getAdminUsers);
AdminRoutes.post("/users", createAdminUser);
AdminRoutes.put("/users/:id", updateAdminUser);
AdminRoutes.delete("/users/:id", deleteAdminUser);

export default AdminRoutes;
