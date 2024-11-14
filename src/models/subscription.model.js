// Import mongoose and Schema from mongoose package
import mongoose, {Schema} from "mongoose";

// Define subscription schema to track relationships between subscribers and channels
const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // Reference to User model for the subscriber
        ref: "User"                  // The user who is subscribing to a channel
    },
    channel: {
        type: Schema.Types.ObjectId, // Reference to User model for the channel
        ref: "User",                 // The user/channel being subscribed to
    }
},{timestamps}); // Add automatic timestamp fields (createdAt, updatedAt)

// Create and export Subscription model
export const Subscription = mongoose.model("Subscription", subscriptionSchema);