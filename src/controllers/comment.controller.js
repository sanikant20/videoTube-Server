import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to get comment for
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "VideoId is missing")
    }

    const comment = await Comment.find({ video: videoId })
        .populate("owner", "fullName userName email"); // Populate the user who commented (optional)

    if (!comment.length) {
        new ApiResponse(200, "There is no comment for this video")
    }

    return res.status(200).json(new ApiResponse(200, { comment }, `Retrived comment for ${videoId}`))
})

// Controller to add comment
const addComment = asyncHandler(async (req, res) => {
    //videoId from params
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    // userData from user 
    const user = req.user
    if (!user._id) {
        throw new ApiError(400, "Unauthorized, user is not login.")
    }

    // comment content from body
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Comment is required.")
    }

    // create new comment
    const comment = await Comment.create({
        content,
        video: video?._id || "video not found",
        owner: user?._id || "owner not found"
    })
    if (!comment) {
        throw new ApiError(400, "Failed to comment")
    }

    // Pipline for joining video and user collections
    const videoCommentWithOwner = await Comment.aggregate([
        {
            $match: {
                _id: comment?._id
            }
        },
        {
            $lookup: {
                from: "videos", // Look up the video associated with the comment
                localField: "video",
                foreignField: "_id",
                as: "videoToBeComment"
            }
        },
        {
            $lookup: {
                from: "users", // Look up the user who made the comment
                localField: "owner",
                foreignField: "_id",
                as: "userWhoCommented"
            }
        },
        {
            $unwind: "$videoToBeComment" // Unwind the 'videoToBeComment' array
        },
        {
            $unwind: "$userWhoCommented" // Unwind the 'userWhoCommented' array
        },
        {
            $addFields: {
                video: "$videoToBeComment", // Assign video data to 'video'
                owner: "$userWhoCommented"  // Assign user data to 'owner'
            }
        },
        {
            $project: {
                content: 1,              // Keep the comment content
                "video.title": 1,         // Include the video's title
                "video._id": 1,           // Include the video's ID
                "owner.fullName": 1,      // Include the owner's full name
                "owner._id": 1            // Include the owner's ID
            }
        }
    ]);
    if (!videoCommentWithOwner.length) {
        throw new ApiError(400, "Failed to retrieve comment with owner details");
    }

    return res.status(200).json(new ApiResponse(200, "Commented successfuly"))
})

// Controller to update comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Comment is required.")
    }

    const comment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                content
            }
        },
        {
            new: true
        }
    )
    if (!comment) {
        throw new ApiError(400, "Failed to update comment")
    }

    return res.status(200).json(new ApiResponse(200, { comment }, "Comment updated."))
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!commentId) {
        throw new ApiError(400, "CommentId is required")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(400, "Comment not found")
    } else {
        const deletedComment = await Comment.findByIdAndDelete(commentId)
        if (!deletedComment) {
            throw new ApiError(400, "Failed to delete comment.")
        }
        return res.status(200).json(new ApiResponse(200, { comment }, "Comment deleted successfully"))
    }

})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}