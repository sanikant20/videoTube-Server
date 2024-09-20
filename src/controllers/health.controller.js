import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

// Controller to check server health
const healthCheck = asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, "Server is running smoothly।"))
})

export { healthCheck }