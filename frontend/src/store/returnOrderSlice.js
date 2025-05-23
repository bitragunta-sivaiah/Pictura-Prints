import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';
import { toast } from 'react-hot-toast';

// Async Thunks

export const requestReturn = createAsyncThunk(
    'returnOrder/requestReturn',
    async ({ orderId, reason, returnItems }, { rejectWithValue }) => {
        try {
            const response = await API.post(`/api/orders/${orderId}/return`, { reason, returnItems });
            toast.success('Return request submitted successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to submit return request.');
            return rejectWithValue(error?.response?.data?.message || 'Failed to submit return request.');
        }
    }
);

export const fetchAllReturnsAdmin = createAsyncThunk(
    'returnOrder/fetchAllReturnsAdmin',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/admin/returns');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch return requests.');
            return rejectWithValue(error?.response?.data?.message || 'Failed to fetch return requests.');
        }
    }
);

export const fetchReturnDetailsAdmin = createAsyncThunk(
    'returnOrder/fetchReturnDetailsAdmin',
    async (returnId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/admin/returns/${returnId}`);
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch return details.');
            return rejectWithValue(error?.response?.data?.message || 'Failed to fetch return details.');
        }
    }
);

export const updateReturnStatusAdmin = createAsyncThunk(
    'returnOrder/updateReturnStatusAdmin',
    async ({ returnId, returnStatus, returnTrackingNumber, returnLabelImageUrl }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/admin/returns/${returnId}/status`, { returnStatus, returnTrackingNumber, returnLabelImageUrl });
            toast.success('Return status updated successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update return status.');
            return rejectWithValue(error?.response?.data?.message || 'Failed to update return status.');
        }
    }
);

export const approveRejectReturnAdmin = createAsyncThunk(
    'returnOrder/approveRejectReturnAdmin',
    async ({ returnId, isApproved }, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/api/admin/returns/${returnId}/approval`, { isApproved });
            toast.success(`Return request ${isApproved ? 'approved' : 'rejected'} successfully!`);
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update return approval status.');
            return rejectWithValue(error?.response?.data?.message || 'Failed to update return approval status.');
        }
    }
);

export const processRefundAdmin = createAsyncThunk(
    'returnOrder/processRefundAdmin',
    async ({ returnId, refundStatus, refundAmount, refundReason, refundTransactionId }, { rejectWithValue }) => {
        try {
            const response = await API.put(`/api/admin/returns/${returnId}/refund`, { refundStatus, refundAmount, refundReason, refundTransactionId });
            toast.success('Refund details updated successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update refund details.');
            return rejectWithValue(error?.response?.data?.message || 'Failed to update refund details.');
        }
    }
);

// Slice
const returnOrderSlice = createSlice({
    name: 'returnOrder',
    initialState: {
        returnRequest: {
            loading: false,
            success: false,
            error: null,
            data: null,
        },
        allReturnsAdmin: {
            loading: false,
            success: false,
            error: null,
            data: [],
        },
        returnDetailsAdmin: {
            loading: false,
            success: false,
            error: null,
            data: null,
        },
        updateReturnStatus: {
            loading: false,
            success: false,
            error: null,
        },
        approveRejectReturn: {
            loading: false,
            success: false,
            error: null,
        },
        processRefund: {
            loading: false,
            success: false,
            error: null,
        },
    },
    reducers: {
        resetReturnRequest: (state) => {
            state.returnRequest = { loading: false, success: false, error: null, data: null };
        },
        resetAllReturnsAdmin: (state) => {
            state.allReturnsAdmin = { loading: false, success: false, error: null, data: [] };
        },
        resetReturnDetailsAdmin: (state) => {
            state.returnDetailsAdmin = { loading: false, success: false, error: null, data: null };
        },
        resetUpdateReturnStatus: (state) => {
            state.updateReturnStatus = { loading: false, success: false, error: null };
        },
        resetApproveRejectReturn: (state) => {
            state.approveRejectReturn = { loading: false, success: false, error: null };
        },
        resetProcessRefund: (state) => {
            state.processRefund = { loading: false, success: false, error: null };
        },
    },
    extraReducers: (builder) => {
        // requestReturn
        builder.addCase(requestReturn.pending, (state) => {
            state.returnRequest.loading = true;
        });
        builder.addCase(requestReturn.fulfilled, (state, action) => {
            state.returnRequest.loading = false;
            state.returnRequest.success = true;
            state.returnRequest.data = action.payload;
        });
        builder.addCase(requestReturn.rejected, (state, action) => {
            state.returnRequest.loading = false;
            state.returnRequest.error = action.payload;
        });

        // fetchAllReturnsAdmin
        builder.addCase(fetchAllReturnsAdmin.pending, (state) => {
            state.allReturnsAdmin.loading = true;
        });
        builder.addCase(fetchAllReturnsAdmin.fulfilled, (state, action) => {
            state.allReturnsAdmin.loading = false;
            state.allReturnsAdmin.success = true;
            state.allReturnsAdmin.data = action.payload;
        });
        builder.addCase(fetchAllReturnsAdmin.rejected, (state, action) => {
            state.allReturnsAdmin.loading = false;
            state.allReturnsAdmin.error = action.payload;
        });

        // fetchReturnDetailsAdmin
        builder.addCase(fetchReturnDetailsAdmin.pending, (state) => {
            state.returnDetailsAdmin.loading = true;
        });
        builder.addCase(fetchReturnDetailsAdmin.fulfilled, (state, action) => {
            state.returnDetailsAdmin.loading = false;
            state.returnDetailsAdmin.success = true;
            state.returnDetailsAdmin.data = action.payload;
        });
        builder.addCase(fetchReturnDetailsAdmin.rejected, (state, action) => {
            state.returnDetailsAdmin.loading = false;
            state.returnDetailsAdmin.error = action.payload;
        });

        // updateReturnStatusAdmin
        builder.addCase(updateReturnStatusAdmin.pending, (state) => {
            state.updateReturnStatus.loading = true;
        });
        builder.addCase(updateReturnStatusAdmin.fulfilled, (state) => {
            state.updateReturnStatus.loading = false;
            state.updateReturnStatus.success = true;
        });
        builder.addCase(updateReturnStatusAdmin.rejected, (state, action) => {
            state.updateReturnStatus.loading = false;
            state.updateReturnStatus.error = action.payload;
        });

        // approveRejectReturnAdmin
        builder.addCase(approveRejectReturnAdmin.pending, (state) => {
            state.approveRejectReturn.loading = true;
        });
        builder.addCase(approveRejectReturnAdmin.fulfilled, (state) => {
            state.approveRejectReturn.loading = false;
            state.approveRejectReturn.success = true;
        });
        builder.addCase(approveRejectReturnAdmin.rejected, (state, action) => {
            state.approveRejectReturn.loading = false;
            state.approveRejectReturn.error = action.payload;
        });

        // processRefundAdmin
        builder.addCase(processRefundAdmin.pending, (state) => {
            state.processRefund.loading = true;
        });
        builder.addCase(processRefundAdmin.fulfilled, (state) => {
            state.processRefund.loading = false;
            state.processRefund.success = true;
        });
        builder.addCase(processRefundAdmin.rejected, (state, action) => {
            state.processRefund.loading = false;
            state.processRefund.error = action.payload;
        });
    },
});

// Actions
export const {
    resetReturnRequest,
    resetAllReturnsAdmin,
    resetReturnDetailsAdmin,
    resetUpdateReturnStatus,
    resetApproveRejectReturn,
    resetProcessRefund,
} = returnOrderSlice.actions;

// Selectors
export const selectReturnRequestState = (state) => state.returnOrder.returnRequest;
export const selectAllReturnsAdminState = (state) => state.returnOrder.allReturnsAdmin;
export const selectReturnDetailsAdminState = (state) => state.returnOrder.returnDetailsAdmin;
export const selectUpdateReturnStatusState = (state) => state.returnOrder.updateReturnStatus;
export const selectApproveRejectReturnState = (state) => state.returnOrder.approveRejectReturn;
export const selectProcessRefundState = (state) => state.returnOrder.processRefund;

export default returnOrderSlice.reducer;