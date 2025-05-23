import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  fetchCategories,
  selectAllCategories,
  selectCategoriesLoading,
  selectCategoriesError,
} from '../store/categorySlice'; // Adjust path
import {
  fetchProducts,
  fetchProductsByCategory, // Import this if your API supports it
  selectAllProducts,
  selectProductsLoading,
  selectProductsError,
} from '../store/productSlice';
import LoadingPage from './Loading'; // Assuming you have this
import ErrorMessage from './ErrorMessage'; // Assuming you have this

const INITIAL_PRODUCT_COUNT = 5;
const PRIMARY_COLOR = '#313115'; // Define the color

const CategoryFilteredProducts = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);
  const categoriesError = useSelector(selectCategoriesError);
  const allProducts = useSelector(selectAllProducts);
  const productsLoading = useSelector(selectProductsLoading);
  const productsError = useSelector(selectProductsError);
  const [activeCategory, setActiveCategory] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(INITIAL_PRODUCT_COUNT);
  const [showAllCategoryProducts, setShowAllCategoryProducts] = useState(false);

  const loading = productsLoading || categoriesLoading;
  const error = productsError || categoriesError;

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts()); // Fetch all products initially
  }, [dispatch]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]); // Set the first category as active initially
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    if (activeCategory) {
      dispatch(fetchProductsByCategory(activeCategory.slug)); // Fetch products for the active category
      setVisibleProducts(INITIAL_PRODUCT_COUNT);
      setShowAllCategoryProducts(false);
    }
  }, [dispatch, activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setVisibleProducts(INITIAL_PRODUCT_COUNT);
    setShowAllCategoryProducts(false);
  };

  const handleViewMore = () => {
    setVisibleProducts(prev => prev + INITIAL_PRODUCT_COUNT);
  };

  const categoryProducts = activeCategory
    ? allProducts.filter(product => product.category?.slug === activeCategory.slug)
    : [];

  const productsToDisplay = showAllCategoryProducts
    ? categoryProducts
    : categoryProducts.slice(0, visibleProducts);

  const hasMore = categoryProducts.length > visibleProducts && !showAllCategoryProducts;

  return (
    <div className="w-full max-w-7xl mx-auto py-8" style={{ color: '#f4f4f4' }}> {/* Optional: Light background for contrast */}
      <div className="mb-8">
        <h1 className='text-3xl md:text-5xl heading text-center mb-6' style={{ color: PRIMARY_COLOR }}>Explore Our Products</h1>
        {categoriesLoading === 'pending' ? (
          <div className="text-center text-gray-500">Loading Categories...</div>
        ) : categoriesError ? (
          <ErrorMessage message={categoriesError} />
        ) : (
          <div className="mb-6 mx-3 overflow-x-auto scrollbar-hide"  >
            <ul className="flex gap-8 border-b-0 capitalize" style={{ borderColor: 'transparent' }}>
              {categories.map((category) => (
                <li
                  key={category._id}
                  className={`cursor-pointer text-[#313115] hover:text-[#313115] font-medium whitespace-nowrap py-2 ${
                    activeCategory?.slug === category.slug ? '  border-b-2 border-[#313115]' : ''
                  }`}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeCategory && (
          <h2 className="text-2xl font-bold text-gray-900 mt-4 text-center" style={{ color: PRIMARY_COLOR }}>
            {showAllCategoryProducts ? `All ${activeCategory.name} Products` : `More ${activeCategory.name}`}
          </h2>
        )}
      </div>

      <div>
        {loading === 'pending' ? (
          <LoadingPage loadingName={productsLoading ? "Loading Products..." : ""} />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : productsToDisplay.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4">
            {productsToDisplay.map((product) => {
              const firstColor = product.availableColors?.[0];
              const frontImage = firstColor?.images?.front;

              return (
                <div key={product._id} className="bg-white rounded-lg overflow-hidden "> {/* Added subtle shadow for card */}
                  <Link to={`/product/${product._id}`}>
                    <div className="relative">
                      {frontImage ? (
                        <img
                          src={frontImage}
                          alt={product.name}
                          className="w-full h-64 object-cover shadow rounded-2xl"
                        />
                      ) : (
                        <div className="w-full h-64 bg-gray-100 flex items-center justify-center text-gray-500">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <p className="text-sm   text-gray-700 mb-2 line-clamp-2">{product.name}</p>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center">
            No products found in {activeCategory ? activeCategory.name : 'any category'}.
          </p>
        )}

        {activeCategory && hasMore && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleViewMore}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded"
              style={{ backgroundColor: PRIMARY_COLOR, color: 'white', borderColor: PRIMARY_COLOR }}
            >
              View More
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilteredProducts;