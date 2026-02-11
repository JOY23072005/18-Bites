import multer from "multer";

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

export const uploadCSV = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.originalname.endsWith(".csv")) {
      return cb(new Error("Only CSV files allowed"));
    }
    cb(null, true);
  }
}).single("file");

export const uploadSingleImage = (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "File upload error",
      });
    }
    next();
  });
};

export const uploadImages = (req, res, next) => {
  upload.array("images",5)(req, res, (err) => {
    if (err) {
      console.log("Multer error:", err);
      return res.status(400).json({
        message: err.message || "File upload error",
      });
    }
    next();
  });
};

export const uploadBannerImages = (req, res, next) => {
  upload.fields([
    { name: "desktopImage", maxCount: 1 },
    { name: "mobileImage", maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        message: err.message || "Banner upload error"
      });
    }
    next();
  });
};
