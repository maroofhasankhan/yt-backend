// Import required dependencies
import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

// Define video schema with required fields and validation
const videoSchema =new Schema({
    videoFile:{
        type: String,
        required: true    // Path to uploaded video file
    },

    title: {
        type: String,
        required: true    // Video title
    },
    description: {
        type: String,
        required: true    // Video description
    },
    duration: {
        type: Number,
        required: true    // Duration of video in seconds
    },
    url: {
        type: String,
        required: true    // Public URL to access video
    },
    thumbnail: {
        type: String,
        required: true    // Thumbnail image for video preview
    },
    views: {
        type: Number,
        default: 0        // Track number of video views
    },
    likes: {
        type: Number,
        default: 0        // Track number of video likes
    },
    isPublished:{
        type: Boolean,
        default: false    // Whether video is published or draft
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:'User'        // Reference to User who uploaded video
    }
},{timestamps: true})    // Add automatic timestamp fields (createdAt, updatedAt)

// Add pagination plugin for aggregation queries
videoSchema.plugin(mongooseAggregatePaginate);

// Create and export Video model
export const Video= mongoose.model('Video',videoSchema)