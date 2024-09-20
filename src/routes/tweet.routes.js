import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets,
    updateTweets
} from "../controllers/tweet.controller.js";

const router = Router()
router.use(verifyJWT) // apply middleware for all routes

// Secure routes for tweet controller
router.route("/create-tweet").post(createTweet)
router.route("/all-tweets").get(getAllTweets)
router.route("/user-tweets").get(getUserTweets)
router
    .route("/:tweetId")
    .patch(updateTweets)
    .delete(deleteTweet)

export default router