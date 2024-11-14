// Import required packages
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";

// Initialize express application
const app = express();

// Configure CORS middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

// Parse JSON payloads with 16kb limit
app.use(express.json({limit:"16kb"}));

// Parse URL-encoded bodies with extended mode and 16kb limit
app.use(express.urlencoded({extended:true , limit:"16kb"}));

// Serve static files from 'public' directory
app.use(express.static("public"))

// Parse cookies in requests
app.use(cookieParser())
// app.use(express.json())  // Redundant as already configured above

// Import route handlers
import userRouter from "./routes/user.routes.js"

// Configure API routes
console.log("Loading routes");

// Mount user routes at /api/v1/users endpoint
app.use("/api/v1/users",userRouter);

// Export the configured app
export {app}