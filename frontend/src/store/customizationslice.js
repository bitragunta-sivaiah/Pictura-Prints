import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient'; // Adjust the path if needed
import { toast } from 'react-hot-toast';

const initialState = {
    customization: null,
    loading: false,
    error: null,
};

// Async thunk to fetch a user's customization for a specific product
export const fetchCustomization = createAsyncThunk(
    'customization/fetchCustomization',
    async ({ productId, userId }, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/products/${productId}/users/${userId}/customization`);
            return response.data;
        } catch (error) {
            toast.error('Failed to load customization.');
            return rejectWithValue(error.response?.data?.message || 'Failed to load customization.');
        }
    }
);

// Async thunk to save or update a user's customization for a specific product
export const saveCustomization = createAsyncThunk(
    'customization/saveCustomization',
    async ({ productId, customizationData }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/api/products/${productId}/customization`, customizationData);
            toast.success('Customization saved successfully!');
            return response.data;
        } catch (error) {
            toast.error('Failed to save customization.');
            return rejectWithValue(error.response?.data?.message || 'Failed to save customization.');
        }
    }
);

// Async thunk to delete a user's customization for a specific product
export const deleteCustomization = createAsyncThunk(
    'customization/deleteCustomization',
    async ({ productId, userId }, { rejectWithValue }) => {
        try {
            await API.delete(`/api/products/${productId}/customization`);
            toast.success('Customization deleted successfully!');
            return null; // Or some success indicator
        } catch (error) {
            toast.error('Failed to delete customization.');
            return rejectWithValue(error.response?.data?.message || 'Failed to delete customization.');
        }
    }
);

const customizationSlice = createSlice({
    name: 'customization',
    initialState,
    reducers: {
        clearCustomization: (state) => {
            state.customization = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        // Fetch Customization Cases
        builder.addCase(fetchCustomization.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(fetchCustomization.fulfilled, (state, action) => {
            state.loading = false;
            state.customization = action.payload;
        });
        builder.addCase(fetchCustomization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.customization = null;
        });

        // Save Customization Cases
        builder.addCase(saveCustomization.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(saveCustomization.fulfilled, (state, action) => {
            state.loading = false;
            state.customization = action.payload;
        });
        builder.addCase(saveCustomization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // Delete Customization Cases
        builder.addCase(deleteCustomization.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(deleteCustomization.fulfilled, (state) => {
            state.loading = false;
            state.customization = null;
        });
        builder.addCase(deleteCustomization.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
    },
});

export const { clearCustomization } = customizationSlice.actions;

// Selectors
export const selectCustomization = (state) => state.customization.customization;
export const selectCustomizationLoading = (state) => state.customization.loading;
export const selectCustomizationError = (state) => state.customization.error;

export default customizationSlice.reducer;