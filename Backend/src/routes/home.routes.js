import express from "express"
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";
import { uploadBannerImages } from "../middlewares/upload.middleware.js";
import { addHomeBanner, deleteHomeBanner, getHomeConfig, updateHomeVideo } from "../controllers/home.controller.js";

const HomeRoutes = express.Router();

HomeRoutes.get("/", getHomeConfig);
HomeRoutes.post("/", authMiddleware, adminMiddleware,uploadBannerImages,addHomeBanner );
HomeRoutes.put("/video", authMiddleware, adminMiddleware, updateHomeVideo);
HomeRoutes.delete("/:bannerId", authMiddleware, adminMiddleware, deleteHomeBanner);

export default HomeRoutes;