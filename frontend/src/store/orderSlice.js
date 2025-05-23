import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';
import { toast } from 'react-hot-toast';

const initialState = {
    order: null,
    orders: [],
    myOrders: [],
    loading: false,
    error: null,
    success: false, // General success flag, can be used for various operations
    paypalCaptureSuccess: false, // Specific success flag for PayPal capture
};

// Async Thunk for creating a new order
export const createOrder = createAsyncThunk(
    'order/createOrder',
    async (orderData, { rejectWithValue }) => {
        try {
            const response = await API.post('/api/orders', orderData);
            // For PayPal, the response contains an approveUrl.
            // For COD/Other, it contains the createdOrder.
            if (orderData.paymentMethod === 'paypal' && response.data.approveUrl) {
                // Don't show "Order placed successfully!" yet for PayPal,
                // as payment is not yet captured.
                // The component initiating this can handle the redirect.
            } else {
                toast.success('Order placed successfully!');
            }
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to place order.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for capturing PayPal payment
export const capturePaypalPayment = createAsyncThunk(
    'order/capturePaypalPayment',
    async ({ paymentId, PayerID, orderId }, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/orders/paypal/capture?paymentId=${paymentId}&PayerID=${PayerID}&orderId=${orderId}`);
            toast.success(response?.data?.message || 'PayPal payment captured successfully!');
            return response.data; // Expected to return { message: 'Payment successful', order }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to capture PayPal payment.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for getting the logged-in user's orders
export const getMyOrders = createAsyncThunk(
    'order/getMyOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/orders/myorders');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch your orders.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for getting an order by ID with populated customizations
export const getOrderDetails = createAsyncThunk(
    'order/getOrderDetails',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await API.get(`/api/orders/${orderId}`);
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch order details.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for getting all orders (Admin only)
export const getAllOrders = createAsyncThunk(
    'order/getAllOrders',
    async (_, { rejectWithValue }) => {
        try {
            const response = await API.get('/api/orders');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to fetch all orders.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for updating order status (Admin only)
export const updateOrderStatus = createAsyncThunk(
    'order/updateOrderStatus',
    async ({ orderId, status }, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/api/orders/${orderId}/status`, { status });
            toast.success('Order status updated successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update order status.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for updating order's delivery partner (Admin only)
export const updateOrderDeliveryPartner = createAsyncThunk(
    'order/updateOrderDeliveryPartner',
    async ({ orderId, deliveryPartner, deliveryPartnerStatus }, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/api/orders/${orderId}/deliverypartner`, { deliveryPartner, deliveryPartnerStatus });
            toast.success('Delivery partner updated successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update delivery partner.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for updating order's tracking information
export const updateOrderTracking = createAsyncThunk(
    'order/updateOrderTracking',
    async ({ orderId, trackingData }, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/api/orders/${orderId}/tracking`, trackingData);
            toast.success('Tracking information updated successfully!');
            return response.data;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to update tracking information.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// Async Thunk for deleting an order (Admin only)
export const deleteOrder = createAsyncThunk(
    'order/deleteOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            await API.delete(`/api/orders/${orderId}`);
            toast.success('Order deleted successfully!');
            return orderId;
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to delete order.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

// --- New Async Thunk for Cancelling an Order ---
export const cancelOrder = createAsyncThunk(
    'order/cancelOrder',
    async (orderId, { rejectWithValue }) => {
        try {
            const response = await API.patch(`/api/orders/${orderId}/cancel`);
            toast.success(response?.data?.message || 'Order cancelled successfully!');
            return response.data.order; // The backend returns the updated order
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to cancel order.');
            return rejectWithValue(error?.response?.data?.message || 'An error occurred');
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        resetOrder: (state) => {
            state.order = null;
            state.success = false;
            state.loading = false;
            state.error = null;
            state.paypalCaptureSuccess = false;
        },
        resetOrders: (state) => {
            state.orders = [];
            state.loading = false;
            state.error = null;
        },
        resetMyOrders: (state) => {
            state.myOrders = [];
            state.loading = false;
            state.error = null;
        },
        resetPaypalCaptureSuccess: (state) => {
            state.paypalCaptureSuccess = false;
        }
    },
    extraReducers: (builder) => {
        // createOrder
        builder.addCase(createOrder.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
            state.order = null; // Clear previous order details if any
            state.paypalCaptureSuccess = false;
        });
        builder.addCase(createOrder.fulfilled, (state, action) => {
            state.loading = false;
            // If it's a paypal order, the payload contains approveUrl and orderId (which is just the ID, not the full order object yet)
            // The full order object will be set after paypal capture or if it's COD/other
            if (action.payload.approveUrl) {
                state.order = { _id: action.payload.orderId, ...action.payload }; // Store approveUrl and orderId
            } else {
                state.order = action.payload; // For COD or other methods
            }
            state.success = true; // General success for order creation initiation
        });
        builder.addCase(createOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        });

        // capturePaypalPayment
        builder.addCase(capturePaypalPayment.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.paypalCaptureSuccess = false;
        });
        builder.addCase(capturePaypalPayment.fulfilled, (state, action) => {
            state.loading = false;
            state.order = action.payload.order; // The backend sends back the updated order
            state.paypalCaptureSuccess = true;
            state.error = null;
        });
        builder.addCase(capturePaypalPayment.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.paypalCaptureSuccess = false;
            state.order = null; // Potentially clear order or set to a state indicating payment failure
        });

        // getMyOrders
        builder.addCase(getMyOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(getMyOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.myOrders = action.payload;
        });
        builder.addCase(getMyOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });

        // getOrderDetails
        builder.addCase(getOrderDetails.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.order = null;
        });
        builder.addCase(getOrderDetails.fulfilled, (state, action) => {
            state.loading = false;
            state.order = action.payload;
        });
        builder.addCase(getOrderDetails.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.order = null;
        });

        // getAllOrders
        builder.addCase(getAllOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.orders = [];
        });
        builder.addCase(getAllOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload;
        });
        builder.addCase(getAllOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.orders = [];
        });

        // updateOrderStatus
        builder.addCase(updateOrderStatus.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
            state.loading = false;
            state.order = action.payload;
            // Update the order in the orders list if it exists
            const index = state.orders.findIndex(order => order._id === action.payload._id);
            if (index !== -1) {
                state.orders[index] = action.payload;
            }
            // Update the order in myOrders list if it exists
            const myOrderIndex = state.myOrders.findIndex(order => order._id === action.payload._id);
            if (myOrderIndex !== -1) {
                state.myOrders[myOrderIndex] = action.payload;
            }
            state.success = true;
        });
        builder.addCase(updateOrderStatus.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        });

        // updateOrderDeliveryPartner
        builder.addCase(updateOrderDeliveryPartner.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(updateOrderDeliveryPartner.fulfilled, (state, action) => {
            state.loading = false;
            state.order = action.payload;
            const index = state.orders.findIndex(order => order._id === action.payload._id);
            if (index !== -1) {
                state.orders[index] = action.payload;
            }
            state.success = true;
        });
        builder.addCase(updateOrderDeliveryPartner.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        });

        // updateOrderTracking
        builder.addCase(updateOrderTracking.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(updateOrderTracking.fulfilled, (state, action) => {
            state.loading = false;
            state.order = action.payload;
            const index = state.orders.findIndex(order => order._id === action.payload._id);
            if (index !== -1) {
                state.orders[index] = action.payload;
            }
            const myOrderIndex = state.myOrders.findIndex(order => order._id === action.payload._id);
            if (myOrderIndex !== -1) {
                state.myOrders[myOrderIndex] = action.payload;
            }
            state.success = true;
        });
        builder.addCase(updateOrderTracking.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        });

        // deleteOrder
        builder.addCase(deleteOrder.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(deleteOrder.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = state.orders.filter(order => order._id !== action.payload);
            // Optionally remove from myOrders if it could be there
            state.myOrders = state.myOrders.filter(order => order._id !== action.payload);
            if (state.order && state.order._id === action.payload) {
                state.order = null;
            }
            state.success = true;
        });
        builder.addCase(deleteOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        });

        // --- Handle cancelOrder states ---
        builder.addCase(cancelOrder.pending, (state) => {
            state.loading = true;
            state.error = null;
            state.success = false;
        });
        builder.addCase(cancelOrder.fulfilled, (state, action) => {
            state.loading = false;
            state.success = true;
            state.order = action.payload; // Set the cancelled order details

            // Update `myOrders` list if the cancelled order is present
            const myOrderIndex = state.myOrders.findIndex(order => order._id === action.payload._id);
            if (myOrderIndex !== -1) {
                state.myOrders[myOrderIndex] = action.payload;
            }

            // Update `orders` list (for admin view) if the cancelled order is present
            const allOrdersIndex = state.orders.findIndex(order => order._id === action.payload._id);
            if (allOrdersIndex !== -1) {
                state.orders[allOrdersIndex] = action.payload;
            }
        });
        builder.addCase(cancelOrder.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
            state.success = false;
        });
    },
});

export const { resetOrder, resetOrders, resetMyOrders, resetPaypalCaptureSuccess } = orderSlice.actions;

// Selectors
export const selectOrder = (state) => state.order.order;
export const selectOrders = (state) => state.order.orders;
export const selectMyOrders = (state) => state.order.myOrders;
export const selectOrderLoading = (state) => state.order.loading;
export const selectOrderError = (state) => state.order.error;
export const selectOrderSuccess = (state) => state.order.success; // General success
export const selectPaypalCaptureSuccess = (state) => state.order.paypalCaptureSuccess;


export default orderSlice.reducer;