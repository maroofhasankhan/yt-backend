import { asyncHandler} from '../utils/asyncHandler.js';
import { ApiError } from '../utils/apiError.js'; 
import { User } from '../models/user.model.js';
import uploadOnCloudinary from '../utils/cloudinary.js';
import { ApiResponse } from '../utils/ApiResponse.js';


const registerUser = asyncHandler(async(req,res)=>{
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
export {registerUser}
