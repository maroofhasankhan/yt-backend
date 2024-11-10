import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from"jsonwebtoken"
import {User} from "../models/user.model.js"
import {ApiError }from "../utils/apiError.js"
import { ApiResponse } from '../utils/ApiResponse.js';

export const verifyJWT= asyncHandler (async(req,res,next)=>{
    try {
        const token= req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
    
        if(!token){
            throw new ApiError(401,"Please login to access this resource")
        }
    
        const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
    
        if(!user) {
            //TODO
            throw new ApiError(401,"invalid access token")
        }
        req.user = user
    
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Failed to authenticate user")
    }
})
