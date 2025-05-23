import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';
import toast from 'react-hot-toast';

// Async thunk to fetch all banners
export const fetchBanners = createAsyncThunk(
  'banners/fetchBanners',
  async () => {
    try {
      const response = await API.get('/api/banners');
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch banners.');
      throw error;
    }
  }
);

// Async thunk to fetch a single banner by ID
export const fetchBannerById = createAsyncThunk(
  'banners/fetchBannerById',
  async (id) => {
    try {
      const response = await API.get(`/api/banners/${id}`);
      return response.data;
    } catch (error) {
      toast.error('Failed to fetch banner details.');
      throw error;
    }
  }
);

// Async thunk to fetch a single banner by bannerNumber
export const fetchBannerByNumber = createAsyncThunk(
  'banners/fetchBannerByNumber',
  async (bannerNumber) => {
    try {
      const response = await API.get(`/api/banners/byNumber/${bannerNumber}`);
      return response.data;
    } catch (error) {
      toast.error(`Failed to fetch banner with number ${bannerNumber}.`);
      throw error;
    }
  }
);

// Async thunk to create a new banner
export const createBanner = createAsyncThunk(
  'banners/createBanner',
  async (bannerData) => {
    try {
      const response = await API.post('/api/banners', bannerData);
      toast.success('Banner created successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to create banner.');
      throw error;
    }
  }
);

// Async thunk to update a banner by bannerNumber
export const updateBannerByNumber = createAsyncThunk(
  'banners/updateBannerByNumber',
  async ({ bannerNumber, bannerData }) => {
    try {
      const response = await API.patch(`/api/banners/byNumber/${bannerNumber}`, bannerData);
      toast.success('Banner updated successfully!');
      return response.data;
    } catch (error) {
      toast.error('Failed to update banner.');
      throw error;
    }
  }
);

// Async thunk to delete a banner by bannerNumber
export const deleteBannerByNumber = createAsyncThunk(
  'banners/deleteBannerByNumber',
  async (bannerNumber) => {
    try {
      await API.delete(`/api/banners/byNumber/${bannerNumber}`);
      toast.success('Banner deleted successfully!');
      return bannerNumber; // Return the deleted bannerNumber for updating state
    } catch (error) {
      toast.error('Failed to delete banner.');
      throw error;
    }
  }
);

// Async thunk to delete a banner by ID
export const deleteBannerById = createAsyncThunk(
  'banners/deleteBannerById',
  async (id) => {
    try {
      await API.delete(`/api/banners/${id}`);
      toast.success('Banner deleted successfully!');
      return id; // Return the deleted banner ID for updating state
    } catch (error) {
      toast.error('Failed to delete banner.');
      throw error;
    }
  }
);

// Async thunk to upload an image
export const uploadImage = createAsyncThunk(
  'banners/uploadImage',
  async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await API.post('/api/image/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data.secure_url; // Return the secure_url
  }
);

const bannerSlice = createSlice({
  name: 'banners',
  initialState: {
    banners: [],
    banner: null,
    loading: false,
    error: null,
    uploadingImage: false,
    uploadImageError: null,
    uploadedImageUrl: null,
  },
  reducers: {
    clearBannerDetails: (state) => {
      state.banner = null;
    },
    clearUploadState: (state) => {
      state.uploadingImage = false;
      state.uploadImageError = null;
      state.uploadedImageUrl = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Banners
    builder.addCase(fetchBanners.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchBanners.fulfilled, (state, action) => {
      state.loading = false;
      state.banners = action.payload;
    });
    builder.addCase(fetchBanners.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Fetch Banner by ID
    builder.addCase(fetchBannerById.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.banner = null;
    });
    builder.addCase(fetchBannerById.fulfilled, (state, action) => {
      state.loading = false;
      state.banner = action.payload;
    });
    builder.addCase(fetchBannerById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.banner = null;
    });

    // Fetch Banner by Number
    builder.addCase(fetchBannerByNumber.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.banner = null;
    });
    builder.addCase(fetchBannerByNumber.fulfilled, (state, action) => {
      state.loading = false;
      state.banner = action.payload;
    });
    builder.addCase(fetchBannerByNumber.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
      state.banner = null;
    });

    // Create Banner
    builder.addCase(createBanner.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createBanner.fulfilled, (state, action) => {
      state.loading = false;
      state.banners.push(action.payload); // Add the new banner to the list
    });
    builder.addCase(createBanner.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Update Banner by Number
    builder.addCase(updateBannerByNumber.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateBannerByNumber.fulfilled, (state, action) => {
      state.loading = false;
      state.banners = state.banners.map((banner) =>
        banner.bannerNumber === action.payload.bannerNumber ? action.payload : banner
      );
      if (state.banner && state.banner.bannerNumber === action.payload.bannerNumber) {
        state.banner = action.payload;
      }
    });
    builder.addCase(updateBannerByNumber.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Delete Banner by Number
    builder.addCase(deleteBannerByNumber.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteBannerByNumber.fulfilled, (state, action) => {
      state.loading = false;
      state.banners = state.banners.filter((banner) => banner.bannerNumber !== action.payload);
      state.banner = null; // Clear the detailed banner if it was the one deleted
    });
    builder.addCase(deleteBannerByNumber.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Delete Banner by ID
    builder.addCase(deleteBannerById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteBannerById.fulfilled, (state, action) => {
      state.loading = false;
      state.banners = state.banners.filter((banner) => banner._id !== action.payload);
      state.banner = null; // Clear the detailed banner if it was the one deleted
    });
    builder.addCase(deleteBannerById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });

    // Upload Image
    builder.addCase(uploadImage.pending, (state) => {
      state.uploadingImage = true;
      state.uploadImageError = null;
      state.uploadedImageUrl = null;
    });
    builder.addCase(uploadImage.fulfilled, (state, action) => {
      state.uploadingImage = false;
      state.uploadedImageUrl = action.payload;
    });
    builder.addCase(uploadImage.rejected, (state, action) => {
      state.uploadingImage = false;
      state.uploadImageError = action.error.message;
      state.uploadedImageUrl = null;
    });
  },
});

export const { clearBannerDetails, clearUploadState } = bannerSlice.actions;

// Selectors
export const selectAllBanners = (state) => state.banners.banners;
export const selectBannerById = (state) => state.banners.banner;
export const selectBannersLoading = (state) => state.banners.loading;
export const selectBannersError = (state) => state.banners.error;
export const selectIsUploadingImage = (state) => state.banners.uploadingImage;
export const selectUploadImageError = (state) => state.banners.uploadImageError;
export const selectUploadedImageUrl = (state) => state.banners.uploadedImageUrl;

export default bannerSlice.reducer;