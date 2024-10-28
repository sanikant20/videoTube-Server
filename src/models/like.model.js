import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: "Video",
        required: false  
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment",
        required: false  
    },
    tweet: {
        type: Schema.Types.ObjectId,
        ref: "Tweet",
        required: false
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true });

// Add a unique compound index to ensure that a user can only like a given item once
likeSchema.index({ video: 1, comment: 1, tweet: 1, likedBy: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
