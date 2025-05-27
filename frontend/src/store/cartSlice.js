import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient';
import { toast } from 'react-hot-toast';

// Fetch Cart
export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.get('/api/cart');
    return data;
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});

// Add Standard Product to Cart
export const addStandardProduct = createAsyncThunk('cart/addStandard', async (product, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/api/cart/standard', product);
    toast.success('Product added to cart!');
    return data;
  } catch (error) {
    toast.error('Failed to add product');
    return rejectWithValue(error.response.data);
  }
});

// Add Customized Product to Cart
export const addCustomizedProduct = createAsyncThunk('cart/addCustomized', async (product, { rejectWithValue }) => {
  try {
    const { data } = await API.post('/api/cart/customized', product);
    toast.success('Customized product added!');
    return data;
  } catch (error) {
    toast.error('Failed to add customized product');
    return rejectWithValue(error.response.data);
  }
});

// Update Item Quantity
export const updateCartItem = createAsyncThunk('cart/updateItem', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const { data } = await API.put(`/api/cart/item/${itemId}`, { quantity });
    toast.success('Cart updated!');
    return data;
  } catch (error) {
    toast.error('Failed to update cart item');
    return rejectWithValue(error.response.data);
  }
});

// Remove Item from Cart
export const removeCartItem = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
  try {
    const { data } = await API.delete(`/api/cart/item/${itemId}`);
    // toast.success('Item removed from cart!');
    return data;
  } catch (error) {
    toast.error('Failed to remove item');
    return rejectWithValue(error.response.data);
  }
});

// Clear the entire cart
export const clearCart = createAsyncThunk('cart/clearCart', async (_, { rejectWithValue }) => {
  try {
    const { data } = await API.delete('/api/cart');
    toast.success('Cart cleared successfully!');
    return data; // Assuming the API returns the empty cart data
  } catch (error) {
    toast.error('Failed to clear cart.');
    return rejectWithValue(error.response.data);
  }
});

// Cart Slice
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    cart: null,
    status: 'idle',
    error: null,
  },
  reducers: {
    resetCart: (state) => {
      state.cart = null;
      state.status = 'idle';
      state.error = null;
    },
    // Reducer to locally clear the cart state (can be used optimistically)
    localClearCart: (state) => {
      state.cart = { items: [], totalPrice: 0 };
      state.status = 'succeeded';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addStandardProduct.fulfilled, (state, action) => {
        state.cart = action.payload; // Assuming API returns updated cart
      })
      .addCase(addCustomizedProduct.fulfilled, (state, action) => {
        state.cart = action.payload; // Assuming API returns updated cart
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.cart = action.payload; // Assuming API returns updated cart
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.cart = action.payload; // Assuming API returns updated cart
      })
      .addCase(clearCart.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cart = action.payload; // Assuming API returns the empty cart
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

// Selectors
export const selectCart = (state) => state.cart.cart;
export const selectCartItems = (state) => state.cart.cart?.items || [];
export const selectCartTotalPrice = (state) => state.cart.cart?.totalPrice || 0;
export const selectCartItemCount = (state) => state.cart.cart?.items?.reduce((count, item) => count + item.quantity, 0) || 0;
export const selectCartLoading = (state) => state.cart.status === 'loading';
export const selectCartError = (state) => state.cart.error;
export const selectCartStatus = (state) => state.cart.status;

export const { resetCart, localClearCart } = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export default cartSlice.reducer;