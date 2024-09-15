import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import {
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweets
} from "../controllers/tweet.controller.js";

const router = Router()
router.route(verifyJWT) // apply middleware for all routes


router.route("/create-tweet").post(createTweet)
router.route("/user/:userId").get(getUserTweets)
router
    .route("/:tweetId")
    .patch(updateTweets)
    .delete(deleteTweet)

export default router