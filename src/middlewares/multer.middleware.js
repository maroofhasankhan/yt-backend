// Import multer for handling multipart/form-data (file uploads)
import multer from "multer";

// Configure storage settings for uploaded files
const storage = multer.diskStorage({
    // Set the destination folder where uploaded files will be stored temporarily
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    // Keep the original filename when saving the uploaded file
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
// Create and export multer middleware instance with configured storage
export const upload = multer({ storage })