import express from "express";
import {
  addReview,
  getReviewsByProduct,
  deleteReview
} from "../controllers/review.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";

const ReviewRoutes = express.Router();

ReviewRoutes.post("/", authMiddleware, addReview);
ReviewRoutes.get("/:productId", getReviewsByProduct);
ReviewRoutes.delete("/:id", authMiddleware, deleteReview);

export default ReviewRoutes;
