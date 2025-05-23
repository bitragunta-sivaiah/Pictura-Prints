import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient'; //  Ensure this path is correct
import { toast } from 'react-hot-toast';

// --- Address Slice ---
const addressSlice = createSlice({
    name: 'address',
    initialState: {
        addresses: [],
        address: null,
        loading: false,
        error: null,
    },
    reducers: {
        setAddresses: (state, action) => {
            state.addresses = action.payload;
            state.loading = false;
            state.error = null;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        clearAddress: (state) => {
            state.address = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // --- Address ---
            .addCase(createAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createAddress.fulfilled, (state, action) => {
                state.addresses.push(action.payload.address);
                state.address = action.payload.address;
                state.loading = false;
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(createAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload.message || "Failed to create address");
            })
            .addCase(fetchAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddresses.fulfilled, (state, action) => {
                state.addresses = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload.message || "Failed to fetch addresses");
            })
            .addCase(fetchAddressById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAddressById.fulfilled, (state, action) => {
                state.address = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(fetchAddressById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload.message || "Failed to fetch address");
            })
            .addCase(updateAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAddress.fulfilled, (state, action) => {
                const updatedAddress = action.payload.address;
                const index = state.addresses.findIndex(a => a._id === updatedAddress._id);
                if (index !== -1) {
                    state.addresses[index] = updatedAddress; // Update in the list
                }
                state.address = updatedAddress;
                state.loading = false;
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(updateAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload.message || "Failed to update address");
            })
            .addCase(deleteAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                const deletedId = action.payload;
                state.addresses = state.addresses.filter(a => a._id !== deletedId);
                state.address = null;
                state.loading = false;
                state.error = null;
                toast.success(action.payload.message);
            })
            .addCase(deleteAddress.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
                toast.error(action.payload.message || "Failed to delete address");
            });
    },
});

// --- Async Thunks ---

// --- Address ---
export const createAddress = createAsyncThunk('address/createAddress', async (addressData, { rejectWithValue }) => {
    try {
        const response = await API.post('/api/addresses', addressData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchAddresses = createAsyncThunk('address/fetchAddresses', async (_, { rejectWithValue }) => {
    try {
        const response = await API.get('/api/addresses');
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const fetchAddressById = createAsyncThunk('address/fetchAddressById', async (id, { rejectWithValue }) => {
    try {
        const response = await API.get(`/api/addresses/${id}`);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const updateAddress = createAsyncThunk('address/updateAddress', async ({ id, addressData }, { rejectWithValue }) => {
    try {
        const response = await API.put(`/api/addresses/${id}`, addressData);
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const deleteAddress = createAsyncThunk('address/deleteAddress', async (id, { rejectWithValue }) => {
    try {
        await API.delete(`/api/addresses/${id}`);
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// --- Selector ---
export const selectAddresses = (state) => state.address.addresses;
export const selectAddress = (state) => state.address.address;
export const selectAddressLoading = (state) => state.address.loading;
export const selectAddressError = (state) => state.address.error;

// --- Action ---
export const { setAddresses, setAddress, setLoading, setError, clearAddress } = addressSlice.actions;
export default addressSlice.reducer;
