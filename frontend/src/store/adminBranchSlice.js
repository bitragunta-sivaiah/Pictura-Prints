import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';
import { toast } from 'react-hot-toast';

// Async Thunks

export const createBranchStation = createAsyncThunk(
  'adminBranch/createBranchStation',
  async (branchData, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/admin/branch-stations', branchData);
      toast.success('Branch station created successfully!');
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create branch station.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const getAllBranchStations = createAsyncThunk(
  'adminBranch/getAllBranchStations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/api/admin/branch-stations');
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch branch stations.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const getBranchStationDetails = createAsyncThunk(
  'adminBranch/getBranchStationDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/admin/branch-stations/${id}`);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch branch station details.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const updateBranchStation = createAsyncThunk(
  'adminBranch/updateBranchStation',
  async ({ id, branchData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/api/admin/branch-stations/${id}`, branchData);
      toast.success('Branch station updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to update branch station.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const deleteBranchStation = createAsyncThunk(
  'adminBranch/deleteBranchStation',
  async (id, { rejectWithValue }) => {
    try {
      await API.delete(`/api/admin/branch-stations/${id}`);
      toast.success('Branch station deleted successfully!');
      return id; // Return the ID to update the state
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete branch station.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const getBranchManagerApplications = createAsyncThunk(
  'adminBranch/getBranchManagerApplications',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/admin/branch-stations/${branchId}/applications`);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch manager applications.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const approveBranchManagerApplication = createAsyncThunk(
  'adminBranch/approveBranchManagerApplication',
  async ({ branchId, userId }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/api/admin/branch-stations/${branchId}/applications/${userId}/approve`);
      toast.success('Manager application approved successfully!');
      return { branchId, userId }; // Return IDs to update state
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to approve application.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const rejectBranchManagerApplication = createAsyncThunk(
  'adminBranch/rejectBranchManagerApplication',
  async ({ branchId, userId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/api/admin/branch-stations/${branchId}/applications/${userId}/reject`, { rejectionReason });
      toast.success('Manager application rejected successfully!');
      return { branchId, userId }; // Return IDs to update state
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to reject application.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const assignOrderToBranch = createAsyncThunk(
    'adminBranch/assignOrderToBranch',
    async ({ orderId, location }, { rejectWithValue }) => { // Expecting an object with orderId and location
        try {
            const response = await API.post(`/api/admin/branch-stations/assign-order/${orderId}`, { location }); // Sending location in the request body
            toast.success(`Order ${orderId} assigned successfully to ${response.data.branchStation.name}.`);
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || `Failed to assign order ${orderId}.`);
            return rejectWithValue(error?.response?.data);
        }
    }
);

export const getOrdersForBranch = createAsyncThunk(
  'adminBranch/getOrdersForBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/admin/branch-stations/${branchId}/orders`);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch orders for this branch.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

export const getAssignedOrdersForBranch = createAsyncThunk(
  'adminBranch/getAssignedOrdersForBranch',
  async (branchId, { rejectWithValue }) => {
    try {
      const response = await API.get(`/api/admin/branch-stations/${branchId}/assigned-orders`);
      return response.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to fetch assigned orders for this branch.');
      return rejectWithValue(error?.response?.data);
    }
  }
);

// Slice
const adminBranchSlice = createSlice({
  name: 'adminBranch',
  initialState: {
    branchStations: [],
    branchStationDetails: null,
    managerApplications: [],
    ordersForBranch: [],
    assignedOrdersForBranch: [],
    loading: false,
    error: null,
    createSuccess: false,
    updateSuccess: false,
    deleteSuccess: false,
    assignOrderSuccess: null,
  },
  reducers: {
    resetCreateSuccess: (state) => {
      state.createSuccess = false;
    },
    resetUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetDeleteSuccess: (state) => {
      state.deleteSuccess = false;
    },
    resetAssignOrderSuccess: (state) => {
      state.assignOrderSuccess = null;
    },
    clearBranchStationDetails: (state) => {
      state.branchStationDetails = null;
    },
    clearOrdersForBranch: (state) => {
      state.ordersForBranch = [];
    },
    clearAssignedOrdersForBranch: (state) => {
      state.assignedOrdersForBranch = [];
    },
  },
  extraReducers: (builder) => {
    // Create Branch Station
    builder.addCase(createBranchStation.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.createSuccess = false;
    });
    builder.addCase(createBranchStation.fulfilled, (state, action) => {
      state.loading = false;
      state.branchStations.push(action.payload);
      state.createSuccess = true;
    });
    builder.addCase(createBranchStation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to create branch station.';
      state.createSuccess = false;
    });

    // Get All Branch Stations
    builder.addCase(getAllBranchStations.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(getAllBranchStations.fulfilled, (state, action) => {
      state.loading = false;
      state.branchStations = action.payload;
    });
    builder.addCase(getAllBranchStations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch branch stations.';
    });

    // Get Branch Station Details
    builder.addCase(getBranchStationDetails.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.branchStationDetails = null;
    });
    builder.addCase(getBranchStationDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.branchStationDetails = action.payload;
    });
    builder.addCase(getBranchStationDetails.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch branch station details.';
      state.branchStationDetails = null;
    });

    // Update Branch Station
    builder.addCase(updateBranchStation.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.updateSuccess = false;
    });
    builder.addCase(updateBranchStation.fulfilled, (state, action) => {
      state.loading = false;
      state.branchStations = state.branchStations.map((branch) =>
        branch._id === action.payload._id ? action.payload : branch
      );
      state.updateSuccess = true;
      state.branchStationDetails = action.payload;
    });
    builder.addCase(updateBranchStation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to update branch station.';
      state.updateSuccess = false;
    });

    // Delete Branch Station
    builder.addCase(deleteBranchStation.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.deleteSuccess = false;
    });
    builder.addCase(deleteBranchStation.fulfilled, (state, action) => {
      state.loading = false;
      state.branchStations = state.branchStations.filter((branch) => branch._id !== action.payload);
      state.deleteSuccess = true;
    });
    builder.addCase(deleteBranchStation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to delete branch station.';
      state.deleteSuccess = false;
    });

    // Get Branch Manager Applications
    builder.addCase(getBranchManagerApplications.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.managerApplications = [];
    });
    builder.addCase(getBranchManagerApplications.fulfilled, (state, action) => {
      state.loading = false;
      state.managerApplications = action.payload;
    });
    builder.addCase(getBranchManagerApplications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch manager applications.';
      state.managerApplications = [];
    });

    // Approve Branch Manager Application
    builder.addCase(approveBranchManagerApplication.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(approveBranchManagerApplication.fulfilled, (state, action) => {
      state.loading = false;
      state.managerApplications = state.managerApplications.filter(
        (app) => !(app.user === action.payload.userId)
      );
      if (state.branchStationDetails) {
        state.branchStationDetails.manager = action.payload.userId;
      }
      state.branchStations = state.branchStations.map(branch =>
        branch._id === action.payload.branchId ? { ...branch, manager: action.payload.userId } : branch
      );
    });
    builder.addCase(approveBranchManagerApplication.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to approve application.';
    });

    // Reject Branch Manager Application
    builder.addCase(rejectBranchManagerApplication.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(rejectBranchManagerApplication.fulfilled, (state, action) => {
      state.loading = false;
      state.managerApplications = state.managerApplications.filter(
        (app) => !(app.user === action.payload.userId)
      );
    });
    builder.addCase(rejectBranchManagerApplication.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to reject application.';
    });

    // Assign Order To Branch
    builder.addCase(assignOrderToBranch.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.assignOrderSuccess = null;
    });
    builder.addCase(assignOrderToBranch.fulfilled, (state, action) => {
      state.loading = false;
      state.assignOrderSuccess = true;
      if (state.branchStationDetails && state.branchStationDetails._id === action.payload.branchStationId) {
        state.branchStationDetails.orders = [...(state.branchStationDetails.orders || []), action.payload.orderId];
      }
    });
    builder.addCase(assignOrderToBranch.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || `Failed to assign order.`;
      state.assignOrderSuccess = false;
    });

    // Get Orders For Branch
    builder.addCase(getOrdersForBranch.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.ordersForBranch = [];
    });
    builder.addCase(getOrdersForBranch.fulfilled, (state, action) => {
      state.loading = false;
      state.ordersForBranch = action.payload;
    });
    builder.addCase(getOrdersForBranch.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch orders for this branch.';
      state.ordersForBranch = [];
    });

    // Get Assigned Orders For Branch
    builder.addCase(getAssignedOrdersForBranch.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.assignedOrdersForBranch = [];
    });
    builder.addCase(getAssignedOrdersForBranch.fulfilled, (state, action) => {
      state.loading = false;
      state.assignedOrdersForBranch = action.payload;
    });
    builder.addCase(getAssignedOrdersForBranch.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload?.message || 'Failed to fetch assigned orders for this branch.';
      state.assignedOrdersForBranch = [];
    });
  },
});

export const {
  resetCreateSuccess,
  resetUpdateSuccess,
  resetDeleteSuccess,
  resetAssignOrderSuccess,
  clearBranchStationDetails,
  clearOrdersForBranch,
  clearAssignedOrdersForBranch,
} = adminBranchSlice.actions;

// Selectors
export const selectBranchStations = (state) => state.adminBranch.branchStations;
export const selectBranchStationDetails = (state) => state.adminBranch.branchStationDetails;
export const selectManagerApplications = (state) => state.adminBranch.managerApplications;
export const selectOrdersForBranch = (state) => state.adminBranch.ordersForBranch;
export const selectAssignedOrdersForBranch = (state) => state.adminBranch.assignedOrdersForBranch;
export const selectAdminBranchLoading = (state) => state.adminBranch.loading;
export const selectAdminBranchError = (state) => state.adminBranch.error;
export const selectCreateBranchSuccess = (state) => state.adminBranch.createSuccess;
export const selectUpdateBranchSuccess = (state) => state.adminBranch.updateSuccess;
export const selectDeleteBranchSuccess = (state) => state.adminBranch.deleteSuccess;
export const selectAssignOrderSuccessStatus = (state) => state.adminBranch.assignOrderSuccess;

export default adminBranchSlice.reducer;