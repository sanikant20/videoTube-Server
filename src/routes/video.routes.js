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
    togglePublishVideo,
    searchVideos
} from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()
// router.use(verifyJWT)

// Secure routes for video controllers 
router.route("/get-all-videos").get(getAllVideos)
router.route("/publish-video").post(verifyJWT,
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

router.route("/update-video-details/:videoId").patch(verifyJWT, updateVideoDetails)
router.route("/update-video/:videoId").patch(verifyJWT, upload.single("videoFile"), updateVideoFile)
router.route("/update-thumbnail/:videoId").patch(verifyJWT, upload.single("thumbnail"), updateThumbnail)

router
    .route("/:videoId")
    .get(getVideoByID)
    .delete(verifyJWT, deleteVideo)

// Define a route for toggling publish status of a video
router.route('/toggle-publish/:videoId').patch(verifyJWT, togglePublishVideo)
router.route("/search/:key").get(searchVideos)

export default router