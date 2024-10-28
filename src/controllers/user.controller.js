import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

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

// Register arrow function: API
const registerUser = asyncHandler(async (req, res) => {
    const { fullName, userName, email, password } = req.body;

    // Check validation i.e., empty validation
    if ([fullName, email, userName, password].some((field) => field?.trim() === "")) {
        return res.status(400).json({
            error: true,
            message: "All fields are required !!"
        });
    }
    // Check for existing username
    const existingUsername = await User.findOne({ userName });
    if (existingUsername) {
        return res.status(409).json({
            error: true,
            message: `User already exists with the given username: ${userName}. Please choose a different username.`,
        });
    }

    // Check for existing user
    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
        return res.status(409).json({
            error: true,
            message: `User already exists with the given email: ${email}. \nPlease choose a different email.`,
        });
    }

    // Get the files path locally, with checks to avoid undefined errors
    const avatarLocalFilePath = req.files?.avatar?.[0]?.path;
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

    if (!avatarLocalFilePath) {
        return res.status(400).json({
            error: true,
            message: "Avatar is missing !!"
        });
    }

    // File upload on Cloudinary
    const avatar = await uploadOnCloudinary(avatarLocalFilePath);
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : null;

    if (!avatar) {
        return res.status(400).json({
            error: true,
            message: "Failed to upload avatar !!"
        });
    }

    // Create new user
    const user = await User.create({
        fullName,
        userName: userName.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
    });

    // Check created user and remove password and refreshToken
    const createdUser = await User.findById(user._id).select("-password -refreshToken");

    if (!createdUser) {
        return res.status(500).json({
            error: true,
            message: "Something went wrong while registering the user."
        });
    }

    return res.status(201).json({
        error: false,
        message: "User registered successfully.",
        data: createdUser
    });
});

// Login Arrow function : API 
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Validate email
    if (!email) {
        return res.status(400).json({
            error: true,
            message: "Email is required.",
        });
    }

    // Validate password
    if (!password) {
        return res.status(400).json({
            error: true,
            message: "Password is required.",
        });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // User validation
    if (!user) {
        return res.status(404).json({
            error: true,
            message: "Email is not valid.",
        });
    }

    // Validate password
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        return res.status(401).json({
            error: true,
            message: "Invalid password.",
        });
    }

    // Generate access and refresh tokens for user
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Get user without password and refreshToken
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Options for cookies
    const options = {
        httpOnly: true,
        secure: true,
    };

    // Return cookie and response
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json({
            error: false,
            message: "User logged in successfully",
            data: {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
        });
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
        secure: true,
        sameSite: "Lax",
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
            secure: true,
            sameSite: "Lax",
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

const updatePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Check if all fields are provided
    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            status: 400,
            message: "All fields are required.",
            error: "Bad Request"
        });
    }

    // Check if new password and confirm password match
    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            status: 400,
            message: "New password and confirm password do not match.",
            error: "Bad Request"
        });
    }

    // Check if new password meets the length requirement
    if (newPassword.length < 6) {
        return res.status(400).json({
            status: 400,
            message: "New password must be at least 6 characters long.",
            error: "Bad Request"
        });
    }

    const { _id: userID } = req.user;

    // Check if userID is present
    if (!userID) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized request",
            error: "Unauthorized request"
        });
    }

    const user = await User.findById(userID);

    // Check if user exists
    if (!user) {
        return res.status(404).json({
            status: 404,
            message: "User not found.",
            error: "Not Found"
        });
    }

    // Check if old password is correct
    if (!(await user.isPasswordCorrect(oldPassword))) {
        return res.status(401).json({
            status: 401,
            message: "Old password is not correct.",
            error: "Unauthorized request"
        });
    }

    // Check if old password and new password are the same
    if (oldPassword === newPassword) {
        return res.status(400).json({
            status: 400,
            message: "Old password and new password cannot be the same.",
            error: "Bad Request"
        });
    }

    // Check if old password and confirm password are the same
    if (oldPassword === confirmPassword) {
        return res.status(400).json({
            status: 400,
            message: "Old password and confirm password cannot be the same.",
            error: "Bad Request"
        });
    }

    // Update the user's password
    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    // Return success response
    return res.status(200).json({
        status: 200,
        data: user,
        message: "Password updated successfully.",
    });
});


// get current user
const getCurrentUser = asyncHandler(async (req, res) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(404).json({ data: null, message: "User not found." });
        }

        // If the user is found, return the user data with a 200 status
        res.status(200).json({ data: user, message: "User fetched successfully." });

    } catch (error) {
        // Log the error and return a 500 status for server error
        console.error("Error fetching user:", error.message);
        res.status(500).json({ data: null, message: error.message || "Internal Server Error" });
    }
});


//Update user account details
const updateAccoutDetails = asyncHandler(async (req, res) => {
    const { fullName, userName } = req.body

    if (!fullName && !userName) {
        throw new ApiError(401, "Either fullName or userName is required!!")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                userName
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

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
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
    const { userName } = req.params;
    if (!userName?.trim) {
        throw new ApiError(400, "username is missing");
    }

    // Start the aggregation pipeline on the 'User' collection to fetch user channel profile data
    const chanel = await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscribers",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                userName: 1
            }
        }
    ]);
    if (!chanel?.length) {
        throw new ApiError(400, "Channel doesn't exists");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, chanel[0], "User channel fetched successfully."));
});

// GET WATCH HISTORY
const getWatchHistory = asyncHandler(async (req, res) => {
    const { _id: userID } = req.user
    if (!userID) {
        throw new ApiError(400, "Unauthorized, user not loggin")
    }

    const user = await User.aggregate([
        {
            $match: {
                _id: userID
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                // A sub-pipeline is used to further refine the data retrieved from the 'videos' collection
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
                                        avatar: 1
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
    ]);

    // Send the user's watch history as the response
    return res.status(200).json(new ApiResponse(200, user[0].watchHistory, "Watch history fetched successfully"));
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