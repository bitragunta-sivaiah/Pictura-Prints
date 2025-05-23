import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import API from '../api/apiClient'; // Assuming apiClient.js handles your axios instance and base URL
import { toast } from 'react-hot-toast';

// Async Thunks for API interactions

// Fetches public feedback for a specific product
export const getProductFeedback = createAsyncThunk(
    'feedback/getProductFeedback',
    async (productId, { rejectWithValue }) => {
        try {
            // This API call now returns comprehensive feedback documents that *contain* feedback for the product
            const { data } = await API.get(`/api/feedback/product/${productId}`);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Submits new comprehensive feedback
export const submitFeedback = createAsyncThunk(
    'feedback/submitFeedback',
    async (feedbackData, { rejectWithValue }) => {
        try {
            const { data } = await API.post('/api/feedback', feedbackData);
            toast.success('Feedback submitted successfully!');
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Fetches feedback submitted by the authenticated user
export const getMyFeedback = createAsyncThunk(
    'feedback/getMyFeedback',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/api/feedback/my-feedback');
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Fetches a single comprehensive feedback entry by ID
export const getFeedbackDetails = createAsyncThunk(
    'feedback/getFeedbackDetails',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.get(`/api/feedback/${id}`);
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Updates an existing comprehensive feedback entry
export const updateFeedback = createAsyncThunk(
    'feedback/updateFeedback',
    async ({ id, feedbackData }, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/api/feedback/${id}`, feedbackData);
            toast.success('Feedback updated successfully!');
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Admin: Fetches all feedback entries
export const getAllFeedback = createAsyncThunk(
    'feedback/getAllFeedback',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await API.get('/api/feedback/admin/all');
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Admin: Toggles public visibility of feedback
export const toggleFeedbackVisibility = createAsyncThunk(
    'feedback/toggleFeedbackVisibility',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/api/feedback/admin/${id}/visibility`);
            toast.success(data.message);
            return data.feedback; // Return the updated feedback object
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Admin: Marks feedback as resolved and adds notes
export const resolveFeedback = createAsyncThunk(
    'feedback/resolveFeedback',
    async ({ id, adminNotes, isResolved }, { rejectWithValue }) => {
        try {
            const { data } = await API.put(`/api/feedback/admin/${id}/resolve`, { adminNotes, isResolved });
            toast.success('Feedback resolution status updated.');
            return data;
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);

// Admin: Deletes a feedback entry
export const deleteFeedback = createAsyncThunk(
    'feedback/deleteFeedback',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await API.delete(`/api/feedback/admin/${id}`);
            toast.success(data.message);
            return id; // Return the ID of the deleted feedback
        } catch (error) {
            const message = error.response?.data?.message || error.message;
            toast.error(message);
            return rejectWithValue(message);
        }
    }
);


const feedbackSlice = createSlice({
    name: 'feedback',
    initialState: {
        allFeedback: [], // For admin to see all feedback documents
        myFeedback: [], // For a user to see their submitted comprehensive feedback documents
        productFeedback: [], // For product pages, these will be comprehensive feedback documents containing the product's feedback
        feedbackDetails: null, // Single comprehensive feedback document details
        loading: false,
        error: null,
    },
    reducers: {
        clearProductFeedback: (state) => {
            state.productFeedback = [];
        },
        clearMyFeedback: (state) => {
            state.myFeedback = [];
        },
        clearFeedbackDetails: (state) => {
            state.feedbackDetails = null;
        },
        clearAllFeedback: (state) => {
            state.allFeedback = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProductFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getProductFeedback.fulfilled, (state, action) => {
                state.loading = false;
                // getProductFeedback now returns comprehensive feedback documents that contain the product.
                // The frontend will need to filter these to display product-specific parts.
                state.productFeedback = action.payload;
            })
            .addCase(getProductFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(submitFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(submitFeedback.fulfilled, (state, action) => {
                state.loading = false;
                // Add the newly submitted comprehensive feedback to myFeedback
                state.myFeedback.unshift(action.payload);
                // Also add it to allFeedback if it's an admin view
                state.allFeedback.unshift(action.payload);

                // If the submitted feedback is public and contains product feedback,
                // you might want to add it to productFeedback if it's currently loaded
                // This logic might be better handled by re-fetching productFeedback or more granular updates
                // For simplicity, we won't try to auto-add to productFeedback here, as it needs filtering
                // on the client side based on the nested structure.
            })
            .addCase(submitFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getMyFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getMyFeedback.fulfilled, (state, action) => {
                state.loading = false;
                state.myFeedback = action.payload;
            })
            .addCase(getMyFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getFeedbackDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getFeedbackDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.feedbackDetails = action.payload;
            })
            .addCase(getFeedbackDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFeedback.fulfilled, (state, action) => {
                state.loading = false;
                state.feedbackDetails = action.payload;
                // Update in myFeedback array
                state.myFeedback = state.myFeedback.map(feedback =>
                    feedback._id === action.payload._id ? action.payload : feedback
                );
                // Update in allFeedback array (for admin view)
                state.allFeedback = state.allFeedback.map(feedback =>
                    feedback._id === action.payload._id ? action.payload : feedback
                );
                // Update in productFeedback array (if applicable)
                // This requires checking if the updated feedback belongs to any currently loaded productFeedback
                // For now, a full replacement is safer than complex deep merging in slice,
                // or consider re-fetching product feedback if it's critical to be up-to-date.
            })
            .addCase(updateFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getAllFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAllFeedback.fulfilled, (state, action) => {
                state.loading = false;
                state.allFeedback = action.payload;
            })
            .addCase(getAllFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(toggleFeedbackVisibility.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(toggleFeedbackVisibility.fulfilled, (state, action) => {
                state.loading = false;
                // Update the specific feedback document in allFeedback and myFeedback arrays
                state.allFeedback = state.allFeedback.map(feedback =>
                    feedback._id === action.payload._id ? action.payload : feedback
                );
                state.myFeedback = state.myFeedback.map(feedback =>
                    feedback._id === action.payload._id ? action.payload : feedback
                );
                // If it affects product feedback, update there too
                state.productFeedback = state.productFeedback.map(feedback =>
                    feedback._id === action.payload._id ? action.payload : feedback
                );
            })
            .addCase(toggleFeedbackVisibility.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(resolveFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resolveFeedback.fulfilled, (state, action) => {
                state.loading = false;
                // Update the specific feedback document in allFeedback array
                state.allFeedback = state.allFeedback.map(feedback =>
                    feedback._id === action.payload._id ? action.payload : feedback
                );
            })
            .addCase(resolveFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteFeedback.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteFeedback.fulfilled, (state, action) => {
                state.loading = false;
                // Remove the deleted feedback from all relevant arrays by ID
                state.allFeedback = state.allFeedback.filter(feedback =>
                    feedback._id !== action.payload
                );
                state.myFeedback = state.myFeedback.filter(feedback =>
                    feedback._id !== action.payload
                );
                state.productFeedback = state.productFeedback.filter(feedback =>
                    feedback._id !== action.payload
                );
            })
            .addCase(deleteFeedback.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearProductFeedback, clearMyFeedback, clearFeedbackDetails, clearAllFeedback } = feedbackSlice.actions;

export default feedbackSlice.reducer;

 
// Selectors
export const selectAllFeedback = (state) => state.feedback.allFeedback;
export const selectMyFeedback = (state) => state.feedback.myFeedback;
export const selectProductFeedback = (state) => state.feedback.productFeedback;
export const selectFeedbackDetails = (state) => state.feedback.feedbackDetails;
export const selectFeedbackLoading = (state) => state.feedback.loading;
export const selectFeedbackError = (state) => state.feedback.error;

// Optional: Memoized selector for public product feedback (if your productFeedback array contains both public/private)
// This assumes your feedback objects have an `isPublic` property.
export const selectPublicProductFeedback = createSelector(
  [selectProductFeedback],
  (productFeedback) => productFeedback.filter(feedback => feedback.isPublic)
);

// Optional: Memoized selector for resolved feedback (if your feedback objects have an `isResolved` property)
export const selectResolvedFeedback = createSelector(
  [selectAllFeedback],
  (allFeedback) => allFeedback.filter(feedback => feedback.isResolved)
);

// Optional: Selector to get feedback by ID from the allFeedback array (useful for detailed views)
export const selectFeedbackById = (feedbackId) =>
  createSelector(
    [selectAllFeedback],
    (allFeedback) => allFeedback.find(feedback => feedback._id === feedbackId)
  );