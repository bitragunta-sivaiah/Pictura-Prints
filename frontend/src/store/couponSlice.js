import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';
import { toast } from 'react-hot-toast';

// Async Thunks for Coupon Operations

// Fetch all coupons (admin)
export const fetchCoupons = createAsyncThunk(
  'coupons/fetchCoupons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/api/coupons/admin/coupons');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get a specific coupon by code (for checking)
export const checkCoupon = createAsyncThunk(
  'coupons/checkCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/coupons/check/${code}`);
      toast.success('Coupon applied successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Create a new coupon (admin)
export const createCoupon = createAsyncThunk(
  'coupons/createCoupon',
  async (couponData, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/coupons/admin/coupons', couponData);
      toast.success('Coupon created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update an existing coupon (admin)
export const updateCoupon = createAsyncThunk(
  'coupons/updateCoupon',
  async ({ id, couponData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/api/coupons/admin/coupons/${id}`, couponData);
      toast.success('Coupon updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete a coupon (admin)
export const deleteCoupon = createAsyncThunk(
  'coupons/deleteCoupon',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/api/coupons/admin/coupons/${id}`);
      toast.success('Coupon deleted successfully!');
      return id; // Return the ID of the deleted coupon
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Coupon Slice
const couponSlice = createSlice({
  name: 'coupons',
  initialState: {
    coupons: [],
    currentCoupon: null, // For storing the coupon after a successful check
    loading: false,
    error: null,
  },
  reducers: {
    // You can add synchronous reducers here if needed
    clearCurrentCoupon: (state) => {
      state.currentCoupon = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Coupons
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = action.payload;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Check Coupon
      .addCase(checkCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentCoupon = null; // Clear previous coupon on new check
      })
      .addCase(checkCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.currentCoupon = action.payload;
      })
      .addCase(checkCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentCoupon = null;
      })
      // Create Coupon
      .addCase(createCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons.push(action.payload); // Add the new coupon to the list
      })
      .addCase(createCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Coupon
      .addCase(updateCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCoupon.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.coupons.findIndex(coupon => coupon._id === action.payload._id);
        if (index !== -1) {
          state.coupons[index] = action.payload; // Update the coupon in the list
        }
      })
      .addCase(updateCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Coupon
      .addCase(deleteCoupon.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCoupon.fulfilled, (state, action) => {
        state.loading = false;
        state.coupons = state.coupons.filter(coupon => coupon._id !== action.payload); // Remove the deleted coupon
      })
      .addCase(deleteCoupon.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCurrentCoupon } = couponSlice.actions;

// ---
// Selectors

// Selector to get all coupons
export const selectAllCoupons = (state) => state.coupons.coupons;


// Selector to get the currently checked coupon
export const selectCurrentCoupon = (state) => state.coupons.currentCoupon;

// Selector to get the loading status
export const selectCouponLoading = (state) => state.coupons.loading;

// Selector to get any error messages
export const selectCouponError = (state) => state.coupons.error;

export default couponSlice.reducer;