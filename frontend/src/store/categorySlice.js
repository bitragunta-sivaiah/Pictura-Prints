import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';
import { toast } from 'react-hot-toast';

// Async thunk for uploading an image
export const uploadImage = createAsyncThunk(
    'categories/uploadImage',
    async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await API.post('/api/image/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data.data.secure_url; // Return the secure_url
        } catch (error) {
            toast.error('Failed to upload image.');
            throw error; // Re-throw the error for the reducer to handle
        }
    }
);

// Async thunk for fetching all categories
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async () => {
        try {
            const response = await API.get('/api/categories');
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch categories.');
            throw error;
        }
    }
);

// Async thunk for fetching a single category by ID
export const fetchCategoryById = createAsyncThunk(
    'categories/fetchCategoryById',
    async (id) => {
        try {
            const response = await API.get(`/api/categories/${id}`);
            return response.data;
        } catch (error) {
            toast.error('Failed to fetch category.');
            throw error;
        }
    }
);

// Async thunk for creating a new category
export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (categoryData) => {
        try {
            const response = await API.post('/api/categories', categoryData);
            toast.success('Category created successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to create category.');
            throw error;
        }
    }
);

// Async thunk for updating an existing category by ID
export const updateCategory = createAsyncThunk(
    'categories/updateCategory',
    async ({ id, categoryData }) => {
        try {
            const response = await API.put(`/api/categories/${id}`, categoryData);
            toast.success('Category updated successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update category.');
            throw error;
        }
    }
);

// Async thunk for deleting a category by ID
export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (id) => {
        try {
            await API.delete(`/api/categories/${id}`);
            toast.success('Category deleted successfully!');
            return id; // Return the ID of the deleted category for updating the state
        } catch (error) {
            toast.error('Failed to delete category.');
            throw error;
        }
    }
);

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        items: [],
        item: null,
        loading: false,
        error: null,
        uploadingImage: false,
        uploadImageError: null,
        uploadedImageUrl: null,
    },
    reducers: {
        clearCategoryDetails: (state) => {
            state.item = null;
        },
        clearUploadedImageUrl: (state) => {
            state.uploadedImageUrl = null;
            state.uploadImageError = null;
        }
    },
    extraReducers: (builder) => {
        // Upload Image Cases
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

        // Fetch Categories Cases
        builder.addCase(fetchCategories.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCategories.fulfilled, (state, action) => {
            state.loading = false;
            state.items = action.payload;
        });
        builder.addCase(fetchCategories.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
            state.items = [];
        });

        // Fetch Category By ID Cases
        builder.addCase(fetchCategoryById.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.item = null;
        });
        builder.addCase(fetchCategoryById.fulfilled, (state, action) => {
            state.loading = false;
            state.item = action.payload;
        });
        builder.addCase(fetchCategoryById.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
            state.item = null;
        });

        // Create Category Cases
        builder.addCase(createCategory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(createCategory.fulfilled, (state, action) => {
            state.loading = false;
            state.items.push(action.payload);
        });
        builder.addCase(createCategory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        // Update Category Cases
        builder.addCase(updateCategory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(updateCategory.fulfilled, (state, action) => {
            state.loading = false;
            state.items = state.items.map(category =>
                category._id === action.payload._id ? action.payload : category
            );
            state.item = action.payload; // Update the single category item if it's being viewed
        });
        builder.addCase(updateCategory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });

        // Delete Category Cases
        builder.addCase(deleteCategory.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteCategory.fulfilled, (state, action) => {
            state.loading = false;
            state.items = state.items.filter(category => category._id !== action.payload);
            state.item = null; // Clear the single category item if it was the one deleted
        });
        builder.addCase(deleteCategory.rejected, (state, action) => {
            state.loading = false;
            state.error = action.error.message;
        });
    },
});

// Export actions
export const { clearCategoryDetails, clearUploadedImageUrl } = categorySlice.actions;

// Selectors
export const selectAllCategories = (state) => state.category.items;
export const selectCategoryById = (state) => state.category.item;
export const selectCategoriesLoading = (state) => state.category.loading;
export const selectCategoriesError = (state) => state.category.error;
export const selectIsUploadingImage = (state) => state.category.uploadingImage;
export const selectUploadedImageUrl = (state) => state.category.uploadedImageUrl;
export const selectUploadImageError = (state) => state.category.uploadImageError;

// Export the reducer
export default categorySlice.reducer;