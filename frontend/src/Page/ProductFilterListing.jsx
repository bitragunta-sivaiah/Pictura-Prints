import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchCategories,
    selectAllCategories,
    selectCategoriesError,
} from '../store/categorySlice';
import {
    fetchProducts,
    selectAllProducts,
    selectProductsError,
} from '../store/productSlice';
import { X, RotateCw, Filter } from 'lucide-react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import Banner from '../components/Banner';

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
    }).format(amount);
};

const ProductCard = ({ product }) => {
    return (
        <Link to={`/product/${product._id}`} className="bg-white rounded-lg shadow overflow-hidden transition-shadow hover:shadow-lg">
            {product.availableColors && product.availableColors[0]?.images?.front ? (
                <img
                    src={product.availableColors[0].images.front}
                    alt={product.name}
                    className="w-full h-48 object-cover"
                />
            ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                    No Image
                </div>
            )}
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1 truncate">{product.description}</p>
                <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{formatCurrency(product.basePrice)}</span>
                    {/* You can add a quick view or add to cart button here */}
                </div>
                {product.availableColors && product.availableColors.length > 0 && (
                    <div className="mt-2 flex items-center space-x-1">
                        <span className="text-xs text-gray-500">Colors:</span>
                        {product.availableColors.slice(0, 3).map((colorInfo) => (
                            <div
                                key={colorInfo.color}
                                className={`w-4 h-4 rounded-full shadow-sm cursor-pointer`}
                                style={{ backgroundColor: colorInfo.color }}
                                title={colorInfo.color}
                            ></div>
                        ))}
                        {product.availableColors.length > 3 && (
                            <span className="text-xs text-gray-500">+ {product.availableColors.length - 3} more</span>
                        )}
                    </div>
                )}
            </div>
        </Link>
    );
};

const FilterGroup = ({ title, filters, onFilterChange, filterType, appliedFilters }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-6 border-b pb-4">

            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <X className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? '' : 'rotate-45'}`} />
            </div>
            {isOpen && (
                <div className="mt-3 space-y-2">
                    {filters.map((filter) => (
                        <div key={filter.value} className="flex items-center">
                            <input
                                id={`filter-${title}-${filter.value}`}
                                type="checkbox"
                                className="form-checkbox h-5 w-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                value={filter.value}
                                checked={appliedFilters[filterType]?.includes(filter.value)}
                                onChange={(e) => onFilterChange(filterType, filter.value, e.target.checked)}
                            />
                            <label htmlFor={`filter-${title}-${filter.value}`} className="ml-3 text-sm text-gray-700">
                                {filter.label || filter.value}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ColorFilterGroup = ({ title, colors, onFilterChange, filterType, appliedFilters }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="mb-6 border-b pb-4">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <X className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isOpen ? '' : 'rotate-45'}`} />
            </div>
            {isOpen && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {colors.map((colorInfo) => (
                        <button
                            key={colorInfo.value}
                            className={`w-8 h-8 rounded-full shadow-sm cursor-pointer focus:outline-none ${appliedFilters[filterType]?.includes(colorInfo.value) ? 'ring-2 ring-indigo-500' : ''}`}
                            style={{ backgroundColor: colorInfo.value }}
                            title={colorInfo.label}
                            onClick={() => onFilterChange(filterType, colorInfo.value, !appliedFilters[filterType]?.includes(colorInfo.value))}
                        ></button>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProductFilterListing = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    const categories = useSelector(selectAllCategories);
    const categoriesError = useSelector(selectCategoriesError);

    const products = useSelector(selectAllProducts);
    const productsError = useSelector(selectProductsError);

    const [filters, setFilters] = useState(() => {
        return {
            categories: searchParams.getAll('categories') || [],
            colors: searchParams.getAll('colors') || [],
            sizes: searchParams.getAll('sizes') || [],
            brands: searchParams.getAll('brands') || [],
        };
    });

    const [uniqueFilterValues, setUniqueFilterValues] = useState({
        colors: [],
        sizes: [],
        brands: [],
    });

    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchProducts());
    }, [dispatch]);

    useEffect(() => {
        if (products && products.length > 0) {
            const colors = [
                ...new Set(products.flatMap((p) => p.availableColors?.map((c) => c.color) || []).filter(Boolean)),
            ].map((color) => ({ value: color, label: color }));
            const sizes = [
                ...new Set(products.flatMap((p) => p.availableColors?.flatMap((ac) => ac.sizes) || []).filter(Boolean)),
            ].map((size) => ({ value: size, label: size }));
            const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))].map((brand) => ({
                value: brand,
                label: brand,
            }));

            setUniqueFilterValues({ colors, sizes, brands });
        }
    }, [products]);

    const updateURL = useCallback(() => {
        const newParams = new URLSearchParams();
        if (filters.categories.length > 0) {
            const selectedCategoryNames = categories
                .filter((cat) => filters.categories.includes(cat._id))
                .map((cat) => cat.name.toLowerCase().replace(/\s+/g, '-'));
            selectedCategoryNames.forEach((catName) => newParams.append('categories', catName));
        }
        if (filters.colors.length > 0) {
            filters.colors.forEach((color) => newParams.append('colors', color));
        }
        if (filters.sizes.length > 0) {
            filters.sizes.forEach((size) => newParams.append('sizes', size));
        }
        if (filters.brands.length > 0) {
            filters.brands.forEach((brand) => newParams.append('brands', brand));
        }
        setSearchParams(newParams, { replace: true });
    }, [filters, categories, setSearchParams]);

    useEffect(() => {
        const initialFilters = {
            categories: [],
            colors: [],
            sizes: [],
            brands: [],
        };

        searchParams.forEach((value, key) => {
            if (key === 'categories') {
                const categoryIds = categories
                    .filter((cat) => value === cat.name.toLowerCase().replace(/\s+/g, '-'))
                    .map((cat) => cat._id);
                initialFilters.categories.push(...categoryIds);
            } else if (['colors', 'sizes', 'brands'].includes(key)) {
                initialFilters[key].push(value);
            }
        });
        setFilters(initialFilters);
    }, [searchParams, categories]);

    useEffect(() => {
        updateURL();
    }, [filters, updateURL]);

    const handleCheckboxChange = (filterType, value, checked) => {
        setFilters((prevFilters) => {
            const updatedValues = checked
                ? [...prevFilters[filterType], value]
                : prevFilters[filterType].filter((v) => v !== value);
            return {
                ...prevFilters,
                [filterType]: updatedValues,
            };
        });
    };

    const handleClearFilters = () => {
        setFilters({
            categories: [],
            colors: [],
            sizes: [],
            brands: [],
        });
    };

    const handleApplyMobileFilters = () => {
        setIsMobileFiltersOpen(false);
    };

    const filteredProducts = products.filter((product) => {
        const categoryMatch =
            filters.categories.length === 0 || filters.categories.includes(product.category?._id);
        const colorMatch =
            filters.colors.length === 0 ||
            product.availableColors?.some((c) => filters.colors.includes(c.color));
        const sizeMatch =
            filters.sizes.length === 0 ||
            product.availableColors?.some((ac) => ac.sizes?.some((s) => filters.sizes.includes(s)));
        const brandMatch = filters.brands.length === 0 || filters.brands.includes(product.brand);

        return categoryMatch && colorMatch && sizeMatch && brandMatch;
    });

    return (
        <div className="bg-gray-100 mt-20 pb-10">
            <Banner position={'product_category_sidebar'} />
           
            <div className="w-[100vw] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Mobile Filter Button */}
                <div className="lg:hidden fixed top-20 left-0 right-0     p-4 z-50 flex justify-end items-center">
                    <button
                        onClick={() => setIsMobileFiltersOpen(true)}
                        className="bg-indigo-600 text-white py-2 px-4 rounded-md focus:outline-none"
                    >
                        <Filter className="h-5 w-5 mr-2 inline-block" /> Filters
                    </button>
                    {Object.values(filters).flat().filter(Boolean).length > 0 && (
                        <button
                            onClick={handleClearFilters}
                            className="text-sm text-gray-500 hover:text-indigo-600 focus:outline-none flex items-center"
                        >
                            <RotateCw className="h-4 w-4 mr-1" /> Clear All
                        </button>
                    )}
                </div>

                {/* Filter Section (Left Part) - Visible on larger screens, conditionally rendered on mobile */}
                <aside
                    className={`col-span-1 bg-white rounded-lg shadow-md p-6 sticky top-24 h-fit lg:block ${
                        isMobileFiltersOpen ? 'fixed top-0 left-0 h-full w-full z-50 overflow-y-auto bg-white' : 'hidden'
                    }`}
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Filters</h2>
                        <button
                            onClick={() => setIsMobileFiltersOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        {(Object.values(filters).flat().filter(Boolean).length > 0) && (
                            <button
                                onClick={handleClearFilters}
                                className="hidden lg:flex text-sm text-gray-500 hover:text-indigo-600 focus:outline-none items-center"
                            >
                                <RotateCw className="h-4 w-4 mr-1" /> Clear All
                            </button>
                        )}
                    </div>
                    <FilterGroup
                        title="Categories"
                        filters={[{ value: '', label: 'All Categories' }, ...(categories || []).map((cat) => ({
                            value: cat._id,
                            label: cat.name,
                        }))]}
                        onFilterChange={handleCheckboxChange}
                        filterType="categories"
                        appliedFilters={filters}
                    />
                    {uniqueFilterValues.colors.length > 0 && (
                        <ColorFilterGroup
                            title="Colors"
                            colors={uniqueFilterValues.colors}
                            onFilterChange={handleCheckboxChange}
                            filterType="colors"
                            appliedFilters={filters}
                        />
                    )}
                    {uniqueFilterValues.sizes.length > 0 && (
                        <FilterGroup
                            title="Sizes"
                            filters={uniqueFilterValues.sizes}
                            onFilterChange={handleCheckboxChange}
                            filterType="sizes"
                            appliedFilters={filters}
                        />
                    )}
                    {uniqueFilterValues.brands.length > 0 && (
                        <FilterGroup
                            title="Brands"
                            filters={uniqueFilterValues.brands}
                            onFilterChange={handleCheckboxChange}
                            filterType="brands"
                            appliedFilters={filters}
                        />
                    )}

                    {/* Apply Button for Mobile */}
                    {isMobileFiltersOpen && (
                        <button
                            onClick={handleApplyMobileFilters}
                            className="lg:hidden bg-indigo-600 text-white py-3 px-6 rounded-md w-full focus:outline-none mt-6"
                        >
                            Apply Filters
                        </button>
                    )}
                </aside>

                {/* Product Listing (Main Part) */}
                <main className="col-span-1 w-full lg:col-span-3">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">
                            {filteredProducts.length > 0 ? `${filteredProducts.length} Products Found` : 'Products'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full text-center py-8">
                                <p className="text-gray-600">No products found matching your filters.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProductFilterListing;