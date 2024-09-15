import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

})

// controller to return subscriber list of a channel
const getSubscriberListOfChannel = asyncHandler(async (req, res) => {
    const { channelId } = req.params

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriptionId } = req.params


})


export {
    toggleSubscription,
    getSubscriberListOfChannel,
    getSubscribedChannels
}