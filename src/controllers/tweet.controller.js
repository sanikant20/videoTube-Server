import { asyncHandler } from "../utils/asyncHandler.js"


// controller to create new tweet
const createTweet = asyncHandler(async (req, res) => {

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