import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";


export const verifyJWT = asyncHandler(async (req, res, next) => {

    try {
        // get token from cookies or authorized headers
        const token = req.cookies?.accessToken || req.heders("Authorization")?.replace("Bearer ", "")

        if (!token) {
            throw new ApiError(201, "Unauthorized request")
        }

        //get decoded token to verify jwt
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id).select(" -password -refreshToken")

        if (!user) {
            // Discusson about frontend

            throw new ApiError(401, "Invalid access token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }
})