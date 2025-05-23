import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';  
import { toast } from 'react-hot-toast';

// Async Thunk for uploading an image with progress tracking
export const uploadImageToCloudinary = createAsyncThunk(
  'cloudinary/uploadImage',
  async (file, { rejectWithValue, dispatch }) => {
    try {
      if (!file) {
        return rejectWithValue({ message: 'No file provided', error: true, success: false });
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await API.post('/api/image/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          dispatch(uploadProgressUpdated(progress)); // Dispatch progress update action
        },
      });

      // Check for a successful response structure
      if (response.data && response.data.success && response.data.data?.url) {
        toast.success(response.data.message || 'Image uploaded successfully!');
        return response.data.data.url; // Return only the URL
      } else {
        toast.error(response.data.message || 'Failed to upload image.');
        return rejectWithValue({
          message: response.data.message || 'Upload failed',
          error: true,
          success: false,
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'An unexpected error occurred during upload.');
      return rejectWithValue({
        message: error.response?.data?.message || 'Upload failed',
        error: true,
        success: false,
      });
    }
  }
);

const cloudinarySlice = createSlice({
  name: 'cloudinary',
  initialState: {
    imageUrl: null,
    loading: false,
    error: null,
    uploadProgress: 0, // Add uploadProgress state
  },
  reducers: {
    clearImageUrl: (state) => {
      state.imageUrl = null;
      state.error = null; //also clear error
      state.uploadProgress = 0; // Reset progress on clear
    },
    uploadProgressUpdated: (state, action) => {
      state.uploadProgress = action.payload; // Update upload progress
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadImageToCloudinary.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.imageUrl = null; // Clear previous URL
        state.uploadProgress = 0; // Reset progress on pending
      })
      .addCase(uploadImageToCloudinary.fulfilled, (state, action) => {
        state.loading = false;
        state.imageUrl = action.payload; // Store the URL directly
        state.error = null;
        state.uploadProgress = 100; // Set progress to 100 on success
      })
      .addCase(uploadImageToCloudinary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Upload failed'; // Get message from payload
        state.imageUrl = null;
        state.uploadProgress = 0; // Reset progress on failure
      });
  },
});

export const { clearImageUrl, uploadProgressUpdated } = cloudinarySlice.actions;

// Selectors
export const selectImageUrl = (state) => state.cloudinary.imageUrl;
export const selectLoading = (state) => state.cloudinary.loading;
export const selectError = (state) => state.cloudinary.error;
export const selectUploadProgress = (state) => state.cloudinary.uploadProgress; // Selector for upload progress

export default cloudinarySlice.reducer;