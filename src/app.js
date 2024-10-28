import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

// cross origin resource sharing configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}))

// Main configuration
app.use(express.json({ limit: "16kb" })) // It's limit the json file size
app.use(express.urlencoded({ extended: true, limit: "16kb" })) // URL encoded extended i.e., sanikant+kushwaha+423ffoijf, sanikant%kushwaha%lksjf893
app.use(express.static("public")) // public assets store files like images, etc.
app.use(cookieParser())

// Error handler middleware
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500; // Default to 500 if no status code is present
    const message = err.message || "Something went wrong";

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        errors: err.errors || [], // You can add more error details if available
    });
});

// Routes import
import commentRoute from "./routes/comment.routes.js"
import healthRoute from "./routes/health.routes.js"
import likeRoute from "./routes/like.routes.js"
import playlistRoute from "./routes/playlist.routes.js"
import subscriptionRoute from "./routes/subscription.routes.js"
import tweetRoute from "./routes/tweet.routes.js"
import userRoute from "./routes/user.routes.js"
import videoRoute from "./routes/video.routes.js"


// Route declearation
app.use("/api/v1/comments", commentRoute)
app.use("/api/v1/health", healthRoute)
app.use("/api/v1/likes", likeRoute)
app.use("/api/v1/playlists", playlistRoute)
app.use("/api/v1/subscriptions", subscriptionRoute)
app.use("/api/v1/tweets", tweetRoute)
app.use("/api/v1/users", userRoute)
app.use("/api/v1/videos", videoRoute)


export { app }