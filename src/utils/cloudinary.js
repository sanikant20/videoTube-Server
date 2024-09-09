import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

// CLOUDINARY CONFIGURATION
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload on cloudinary
const uploadOnClouydinary = async (localFilePath) => {
    try {
        // if there is no local file path return null
        if (!localFilePath) return null

        // Upload files
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" })
        console.log("File successfully save on cloudinary: ", response.url)

        // unlink local file i.e., delete file locally when uploaded on cloudinary
        fs.unlinkSync(localFilePath)
        return response;

    } catch (error) {
        fs.unlinkSync(localFilePath) // remove locally saved files as uploader got failed
        return null
    }
}

export { uploadOnClouydinary }