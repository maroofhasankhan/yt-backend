// Import required modules and dependencies
import { Router } from "express";

// Import controller functions for handling user-related operations
import { logoutUser, registerUser, loginUser, refreshAccessToken, changePassword, getCurrentUser, updateAccount, updateUserAvatar, updateUserCoverImage, getUserChannelProfile, getWatchHistory, } from "../controllers/user.controller.js";

// Import middleware for file uploads and JWT authentication
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Initialize Express router
const router =Router();
console.log("routtes");

// Public routes that don't require authentication

// Register new user with avatar and cover image upload capability
router.route("/register").post(upload.fields([
    {
        name:"avatar",
        maxCount:1
    },
    {
        name:"coverImage",
        maxCount:1
    }
]),registerUser)

// User login route
router.route("/login").post(loginUser)


//secured routes - require JWT authentication
router.route("/logout").post( verifyJWT, logoutUser )
router.route("/refresh-token").post(refreshAccessToken)

// User profile management routes
router.route("/change-password".post(verifyJWT, changePassword))
router.route("/current-user").get(verifyJWT, getCurrentUser)
router.route("update-account").patch(verifyJWT, updateAccount)

// Profile media update routes
router.route("/avatar").patch(verifyJWT, upload.single("avatar"),updateUserAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"),updateUserCoverImage)

// Channel and content routes
router.route("/c/:username").get(verifyJWT,getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)


// Export the router instance that contains all user-related routes
// This router handles user authentication (register, login, logout), 
// profile management (avatar, cover image updates),
// and user data retrieval (channel profile, watch history)
// The router uses verifyJWT middleware to protect secured routes
// and multer middleware to handle file uploads
export default router;