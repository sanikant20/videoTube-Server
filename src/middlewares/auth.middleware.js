import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.headers?.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                status: 401,
                message: "User not logged in",
                error: "Unauthorized request"
            });
        }

        // Decode and verify the access token
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await User.findById(decodedToken._id).select('-password -refreshToken');

        if (!user) {
            return res.status(401).json({
                status: 401,
                message: "User not found",
                error: "Unauthorized request"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        // Detect token expiration error
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 401,
                message: "Token expired",
                error: "Expired token"
            });
        }
        return res.status(500).json({
            status: 500,
            message: "Internal server error",
            error: error.message || "Something went wrong"
        });
    }
});
