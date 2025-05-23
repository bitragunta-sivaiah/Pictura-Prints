import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Load Cloudinary configuration from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const cloudinaryApi = async (image) => {
    if (!image) {
        throw new Error('No image provided for upload');
    }

    // Directly use the buffer from the Multer file object
    const buffer = image.buffer;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            { folder: 'DesiXpress' },
            (error, uploadResult) => {
                if (error) {
                    return reject(new Error('Cloudinary Upload Failed: ' + error.message));
                }
                resolve(uploadResult);
            }
        );

        uploadStream.end(buffer);
    });
};

export default cloudinaryApi;