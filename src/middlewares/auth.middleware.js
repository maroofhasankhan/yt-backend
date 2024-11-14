// Import required utilities and dependencies
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from"jsonwebtoken"
import {User} from "../models/user.model.js"
import {ApiError }from "../utils/apiError.js"
import { ApiResponse } from '../utils/ApiResponse.js';

// Middleware to verify JWT tokens and protect routes
export const verifyJWT= asyncHandler (async(req,res,next)=>{
    try {
        // Get token from either cookies or Authorization header
        // If from header, remove the "Bearer " prefix
        const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        // If no token found, user needs to login
        if(!token){
            throw new ApiError(401,"Please login to access this resource")
        }
    
        // Verify the token using the secret key
        // This will throw an error if token is invalid or expired
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        // Find user by ID from decoded token
        // Exclude password and refreshToken fields from the result
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        // If no user found with the ID from token
        // Token may be valid but user may have been deleted
        if(!user) {
            throw new ApiError(401,"invalid access token")
        }

        // Attach user object to request for use in subsequent middleware/routes
        req.user = user
    
        // Pass control to next middleware
        next()
    } catch (error) {
        // Handle any errors during verification
        // Pass along error message or default message
        throw new ApiError(401,error?.message || "Failed to authenticate user")
    }
})
