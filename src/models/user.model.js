// Import required dependencies
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt  from "jsonwebtoken";


// Define the user schema with required fields and validation
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true, // Index this field for faster queries
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  fullname: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  coverImage: {
    type: String,
  },
  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video", // Reference to Video model
    },
  ],
  password: {
    type: String,
    required: [true, 'password is required'],
  },
  refreshToken: {
    type: String,
  }
},
{timestamps: true}); // Add automatic timestamp fields (createdAt, updatedAt)


// Middleware: Hash password before saving to database
userSchema.pre("save",async function(next){
    // Only hash if password is modified
    if(!this.isModified("password")) return next();
    // Hash password with bcrypt using salt rounds of 10
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


// Method to verify if provided password matches stored hash
userSchema.methods.isPasswordCorrect = async function(password) {
    return await bcrypt.compare(password, this.password)
}

// Method to generate JWT access token containing user details
userSchema.methods.generateAccessToken = async function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullname:this.fullname
     },
     process.env.ACCESS_TOKEN_SECRET,
     {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
     }
    )
}

// Method to generate JWT refresh token containing only user ID
userSchema.methods.generateRefreshToken = async function(){
    return jwt.sign({
        _id:this._id,
     },
     process.env.REFRESH_TOKEN_SECRET,
     {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
     }
    )
}

// Create and export User model
export const User = mongoose.model("User", userSchema);
