import cloudinary from "../cloudinary.js";
import streamifier from "streamifier";

export const uploadFilesToCloudinary = async (
  files,
  folder = "18Bites/product-images"
) => {
  const uploaded = [];

  try {
    for (const file of files) {
      const image = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: "image",
            transformation: [
              { width: 1200, height: 1200, crop: "limit" },
              { quality: "auto" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) reject(error);
            else
              resolve({
                url: result.secure_url,
                publicId: result.public_id
              });
          }
        );

        streamifier.createReadStream(file.buffer).pipe(stream);
      });

      uploaded.push(image);
    }

    return uploaded;
  } catch (err) {
    // 🧹 cleanup partial uploads
    await Promise.all(
      uploaded.map(img => cloudinary.uploader.destroy(img.publicId))
    );
    throw err;
  }
};
