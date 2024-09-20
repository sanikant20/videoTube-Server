import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    deleteVideo,
    getAllVideos,
    getVideoByID,
    publishVideo,
    updateThumbnail,
    updateVideoDetails,
    updateVideoFile,
    togglePublishVideo
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
router.use(verifyJWT)

// Secure routes for video controllers 
router.route("/get-all-videos").get(getAllVideos)
router.route("/publish-video").post(
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

// Define a route for toggling publish status of a video
router.route('/toggle-publish/:videoId').patch(togglePublishVideo)

export default router