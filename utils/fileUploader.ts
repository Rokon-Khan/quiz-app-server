import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";
// import config from "../../config";
// import { env } from "process";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
  api_key: process.env["CLOUDINARY_API_KEY"],
  api_secret: process.env["CLOUDINARY_API_SECRET"],
});

// Use memory storage (no disk write)
const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Delete file from Cloudinary by public_id
async function deleteFromCloudinary(public_id: string) {
  if (!public_id) return;
  await cloudinary.uploader.destroy(public_id);
}

// Upload a fresh image to Cloudinary
async function uploadToCloudinary(
  file: Express.Multer.File,
  oldImageUrl?: string
) {
  // Delete old image if exists
  if (oldImageUrl) {
    const publicId = oldImageUrl.split("/").pop()?.split(".")[0]; // Extract public_id from URL
    if (publicId) await deleteFromCloudinary(publicId);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { public_id: `${file.originalname}-${Date.now()}` },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    const bufferStream = Readable.from(file.buffer);
    bufferStream.pipe(uploadStream);
  });
}

export const fileUploader = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
};
