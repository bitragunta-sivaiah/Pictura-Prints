import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../api/apiClient'; // Adjust the path if needed
import { toast } from 'react-hot-toast';

// Async Thunks

// Fetch all products
export const fetchProducts = createAsyncThunk('products/fetchProducts', async () => {
  try {
    const response = await API.get('/api/products');
    return response.data;
  } catch (error) {
    toast.error(`Failed to fetch products: ${error.message}`);
    throw error; // Re-throw to be caught by Redux
  }
});

// Fetch products by category slug
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchProductsByCategory',
  async (categorySlug) => {
    try {
      const response = await API.get(`/api/categories/${categorySlug}/products`);
      return response.data;
    } catch (error) {
      toast.error(`Failed to fetch products by category: ${error.message}`);
      throw error;
    }
  }
);

// Fetch a single product by ID
export const fetchProductById = createAsyncThunk('products/fetchProductById', async (id) => {
  try {
    const response = await API.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    toast.error(`Failed to fetch product: ${error.message}`);
    throw error;
  }
});

// Fetch a single product by slug
export const fetchProductBySlug = createAsyncThunk('products/fetchProductBySlug', async (slug) => {
  try {
    const response = await API.get(`/api/products/slug/${slug}`);
    return response.data;
  } catch (error) {
    toast.error(`Failed to fetch product by slug: ${error.message}`);
    throw error;
  }
});

// Fetch similar products by product ID
export const fetchSimilarProducts = createAsyncThunk(
  'products/fetchSimilarProducts',
  async (productId) => {
    try {
      const response = await API.get(`/api/products/${productId}/similar`);
      return response.data;
    } catch (error) {
      toast.error(`Failed to fetch similar products: ${error.message}`);
      throw error;
    }
  }
);

// Create a new product (requires authentication)
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await API.post('/api/products', productData);
      toast.success('Product created successfully!');
      return response.data;
    } catch (error) {
      toast.error(`Failed to create product: ${error.message}`);
      return rejectWithValue(error.response?.data);
    }
  }
);

// Update an existing product by ID (requires authentication)
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      const response = await API.put(`/api/products/${productId}`, productData);
      toast.success('Product updated successfully!');
      return response.data;
    } catch (error) {
      toast.error(`Failed to update product: ${error.message}`);
      return rejectWithValue(error.response?.data);
    }
  }
);

// Delete a product by ID (requires authentication)
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (productId, { rejectWithValue }) => {
    try {
      await API.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully!');
      return productId; // Return the ID for removal from state
    } catch (error) {
      toast.error(`Failed to delete product: ${error.message}`);
      return rejectWithValue(error.response?.data);
    }
  }
);


// Product Slice
const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    product: null,
    similarProducts: [], // New state for similar products
    loading: 'idle', // 'idle' | 'pending' | 'succeeded' | 'failed'
    error: null,
    fetchProductDetailsLoading: 'idle',
    fetchProductDetailsError: null,
    fetchProductBySlugLoading: 'idle',
    fetchProductBySlugError: null,
    fetchSimilarProductsLoading: 'idle', // Loading state for similar products
    fetchSimilarProductsError: null, // Error state for similar products
    updateProductLoading: 'idle',
    updateProductError: null,
    createProductLoading: 'idle',
    createProductError: null,
    deleteProductLoading: 'idle',
    deleteProductError: null,
  },
  reducers: {
    // Reset single product
    resetProduct: (state) => {
      state.product = null;
      state.loading = 'idle';
    },
    clearProductDetails: (state) => {
      state.product = null;
      state.fetchProductDetailsLoading = 'idle';
      state.fetchProductDetailsError = null;
      state.similarProducts = []; // Clear similar products when clearing details
      state.fetchSimilarProductsLoading = 'idle';
      state.fetchSimilarProductsError = null;
    },
    clearSimilarProducts: (state) => {
      state.similarProducts = [];
      state.fetchSimilarProductsLoading = 'idle';
      state.fetchSimilarProductsError = null;
    }
  },
  extraReducers: (builder) => {
    // --- Fetch Products ---
    builder.addCase(fetchProducts.pending, (state) => {
      state.loading = 'pending';
      state.error = null;
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.loading = 'failed';
      state.error = action.error.message;
    });

    // --- Fetch Products by Category ---
    builder.addCase(fetchProductsByCategory.pending, (state) => {
      state.loading = 'pending';
      state.error = null;
    });
    builder.addCase(fetchProductsByCategory.fulfilled, (state, action) => {
      state.loading = 'succeeded';
      state.products = action.payload;
    });
    builder.addCase(fetchProductsByCategory.rejected, (state, action) => {
      state.loading = 'failed';
      state.error = action.error.message;
    });

    // --- Fetch Product by ID ---
    builder.addCase(fetchProductById.pending, (state) => {
      state.fetchProductDetailsLoading = 'pending';
      state.fetchProductDetailsError = null;
      state.product = null; // Reset product details on loading
      state.similarProducts = []; // Clear similar products on new product fetch
      state.fetchSimilarProductsLoading = 'idle';
      state.fetchSimilarProductsError = null;
    });
    builder.addCase(fetchProductById.fulfilled, (state, action) => {
      state.fetchProductDetailsLoading = 'succeeded';
      state.product = action.payload;
    });
    builder.addCase(fetchProductById.rejected, (state, action) => {
      state.fetchProductDetailsLoading = 'failed';
      state.fetchProductDetailsError = action.error.message;
      state.product = null; // Reset product details on error
      state.similarProducts = [];
      state.fetchSimilarProductsLoading = 'idle';
      state.fetchSimilarProductsError = null;
    });

    // --- Fetch Product by Slug ---
    builder.addCase(fetchProductBySlug.pending, (state) => {
      state.fetchProductBySlugLoading = 'pending';
      state.fetchProductBySlugError = null;
      state.product = null; // Reset product on loading
      state.similarProducts = []; // Clear similar products on new product fetch
      state.fetchSimilarProductsLoading = 'idle';
      state.fetchSimilarProductsError = null;
    });
    builder.addCase(fetchProductBySlug.fulfilled, (state, action) => {
      state.fetchProductBySlugLoading = 'succeeded';
      state.product = action.payload;
    });
    builder.addCase(fetchProductBySlug.rejected, (state, action) => {
      state.fetchProductBySlugLoading = 'failed';
      state.fetchProductBySlugError = action.error.message;
      state.product = null; // Reset product on error
      state.similarProducts = [];
      state.fetchSimilarProductsLoading = 'idle';
      state.fetchSimilarProductsError = null;
    });

    // --- Fetch Similar Products ---
    builder.addCase(fetchSimilarProducts.pending, (state) => {
      state.fetchSimilarProductsLoading = 'pending';
      state.fetchSimilarProductsError = null;
      state.similarProducts = []; // Clear previous similar products
    });
    builder.addCase(fetchSimilarProducts.fulfilled, (state, action) => {
      state.fetchSimilarProductsLoading = 'succeeded';
      state.similarProducts = action.payload;
    });
    builder.addCase(fetchSimilarProducts.rejected, (state, action) => {
      state.fetchSimilarProductsLoading = 'failed';
      state.fetchSimilarProductsError = action.error.message;
      state.similarProducts = [];
    });

    // --- Create Product ---
    builder.addCase(createProduct.pending, (state) => {
      state.createProductLoading = 'pending';
      state.createProductError = null;
    });
    builder.addCase(createProduct.fulfilled, (state, action) => {
      state.createProductLoading = 'succeeded';
      state.products.push(action.payload); // Add new product to the list
    });
    builder.addCase(createProduct.rejected, (state, action) => {
      state.createProductLoading = 'failed';
      state.createProductError = action.payload?.message || action.error.message;
    });

    // --- Update Product ---
    builder.addCase(updateProduct.pending, (state) => {
      state.updateProductLoading = 'pending';
      state.updateProductError = null;
    });
    builder.addCase(updateProduct.fulfilled, (state, action) => {
      state.updateProductLoading = 'succeeded';
      const updatedProduct = action.payload;
      const index = state.products.findIndex((p) => p._id === updatedProduct._id);
      if (index !== -1) {
        state.products[index] = updatedProduct; // Update in the list
      }
      if (state.product && state.product._id === updatedProduct._id) {
        state.product = updatedProduct; // Update the single product if it's the one being displayed
      }
    });
    builder.addCase(updateProduct.rejected, (state, action) => {
      state.updateProductLoading = 'failed';
      state.updateProductError = action.payload?.message || action.error.message;
    });

    // --- Delete Product ---
    builder.addCase(deleteProduct.pending, (state) => {
      state.deleteProductLoading = 'pending';
      state.deleteProductError = null;
    });
    builder.addCase(deleteProduct.fulfilled, (state, action) => {
      state.deleteProductLoading = 'succeeded';
      const deletedProductId = action.payload;
      state.products = state.products.filter((p) => p._id !== deletedProductId); // Remove from the list
      if (state.product && state.product._id === deletedProductId) {
        state.product = null; // Clear the single product if it was deleted
      }
    });
    builder.addCase(deleteProduct.rejected, (state, action) => {
      state.deleteProductLoading = 'failed';
      state.deleteProductError = action.payload?.message || action.error.message;
    });
  },
});

// Selectors
export const selectAllProducts = (state) => state.products.products;
export const selectProductDetails = (state) => state.products.product;
export const selectSimilarProducts = (state) => state.products.similarProducts; // Selector for similar products
export const selectProductById = (state) => state.products.product; // Alias for clarity
export const selectProductsLoading = (state) => state.products.loading;
export const selectProductsError = (state) => state.products.error;

// Specific selectors for fetchProductDetails (by ID)
export const selectFetchProductDetailsLoading = (state) => state.products.fetchProductDetailsLoading;
export const selectFetchProductDetailsError = (state) => state.products.fetchProductDetailsError;

// Specific selectors for fetchProductBySlug
export const selectFetchProductBySlugLoading = (state) => state.products.fetchProductBySlugLoading;
export const selectFetchProductBySlugError = (state) => state.products.fetchProductBySlugError;

// Specific selectors for fetchSimilarProducts
export const selectFetchSimilarProductsLoading = (state) => state.products.fetchSimilarProductsLoading;
export const selectFetchSimilarProductsError = (state) => state.products.fetchSimilarProductsError;

// Specific selectors for updateProduct
export const selectUpdateProductLoading = (state) => state.products.updateProductLoading;
export const selectUpdateProductError = (state) => state.products.updateProductError;

// Specific selectors for createProduct
export const selectCreateProductLoading = (state) => state.products.createProductLoading;
export const selectCreateProductError = (state) => state.products.createProductError;

// Specific selectors for deleteProduct
export const selectDeleteProductLoading = (state) => state.products.deleteProductLoading;
export const selectDeleteProductError = (state) => state.products.deleteProductError;


export const { resetProduct, clearProductDetails, clearSimilarProducts } = productSlice.actions;
export default productSlice.reducer;