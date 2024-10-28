import { Tweet } from "../models/tweet.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


// controller to create new tweet
const createTweet = asyncHandler(async (req, res) => {
    const user = req.user;
    if (!user?._id) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized, user not logged in",
            error: "Unauthorized"
        })
    }

    const { content } = req.body;
    if (!content) {
        return res.status(400).json({
            success: false,
            message: "Content is required, please enter content",
            error: "Bad Request"
        })
    }

    // Create the new tweet
    const tweet = await Tweet.create({
        content,
        owner: user._id
    });
    if (!tweet) {
        return res.status(400).json({
            success: false,
            message: "Failed to create tweet",
            error: "Bad Request"
        })
    }

    // Use aggregation to retrieve the tweet with owner details
    const tweetWithOwner = await Tweet.aggregate([
        {
            $match: { _id: tweet._id }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        { $unwind: "$owner" },
        {
            $project: {
                content: 1,
                createdAt: 1,
                "owner._id": 1,
                "owner.fullName": 1,
                "owner.userName": 1,
                "owner.email": 1,
                "owner.avatar": 1
            }
        }
    ]);

    if (!tweetWithOwner?.length) {
        return res.status(404).json({
            success: false,
            message: "Tweet not found with owner details",
            error: "Not Found"
        })
    }

    return res.status(200).json(
        new ApiResponse(200, { tweet: tweetWithOwner }, "New tweet created successfully.")
    );
});

// controller to get all tweets with populated owner data
const getAllTweets = asyncHandler(async (req, res) => {
    try {
        const tweets = await Tweet.aggregate([
            {
                $lookup: {
                    from: "users", 
                    localField: "owner", 
                    foreignField: "_id", 
                    as: "owner"
                }
            },
            { 
                $unwind: "$owner" // Convert owner array to an object for easier access
            },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    "owner._id": 1,
                    "owner.fullName": 1,
                    "owner.userName": 1, 
                    "owner.email": 1,
                    "owner.avatar": 1
                }
            }
        ]);

        return res.status(200).json(new ApiResponse(200, { tweets : tweets.reverse() }, "All tweets retrieved with owner data."));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Failed to retrieve tweets with owner data."));
    }
});

// controller to get user tweets
const getUserTweets = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user not loggedIn")
    }

    try {
        const tweets = await Tweet.find({ owner: userId })
        if (!tweets.length) {
            return res.status(404).json(new ApiResponse(404, [], "No tweets found for this user."));
        }

        const tweetsWithOwner = await Tweet.aggregate([
            {
                $match: {_id : { $in: tweets.map(t => t._id) } }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "owner",
                    foreignField: "_id",
                    as: "owner"
                },
                
            },
            { $unwind: "$owner" },
            {
                $project: {
                    content: 1,
                    createdAt: 1,
                    "owner._id": 1,
                    "owner.fullName": 1,
                    "owner.userName": 1,
                    "owner.email": 1,
                    "owner.avatar": 1
                }
            }
        ])
        if (!tweetsWithOwner.length) {
            return res.status(404).json({ success: false, message: "No tweets found for this user." });
        }
        return res.status(200).json(new ApiResponse(200, { tweets: tweetsWithOwner }, "Tweets retrieved successfully."));

    } catch (error) {
        throw new ApiError(500, error.message || "Internal server error.")
    }
});

// controller to get single tweet
const getSingleTweet = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized, user not logged in",
            error: "Unauthorized"
        });
    }

    const { tweetId } = req.params;
    if (!tweetId) {
        return res.status(400).json({
            success: false,
            message: "Tweet ID is missing",
            error: "Bad Request"
        });
    }

    // Fetch the tweet and check ownership
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        return res.status(404).json({
            success: false,
            message: "Tweet not found",
            error: "Not Found"
        });
    }

    if (tweet.owner.toString() !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to view this tweet",
            error: "Forbidden"
        });
    } else {
        return res.status(200).json({
            success: true,
            message: "Tweet retrieved successfully for update",
            data: tweet
        });
    }

})

// Controller to update tweet
const updateTweets = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized, user not logged in",
            error: "Unauthorized"
        });
    }

    const { tweetId } = req.params;
    if (!tweetId) {
        return res.status(400).json({
            success: false,
            message: "Tweet ID is missing",
            error: "Bad Request"
        });
    }

    // Fetch the tweet and check ownership
    const tweet = await Tweet.findById(tweetId);
    if (!tweet) {
        return res.status(404).json({
            success: false,
            message: "Tweet not found",
            error: "Not Found"
        });
    }

    if (tweet.owner.toString() !== userId.toString()) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to update this tweet",
            error: "Forbidden"
        });
    }

    const { content } = req.body;
    if (!content) {
        return res.status(400).json({
            success: false,
            message: "Content is required",
            error: "Bad Request"
        });
    }

    // Update the tweet content
    const updatedTweet = await Tweet.findByIdAndUpdate(
        tweetId,
        { $set: { content } },
        { new: true }
    );

    return res.status(200).json({
        success: true,
        data: updatedTweet,
        message: "Tweet updated successfully"
    });
});

// controller to delete tweet
const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!tweetId) {
       return res.status(400).json({ success: false, message: "Tweet ID is missing", error: "Bad Request" })
    }

    const { _id: userId } = req.user
    if (!userId) {
       return res.status(401).json({ success: false, message: "Unauthorized, user not logged in", error: "Unauthorized" })
    }

    const tweet = await Tweet.findById(tweetId)
    if (!tweet) {
        return res.status(404).json({ success: false, message: "Tweet not found", error: "Not Found" })
    }

    if (tweet.owner.toString() !== userId.toString()) {
        return res.status(403).json({ success: false, message: "Unauthorized to delete this tweet", error: "Forbidden" })
    }

    await Tweet.findByIdAndDelete(tweetId)
    return res.status(200).json({ success: true, message: "Tweet deleted successfully" })


})


export {
    createTweet,
    getAllTweets,
    getUserTweets,
    getSingleTweet,
    updateTweets,
    deleteTweet
}