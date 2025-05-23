import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient'; // Ensure this path is correct
import { toast } from 'react-hot-toast';

// Async Thunks

export const fetchDeliveryPartners = createAsyncThunk(
    'deliveryPartners/fetchDeliveryPartners',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/delivery-partners');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch delivery partners.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch delivery partners.');
        }
    }
);

export const fetchDeliveryPartnerById = createAsyncThunk(
    'deliveryPartners/fetchDeliveryPartnerById',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/delivery-partners/${id}`);
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch delivery partner details.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch delivery partner details.');
        }
    }
);

export const updateDeliveryPartner = createAsyncThunk(
    'deliveryPartners/updateDeliveryPartner',
    async ({ id, data }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/delivery-partners/${id}`, data);
            toast.success('Delivery partner updated successfully.');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to update delivery partner.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to update delivery partner.');
        }
    }
);

export const deleteDeliveryPartner = createAsyncThunk(
    'deliveryPartners/deleteDeliveryPartner',
    async (id, { rejectWithValue }) => {
        try {
            await API.delete(`/api/delivery-partners/${id}`);
            toast.success('Delivery partner deleted successfully.');
            return id; // Return the ID to update the state
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to delete delivery partner.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to delete delivery partner.');
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'deliveryPartners/updateOrderStatus',
    async ({ orderId, status, location }, { rejectWithValue }) => { // Receive location
        try {
            const response = await API.post(`/api/delivery-partners/orders/${orderId}/update-status`, { status, location }); // Send location
            toast.success('Order status updated successfully.');
            return { orderId, status, location }; // Include location in the returned data
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to update order status.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to update order status.');
        }
    }
);

export const applyDeliveryPartner = createAsyncThunk(
    'deliveryPartners/applyDeliveryPartner',
    async (applicationData, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/delivery-partners/apply-delivery-partner', applicationData);
            toast.success('Application submitted successfully.');
            return response.data.user;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to submit application.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to submit application.');
        }
    }
);

export const fetchBranchDeliveryPartnerApplications = createAsyncThunk(
    'deliveryPartners/fetchBranchDeliveryPartnerApplications',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/delivery-partners/branch/delivery-partner-applications');
            return response.data.data; // <--- Corrected: Return only the 'data' array
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch applications.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch applications.');
        }
    }
);

export const approveDeliveryPartnerApplication = createAsyncThunk(
    'deliveryPartners/approveDeliveryPartnerApplication',
    async (userId, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/delivery-partners/branch/delivery-partner-applications/${userId}/approve`);
            toast.success('Application approved successfully.');
            return response.data.user;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to approve application.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to approve application.');
        }
    }
);

export const rejectDeliveryPartnerApplication = createAsyncThunk(
    'deliveryPartners/rejectDeliveryPartnerApplication',
    async ({ userId, rejectionReason }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/delivery-partners/branch/delivery-partner-applications/${userId}/reject`, { rejectionReason });
            toast.success('Application rejected successfully.');
            return response.data.user;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to reject application.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to reject application.');
        }
    }
);

export const fetchMyDeliveryProfile = createAsyncThunk(
    'deliveryPartners/fetchMyDeliveryProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/delivery-partners/me/profile');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch profile.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch profile.');
        }
    }
);

export const updateMyAvailability = createAsyncThunk(
    'deliveryPartners/updateMyAvailability',
    async (availabilityData, { rejectWithValue }) => {
        try {
            const response = await API.put('/api/delivery-partners/me/availability', availabilityData);
            toast.success('Availability updated successfully.');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to update availability.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to update availability.');
        }
    }
);

export const updateMyLocation = createAsyncThunk(
    'deliveryPartners/updateMyLocation',
    async (locationData, { rejectWithValue }) => {
        try {
            const response = await API.put('/api/delivery-partners/me/location', locationData);
            toast.success('Location updated successfully.');
            return response.data.location;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to update location.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to update location.');
        }
    }
);

export const fetchNearbyDeliveryPartners = createAsyncThunk(
    'deliveryPartners/fetchNearbyDeliveryPartners',
    async ({ longitude, latitude, maxDistance }, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/delivery-partners/nearby?longitude=${longitude}&latitude=${latitude}&maxDistance=${maxDistance}`);
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch nearby delivery partners.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch nearby delivery partners.');
        }
    }
);

export const acceptOrderAssignment = createAsyncThunk(
    'deliveryPartners/acceptOrderAssignment',
    async ({ orderId, location }, { rejectWithValue }) => { // Receive location
        try {
            const response = await API.post(`/api/delivery-partners/orders/${orderId}/accept-assignment`, { location }); // Send location
            toast.success('Order assignment accepted.');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to accept order assignment.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to accept order assignment.');
        }
    }
);


export const rejectOrderAssignment = createAsyncThunk(
    'deliveryPartners/rejectOrderAssignment',
    async ({ orderId, reason }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/api/delivery-partners/orders/${orderId}/reject-assignment`, { reason });
            toast.success('Order assignment rejected.');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to reject order assignment.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to reject order assignment.');
        }
    }
);

export const fetchMyActiveOrdersToday = createAsyncThunk(
    'deliveryPartners/fetchMyActiveOrdersToday',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/delivery-partners/me/orders/active/today');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch today\'s active orders.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch today\'s active orders.');
        }
    }
);

export const fetchMyTotalAssignedOrders = createAsyncThunk(
    'deliveryPartners/fetchMyTotalAssignedOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/delivery-partners/me/orders/assigned/total');
            return response.data.totalAssignedOrders;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch total assigned orders.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch total assigned orders.');
        }
    }
);

export const fetchMyRevenue = createAsyncThunk(
    'deliveryPartners/fetchMyRevenue',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/delivery-partners/me/revenue');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch revenue statistics.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch revenue statistics.');
        }
    }
);

// NEW: Async Thunk for fetching all delivered orders for a delivery partner
export const fetchMyDeliveredOrders = createAsyncThunk(
    'deliveryPartners/fetchMyDeliveredOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/delivery-partners/me/orders/delivered');
            toast.success('Delivered orders fetched successfully.');
            return response.data; // Assuming your backend returns { success: true, data: [...] }
        } catch (error) {
            toast.error(error?.response?.data?.error || 'Failed to fetch delivered orders.');
            return rejectWithValue(error?.response?.data?.error || 'Failed to fetch delivered orders.');
        }
    }
);


// Slice
const deliveryPartnerSlice = createSlice({
    name: 'deliveryPartners',
    initialState: {
        deliveryPartners: [],
        deliveryPartner: null,
        pendingApplications: [],
        myProfile: null,
        nearbyPartners: [],
        activeOrdersToday: [],     // Changed to array, will store order objects
        totalAssignedOrders: 0,
        revenue: null,
        deliveredOrders: [], // NEW: State to hold delivered orders
        loading: false,
        error: null,
    },
    reducers: {
        clearDeliveryPartnerDetails: (state) => {
            state.deliveryPartner = null;
        },
        clearError: (state) => {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchDeliveryPartners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeliveryPartners.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryPartners = action.payload;
            })
            .addCase(fetchDeliveryPartners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchDeliveryPartnerById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchDeliveryPartnerById.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryPartner = action.payload;
            })
            .addCase(fetchDeliveryPartnerById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateDeliveryPartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDeliveryPartner.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryPartners = state.deliveryPartners.map(dp =>
                    dp._id === action.payload._id ? action.payload : dp
                );
                state.deliveryPartner = action.payload;
            })
            .addCase(updateDeliveryPartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteDeliveryPartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDeliveryPartner.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveryPartners = state.deliveryPartners.filter(dp => dp._id !== action.payload);
            })
            .addCase(deleteDeliveryPartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                // Update order status in relevant lists
                // If there was an orderHistory, its updates would be removed here.
                if (state.activeOrdersToday) {
                    state.activeOrdersToday = state.activeOrdersToday.map(order =>
                        order._id === action.payload.orderId ? { ...order, status: action.payload.status } : order
                    );
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(applyDeliveryPartner.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(applyDeliveryPartner.fulfilled, (state, action) => {
                state.loading = false;
                state.myProfile = action.payload; // Update profile.
            })
            .addCase(applyDeliveryPartner.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchBranchDeliveryPartnerApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchBranchDeliveryPartnerApplications.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingApplications = action.payload; // <--- Now correctly receiving the array
            })
            .addCase(fetchBranchDeliveryPartnerApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(approveDeliveryPartnerApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(approveDeliveryPartnerApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingApplications = state.pendingApplications.filter(app => app._id !== action.payload._id);
                state.deliveryPartners = [...state.deliveryPartners, action.payload];
            })
            .addCase(approveDeliveryPartnerApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(rejectDeliveryPartnerApplication.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectDeliveryPartnerApplication.fulfilled, (state, action) => {
                state.loading = false;
                state.pendingApplications = state.pendingApplications.filter(app => app._id !== action.payload._id);
            })
            .addCase(rejectDeliveryPartnerApplication.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyDeliveryProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyDeliveryProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.myProfile = action.payload;
            })
            .addCase(fetchMyDeliveryProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateMyAvailability.fulfilled, (state, action) => {
                if (state.myProfile && state.myProfile.deliveryPartnerDetails) { // check nested
                    state.myProfile.deliveryPartnerDetails.availability = action.payload.availability;
                    state.myProfile.deliveryPartnerDetails.workingHours = action.payload.workingHours;
                }
            })
            .addCase(updateMyAvailability.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(updateMyLocation.fulfilled, (state, action) => {
                if (state.myProfile && state.myProfile.deliveryPartnerDetails) { //check nested
                    state.myProfile.deliveryPartnerDetails.location = action.payload;
                }
            })
            .addCase(updateMyLocation.rejected, (state, action) => {
                state.error = action.payload;
            })
            .addCase(fetchNearbyDeliveryPartners.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchNearbyDeliveryPartners.fulfilled, (state, action) => {
                state.loading = false;
                state.nearbyPartners = action.payload;
            })
            .addCase(fetchNearbyDeliveryPartners.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(acceptOrderAssignment.fulfilled, (state, action) => {
                state.loading = false;
                // Update order in activeOrdersToday (orderHistory is no longer managed here)
                if (state.activeOrdersToday) {
                    // If the accepted order was already in activeOrdersToday, update it.
                    // Otherwise, add it.
                    const existingIndex = state.activeOrdersToday.findIndex(order => order._id === action.payload.data._id);
                    if (existingIndex !== -1) {
                        state.activeOrdersToday[existingIndex] = action.payload.data;
                    } else {
                        state.activeOrdersToday.push(action.payload.data);
                    }
                }
            })
            .addCase(acceptOrderAssignment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(rejectOrderAssignment.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(rejectOrderAssignment.fulfilled, (state, action) => {
                state.loading = false;
                if (state.activeOrdersToday) {
                    state.activeOrdersToday = state.activeOrdersToday.map(order =>
                        order._id === action.payload.data._id ? action.payload.data : order
                    ).filter(order => order.deliveryAssignment?.status !== 'rejected'); // Remove if status becomes 'rejected'
                }
            })
            .addCase(rejectOrderAssignment.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyActiveOrdersToday.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyActiveOrdersToday.fulfilled, (state, action) => {
                state.loading = false;
                state.activeOrdersToday = action.payload.data; // Assuming data is in .data property
            })
            .addCase(fetchMyActiveOrdersToday.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyTotalAssignedOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyTotalAssignedOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.totalAssignedOrders = action.payload;
            })
            .addCase(fetchMyTotalAssignedOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchMyRevenue.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyRevenue.fulfilled, (state, action) => {
                state.loading = false;
                state.revenue = action.payload.data; // Assuming revenue data is in .data property
            })
            .addCase(fetchMyRevenue.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // NEW: Cases for fetchMyDeliveredOrders
            .addCase(fetchMyDeliveredOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchMyDeliveredOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.deliveredOrders = action.payload.data; // Store the array of delivered orders
            })
            .addCase(fetchMyDeliveredOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

// Actions
export const { clearDeliveryPartnerDetails, clearError } = deliveryPartnerSlice.actions;

// Selectors
export const selectDeliveryPartners = (state) => state.deliveryPartners.deliveryPartners;
export const selectDeliveryPartnerDetails = (state) => state.deliveryPartners.deliveryPartner;
export const selectPendingDeliveryPartnerApplications = (state) => state.deliveryPartners.pendingApplications;
export const selectMyDeliveryProfile = (state) => state.deliveryPartners.myProfile;
export const selectNearbyDeliveryPartners = (state) => state.deliveryPartners.nearbyPartners;
export const selectMyActiveOrdersToday = (state) => state.deliveryPartners.activeOrdersToday;
export const selectTotalAssignedOrders = (state) => state.deliveryPartners.totalAssignedOrders;
export const selectDeliveryPartnerRevenue = (state) => state.deliveryPartners.revenue;
export const selectDeliveryPartnerLoading = (state) => state.deliveryPartners.loading;
export const selectDeliveryPartnerError = (state) => state.deliveryPartners.error;
export const selectMyDeliveredOrders = (state) => state.deliveryPartners.deliveredOrders; // NEW: Selector for delivered orders


export default deliveryPartnerSlice.reducer;