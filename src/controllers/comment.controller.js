import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// Controller to add comment
const addComment = asyncHandler(async (req, res) => {
    //videoId from params
    const { videoId } = req.params
    const video = await Video.findById(videoId)

    // userData from user 
    const { _id: userId } = req.user
    if (!userId) {
        res.status(400).json({
            success: false,
            message: "Unauthorized, user not logged in",
            error: "Bad Request"
        })
    }

    // comment content from body
    const { content } = req.body
    if (!content) {
        res.status(400).json({
            success: false,
            message: "Comment is required",
            error: "Bad Request"
        })
    }

    // create new comment
    const comment = await Comment.create({
        content,
        video: video?._id || "video not found",
        owner: userId || "owner not found"
    })
    if (!comment) {
        res.status(400).json({
            success: false,
            message: "Failed to add comment",
            error: "Bad Request"
        })
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
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoToBeComment"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "userWhoCommented"
            }
        },
        {
            $unwind: "$videoToBeComment"
        },
        {
            $unwind: "$userWhoCommented"
        },
        {
            $addFields: {
                video: "$videoToBeComment",
                owner: "$userWhoCommented"
            }
        },
        {
            $project: {
                content: 1,
                "video.title": 1,
                "video._id": 1,
                "owner.fullName": 1,
                "owner._id": 1
            }
        }
    ]);
    if (!videoCommentWithOwner.length) {
        throw new ApiError(400, "Failed to retrieve comment with owner details");
    }

    return res.status(200).json(new ApiResponse(200, { comment: videoCommentWithOwner }, "Commented successfuly"))
})

// Controller to get comment for
const getVideoComments = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        res.status(400).json({
            success: false,
            message: "VideoId is required",
            error: "Bad Request"
        })
    }

    const comment = await Comment.find({ video: videoId })
        .populate("owner", "fullName userName email");

    if (!comment.length) {
        new ApiResponse(200, "There is no comment for this video")
    }
    comment.reverse()

    return res.status(200).json(new ApiResponse(200, { comment }, `Retrived comment for ${videoId}`))
})

// Controller to update comment
const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Check if commentId is valid
    const comment = await Comment.findById(commentId);
    if (!comment) {
        return res.status(400).json({ success: false, message: "Comment not found", error: "Bad Request" });
    }

    // Check if user is authorized to update the comment
    if (comment.owner.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: "You are not authorized to update this comment", error: "Forbidden" });
    }

    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ success: false, message: "Content is required", error: "Bad Request" });
    }

    try {
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            {
                $set: {
                    content: content
                }
            },
            {
                new: true // Return the updated comment
            }
        );

        if (!updatedComment) {
            return res.status(404).json({ success: false, message: "Comment not found", error: "Not Found" });
        }

        return res.status(200).json(new ApiResponse(200, { comment: updatedComment }, "Comment updated."));
    } catch (error) {
        throw new ApiError(500, error.message || "Internal Server Error");
    }
});

// Controller to delete a comment
const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;

    // Check if commentId is provided
    if (!commentId) {
        return res.status(400).json({
            success: false,
            message: "CommentId is required",
            error: "Bad Request"
        });
    }

    // Find the comment by ID
    const comment = await Comment.findById(commentId).populate('owner', '_id'); // Populate owner to verify ownership

    // Check if comment exists
    if (!comment) {
        return res.status(404).json({
            success: false,
            message: "Comment not found",
            error: "Not Found"
        });
    }

    // Check if the current user is the owner of the comment
    const { _id: userId } = req.user; // Assuming req.user contains the authenticated user's information
    if (String(comment.owner._id) !== String(userId)) {
        return res.status(403).json({
            success: false,
            message: "You are not authorized to delete this comment",
            error: "Forbidden"
        });
    }

    // Delete the comment
    const deletedComment = await Comment.findByIdAndDelete(commentId);
    if (!deletedComment) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete comment",
            error: "Internal Server Error"
        });
    }

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}