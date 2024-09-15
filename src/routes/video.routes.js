import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoByID, publishVideo, updateVideo } from "../controllers/video.controller";


const router = Router()
router.route(verifyJWT)

router
    .route("/")
    .get(getAllVideos)
    .post(
        upload.fields([
            {
                name: "videofile",
                maxCount: 1
            },
            {
                name: "thumnail",
                maxCount: 1
            }
        ]),
        publishVideo
    )

router
    .route("/:videoId")
    .get(getVideoByID)
    .patch(upload.single("thumnail"), updateVideo)
    .delete(deleteVideo)

export default router