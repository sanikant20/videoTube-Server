import { asyncHandler } from "../utils/asyncHandler.js"


const healthCheck = asyncHandler(async (req, res) => {
    // todo : build a healthcheck response that simply returns the OK status as json with a message
})

export { healthCheck }