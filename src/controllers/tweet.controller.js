import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// controller to create new tweet
const createTweet = asyncHandler(async (req, res) => {
    const user = req.user 
    if (!user?._id) {
        throw new ApiError(400, "Unauthorized, user not login.")
    }

    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "Content is required.")
    }


    const tweet = await Tweet.create({
        content,
        owner: user._id
    })
    if (!tweet) {
        throw new ApiError(400, "Failed to create tweet")
    }

    const tweetWithOwner = await Tweet.aggregate([
        {
            $match: {
                _id: tweet._id
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $addFields: {
                owner: "$owner"
            }
        },
        {
            $project: {
                content: 1,
                owner: 1,
            }
        }
    ])
    if (!tweetWithOwner?.length) {
        throw new ApiError(400, "Failed to retrive user details for tweet")
    }

    return res.status(200).json(new ApiResponse(200, { tweet: tweetWithOwner[0] }, "New tweet created successfully."))
})


// controller to get user tweeets
const getUserTweets = asyncHandler(async (req, res) => {
    const { userId } = req.params


})

// controller to update tweet
const updateTweets = asyncHandler(async (req, res) => {
    const { tweetId } = req.params


})

// controller to delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params


})



export {
    createTweet,
    getUserTweets,
    updateTweets,
    deleteTweet
}