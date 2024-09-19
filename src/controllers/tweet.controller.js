import { Tweet } from "../models/tweet.model.js"
import { Video } from "../models/video.model.js"
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
                "owner._id": 1,
                "owner.fullName": 1,
                "owner.userName": 1,
                "owner.email": 1,
            }
        }
    ])
    if (!tweetWithOwner?.length) {
        throw new ApiError(400, "Failed to retrive user details for tweet")
    }

    return res.status(200).json(new ApiResponse(200, { tweet: tweetWithOwner[0] }, "New tweet created successfully."))
})

// controller to get user tweeets
const getAllTweets = asyncHandler(async (req, res) => {

    const tweets = await Tweet.find()
    console.log("Tweets: ", tweets)
    return res.status(200).json(new ApiResponse(200, { tweets }, "All tweets retrived."))

})

const getUserTweets = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user not loggedIn")
    }

    try {
        // Fetch tweets where the owner matches the user's ID
        const tweets = await Tweet.find({ owner: userId })
        // .populate("owner", "fullName userName email")

        // If no tweets are found, throw an error or handle it gracefully
        if (!tweets.length) {
            return res.status(404).json(new ApiResponse(404, [], "No tweets found for this user."));
        }

        // Return the found tweets in the response
        return res.status(200).json(new ApiResponse(200, { tweets }, "Tweets retrieved successfully."));

    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error.")
    }
});

// controller to update tweet
const updateTweets = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!tweetId) {
        throw new ApiError(404, "tweetId is missing")
    }

    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "content is missing")
    }
    const tweeets = await Tweet.findByIdAndUpdate(tweetId,
        {
            $set: {
                content: content
            }
        }, {
        new: true
    })
    return res.status(200).json(new ApiResponse(200, { tweeets }, `Tweet updated successfully`))
})

// controller to delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
        throw new ApiError(400, "Tweet id is missing")
    }

    const tweet = await Tweet.findByIdAndDelete(tweetId)
    if (!tweet) {
        throw new ApiError(400, "Failed to delete tweet")
    } else {
        return res.status(200).json(new ApiResponse(200, { tweet }, `Tweet is deleted successfully.`))
    }

})


export {
    createTweet,
    getAllTweets,
    getUserTweets,
    updateTweets,
    deleteTweet
}