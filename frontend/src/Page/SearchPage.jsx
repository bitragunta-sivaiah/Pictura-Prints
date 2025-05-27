import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchProducts,
  fetchProductsByCategory,
  selectAllProducts,
  selectProductsLoading,
  selectProductsError,
} from '../store/productSlice';
import {
  fetchCategories,
  selectAllCategories,
  selectCategoriesLoading,
} from '../store/categorySlice';
import { Search, XCircle, ChevronDown, Filter, Loader2, IndianRupee, ArrowUpFromDot } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const SearchProductPage = () => {
  const dispatch = useDispatch();

  const allProducts = useSelector(selectAllProducts);
  const productsLoading = useSelector(selectProductsLoading);
  const productsError = useSelector(selectProductsError);

  const allCategories = useSelector(selectAllCategories);
  const categoriesLoading = useSelector(selectCategoriesLoading);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  // Dropdown open states
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const [isColorDropdownOpen, setIsColorDropdownOpen] = useState(false);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);

  // Refs for closing dropdowns when clicking outside
  const categoryRef = useRef(null);
  const brandRef = useRef(null);
  const colorRef = useRef(null);
  const priceRef = useRef(null);

  // Initial data fetching
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle clicks outside of dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (brandRef.current && !brandRef.current.contains(event.target)) {
        setIsBrandDropdownOpen(false);
      }
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        setIsColorDropdownOpen(false);
      }
      if (priceRef.current && !priceRef.current.contains(event.target)) {
        setIsPriceDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Derive unique brands and colors from all products and their variants
  const { uniqueBrands, uniqueColors } = useMemo(() => {
    const brands = new Set();
    const colors = new Set();

    allProducts.forEach((product) => {
      if (product.brand) brands.add(product.brand);
      if (product.availableColors && Array.isArray(product.availableColors)) {
        product.availableColors.forEach((variant) => {
          if (variant.color) colors.add(variant.color);
        });
      }
    });
    return { uniqueBrands: Array.from(brands), uniqueColors: Array.from(colors) };
  }, [allProducts]);

  const priceRanges = [
    { label: 'All Prices', value: '' },
    { label: '₹0 - ₹100', value: '0-100' },
    { label: '₹101 - ₹200', value: '101-200' },
    { label: '₹201 - ₹500', value: '201-500' },
    { label: '₹501 - ₹1000', value: '501-1000' },
    { label: '₹1000+', value: '1000+' },
  ];

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setIsCategoryDropdownOpen(false);
    if (categorySlug) {
      dispatch(fetchProductsByCategory(categorySlug));
    } else {
      dispatch(fetchProducts()); // Fetch all products if "All Categories" is selected
    }
  };

  const handleBrandChange = (brand) => {
    setSelectedBrand(brand);
    setIsBrandDropdownOpen(false);
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setIsColorDropdownOpen(false);
  };

  const handlePriceRangeChange = (range) => {
    setSelectedPriceRange(range);
    setIsPriceDropdownOpen(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedColor('');
    setSelectedPriceRange('');
    dispatch(fetchProducts()); // Reset to all products
  };

  const filteredProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter by search term on product name and description
    if (searchTerm) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter((product) => product.brand === selectedBrand);
    }

    // Filter by color (checking availableColors array)
    if (selectedColor) {
      filtered = filtered.filter((product) =>
        product.availableColors.some((variant) => variant.color === selectedColor)
      );
    }

    // Filter by price range (using basePrice for the main product price)
    if (selectedPriceRange) {
      filtered = filtered.filter((product) => {
        const price = product.basePrice; // Using basePrice for filtering
        if (selectedPriceRange === '0-100') return price >= 0 && price <= 100;
        if (selectedPriceRange === '101-200') return price > 100 && price <= 200;
        if (selectedPriceRange === '201-500') return price > 200 && price <= 500;
        if (selectedPriceRange === '501-1000') return price > 500 && price <= 1000;
        if (selectedPriceRange === '1000+') return price > 1000;
        return true;
      });
    }

    return filtered;
  }, [allProducts, searchTerm, selectedBrand, selectedColor, selectedPriceRange]);

  // Display error toasts
  useEffect(() => {
    if (productsError) {
      toast.error(`Product error: ${productsError}`);
    }
  }, [productsError]);

  useEffect(() => {
    if (categoriesLoading === 'failed') {
      toast.error('Failed to load categories.');
    }
  }, [categoriesLoading]);

  return (
    <div className="min-h-screen   p-4 font-sans antialiased">
      <div className=" w-[98%] mx-auto bg-white       ">
       

        {/* --- Search Bar and Action Buttons --- */}
        <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex w-full items-center gap-4">
            <Link to={'/'} className='w-fit h-[40px] flex items-center gap-2 border rounded '>
            <ArrowUpFromDot className=' rotate-[-90deg]'/> 
          </Link>
          <div className="relative flex-grow w-full ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products by name or description..."
              className="w-full pl-10 pr-10 py-2.5 border-1 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 ease-in-out text-base placeholder-gray-400"
              value={searchTerm}
              onChange={handleSearchChange}
            />
            {searchTerm && (
              <XCircle
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer hover:text-red-500 transition-colors"
                size={20}
                onClick={handleClearSearch}
              />
            )}
          </div>
        </div>
          <button
            onClick={handleClearFilters}
            className="flex items-center max-w-[300px] justify-center gap-3 w-full p-2  py-2.5 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-200 ease-in-out  "
          >
            <p><Filter size={18} className=" " /> </p>
            <p>Reset Filters</p>
          </button>
        </div>

        {/* --- Filter Options Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4 mb-8">
          {/* Category Filter */}
          <div className="relative" ref={categoryRef}>
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className=" flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-full bg-white text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out text-base"
            >
              <span>{selectedCategory ? allCategories.find(cat => cat.slug === selectedCategory)?.name || 'Select Category' : 'All Categories'}</span>
              <ChevronDown size={18} className={`${isCategoryDropdownOpen ? 'rotate-180' : ''} transition-transform ml-2`} />
            </button>
            {isCategoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {categoriesLoading === 'pending' && <div className="p-3 text-center text-gray-500 text-sm">Loading categories...</div>}
                <div
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors text-base"
                  onClick={() => handleCategoryChange('')}
                >
                  All Categories
                </div>
                {allCategories.length > 0 ? (
                  allCategories.map((category) => (
                    <div
                      key={category._id}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors text-base"
                      onClick={() => handleCategoryChange(category.slug)}
                    >
                      {category.name}
                    </div>
                  ))
                ) : (
                  categoriesLoading === 'succeeded' && <div className="px-4 py-2 text-gray-500 text-sm">No categories available</div>
                )}
              </div>
            )}
          </div>

          {/* Brand Filter */}
          <div className="relative" ref={brandRef}>
            <button
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-full bg-white text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out text-base"
            >
              <span>{selectedBrand || 'All Brands'}</span>
              <ChevronDown size={18} className={`${isBrandDropdownOpen ? 'rotate-180' : ''} transition-transform ml-2`} />
            </button>
            {isBrandDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors text-base"
                  onClick={() => handleBrandChange('')}
                >
                  All Brands
                </div>
                {uniqueBrands.length > 0 ? (
                  uniqueBrands.map((brand) => (
                    <div
                      key={brand}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors text-base"
                      onClick={() => handleBrandChange(brand)}
                    >
                      {brand}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">No brands available</div>
                )}
              </div>
            )}
          </div>

          {/* Color Filter */}
          <div className="relative" ref={colorRef}>
            <button
              onClick={() => setIsColorDropdownOpen(!isColorDropdownOpen)}
              className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-full bg-white text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out text-base"
            >
              <span>{selectedColor || 'All Colors'}</span>
              <ChevronDown size={18} className={`${isColorDropdownOpen ? 'rotate-180' : ''} transition-transform ml-2`} />
            </button>
            {isColorDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div
                  className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors text-base"
                  onClick={() => handleColorChange('')}
                >
                  All Colors
                </div>
                {uniqueColors.length > 0 ? (
                  uniqueColors.map((color) => (
                    <div
                      key={color}
                      className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 flex items-center text-base transition-colors"
                      onClick={() => handleColorChange(color)}
                    >
                      <span className="inline-block w-5 h-5 rounded-full mr-2 border border-gray-300 shadow-sm" style={{ backgroundColor: color }}></span>
                      {color}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500 text-sm">No colors available</div>
                )}
              </div>
            )}
          </div>

          {/* Price Range Filter */}
          <div className="relative" ref={priceRef}>
            <button
              onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
              className="w-full flex justify-between items-center px-4 py-2.5 border border-gray-300 rounded-full bg-white text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out text-base"
            >
              <span>{priceRanges.find(range => range.value === selectedPriceRange)?.label || 'All Prices'}</span>
              <ChevronDown size={18} className={`${isPriceDropdownOpen ? 'rotate-180' : ''} transition-transform ml-2`} />
            </button>
            {isPriceDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {priceRanges.map((range) => (
                  <div
                    key={range.value}
                    className="px-4 py-2 cursor-pointer hover:bg-blue-50 hover:text-blue-700 text-gray-800 transition-colors text-base"
                    onClick={() => handlePriceRangeChange(range.value)}
                  >
                    {range.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* --- Product List --- */}
        {productsLoading === 'pending' ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : productsError ? (
          <div className="text-center text-red-600 text-xl font-medium py-10">
            <p>Oops! Something went wrong while fetching products.</p>
            <p className="text-base text-gray-500 mt-2">{productsError}</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-600 text-xl font-medium py-10">
            No products found matching your criteria. Try adjusting your filters!
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols32 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {filteredProducts.map((product) => (
              <Link to={`/product/${product._id}`}
                key={product._id}
                className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition-transform duration-300 ease-in-out border border-gray-100 hover:border-indigo-300"
              >
                <img
                  src={product.availableColors[0]?.images?.front || 'https://via.placeholder.com/300x200?text=No+Image'}
                  alt={product.name}
                  className="w-full h-48 object-cover object-center"
                />
                <div className="p-2">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate" title={product.name}>
                    {product.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-indigo-700 flex items-center">
                      <IndianRupee size={15} className="" />
                      {product.basePrice }
                    </span>
                    {product.brand && (
                      <span className="text-[10px] text-gray-500 bg-gray-100 p-1   rounded-full border-1 border-gray-200">
                        {product.brand}
                      </span>
                    )}
                  </div>
                  {product.availableColors.length > 0 && (
                    <div className="flex items-center mt-3 flex-wrap gap-1">
                      <span className="text-xs text-gray-700 mr-1">Available Colors:</span>
                      {product.availableColors.map((variant) => (
                        <span
                          key={variant._id}
                          className="inline-block w-4 h-4 rounded-full border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-110"
                          style={{ backgroundColor: variant.color, outline: `1px solid ${variant.color}` }}
                          title={`Color: ${variant.color}`}
                        ></span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchProductPage;