import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// Configure cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET, // corrected to use `api_secret`
});

// Upload file to Cloudinary
const uploadOnCloudinary = async (localFilePath) => {
  try {
    // Ensure localFilePath exists
    if (!localFilePath) return null;

    // Upload file to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Automatically determine the resource type
    });

    // After upload, remove the local file
    fs.unlinkSync(localFilePath); // Remove the locally saved temp file

    // Return the Cloudinary response
    return uploadResult; // uploadResult contains important details, such as the URL of the uploaded file
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    // Clean up the local file if something goes wrong
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw new Error("Failed to upload file to Cloudinary");
  }
};

export default uploadOnCloudinary;
