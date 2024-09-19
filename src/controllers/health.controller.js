import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const healthCheck = asyncHandler(async (req, res) => {

    // todo : build a healthcheck response that simply returns the OK status as json with a message
    return res.status(200).json(new ApiResponse(200, "Server is running smoothly।"))

})

export { healthCheck }