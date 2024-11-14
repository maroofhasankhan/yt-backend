// Import required dependencies
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express"; // Note: This import appears unnecessary as Express isn't used

// Create Express app instance (Note: This may not be needed in this DB connection file)
const app = express();

/**
 * Connects to MongoDB using mongoose
 * @returns {Promise} Resolves when connection is successful, rejects on error
 */
const connectDB = async () =>{
    try{
        // Attempt to connect to MongoDB using environment variables
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // Log successful connection with host information
        console.log(`MongoDB connected successfully on port ${connectionInstance.connection.host}`);
    }
    catch(err){
        // Log connection failure and re-throw error for handling upstream
        console.log(`MongoDB connection failed`);
        throw err;
    }
}
// connectDB(); // Commented out direct invocation as it's imported and called elsewhere

// Export the connection function for use in other modules
export default connectDB;