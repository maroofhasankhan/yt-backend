// Import required modules and utilities
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';

/**
 * Helper function to generate access and refresh tokens for a user
 *@ param {string} userId - The user's ID
 *@ returns {Object} Object containing access token and refresh token
 */
const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        //disable validation for refresh token else it will throw error for empty string
        await user.save({ validateBeforeSave: false });

        //return access and refresh token
        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, "Failed to generate access and refresh token")
    }
}

/**
 * Controller to handle user registration
 * Steps:
 * 1. Get user details from frontend
 * 2. Validate required fields
 * 3. Check if user already exists
 * 4. Handle image uploads
 * 5. Create user in database
 * 6. Return response
 */
const registerUser = asyncHandler(async (req, res) => {
    const { fullname, username, email, password } = req.body;

    // Validate required fields
    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required", 400);
    }

    // Check for existing user
    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (exitedUser) {
        throw new ApiError(400, "Username or email already exist");
    }

    // Handle file uploads
    const avatarLocalPath = req.files?.avatar[0]?.path;
    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // Upload avatar and extract the URL
    const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
    const avatarUrl = avatarUploadResult.url;

    // Upload cover image and extract the URL if it exists
    const coverImageUrl = coverImageLocalPath ? (await uploadOnCloudinary(coverImageLocalPath)).url : "";

    if (!avatarUrl) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    // Create user in database
    const user = await User.create({
        fullname,
        email,
        avatar: avatarUrl,
        coverImage: coverImageUrl,
        password,
        username: username.toLowerCase()
    });

    // Get created user without sensitive fields
    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );
})

/**
 * Controller to handle user login
 * Steps:
 * 1. Validate credentials
 * 2. Find user
 * 3. Verify password
 * 4. Generate tokens
 * 5. Set cookies and return response
 */
const loginUser = asyncHandler(async (req, res) => {
    const { username, password, email } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is missing")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) throw new ApiError(404, "Invalid username or email")

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) throw new ApiError(401, "Invalid password")

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        srcure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully")
        )
})

/**
 * Controller to handle user logout
 * Steps:
 * 1. Clear refresh token from database
 * 2. Clear cookies
 * 3. Return success response
 */
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        srcure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged out successfully"))
})

/**
 * Controller to refresh access token using refresh token
 * Steps:
 * 1. Validate refresh token
 * 2. Verify token and get user
 * 3. Generate new tokens
 * 4. Set cookies and return response
 */
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshAccessToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Invalid request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.JWT_SECRET)

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }

        if (user.refreshToken !== incomingRefreshToken) {
            throw new ApiError(401, "Invalid refresh token")
        }

        const options = {
            httpOnly: true,
            srcure: true
        }

        const { accessToken, newRefreshToken } = generateAccessTokenAndRefreshToken(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "Access token refreshed successfully")
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})

/**
 * Controller to change user password
 * Steps:
 * 1. Validate old password
 * 2. Update with new password
 * 3. Return success response
 */
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: save })

    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})

/**
 * Controller to get current user details
 */
const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, req.user, "current User found successfully"))
})

/**
 * Controller to update user account details
 * Note: Separate from image updates to reduce server load
 */
const updateAccount = asyncHandler(async (req, res) => {
    const { fullname, email } = req.body;

    if (!fullname || !email) {
        throw new ApiError(400, "All fields are required");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated"));
})

/**
 * Controller to update user avatar
 * Steps:
 * 1. Get avatar file
 * 2. Upload to Cloudinary
 * 3. Update user record
 */
const updateUserAvatar = asyncHandler(async (req, res) => {
    const user = req.user;

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
    const avatarUrl = avatarUploadResult.url;

    if (!avatarUrl) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const newUser = await User.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                avatar: avatarUrl
            }
        }
    )

    return res.status(200).json(new ApiResponse(200, newUser, "Avatar updated successfully"));
})

/**
 * Controller to update user cover image
 * Steps:
 * 1. Get cover image file
 * 2. Upload to Cloudinary
 * 3. Update user record
 */
const updateUserCoverImage = asyncHandler(async (req, res) => {
    const user = req.user;

    const coverLocalPath = req.file?.path;

    if (!coverLocalPath) {
        throw new ApiError(400, "cover is required");
    }

    const coverUploadResult = await uploadOnCloudinary(coverLocalPath);
    const coverUrl = coverUploadResult.url;

    if (!coverUrl) {
        throw new ApiError(500, "Failed to upload cover");
    }

    const newUser = await User.findByIdAndUpdate(
        user?._id,
        {
            $set: {
                coverImage: coverUrl
            }
        }
    )

    return res.status(200).json(new ApiResponse(200, newUser, "Avatar updated successfully"));
})

/**
 * Controller to get user channel profile
 * Uses MongoDB aggregation for:
 * - Subscriber counts
 * - Subscription status
 * - Channel details
 */
const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params;
    if (!username?.trim()) {
        throw new ApiError(400, "Username is required");
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
            }
        }
    ])

    if (channel?.length) {
        throw new ApiError(404, "Channel not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "Channel found successfully")
        )
})

/**
 * Controller to get user watch history
 * Uses MongoDB aggregation for:
 * - Video details
 * - Video owner details
 */
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "user",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullname: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                owner: {
                    $arrayElemAt: ["$owner", 0]
                }
            }
        }
    ])
    
    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0], "Watch history found successfully")
        )
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccount,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory,
}
