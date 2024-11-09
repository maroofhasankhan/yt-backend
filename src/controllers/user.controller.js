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


    const {fullname,username,email,password}=req.body
    if(
        [
            fullname,
            username,
            email,
            password
        ].some((field)=> field?.trim()==="")
    ){
         throw new ApiError(400,"All fields are required", 400)
    } 

    const exitedUser=await User.findOne({
        $or:[ { fullname },{ email } ]
    })

    if(exitedUser){
        throw new ApiError(400,"Username or email already exist" )
    }  

    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar is required" )
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage= await uploadOnCloudinary(coverImageLocalPath)
    
    if(!avatar || !avatar.url){
        throw new ApiError(500,"Failed to upload avatar" )
    }


    const user = await User.create({ fullname,email,avatar,coverImage:coverImage?.url|| "",password,username:username.toLowerCase()  })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if(!createdUser){
        throw new ApiError(500,"Failed to create user" )
    }

    return res.this.status(201).json(
        new ApiResponse (200,createdUser,"user registered sucessfully")
    )

})
export {registerUser}
