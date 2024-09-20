import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Video } from "../models/video.model.js";

// controller to create new playlist
const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name) {
        throw new ApiError(400, "Playlist name is required.")
    }
    if (!description) {
        throw new ApiError(400, "Playlist description is required.")
    }

    // check if playlist name already exists
    const existedPlaylist = await Playlist.findOne({ name })
    if (existedPlaylist) {
        throw new ApiError(400, "Playlist name already exists.")
    }

    // userData from user
    const { _id: userId } = req.user
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user is not login.")
    }

    // create new playlist
    const playlist = await Playlist.create({
        name,
        description,
        // videos: [], // set the 'videos' field to an array
        owner: userId
    })

    if (!playlist) {
        throw new ApiError(400, "Failed to create playlist")
    }

    // Pipline for joining video and user collections
    const playlistWithOwner = await Playlist.aggregate([
        {
            $match: {
                _id: playlist._id
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner"
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $unwind: "$videos"
        },
        {
            $addFields: {
                video: "$videos"
            }
        },
        {
            $addFields: {
                owner: "$owner"
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                video: 1,
                owner: 1
            }
        }
    ])
    if (!playlistWithOwner) {
        throw new ApiError(400, "Failed to create playlist")
    }

    return res.status(200).json(new ApiResponse(200, { playlist }, "Playlist created successfully."))
})

// controller to get user playlists
const getUserPlaylists = asyncHandler(async (req, res) => {
    const { _id: userId } = req.user
    if (!userId) {
        throw new ApiError(400, "Unauthorized, user is not login.")
    }

    // Fetch playlists where the owner matches the user's ID
    const playlists = await Playlist.find({ owner: userId })
    if (!playlists.length) {
        return res.status(404).json(new ApiResponse(404, [], "No playlists found for this user."))
    }

    // Return the found playlists in the response
    return res.status(200).json(new ApiResponse(200, { playlists }, "Playlists retrived successfully."))

})

// controller to get playlist by playlistId
const getPlaylistByPlaylistId = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "PlaylistId is missing")
    }
    // find playlist with playlistId
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // return playlist as response
    return res.status(200).json(new ApiResponse(200, { playlist }, "Playlist retrived successfully."))
})

// controller to add video to playlist
const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    if (!playlistId || !videoId) {
        throw new ApiError(400, "PlaylistId or videoId is missing")
    }

    // find playlist with playlistId
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    console.log(playlist.videos)

    const videoInPlaylist = await playlist.videos.includes(videoId)
    if (videoInPlaylist) {
        throw new ApiError(400, "Video already in playlist")
    }

    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(404, "Video not found")
    }

    // add video to playlist
    playlist.videos.push(videoId)

    // save playlist
    await playlist.save()

    // return playlist
    return res.status(200).json(new ApiResponse(200, { playlist }, "Playlist updated successfully."))
})

// controller to remove video from playlist
const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // request playlistId from params
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "PlaylistId is missing")
    }

    // find playlist with playlistId
    const playlist = await Playlist.findById(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // request video id from body
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "VideoId is missing")
    }

    // check if video in playlist
    const videoInPlaylist = await playlist.videos.includes(videoId)
    if (!videoInPlaylist) {
        throw new ApiError(400, "Video not in playlist")
    }

    // remove video from playlist
    const index = playlist.videos.indexOf(videoId)
    playlist.videos.splice(index, 1)

    // save playlist
    await playlist.save()

    // return playlist
    return res.status(200).json(new ApiResponse(200, { playlist }, "Video removed from playlist successfully."))
})

// controller to delete playlist
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!playlistId) {
        throw new ApiError(400, "PlaylistId is missing")
    }

    // find playlist with playlistId and delete
    const playlist = await Playlist.findByIdAndDelete(playlistId)
    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    // return playlist
    return res.status(200).json(new ApiResponse(200, { playlist }, "Playlist deleted successfully."))

})

// controller to update playlist
const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    const { name, description } = req.body

    // Empty validation
    if (!playlistId) {
        throw new ApiError(400, "PlaylistId is missing")
    }
    if (!name || !description) {
        throw new ApiError(400, "Playlist name or description is missing")
    }

    // find playlist by playlistId and delete
    const playlist = await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:
            {
                name: name,
                description: description
            }
        },
        {
            new: true
        }
    )
    if (!playlist) {
        throw new ApiError(400, "Failed to update playlist.")
    }

    // return response
    return res.status(200).json(new ApiResponse(200, { playlist }, "Playlist updated successfully."))

})


// export controllers
export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistByPlaylistId,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}