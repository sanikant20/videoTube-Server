import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getVideoByID,
    publishVideo,
    updateThumbnail,
    updateVideoDetails,
    updateVideoFile
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


router.route("/update-video-details/:videoId").patch(updateVideoDetails)
router.route("/update-video/:videoId").patch(upload.single("videoFile"), updateVideoFile)
router.route("/update-thumbnail/:videoId").patch(upload.single("thumbnail"), updateThumbnail)

router
    .route("/:videoId")
    .get(getVideoByID)
    .delete(deleteVideo)

export default router