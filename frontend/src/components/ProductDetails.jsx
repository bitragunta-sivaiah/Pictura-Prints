import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchProductById,
    fetchSimilarProducts, // Import the new thunk
    resetProduct,
    selectProductDetails, // Use the more consistent selector name
    selectProductsLoading,
    selectProductsError,
    selectSimilarProducts, // Import the similar products selector
    selectFetchSimilarProductsLoading, // Import loading state for similar products
    selectFetchSimilarProductsError, // Import error state for similar products
    clearProductDetails,
    clearSimilarProducts, // Import the action to clear similar products
} from '../store/productSlice'; // Adjust path as needed

import { addStandardProduct } from '../store/cartSlice';

import { Loader2, AlertCircle, Settings, Star, XCircle, Check } from 'lucide-react';
import ProductCustomDesign from '../components/CustomProductDesign';
 

const ProductDetailsPage = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const product = useSelector(selectProductDetails); // Changed to selectProductDetails
    const loading = useSelector(selectProductsLoading); // This loading refers to the main product fetch
    const error = useSelector(selectProductsError); // This error refers to the main product fetch

    const similarProducts = useSelector(selectSimilarProducts); // Select similar products
    const similarProductsLoading = useSelector(selectFetchSimilarProductsLoading); // Select similar products loading state
    const similarProductsError = useSelector(selectFetchSimilarProductsError); // Select similar products error state

    const { user } = useSelector((state) => state.auth); // Assuming user info is in auth slice

    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mainImage, setMainImage] = useState(null);
    const [addToCartMessage, setAddToCartMessage] = useState(null);
    const [isCustomizing, setIsCustomizing] = useState(false);
    const [customizationDetails, setCustomizationDetails] = useState({});
    const imageInterval = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [autoChangeActive, setAutoChangeActive] = useState(false);

    // State for image viewer
    const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
    const [viewerImage, setViewerImage] = useState(null);

    useEffect(() => {
        console.log('ProductDetailsPage: Fetching product with ID:', productId);
        dispatch(fetchProductById(productId))
            .unwrap()
            .then(() => {
                console.log('ProductDetailsPage: Product fetched successfully');
                // Dispatch fetchSimilarProducts after the main product is fetched
                dispatch(fetchSimilarProducts(productId));
            })
            .catch((err) => console.error('ProductDetailsPage: Error fetching product:', err));

        return () => {
            console.log('ProductDetailsPage: Resetting product state');
            dispatch(resetProduct());
            dispatch(clearProductDetails());
            dispatch(clearSimilarProducts()); // Clear similar products on unmount
            clearInterval(imageInterval.current);
        };
    }, [dispatch, productId]);

    useEffect(() => {
        console.log('ProductDetailsPage: Updating local state based on product data');
        if (product) {
            if (product.availableColors && product.availableColors.length > 0) {
                const initialColor = product.availableColors[0];
                setSelectedColor(initialColor);
                setSelectedSize(initialColor.sizes[0] || null);
                setMainImage(initialColor.images?.front);
                setAutoChangeActive(true);
            } else if (product.generatedImage) {
                setMainImage(product.generatedImage.front?.url || null);
                setAutoChangeActive(false);
            } else {
                setMainImage(null);
                setAutoChangeActive(false);
            }
        }
    }, [product]);

    useEffect(() => {
        clearInterval(imageInterval.current);

        if (selectedColor?.images && autoChangeActive) {
            const images = [
                selectedColor.images.front,
                selectedColor.images.back,
                selectedColor.images.leftSleeve,
                selectedColor.images.rightSleeve,
                ...(selectedColor.images.additional || []),
            ].filter(Boolean);

            if (images.length > 0) {
                setMainImage(images[currentImageIndex]);

                imageInterval.current = setInterval(() => {
                    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
                }, 3000);
            } else {
                setMainImage(null);
            }
        } else {
            clearInterval(imageInterval.current);
        }

        return () => clearInterval(imageInterval.current);
    }, [selectedColor, autoChangeActive, currentImageIndex]);

    const handleColorSelect = (color) => {
        console.log('ProductDetailsPage: Selected color:', color);
        setSelectedColor(color);
        setSelectedSize(color.sizes[0] || null);
        setCurrentImageIndex(0);
        setMainImage(color.images?.front);
        setAutoChangeActive(true);
    };

    const handleSizeSelect = (size) => {
        console.log('ProductDetailsPage: Selected size:', size);
        setSelectedSize(size);
    };

    const handleQuantityChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setQuantity(isNaN(value) || value < 1 ? 1 : value);
    };

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login?redirect=' + window.location.pathname);
            return;
        }

        if (product && selectedColor && selectedSize) {
            dispatch(
                addStandardProduct({
                    productId: product._id,
                    quantity: quantity,
                    color: selectedColor.color,
                    size: selectedSize,
                })
            );
            setAddToCartMessage('Product added to cart!');
            setTimeout(() => setAddToCartMessage(null), 3000);
        } else {
            setAddToCartMessage('Please select a color and size.');
            setTimeout(() => setAddToCartMessage(null), 3000);
        }
    };

    const handleCustomizeClick = () => {
        console.log('ProductDetailsPage: Customize button clicked');
        setIsCustomizing(true);
        clearInterval(imageInterval.current);
        setAutoChangeActive(false);
    };

    const handleCustomizeClose = () => {
        console.log('ProductDetailsPage: Customize close button clicked');
        setIsCustomizing(false);
        setAutoChangeActive(true);
    };

    const handleImageClick = (imgSrc) => {
        setMainImage(imgSrc);
        clearInterval(imageInterval.current);
        setAutoChangeActive(false);
        const clickedIndex = allImages.indexOf(imgSrc);
        if (clickedIndex !== -1) {
            setCurrentImageIndex(clickedIndex);
        }
    };

    // Function to open image viewer
    const openImageViewer = (imgSrc) => {
        setViewerImage(imgSrc);
        setIsImageViewerOpen(true);
    };

    // Function to close image viewer
    const closeImageViewer = () => {
        setViewerImage(null);
        setIsImageViewerOpen(false);
    };

    const handleCustomizationChange = (details) => {
        console.log('ProductDetailsPage: Customization details updated:', details);
        setCustomizationDetails(details);
    };

    // Helper to render star rating
    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

        return (
            <div className="flex items-center">
                {[...Array(fullStars)].map((_, i) => (
                    <Star key={`full-${i}`} size={16} fill="currentColor" className="text-yellow-500" strokeWidth={0} />
                ))}
                {halfStar && <Star size={16} fill="currentColor" className="text-yellow-500" style={{ clipPath: 'inset(0 50% 0 0)' }} strokeWidth={0} />}
                {[...Array(emptyStars)].map((_, i) => (
                    <Star key={`empty-${i}`} size={16} fill="none" className="text-gray-300" strokeWidth={1} />
                ))}
            </div>
        );
    };

    // Calculate total average rating and number of reviews for the current product
    const calculateOverallProductRating = () => {
        if (!product || !product.feedback || product.feedback.length === 0) {
            return { average: 0, count: 0 };
        }

        let totalRatingSum = 0;
        let totalReviewCount = 0;

        product.feedback.forEach(feedbackItem => {
            if (feedbackItem.productFeedbacks && feedbackItem.productFeedbacks.length > 0) {
                feedbackItem.productFeedbacks.forEach(productFeedback => {
                    // Ensure the feedback is for the current product
                    if (productFeedback.product && productFeedback.product._id === productId) {
                        totalRatingSum += productFeedback.rating;
                        totalReviewCount++;
                    }
                });
            }
        });

        const average = totalReviewCount > 0 ? (totalRatingSum / totalReviewCount) : 0;
        return { average: parseFloat(average.toFixed(1)), count: totalReviewCount };
    };

    const { average: overallAverageRating, count: numberOfProductReviews } = calculateOverallProductRating();

    if (loading === 'pending') {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
            </div>
        );
    }

    if (error) {
        const errorMessage = (error && error.message) || 'An unknown error occurred.';
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">
                    <AlertCircle className="inline-block mr-2 w-6 h-6" />
                    Error loading product details or coupons. {errorMessage}
                </div>
            </div>
        );
    }
    if (!product) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-500">No product details found.</div>
            </div>
        );
    }


    const allImages = selectedColor?.images
        ? [
            selectedColor.images.front,
            selectedColor.images.back,
            selectedColor.images.leftSleeve,
            selectedColor.images.rightSleeve,
            ...(selectedColor.images.additional || []),
        ].filter(Boolean)
        : [];

    return (
        <div className="container mx-auto mt-10 py-8">
            <div className="bg-white rounded-lg   overflow-hidden"> {/* Added shadow-xl */}
                {!isCustomizing ? (
                    <div className="md:flex">
                        <div className="md:w-1/2 p-4 md:p-8 flex flex-col items-center justify-center"> {/* Added padding and centering */}
                            {mainImage ? (
                                <img
                                    src={mainImage}
                                    alt={product.name}
                                    className="w-full max-w-xl h-auto rounded-lg shadow cursor-pointer transition-transform duration-300 hover:scale-105" // Larger image, nicer hover effect
                                    onClick={() => openImageViewer(mainImage)}
                                />
                            ) : (
                                <div className="w-full max-w-lg h-64 bg-gray-100 flex justify-center items-center rounded-lg text-gray-500 text-lg">
                                    No Image Available
                                </div>
                            )}

                            <div className="w-full flex items-center max-md:pl-20 justify-center overflow-scroll">
                                {allImages.length > 0 && (
                                    <div className="mt-6 w-full flex justify-center items-center   gap-3"> {/* Increased gap */}
                                        {allImages.map((imgSrc, index) => (
                                            <img
                                                key={index}
                                                src={imgSrc}
                                                alt={`${product.name} - Thumbnail ${index + 1}`}
                                                className={`w-16 h-16 object-cover rounded-md cursor-pointer border-2 transition-all duration-200 ${ // Slightly larger thumbnails
                                                    mainImage === imgSrc ? 'border-indigo-600 shadow-md' : 'border-transparent hover:border-gray-300' // Better active state
                                                    }`}
                                                onClick={() => handleImageClick(imgSrc)}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="md:w-1/2 p-6">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-3">{product.name}</h2>
                            <p className="text-gray-700 mb-4 leading-relaxed">{product.description}</p>

                            {/* Overall Product Rating Box */}
                            <div className="mb-6 p-5 border border-gray-200 rounded-xl bg-white shadow-sm flex items-center justify-between transition-all duration-300 hover:shadow-md">
                                <div className="flex items-center">
                                    <Star size={28} fill="currentColor" className="text-yellow-500 mr-3" strokeWidth={0} />
                                    <span className="text-3xl font-extrabold text-gray-900">
                                        {overallAverageRating.toFixed(1)}
                                    </span>
                                    <span className="ml-2 text-lg text-gray-500">/ 5</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-gray-700 font-semibold mb-0.5">Average Rating</p>
                                    <p className="text-sm text-gray-500">Based on {numberOfProductReviews} reviews</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Available Colors</h3>
                                <div className="flex items-center gap-3"> {/* Use gap for spacing */}
                                    {product.availableColors &&
                                        product.availableColors.map((color) => (
                                            <div
                                                key={color._id}
                                                className={`relative w-7 h-7 rounded-full shadow-md cursor-pointer flex items-center justify-center transition-all duration-200 ${
                                                    selectedColor?._id === color._id ? 'ring-1 ring-indigo-500 scale-110' : 'ring-1 ring-gray-300'
                                                    }`}
                                                style={{ backgroundColor: color.color }}
                                                title={`Color: ${color.color}`}
                                                onClick={() => handleColorSelect(color)}
                                            >
                                                {selectedColor?._id === color._id && (
                                                    <Check className="w-5 h-5 text-white" /> // Add a checkmark for selected color
                                                )}
                                            </div>
                                        ))}
                                    {(!product.availableColors || product.availableColors.length === 0) && (
                                        <span className="text-gray-500">No colors available.</span>
                                    )}
                                </div>
                                {selectedColor?.sizes && selectedColor.sizes.length > 0 && (
                                    <div className="mt-4">
                                        <h4 className="   text-gray-800">Sizes:</h4>
                                        <div className="flex items-center mt-2 gap-2"> {/* Use gap for spacing */}
                                            {selectedColor.sizes.map((size) => (
                                                <p
                                                    key={size}
                                                    className={`inline-flex items-center justify-center  w-[80px] h-[30px]  py-2 rounded text-xs   cursor-pointer transition-all duration-200 ${
                                                        selectedSize === size ? 'bg-indigo-600 text-white shadow' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                        }`}
                                                    onClick={() => handleSizeSelect(size)}
                                                >
                                                    {size} ({selectedColor.stock} left)
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mb-4">
                                <h3 className="text-xl font-bold text-gray-800 mb-2">Price</h3>
                                <p className="text-3xl text-green-600 font-extrabold">₹{product.basePrice.toFixed(2)}</p>
                                {selectedColor && selectedColor.price !== 0 && ( // Changed from product.basePrice to 0 for additional charge logic
                                    <p className="text-sm text-gray-600 mt-1">Additional Price for selected color: ₹{selectedColor.price.toFixed(2)}</p>
                                )}
                            </div>

                            <div>
                                <div className="mb-4">
                                    <label htmlFor="quantity" className="block text-gray-800 text-sm font-bold mb-2">
                                        Quantity:
                                    </label>
                                    <input
                                        type="number"
                                        id="quantity"
                                        className="shadow appearance-none border rounded w-24 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        min="1"
                                        value={quantity}
                                        onChange={handleQuantityChange}
                                    />
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"> {/* Improved button layout */}
                                    <button
                                        onClick={handleCustomizeClick}
                                        className={`inline-flex items-center justify-center bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300  `}
                                    >
                                        <Settings className="w-5 h-5 mr-2" />
                                        Customize
                                    </button>
                                    <button
                                        className="inline-flex items-center justify-center bg-yellow-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-all duration-300"
                                        onClick={handleAddToCart}
                                        disabled={!selectedColor || !selectedSize}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                                {addToCartMessage && (
                                    <p className="mt-3 text-base font-medium text-green-600 animate-fade-in-down">{addToCartMessage}</p>
                                )}

                                <p className="mt-3 text-sm text-gray-500 italic">This is a standard product with no customization options.</p>

                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-6">
                        <ProductCustomDesign productId={productId} onCustomizationChange={handleCustomizationChange} />
                        <button
                            onClick={handleCustomizeClose}
                            className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
                        >
                            Back to Details
                        </button>

                        {addToCartMessage && isCustomizing && (
                            <p className="mt-2 text-sm text-green-500">{addToCartMessage}</p>
                        )}
                    </div>
                )}


                {/* Product Feedback Section */}
                <div className="mt-12 p-6 lg:p-8 bg-gray-50 rounded-b-lg">
                    <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8 heading">Customer Reviews</h2>

                    {numberOfProductReviews === 0 ? (
                        <p className="text-gray-600 text-lg text-center py-10">
                            Be the first to review this product!
                        </p>
                    ) : (
                        <div className="flex items-center flex-wrap gap-2">
                            {product.feedback.map((feedbackItem) => (
                                feedbackItem.productFeedbacks && feedbackItem.productFeedbacks.length > 0 &&
                                feedbackItem.productFeedbacks.map((productFeedback) => {
                                    // Only render feedback relevant to the current product
                                    if (productFeedback.product && productFeedback.product._id === productId) {
                                        return (
                                            <div key={productFeedback._id} className="border w-fit h-fit border-gray-200   rounded-xl shadow   ">
                                                <div className="flex items-center mb-4">
                                                    <img
                                                        src={feedbackItem.user?.avatar}
                                                        alt={feedbackItem.user?.username || 'User Avatar'}
                                                        className='w-12 h-12 rounded-full object-cover mr-4 border-2 border-indigo-200'
                                                    />
                                                    <div className="flex flex-col">
                                                        <div className="font-bold text-xs text-gray-800 mb-0.5">
                                                            {feedbackItem.user?.username || 'Anonymous User'}
                                                        </div>
                                                        {renderStars(productFeedback.rating)}
                                                        <span className="text-xs text-gray-600 mt-1">
                                                            ({productFeedback.rating.toFixed(1)} out of 5)
                                                        </span>
                                                    </div>
                                                </div>
                                                <p className="text-gray-700 text-base mb-4 leading-relaxed">{productFeedback.comment}</p>

                                                {productFeedback.aspects && productFeedback.aspects.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                        {productFeedback.aspects.map((aspect, idx) => (
                                                            <span key={idx} className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">
                                                                {aspect.replace(/_/g, ' ')} {/* Replace underscores for better display */}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}

                                                {productFeedback.media && productFeedback.media.length > 0 && (
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
                                                        {productFeedback.media.map((img, idx) => (
                                                            <img
                                                                key={idx}
                                                                src={img}
                                                                alt={`Review image ${idx + 1}`}
                                                                className="w-full h-24 object-cover rounded-lg cursor-pointer shadow-sm transition-transform duration-200 hover:scale-105 hover:shadow-md"
                                                                onClick={() => openImageViewer(img)}
                                                            />
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    }
                                    return null; // Don't render feedback for other products
                                })
                            ))}
                        </div>
                    )}
                </div>

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                    <div className="mt-12 p-6 lg:p-8 bg-gray-50 border-t border-gray-200">
                        <h2 className="text-2xl lg:text-3xl font-extrabold text-gray-900 mb-8 heading">Similar Products You Might Like</h2>
                        {similarProductsLoading === 'pending' && (
                            <div className="flex justify-center items-center py-8">
                                <Loader2 className="animate-spin w-8 h-8 text-indigo-600" />
                            </div>
                        )}
                        {similarProductsError && (
                            <div className="text-red-500 text-center py-8">
                                <AlertCircle className="inline-block mr-2 w-5 h-5" />
                                Failed to load similar products: {similarProductsError}
                            </div>
                        )}
                        {similarProductsLoading === 'succeeded' && similarProducts.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-2">
                                {similarProducts.map((simProduct) => (
                                    <div key={simProduct._id} className="bg-white rounded-lg shadow overflow-hidden  transition-shadow duration-300">
                                        <img
                                            src={simProduct.availableColors[0]?.images?.front || simProduct.generatedImage?.front?.url || 'https://via.placeholder.com/300'}
                                            alt={simProduct.name}
                                            className="w-full h-48 object-cover cursor-pointer"
                                            onClick={() => navigate(`/product/${simProduct._id}`)}
                                        />
                                        <div className="p-4">
                                            <p className="text-xs font-semibold text-gray-900 truncate mb-1">
                                                <button onClick={() => navigate(`/product/${simProduct._id}`)} className="hover:underline">
                                                    {simProduct.name}
                                                </button>
                                            </p>
                                            <p className="text-gray-700 text-sm mb-2">₹{simProduct.basePrice.toFixed(2)}</p>
                                            {/* You might want to add a quick "Add to Cart" or "View Details" button here */}
                                            <button
                                                onClick={() => navigate(`/product/${simProduct._id}`)}
                                                className="w-full bg-indigo-500 text-white py-2 rounded-md text-sm hover:bg-indigo-600 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {similarProductsLoading === 'succeeded' && similarProducts.length === 0 && (
                            <p className="text-gray-600 text-center py-8">No similar products found.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Image Viewer Modal */}
            {isImageViewerOpen && viewerImage && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50 p-4"
                    onClick={closeImageViewer}
                >
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                        <button
                            onClick={closeImageViewer}
                            className="absolute top-4 right-4 text-black text-3xl hover:text-gray-800 z-10"
                            aria-label="Close image viewer"
                        >
                            <XCircle size={36} />
                        </button>
                        <img src={viewerImage} alt="Product Viewer" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetailsPage;