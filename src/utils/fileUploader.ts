import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { Readable } from "stream";
import AWS from "aws-sdk";

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env["CLOUDINARY_CLOUD_NAME"],
  api_key: process.env["CLOUDINARY_API_KEY"],
  api_secret: process.env["CLOUDINARY_API_SECRET"],
});

// DigitalOcean Spaces configuration
const spacesEndpoint = new AWS.Endpoint(process.env["DO_SPACES_ENDPOINT"] || "");
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env["DO_SPACES_KEY"],
  secretAccessKey: process.env["DO_SPACES_SECRET"],
  region: process.env["DO_SPACES_REGION"] || "nyc3",
});

const storage = multer.memoryStorage();
export const upload = multer({ storage });

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return !!(process.env["CLOUDINARY_CLOUD_NAME"] && 
           process.env["CLOUDINARY_API_KEY"] && 
           process.env["CLOUDINARY_API_SECRET"]);
};

// Check if DigitalOcean Spaces is configured
const isSpacesConfigured = () => {
  return !!(process.env["DO_SPACES_ENDPOINT"] && 
           process.env["DO_SPACES_KEY"] && 
           process.env["DO_SPACES_SECRET"] &&
           process.env["DO_SPACES_BUCKET"]);
};

// Upload to DigitalOcean Spaces
async function uploadToSpaces(file: Express.Multer.File, oldImageUrl?: string) {
  if (!isSpacesConfigured()) {
    throw new Error('DigitalOcean Spaces configuration is missing');
  }

  if (oldImageUrl) {
    const key = oldImageUrl.split("/").pop();
    if (key) await deleteFromSpaces(key);
  }

  const key = `${Date.now()}-${file.originalname}`;
  const params = {
    Bucket: process.env["DO_SPACES_BUCKET"] || "",
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: "public-read",
  };

  const result = await s3.upload(params).promise();
  return { secure_url: result.Location, public_id: key };
}

// Delete from DigitalOcean Spaces
async function deleteFromSpaces(key: string) {
  if (!key || !isSpacesConfigured()) return;
  const params = {
    Bucket: process.env["DO_SPACES_BUCKET"] || "",
    Key: key,
  };
  await s3.deleteObject(params).promise();
}

// Smart upload - uses Cloudinary if configured, otherwise DigitalOcean Spaces
async function smartUpload(file: Express.Multer.File, oldImageUrl?: string) {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(file, oldImageUrl);
  } else if (isSpacesConfigured()) {
    return uploadToSpaces(file, oldImageUrl);
  } else {
    throw new Error('No file upload service configured. Please configure either Cloudinary or DigitalOcean Spaces.');
  }
}

export const fileUploader = {
  upload,
  uploadToCloudinary,
  deleteFromCloudinary,
  uploadToSpaces,
  deleteFromSpaces,
  smartUpload,
};
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
  if (oldImageUrl) {
    const publicId = oldImageUrl.split("/").pop()?.split(".")[0];
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