import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

// arrow function for generating access and refresh token
const generateAccessAndRefreshTokens = async (userID) => {

    const user = await User.findById(userID)

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshToken()

    //save refresh token to database
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })

    return { accessToken, refreshToken }
}

// Register arrow function : API
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, email, password } = req.body

    // Check validation i.e., empty validation
    if (
        [fullName, email, userName, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All field is required !!")
    }

    // Check for existing user
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User already existed with the given email or username.")
    }

    // Get the files path locally, with checks to avoid undefined errors
    const avatarLocalFilePath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is missing !!")
    }

    // file upload on cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar is required !!")
    }

    // Create new user
    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    })

    // check createdUser and removed password and refreshToken
    const createdUser = await User.findById(user._id).select(" -password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully.")
    )
});

// Login  Arrow function : API 
const loginUser = asyncHandler(async (req, res) => {
    // Todo task logic : for login
    //req body -> email, username, password
    //validate user email, username
    //validate password
    // generate access and refresh token and save refresh token to db
    // send / save cookies

    const { email, userName, password } = req.body

    if (!(email || userName)) {
        throw new ApiError(400, "email or username is required.")
    }

    // find the user email and username
    const user = await User.findOne({
        $or: [{ email }, { userName }]
    })

    // user validation
    if (!user) {
        throw new ApiError(404, "email or username is not valid.")
    }

    // user password validation
    const isPasswordValid = await user.isPasswordCorrect(password)
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid password")
    }

    // getting generated access and refresh token for user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    //getting user without password and refreshToken
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    // options for cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    // return cookie
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged in successfully"
            )
        )
});

// Login arrow function : API
const logoutUser = asyncHandler(async (req, res) => {

    // find user by id and undefine refreshToken and update database
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    // options for cookies
    const options = {
        httpOnly: true,
        secure: true
    }

    // return response
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "User logged out successfully.")
        )
})

// Refresh token
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unautorized request")
    }

    try {
        // Verify the incoming refresh token
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // Find the user associated with the refresh token
        const user = await User.findById(decodedRefreshToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        // Check if the refresh token matches the user's stored token
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        // Set cookie options
        const options = {
            httpOnly: true,
            secure: true
        }

        // Generate new access and refresh tokens
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        // Set the new tokens in cookies and return them in the response
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken
                    },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})


// change password
const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body

    if (!(newPassword === confirmPassword)) {
        throw new ApiError(401, "new password and confirm password are not same.")
    }

    const user = await User.findById(req.user?._id)
    console.log("User: ", user)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password.")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully."))

})

// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    console.log("User :", req.user)
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched succesfully."))
})

//Update user account details
const updateAccoutDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName || !email) {
        throw new ApiError(401, "All fields are required !!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account details updated successfully."))
})

// update user avatar
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalFilePath = await req.file?.path

    if (!avatarLocalFilePath) {
        throw new ApiError(400, "Missing avatar for update")
    }

    const avatar = await uploadOnCloudinary(avatarLocalFilePath)

    if (!avatar?.url) {
        throw new ApiError(400, "Failed to upload avatar on cloudinary for avatar update")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        { new: true }
    ).select(" -password ")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar updated successfully."))
})

// UPDATE COVER IMAGE
const updateCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Missing cover image for update")
    }

    console.log("Local updated cover Image :", coverImageLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    console.log("Cover image cloud details:", coverImage)

    if (!coverImage?.url) {
        throw new ApiError(400, "Failed to upload cover image on cloudinary for update")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        { new: true }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Cover image updated successfully."))
})


// GET USER CHANNEL PROFILE WITH AGGREGATION PIPELINE
const getUserChannelProfile = asyncHandler(async (req, res) => {
    // Extract 'userName' from the URL parameters
    const { userName } = req.params;

    // Check if 'userName' is provided and not just whitespace, throw error if missing
    if (!userName?.trim) {
        throw new ApiError(400, "username is missing");
    }

    // Start the aggregation pipeline on the 'User' collection to fetch user channel profile data
    const chanel = await User.aggregate([
        // Match the document where 'userName' (converted to lowercase) matches the input
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },

        // First $lookup: Join 'subscriptions' collection where the 'channel' field matches the user's '_id'
        // Retrieves all subscribers to this user's channel
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },

        // Second $lookup: Join 'subscribers' collection where 'subscriber' field matches the user's '_id'
        // Retrieves all channels this user is subscribed to
        {
            $lookup: {
                from: "subscribers",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },

        // $addFields: Add additional computed fields to the result
        {
            $addFields: {
                // 'subscribersCount' is the size of the 'subscribers' array (number of people subscribed to the channel)
                subscribersCount: {
                    $size: "$subscribers"
                },
                // 'channelsSubscribedToCount' is the size of the 'subscribedTo' array (number of channels this user is subscribed to)
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                // 'isSubscribed' is a boolean indicating if the current logged-in user is subscribed to this channel
                // It checks if the current user's '_id' is present in the 'subscribers.subscriber' array
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },

        // $project: Define which fields should be included in the final output
        // Include 'fullName', 'userName', 'subscribersCount', 'channelsSubscribedToCount', 'isSubscribed', 'avatar', 'coverImage', and 'email'
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1
            }
        }
    ]);

    // If no channel is found (empty result), throw an error indicating the channel does not exist
    if (!chanel?.length) {
        throw new ApiError(400, "Channel doesn't exists");
    }

    // If the channel is found, return the first document from the result with a success response
    return res
        .status(200)
        .json(new ApiResponse(200, chanel[0], "User channel fetched successfully."));
});

// GET WATCH HISTORY
const getWatchHistory = asyncHandler(async (req, res) => {
    // Start an aggregation pipeline on the 'User' collection to fetch the watch history of the logged-in user
    const user = await User.aggregate([
        // $match: Find the document in the 'User' collection where the '_id' matches the logged-in user's ID
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user?._id) // Convert the 'req.user._id' to an ObjectId for matching
            }
        },

        // $lookup: Join the 'videos' collection to fetch videos from the user's 'watchHistory' array
        {
            $lookup: {
                from: "videos", // The collection to join with
                localField: "watchHistory", // The field in 'User' that contains the video IDs
                foreignField: "_id", // The field in the 'videos' collection that corresponds to the video IDs
                as: "watchHistory", // The result will be stored in a new 'watchHistory' field
                // A sub-pipeline is used to further refine the data retrieved from the 'videos' collection
                pipeline: [
                    // Nested $lookup: Join the 'users' collection to fetch the 'owner' details of each video
                    {
                        $lookup: {
                            from: "users", // The collection to join with (to get the video owner details)
                            localField: "owner", // The 'owner' field in the 'videos' collection, representing the video's uploader
                            foreignField: "_id", // The field in 'users' that matches the video's 'owner' field
                            as: "owner", // The result will be stored in the 'owner' field
                            pipeline: [
                                // $project: Select specific fields from the 'owner' (user) document
                                {
                                    $project: {
                                        fullName: 1, // Include the owner's full name
                                        userName: 1, // Include the owner's username
                                        avatar: 1 // Include the owner's avatar
                                    }
                                }
                            ]
                        }
                    },
                    // $addFields: Convert the 'owner' array to a single object (since each video has only one owner)
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner" // Get the first (and only) owner from the 'owner' array
                            }
                        }
                    }
                ]
            }
        }
    ]);

    // Send the user's watch history as the response
    return res
        .status(200)
        .json(new ApiResponse(
            200, // Status code for success
            user[0].watchHistory, // The fetched watch history array is sent as part of the response
            "Watch history fetched successfully" // Success message
        ));
});


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    updatePassword,
    getCurrentUser,
    updateAccoutDetails,
    updateUserAvatar,
    updateCoverImage,
    getUserChannelProfile,
    getWatchHistory
}