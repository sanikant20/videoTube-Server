import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.models.js";
import { uploadOnClouydinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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
    const avatar = await uploadOnClouydinary(avatarLocalPath)
    const coverImage = await uploadOnClouydinary(coverImageLocalPath)

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

// Login arrow function
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


export {
    registerUser,
    loginUser,
    logoutUser
}