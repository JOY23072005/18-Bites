import HomeConfig from "../models/homeConfig.model.js";
import { connectDB } from "../config/db.js";
import { uploadBufferToCloudinary } from "../utils/cloudinary.js";

export const addHomeBanner = async (req, res) => {
  try {
    await connectDB();

    if (!req.files?.desktopImage || !req.files?.mobileImage) {
      return res.status(400).json({
        message: "Desktop and mobile images are required"
      });
    }

    const desktopUpload = await uploadBufferToCloudinary(
      req.files.desktopImage[0].buffer,
      "home/banners/desktop"
    );

    const mobileUpload = await uploadBufferToCloudinary(
      req.files.mobileImage[0].buffer,
      "home/banners/mobile"
    );

    const banner = {
      desktopImageUrl: desktopUpload.secure_url,
      mobileImageUrl: mobileUpload.secure_url,
      redirectUrl: req.body.redirectUrl || "",
      title: req.body.title || "",
      subtitle: req.body.subtitle || "",
      isActive: true
    };

    const config = await HomeConfig.findOneAndUpdate(
      {},
      { $push: { banners: banner } },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      banner,
      banners: config.banners
    });

  } catch (err) {
    console.error("addHomeBanner:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getHomeConfig = async (req, res) => {
  try {
    await connectDB();

    const device = req.query.device === "mobile" ? "mobile" : "desktop";

    const config = await HomeConfig.findOne({ isActive: true }).lean();

    if (!config) {
      return res.json({
        banners: [],
        videoIframeUrl: ""
      });
    }

    const banners = (config.banners || [])
      .filter(b => b.isActive)
      .map(b => ({
        _id: b._id,
        imageUrl:
          device === "mobile" && b.mobileImageUrl
            ? b.mobileImageUrl
            : b.desktopImageUrl,
        redirectUrl: b.redirectUrl,
        title: b.title,
        subtitle: b.subtitle,
        isActive: b.isActive
      }));

    res.json({
      _id: config._id,
      banners,
      videoIframeUrl: config.videoIframeUrl,
      createdAt: config.createdAt,
      updatedAt: config.updatedAt
    });

  } catch (err) {
    console.error("getHomeConfig:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteHomeBanner = async (req, res) => {
  try {
    await connectDB();

    const { bannerId } = req.params;

    const updated = await HomeConfig.findOneAndUpdate(
      {},
      { $pull: { banners: { _id: bannerId } } },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Home config not found" });
    }

    res.json({
      success: true,
      message: "Banner deleted successfully",
      banners: updated.banners
    });

  } catch (err) {
    console.error("deleteHomeBanner:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateHomeVideo = async (req, res) => {
  try {
    await connectDB();

    const { videoIframeUrl } = req.body;

    if (!videoIframeUrl) {
      return res.status(400).json({
        message: "videoIframeUrl is required"
      });
    }

    const updated = await HomeConfig.findOneAndUpdate(
      {},
      { videoIframeUrl },
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      message: "Home video updated successfully",
      videoIframeUrl: updated.videoIframeUrl
    });

  } catch (err) {
    console.error("updateHomeVideo:", err);
    res.status(500).json({ message: "Server error" });
  }
};
