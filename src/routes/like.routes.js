import { Router } from "express"
import {
    getLikedVideos,
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike
} from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
router.use(verifyJWT)   // apply middlewares on all route

router.route("/toggle/video/:videoId").post(toggleVideoLike)
router.route("/toggle/comment/:commentId").post(toggleCommentLike)
router.route("/toggle/tweet/:tweetId").post(toggleTweetLike)
router.route("/liked-video").get(getLikedVideos)

export default router