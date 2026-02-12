import express from "express";
import {
  createCoupon,
  listCoupons,
  applyCoupon,
  deleteCoupon,
  updateCouponStatus
} from "../controllers/coupon.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const CouponRoutes = express.Router();

CouponRoutes.post("/", authMiddleware, adminMiddleware, createCoupon);
CouponRoutes.get("/", authMiddleware, adminMiddleware, listCoupons);
CouponRoutes.patch("/:id/status", authMiddleware, adminMiddleware, updateCouponStatus);
CouponRoutes.post("/apply", authMiddleware, applyCoupon);
CouponRoutes.delete("/:id", authMiddleware, adminMiddleware, deleteCoupon);

export default CouponRoutes;
