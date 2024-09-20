import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";

const router = Router()
router.use(verifyJWT)   // apply middlewares on all route

// Secure routes for comment controller
router
    .route("/video-comment/:videoId")
    .get(getVideoComments)
    .post(addComment)

router
    .route("/c/:commentId")
    .patch(updateComment)
    .delete(deleteComment)

export default router