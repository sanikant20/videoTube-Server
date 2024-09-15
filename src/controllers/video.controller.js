import { asyncHandler } from "../middlewares/auth.middleware.js"

// controller to publish video
const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body


})

// controller to get videos
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

})

// controller to get video
const getVideoByID = asyncHandler(async (req, res) => {
    const { videoId } = req.params


})

// controller to update video
const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params


})

//controller to delete video
const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params


})

// controller for publish video toggle
const togglePublishVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params


})

export {
    publishVideo,
    getAllVideos,
    getVideoByID,
    updateVideo,
    deleteVideo,
    togglePublishVideo
}