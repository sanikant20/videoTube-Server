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
    const avatarLocalPath = req.files?.avatar?.[0]?.path;
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
            $set: {
                refreshToken: undefined
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
    const incomingRefreshToken = req.cookie?.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unautorized request")
    }

    try {
        const decodedRefreshToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedRefreshToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, newRefreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken, refreshToken: newRefreshToken
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
    return res
        .status(200)
        .json(200, req.user, "Current user fetched succesfully.")
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
    const avatarLocalPath = await req.file?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Missing avatar for update")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
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

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "Failed to upload cover image on cloudinary for update")
    }

    const user = User.findByIdAndUpdate(
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

//GET WATCH HISTORY
const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 11
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(new ApiResponse(
            200,
            user[0].watchHistory,
            "watch history fetch successfully"
        ))
})


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