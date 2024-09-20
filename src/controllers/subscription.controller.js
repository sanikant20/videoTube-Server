import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "Channel not found.");
    }

    // Get the current logged-in user (subscriber)
    const { _id: userId } = req.user;
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user not logged in.");
    }

    // Prevent subscribing to one's own channel
    if (channelId === userId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel.");
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({
        channel: channelId,
        subscriber: userId,
    });

    if (existingSubscription) {
        // Unsubscribe (delete the subscription)
        await Subscription.deleteOne({ _id: existingSubscription._id });
        return res.status(200).json(new ApiResponse(200, {}, "Unsubscribed successfully."));
    } else {
        // Subscribe (create new subscription)
        const subscription = new Subscription({
            subscriber: userId,
            channel: channelId,
        });
        if (!subscription) {
            throw new ApiError(404, "Failed to toggle subscription")
        }
        await subscription.save();
        return res.status(201).json(new ApiResponse(201, { subscription }, "Subscribed successfully."));
    }
});

// Controller to return the subscriber list of a channel
const getMyChannelSubscriberList = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user;

    // Check if the channelId is provided
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user not logged in.");
    }

    // Find all subscribers of the channel
    const myChannelSubscribers = await Subscription.find({ channel: userId })
        .populate({
            path: 'subscriber', // Populate subscriber information
            select: 'fullName userName email', // Only return selected fields
        });

    // If no subscribers are found, return an empty array
    if (!myChannelSubscribers.length) {
        return res.status(200).json(new ApiResponse(200, [], "No subscribers found for this channel."));
    }

    // Return the list of subscribers
    return res.status(200).json(new ApiResponse(200, { myChannelSubscribers }, "Subscriber list fetched successfully."));
});

// Controller to return channel list to which the user has subscribed
const getChannelListToWhomISubscribed = asyncHandler(async (req, res) => {
    // Get the logged-in user's ID
    const { _id: userId } = req.user;

    // Ensure the user is logged in
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user not logged in.");
    }

    // Find all subscriptions where the user is the subscriber
    const subscriptions = await Subscription.find({ subscriber: userId })
        .populate({
            path: 'channel', // Populate channel details
            select: 'fullName userName email', // Only return relevant fields from the channel (User model)
        });

    // If no subscriptions are found, return a message
    if (!subscriptions.length) {
        return res.status(200).json(new ApiResponse(200, [], "You have not subscribed to any channels."));
    }

    // Return the list of channels the user has subscribed to
    return res.status(200).json(new ApiResponse(200, { subscriptions }, "Subscribed channels fetched successfully."));
});


export {
    toggleSubscription,
    getMyChannelSubscriberList,
    getChannelListToWhomISubscribed
}