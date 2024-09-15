import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { Video } from "../models/video.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"


// controller to publish video
const publishVideo = asyncHandler(async (req, res) => {
    // check for user logged in
    // check validation
    // check existed title for video
    // store files locally
    // store on cloud and delete local files
    // create new post and store data


    const { title, description } = req.body

    // check empty validation
    if (!title || !description) {
        throw new ApiError(400, "All fields are required for video publish")
    }

    // Check for existing title
    const existedVideoTitle = await Video.findOne({
        $or: [{ title }]
    })
    if (existedVideoTitle) {
        throw new ApiError(409, "Video title already exists, please write new title !!")
    }

    // Get the files path locally, with checks to avoid undefined errors
    const localVideoFile = await req.files?.videoFile?.[0].path;
    const localThumbnailFile = await req.files?.thumbnail?.[0].path;

    if (!localVideoFile || !localThumbnailFile) {
        throw new ApiError(400, "Video is missing !!")
    }
    if (!localThumbnailFile) {
        throw new ApiError(400, "thumbanil is missing !!")
    }

    // file upload on cloudinary
    const cloudVideoFile = await uploadOnCloudinary(localVideoFile)
    const cloudThumbnailFile = await uploadOnCloudinary(localThumbnailFile)

    if (!cloudVideoFile) {
        throw new ApiError(400, "Failed to upload Video  in cloudinary !!")
    }
    if (!cloudVideoFile) {
        throw new ApiError(400, "Failed to upload thumbanil in cloudinary !!")
    }

    // Create new video publish
    const video = await Video.create({
        title,
        description,
        videoFile: cloudVideoFile.url,
        thumbnail: cloudThumbnailFile.url,
        duration: cloudVideoFile?.duration / 60 || ""
    })

    // const publishedVideo = await Video.findById(video._id)
    if (!video) {
        throw new ApiError(400, "Something went wrong while publishing video.")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, "Video published successfully"))

})


// controller to get videos
const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = "desc", userId } = req.query

    // Building the filter object
    let filter = {};
    if (query) {
        filter.title = {
            $regex: query,
            $options: "i"
        }; // 'title' is a field in the Video schema
    }
    if (userId) {
        filter.userId = userId;
    }

    try {
        // Fetch videos with pagination, filtering, and sorting
        const videos = await Video.find(filter)
            .sort({ [sortBy]: sortType === "desc" ? -1 : 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Total count for pagination
        const totalVideos = await Video.countDocuments(filter);

        if (videos.length > 0) {
            return res
                .status(200)
                .json(new ApiResponse(
                    200,
                    {
                        videos,
                        currentPage: page,
                        totalPages: Math.ceil(totalVideos / limit),
                        totalVideos
                    },
                    "Videos retrieved.",
                ));
        } else {
            throw new ApiError(404, "No videos found.");
        }
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json(new ApiError(error.statusCode || 500, error.message || "Failed to retrieve videos."));
    }
});


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