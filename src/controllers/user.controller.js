import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';


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


const registerUser = asyncHandler(async (req, res) => {
    //get user details fromm frontend
    //validation - not empty 
    //check if user already exit username, email
    //check for images, check for avatar
    //upload them to cloudinary,avtar
    //create user object - create entry in db
    //remove password and refresh token field from response
    //return res


    const { fullname, username, email, password } = req.body;

    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required", 400);
    }

    const exitedUser = await User.findOne({
        $or: [{ username }, { email }]
    });

    if (exitedUser) {
        throw new ApiError(400, "Username or email already exist");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required");
    }

    // Upload avatar and extract the URL
    const avatarUploadResult = await uploadOnCloudinary(avatarLocalPath);
    const avatarUrl = avatarUploadResult.url; // Extract the URL

    // Upload cover image and extract the URL if it exists
    const coverImageUrl = coverImageLocalPath ? (await uploadOnCloudinary(coverImageLocalPath)).url : "";

    if (!avatarUrl) {
        throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.create({
        fullname,
        email,
        avatar: avatarUrl, // Use the extracted URL
        coverImage: coverImageUrl,
        password,
        username: username.toLowerCase()
    });

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new ApiError(500, "Failed to create user");
    }

    return res.status(200).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    );

})

const loginUser = asyncHandler(async (req, res) => {
    //req body ->data
    // username or email
    //find user
    //check if password is correct
    //generate access and refresh token
    //send cookie
    //return res

    const { username, password, email } = req.body;

    if (!username && !email) {
        throw new ApiError(400, "username or email is missing")
    }

    const user = await User.findOne({
        //mongoDb operator
        $or: [{ username }, { email }]
    })

    if (!user) throw new ApiError(404, "Invalid username or email")

    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) throw new ApiError(401, "Invalid password")

    //generate access and refresh token 
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

const logoutUser = asyncHandler(async (req, res) => {
    //clear cookie
    //delete refresh token from db
    //return res
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {
            //store updated value
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


const changePassword = asyncHandler(async (req, res) => {
    //get old password, new password
    //check if old password is correct
    //update password
    //return res
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

const getCurrentUser = asyncHandler(async (req, res) => {
    //get user from req.user
    //return res

    return res.status(200).json(new ApiResponse(200, req.user, "current User found successfully"))
})


//if user want to update there pic write different controller/endpoint this reduce the load on server

const updateAccount = asyncHandler(async (req, res) => {
    //get user from req.user
    //update user
    //return res

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

const updateUserAvatar = asyncHandler(async (req, res) => {
    //get user from req.user
    //check if avatar is present
    //upload avatar to cloudinary
    //update user
    //return res

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



const updateUserCoverImage = asyncHandler(async (req, res) => {
    //get user from req.user
    //check if avatar is present
    //upload avatar to cloudinary
    //update user
    //return res

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



export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken, 
    changePassword, 
    getCurrentUser, 
    updateAccount, 
    updateUserAvatar, 
    updateUserCoverImage
}
