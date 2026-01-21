import express from "express";
import {
  createPaymentIntent,
  verifyPayment
} from "../controllers/payment.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const PayRoutes = express.Router();

/**
 * =====================
 * PAYMENT ROUTES
 * =====================
 */

// POST /api/payment/create-intent
PayRoutes.post(
  "/create-intent",
  authMiddleware,
  createPaymentIntent
);

// POST /api/payment/verify
PayRoutes.post(
  "/verify",
  authMiddleware,
  verifyPayment
);

export default PayRoutes;
