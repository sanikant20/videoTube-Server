import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addComment,
    getVideoComments,
    updateComment,
    deleteComment,
} from "../controllers/comment.controller.js";

const router = Router()

// Secure routes for comment controller
router
    .route("/video-comment/:videoId")
    .get(getVideoComments)
    .post(verifyJWT, addComment)

router
    .route("/c/:commentId")
    .patch(verifyJWT, updateComment)
    .delete(verifyJWT, deleteComment)

export default router