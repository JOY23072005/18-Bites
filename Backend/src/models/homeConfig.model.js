import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    desktopImageUrl: {
      type: String,
      required: true
    },

    mobileImageUrl: {
      type: String,
      required: true
    },

    redirectUrl: {
      type: String,
      default: ""
    },

    title: {
      type: String
    },

    subtitle: {
      type: String
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { _id: false }
);

const homeConfigSchema = new mongoose.Schema(
  {
    banners: {
      type: [bannerSchema],
      default: []
    },

    videoIframeUrl: {
      type: String,
      default: ""
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("HomeConfig", homeConfigSchema);
