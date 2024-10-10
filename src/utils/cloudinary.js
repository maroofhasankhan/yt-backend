import { v2 as cloudinary } from "cloudinary";
import { response } from "express";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLODINARY_CLOUD_NAME,
  api_key: CLODINARY_API_KEY,
  api_secret: process.env.CLODINARY_API_KEY_SECRET, // Click 'View API Keys' above to copy your API secret
});

const uploadOnCloudinary = async (localFilePath) => {
    if(!localFilePath) return null;
    const uploadResult = await cloudinary.uploader
    .upload(localFilePath, {
      resource_type: "auto",
    })
    .then(()=>{
        console.log(response.url);
        return response;
    })
    .catch((error) => {
      fs.unlinkSync(localFilePath)// remove the locally saved temp file
    });
};

export default uploadOnCloudinary;
