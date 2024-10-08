import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";
import express from "express";

const app = express();


const connectDB = async () =>{
    try{
        const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        console.log(`MongoDB connected successfully on port ${connectionInstance.connection.host}`);
    }
    catch(err){
        console.log(`MongoDB connection failed`);
        throw err;
    }
}

// connectDB();

export default connectDB;