import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getVideoByID,
    publishVideo,
    updateVideo
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.route(verifyJWT)

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videoFile",
                maxCount: 1
            },
            {
                name: "thumbnail",
                maxCount: 1
            }
        ]),
        publishVideo
    )

router
    .route("/:videoId")
    .get(getVideoByID)
    .patch(upload.single("thumbnail"), updateVideo)
    .delete(deleteVideo)

export default router