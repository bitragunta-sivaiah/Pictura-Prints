import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient'; // Adjust the path if needed
import { toast } from 'react-hot-toast';

// Async Thunks

export const getBranchStationDetails = createAsyncThunk(
    'branch/getBranchStationDetails',
    async (id, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/branch-stations/${id}`);
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to fetch branch station details.';
            toast.error(message);
            return rejectWithValue({ message }); // Consistent error payload
        }
    }
);

export const applyForBranchManager = createAsyncThunk(
    'branch/applyForBranchManager',
    async ({ branchId, reason, documents }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/api/branch-stations/${branchId}/apply-manager`, { reason, documents });
            toast.success('Application submitted successfully!');
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to submit application.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const getManagedBranch = createAsyncThunk(
    'branch/getManagedBranch',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/branch-stations/managed');
            return response.data;
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to fetch managed branch.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const getOrdersForBranch = createAsyncThunk(
    'branch/getOrdersForBranch',
    async (branchId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/branch-stations/${branchId}/orders`);
            return response.data.data; // Assuming your router returns { success: true, data: orders, total: ... }
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to fetch orders for this branch.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const getActiveOrdersForBranch = createAsyncThunk(
    'branch/getActiveOrdersForBranch',
    async (branchId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/branch-stations/${branchId}/orders/active/today`); // Corrected endpoint
            return response.data.data; // Assuming your router returns { success: true, data: orders, total: ... }
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to fetch active orders for this branch.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const getDeliveryPartnersForBranch = createAsyncThunk(
    'branch/getDeliveryPartnersForBranch',
    async (branchId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/branch-stations/${branchId}/delivery-partners`);
            return response.data.data; // Assuming your router returns { success: true, data: deliveryPartners }
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to fetch delivery partners for this branch.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const assignDeliveryPartnerToOrder = createAsyncThunk(
    'branch/assignDeliveryPartnerToOrder',
    async ({ branchId, orderId, deliveryPartnerId, location }, { rejectWithValue }) => { // Include location
        try {
           const response = await API.post(`/api/branch-stations/${branchId}/orders/${orderId}/assign-delivery-partner`, { 
    deliveryPartnerId, 
    location 
});  
            // toast.success(response.data.message);
            return response.data.data; // Return the updated order data
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to assign delivery partner.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const addDeliveryPartnerToBranch = createAsyncThunk(
    'branch/addDeliveryPartnerToBranch',
    async ({ branchId, deliveryPartnerId }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/api/branch-stations/${branchId}/delivery-partners`, { deliveryPartnerId });
            toast.success('Delivery partner added to branch successfully!');
            return response.data.data; // Return the updated user data
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to add delivery partner to branch.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const removeDeliveryPartnerFromBranch = createAsyncThunk(
    'branch/removeDeliveryPartnerFromBranch',
    async ({ branchId, userId }, { rejectWithValue }) => {
        try {
            await API.delete(`/api/branch-stations/${branchId}/delivery-partners/${userId}`);
            toast.success('Delivery partner removed from branch successfully!');
            return userId;
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to remove delivery partner from branch.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const getBranchRevenue = createAsyncThunk(
    'branch/getBranchRevenue',
    async (branchId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/branch-stations/${branchId}/revenue`);
            return response.data.data; // Assuming your router returns { success: true, data: revenue }
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to fetch branch revenue.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const reassignOrderToDeliveryPartner = createAsyncThunk(
    'branch/reassignOrderToDeliveryPartner',
    async ({ branchId, orderId, newDeliveryPartnerId ,   location   }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/api/branch-stations/${branchId}/orders/${orderId}/reassign-delivery-partner`, { newDeliveryPartnerId,   location   });
            toast.success('Order reassigned successfully.');
            return response.data.data; // Return the updated order data
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to reassign order.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

export const rejectOrderAssignment = createAsyncThunk( // Added rejectOrderAssignment
    'branch/rejectOrderAssignment',
    async ({ orderId, reason }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/api/branch-stations/orders/${orderId}/reject-assignment`, { reason });
            toast.success('Order assignment rejected.');
            return response.data.data; // Return the updated order data
        } catch (error) {
            const message = error?.response?.data?.message || 'Failed to reject order assignment.';
            toast.error(message);
            return rejectWithValue({ message });
        }
    }
);

// Slice
const branchSlice = createSlice({
    name: 'branch',
    initialState: {
        branchStationDetails: null,
        managedBranch: null,
        orders: [],
        activeOrders: [],
        deliveryPartners: [],
        revenue: null,
        loading: false,
        error: null,
        applySuccess: false,
        assignDeliveryPartnerSuccess: null,
        addDeliveryPartnerSuccess: null,
        removeDeliveryPartnerSuccess: null,
        reassignDeliveryPartnerSuccess: null, // Added for reassign
        rejectOrderAssignmentSuccess: null, // Added for reject
    },
    reducers: {
        resetApplySuccess: (state) => {
            state.applySuccess = false;
        },
        resetAssignDeliveryPartnerSuccess: (state) => {
            state.assignDeliveryPartnerSuccess = null;
        },
        resetAddDeliveryPartnerSuccess: (state) => {
            state.addDeliveryPartnerSuccess = null;
        },
        resetRemoveDeliveryPartnerSuccess: (state) => {
            state.removeDeliveryPartnerSuccess = null;
        },
        resetReassignDeliveryPartnerSuccess: (state) => { // Added reset for reassign
            state.reassignDeliveryPartnerSuccess = null;
        },
        resetRejectOrderAssignmentSuccess: (state) => { // Added reset for reject
            state.rejectOrderAssignmentSuccess = null;
        },
        clearBranchDetails: (state) => {
            state.branchStationDetails = null;
            state.orders = [];
            state.activeOrders = [];
            state.deliveryPartners = [];
            state.revenue = null;
        },
        clearOrders: (state) => {
            state.orders = [];
        },
        clearActiveOrders: (state) => {
            state.activeOrders = [];
        },
        clearDeliveryPartners: (state) => {
            state.deliveryPartners = [];
        },
        clearRevenue: (state) => {
            state.revenue = null;
        },
        clearManagedBranch: (state) => {
            state.managedBranch = null;
            state.orders = [];
            state.activeOrders = [];
            state.deliveryPartners = [];
            state.revenue = null;
        },
    },
    extraReducers: (builder) => {
        // Get Branch Station Details
        builder.addCase(getBranchStationDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.branchStationDetails = null;
            state.orders = [];
            state.activeOrders = [];
            state.deliveryPartners = [];
            state.revenue = null;
        });
        builder.addCase(getBranchStationDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.branchStationDetails = action.payload.data;
            state.orders = action.payload.data?.orders || [];
            state.deliveryPartners = action.payload.data?.deliveryPartners || [];
        });
        builder.addCase(getBranchStationDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to fetch branch station details.';
            state.branchStationDetails = null;
            state.orders = [];
            state.activeOrders = [];
            state.deliveryPartners = [];
            state.revenue = null;
        });

        // Apply for Branch Manager
        builder.addCase(applyForBranchManager.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.applySuccess = false;
        });
        builder.addCase(applyForBranchManager.fulfilled, (state) => {
            state.loading = false;
            state.applySuccess = true;
        });
        builder.addCase(applyForBranchManager.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to submit application.';
            state.applySuccess = false;
        });

        // Get Managed Branch
        builder.addCase(getManagedBranch.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.managedBranch = null;
            state.orders = [];
            state.activeOrders = [];
            state.deliveryPartners = [];
            state.revenue = null;
        });
        builder.addCase(getManagedBranch.fulfilled, (state, action) => {
            state.loading = false;
            state.managedBranch = action.payload.data;
            state.orders = action.payload.data?.orders || [];
            state.deliveryPartners = action.payload.data?.deliveryPartners || [];
        });
        builder.addCase(getManagedBranch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to fetch managed branch.';
            state.managedBranch = null;
            state.orders = [];
            state.activeOrders = [];
            state.deliveryPartners = [];
            state.revenue = null;
        });

        // Get Orders For Branch
        builder.addCase(getOrdersForBranch.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.orders = [];
        });
        builder.addCase(getOrdersForBranch.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload;
        });
        builder.addCase(getOrdersForBranch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to fetch orders for this branch.';
            state.orders = [];
        });

        // Get Active Orders For Branch
        builder.addCase(getActiveOrdersForBranch.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.activeOrders = [];
        });
        builder.addCase(getActiveOrdersForBranch.fulfilled, (state, action) => {
            state.loading = false;
            state.activeOrders = action.payload;
        });
        builder.addCase(getActiveOrdersForBranch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to fetch active orders for this branch.';
            state.activeOrders = [];
        });

        // Get Delivery Partners For Branch
        builder.addCase(getDeliveryPartnersForBranch.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.deliveryPartners = [];
        });
        builder.addCase(getDeliveryPartnersForBranch.fulfilled, (state, action) => {
            state.loading = false;
            state.deliveryPartners = action.payload;
        });
        builder.addCase(getDeliveryPartnersForBranch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to fetch delivery partners for this branch.';
            state.deliveryPartners = [];
        });

        // Assign Delivery Partner to Order
        builder.addCase(assignDeliveryPartnerToOrder.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.assignDeliveryPartnerSuccess = null;
        });
        builder.addCase(assignDeliveryPartnerToOrder.fulfilled, (state, action) => {
            state.loading = false;
            state.assignDeliveryPartnerSuccess = true;
            const updatedOrder = action.payload;
            if (state.orders) {
                state.orders = state.orders.map(order =>
                    order._id === updatedOrder._id ? updatedOrder : order
                );
            }
            if (state.activeOrders) {
                state.activeOrders = state.activeOrders.map(order =>
                    order._id === updatedOrder._id ? updatedOrder : order
                );
            }
        });
        builder.addCase(assignDeliveryPartnerToOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to assign delivery partner.';
            state.assignDeliveryPartnerSuccess = false;
        });

        // Add Delivery Partner to Branch
        builder.addCase(addDeliveryPartnerToBranch.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.addDeliveryPartnerSuccess = null;
        });
        builder.addCase(addDeliveryPartnerToBranch.fulfilled, (state, action) => {
            state.loading = false;
            state.addDeliveryPartnerSuccess = true;
            const newDeliveryPartner = action.payload;
            state.deliveryPartners.push(newDeliveryPartner);
            if (state.branchStationDetails?.deliveryPartners) {
                state.branchStationDetails.deliveryPartners.push(newDeliveryPartner);
            }
            if (state.managedBranch?.deliveryPartners) {
                state.managedBranch.deliveryPartners.push(newDeliveryPartner);
            }
        });
        builder.addCase(addDeliveryPartnerToBranch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to add delivery partner to branch.';
            state.addDeliveryPartnerSuccess = null;
        });

        // Remove Delivery Partner from Branch
        builder.addCase(removeDeliveryPartnerFromBranch.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.removeDeliveryPartnerSuccess = null;
        });
        builder.addCase(removeDeliveryPartnerFromBranch.fulfilled, (state, action) => {
            state.loading = false;
            state.removeDeliveryPartnerSuccess = true;
            const userIdToRemove = action.payload;
            state.deliveryPartners = state.deliveryPartners.filter(dp => dp._id !== userIdToRemove);
            if (state.branchStationDetails?.deliveryPartners) {
                state.branchStationDetails.deliveryPartners = state.branchStationDetails.deliveryPartners.filter(id => id !== userIdToRemove);
            }
            if (state.managedBranch?.deliveryPartners) {
                state.managedBranch.deliveryPartners = state.managedBranch.deliveryPartners.filter(id => id !== userIdToRemove);
            }
        });
        builder.addCase(removeDeliveryPartnerFromBranch.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to remove delivery partner from branch.';
            state.removeDeliveryPartnerSuccess = null;
        });

        // Get Branch Revenue
        builder.addCase(getBranchRevenue.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.revenue = null;
        });
        builder.addCase(getBranchRevenue.fulfilled, (state, action) => {
            state.loading = false;
            state.revenue = action.payload;
        });
        builder.addCase(getBranchRevenue.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to fetch branch revenue.';
            state.revenue = null;
        });

        // Reassign Order
        builder.addCase(reassignOrderToDeliveryPartner.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.reassignDeliveryPartnerSuccess = null;
        });
        builder.addCase(reassignOrderToDeliveryPartner.fulfilled, (state, action) => {
            state.loading = false;
            state.reassignDeliveryPartnerSuccess = true;
            const updatedOrder = action.payload;
            if (state.orders) {
                state.orders = state.orders.map(order =>
                    order._id === updatedOrder._id ? updatedOrder : order
                );
            }
            if (state.activeOrders) {
                state.activeOrders = state.activeOrders.map(order =>
                    order._id === updatedOrder._id ? updatedOrder : order
                );
            }
        });
        builder.addCase(reassignOrderToDeliveryPartner.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to reassign order.';
            state.reassignDeliveryPartnerSuccess = false;
        });

        // Reject Order Assignment
        builder.addCase(rejectOrderAssignment.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.rejectOrderAssignmentSuccess = null;
        });
        builder.addCase(rejectOrderAssignment.fulfilled, (state, action) => {
            state.loading = false;
            state.rejectOrderAssignmentSuccess = true;
            const updatedOrder = action.payload;
            if (state.orders) {
                state.orders = state.orders.map(order =>
                    order._id === updatedOrder._id ? updatedOrder : order
                );
            }
            if (state.activeOrders) {
                state.activeOrders = state.activeOrders.filter(order => order._id !== updatedOrder._id);
            }
        });
        builder.addCase(rejectOrderAssignment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload?.message || 'Failed to reject order assignment.';
            state.rejectOrderAssignmentSuccess = false;
        });
    },
});

export const {
    resetApplySuccess,
    resetAssignDeliveryPartnerSuccess,
    resetAddDeliveryPartnerSuccess,
    resetRemoveDeliveryPartnerSuccess,
    resetReassignDeliveryPartnerSuccess,
    resetRejectOrderAssignmentSuccess,
    clearBranchDetails,
    clearOrders,
    clearActiveOrders,
    clearDeliveryPartners,
    clearRevenue,
    clearManagedBranch,
} = branchSlice.actions;

// Selectors
export const selectBranchLoading = (state) => state.branchStation.loading;
export const selectBranchError = (state) => state.branchStation.error;
export const selectBranchStationDetails = (state) => state.branchStation.branchStationDetails;
export const selectApplySuccess = (state) => state.branchStation.applySuccess;
export const selectManagedBranch = (state) => state.branchStation.managedBranch;
export const selectBranchOrders = (state) => state.branchStation.orders;
export const selectBranchActiveOrders = (state) => state.branchStation.activeOrders;
export const selectBranchDeliveryPartners = (state) => state.branchStation.deliveryPartners;
export const selectBranchRevenue = (state) => state.branchStation.revenue;
export const selectAssignDeliveryPartnerSuccess = (state) => state.branchStation.assignDeliveryPartnerSuccess;
export const selectAddDeliveryPartnerSuccess = (state) => state.branchStation.addDeliveryPartnerSuccess;
export const selectRemoveDeliveryPartnerSuccess = (state) => state.branchStation.removeDeliveryPartnerSuccess;
export const selectReassignDeliveryPartnerSuccess = (state) => state.branchStation.reassignDeliveryPartnerSuccess;
export const selectRejectOrderAssignmentSuccess = (state) => state.branchStation.rejectOrderAssignmentSuccess;

export default branchSlice.reducer;