import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistByPlaylistId,
    getUserPlaylists,
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";

const router = Router()
router.use(verifyJWT)   // apply middleware to all routes

// Secure routes for playlist controller
router.route("/create-playlist").post(createPlaylist)
router.route("/user-playlists").get(getUserPlaylists)

router
    .route("/:playlistId")
    .get(getPlaylistByPlaylistId)
    .delete(deletePlaylist)
    .patch(updatePlaylist)

router.route("/add/:videoId/:playlistId").post(addVideoToPlaylist)
router.route("/remove/:videoId/:playlistId").patch(removeVideoFromPlaylist)

export default router