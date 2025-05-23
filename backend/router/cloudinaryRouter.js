import { Router } from 'express';
import multer from 'multer';
import cloudnaryApi from '../utils/cloudnaryApi.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadRouter = Router();

uploadRouter.post('/upload', upload.single('image'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({
                message: 'Please upload an image file.',
                error: true,
                success: false
            });
        }

        const uploadImage = await cloudnaryApi(file);

        return res.json({
            message: 'Upload done',
            data: uploadImage,
            success: true,
            error: false
        });
    } catch (error) {
        console.error('Error during image upload:', error); // Log the error on the server
        return res.status(500).json({
            message: error.message || 'An unexpected error occurred during upload.',
            error: true,
            success: false
        });
    }
});

export default uploadRouter;