import { Comment } from "../models/comment.model.js";
import { Like } from "../models/like.model.js";
import { Video } from "../models/video.model.js";
import { Tweet } from "../models/tweet.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Controller to toggle video like
const toggleVideoLike = asyncHandler(async (req, res) => {
    // get videoId from params
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "videoId is missing")
    }

    // get authorized userId
    const { _id: userId } = req.user
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user is not loggin")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Video not found")
    }

    const existedLikeOnVideo = await Like.findOne({ video: videoId, likedBy: userId })

    if (existedLikeOnVideo) {
        //unlike the video if video already liked
        await Like.deleteOne({ _id: existedLikeOnVideo._id })

        // decrease from total like
        video.likeCount = Math.max(0, video.likeCount - 1) // Ensure likeCount don't go in negative
        await video.save()

        return res.status(200).json(new ApiResponse(200, "Video unliked"))
    } else {
        const newLike = new Like({
            video: videoId,
            likedBy: userId
        })
        if (!newLike) {
            return new ApiError(400, "Failed to like")
        } else {
            await newLike.save()
            // increase the like by 1
            video.likeCount += 1
            await video.save()

            return res.status(200).json(new ApiResponse(200, "Video liked"))
        }
    }
})

// Controller to toggle comment like
const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!commentId) {
        throw new ApiError(400, "CommentId is missing")
    }
    const comment = await Comment.findById(commentId)
    if (!comment) {
        throw new ApiError(404, "Comment is not found")
    }

    const { _id: userId } = req.user
    if (!userId) {
        throw new ApiError(404, "Unauthorized, user not logged in")
    }

    const existedLikeOnComment = await Like.findOne({ comment: commentId, likedBy: userId })

    if (existedLikeOnComment) {
        await Like.deleteOne({ _id: existedLikeOnComment._id })

        comment.likeCount = Math.max(0, comment.likeCount - 1)
        await comment.save()

        return res.status(200).json(new ApiResponse(200, "Comment unliked."))
    } else {
        const newCommentLike = new Like({
            comment: commentId,
            likedBy: userId
        })
        await newCommentLike.save()

        comment.likeCount += 1
        await comment.save()

        return res.status(200).json(new ApiResponse(200, "Comment liked."))
    }
})

// controller to toggle tweet like
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(400, "tweetId is missing")
    }
    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        throw new ApiError(404, "Tweet not found")
    }

    const { _id: userId } = req.user
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user not logged in")
    }

    const existedLikeOnTweet = await Like.findOne({ tweet: tweetId, likedBy: userId })
    if (existedLikeOnTweet) {
        await Like.deleteOne({ _id: existedLikeOnTweet._id })

        tweet.likeCount = Math.max(0, tweet.likeCount - 1)
        tweet.save()

        return res.status(200).json(new ApiResponse(200, "Tweet unliked."))
    } else {
        const newTweetLike = new Like({
            tweet: tweetId,
            likedBy: userId
        })
        await newTweetLike.save()

        tweet.likeCount += 1
        await tweet.save()

        return res.status(200).json(new ApiResponse(200, "Tweet liked."))
    }

})

// controller to get liked video only
const getLikedVideos = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user not logged in.")
    }
    
    try {
        // Fetch liked videos only
        const likedVideo = await Like.find({ likedBy: userId, video: { $exists: true } })
            .populate("video", "videoFile thumbnail title description duration views likeCount")

        if (!likedVideo.length) {
            return res.status(404).json(new ApiResponse(404, {}, "No liked video found."))
        }
        // Return the found liked videos in the response
        return res.status(200).json(new ApiResponse(200, { likedVideo }, "Liked video retrived successfully."))
    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error.")
    }
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}