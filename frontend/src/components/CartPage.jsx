import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchCart,
    updateCartItem,
    removeCartItem,
    selectCartItems,
    selectCartLoading,
    selectCartError,
    selectCartItemCount,
} from '../store/cartSlice';
import { deleteCustomization as deleteCustomizationAction } from '../store/customizationslice';  
import { Trash2, Plus, Minus, Image as ImageIcon, X, CheckSquare, Square } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Modern Loader Component (without framer-motion)
const Loader = () => (
    <div className="flex justify-center items-center py-16">
        <div
            className="w-10 h-10 rounded-full border-4 border-dashed border-indigo-500 animate-spin"
            style={{ borderColor: '#6366f1 transparent #6366f1 transparent' }}
        />
    </div>
);

// Modern Message Component (without framer-motion)
const Message = ({ variant = 'info', children }) => {
    const variantStyles = useMemo(() => {
        const base = 'p-4 rounded-md shadow-sm mb-4';
        switch (variant) {
            case 'danger':
                return `${base} bg-red-50 text-red-700 border border-red-200`;
            case 'success':
                return `${base} bg-green-50 text-green-700 border border-green-200`;
            case 'warning':
                return `${base} bg-yellow-50 text-yellow-700 border border-yellow-200`;
            default:
                return `${base} bg-blue-50 text-blue-700 border border-blue-200`;
        }
    }, [variant]);

    return (
        <div className={variantStyles}>
            {children}
        </div>
    );
};

// Modern Cart Item Component (without framer-motion)
const CartItem = React.memo(({ item, onQuantityChange, onRemoveItem, onToggleCustomizationDetails, openImageModal, expandedItems, isItemSelected, onSelectItem, loadingItem, onDeleteCustomization }) => {
    const navigate = useNavigate();
    const handleNavigate = useCallback((productId) => {
        navigate(`/product/${productId}`);
    }, [navigate]);

    const calculateItemBasePrice = useMemo(() => {
        const basePrice = item.productId?.basePrice || 0;
        const selectedColorData = item.productId?.availableColors?.find(colorData => colorData.color === item.color);
        const colorPrice = selectedColorData?.price || 0;
        return basePrice + colorPrice;
    }, [item.productId?.basePrice, item.productId?.availableColors, item.color]);

    const calculateItemCustomizationPrice = useMemo(() => {
        let customizationPrice = 0;
        if (item.customizationId) {
            ['front', 'back', 'leftSleeve', 'rightSleeve'].forEach(area => {
                let areaCustomizationPrice = 0;
                let hasCustomizationInArea = false;
                item.customizationId[area]?.forEach(customization => {
                    const printingPrice = item.productId?.availableColors?.find(colorData => colorData.color === item.color)?.printingPrices?.[area] || 0;
                    if (customization.url || customization.text) {
                        hasCustomizationInArea = true;
                    }
                    // We only add the printing price if there's any customization in that area
                    if (hasCustomizationInArea && printingPrice > areaCustomizationPrice) {
                        areaCustomizationPrice = printingPrice;
                    }
                });
                customizationPrice += areaCustomizationPrice;
            });
        }
        return customizationPrice;
    }, [item.customizationId, item.productId?.availableColors, item.color]);

    const calculateItemTotalPrice = useMemo(() => {
        return calculateItemBasePrice + calculateItemCustomizationPrice;
    }, [calculateItemBasePrice, calculateItemCustomizationPrice]);

    // Find the selected color object based on item.color
    const selectedColor = useMemo(() => {
        return item.productId?.availableColors?.find(colorData => colorData.color === item.color);
    }, [item.productId?.availableColors, item.color]);

    return (
        <li
            key={item._id}
            className="bg-white shadow-md overflow-hidden  flex flex-row items-center py-4 px-4 md:px-6"
        >
            <button
                onClick={() => onSelectItem(item._id)}
                className="mr-4 focus:outline-none"
            >
                {isItemSelected ? <CheckSquare className="h-5 w-5 text-indigo-500" /> : <Square className="h-5 w-5 text-gray-400" />}
            </button>
            <div className="md:w-32 md:h-32 w-20 h-20 rounded-md overflow-hidden flex-shrink-0 mr-4 relative">
                {selectedColor?.images?.front && (
                    <div
                        className="absolute top-0 left-0 w-full h-full cursor-pointer hover:scale-105 transition-transform duration-200"
                        onClick={() => openImageModal(selectedColor.images.front)}
                    >
                        <img
                            className="h-full w-full object-cover"
                            src={selectedColor.images.front}
                            alt={item.productId?.name || 'Product Image'}
                        />
                    </div>
                )}
            </div>
            <div className="flex-grow flex flex-col justify-between min-w-0">
                <div>
                    <div className="flex md:flex-row flex-col justify-between items-start mb-2">
                        <div className="min-w-0">
                            <h6
                                className="text-md md:text-lg font-semibold text-gray-800 cursor-pointer hover:text-indigo-600 transition-colors duration-200 truncate"
                                onClick={() => handleNavigate(item.productId?._id)}
                            >
                                {item.productId ? item.productId.name : 'N/A'}
                            </h6>
                            <p className="text-xs text-gray-500 truncate">{item.productId?.brand}</p>
                            {selectedColor?.color && (
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                    <span className="mr-2">Color:</span>
                                    <div
                                        className="w-3 h-3 rounded-full shadow border border-gray-300"
                                        style={{ backgroundColor: selectedColor.color }}
                                        title={`Color: ${selectedColor.color}`}
                                    />
                                </div>
                            )}
                            {item.size && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Size: {item.size}
                                </p>
                            )}
                            {item.customizationId ? (
                                <button
                                    onClick={() => onToggleCustomizationDetails(item._id)}
                                    className="text-xs text-indigo-500 font-medium mt-1 focus:outline-none hover:underline"
                                >
                                    {expandedItems[item._id] ? 'Hide Details' : 'View Customization'}
                                </button>
                            ) : (
                                !item.color && <p className="text-xs text-gray-500 mt-1">Standard</p>
                            )}
                        </div>
                        <button
                            onClick={() => onRemoveItem(item._id)}
                            className="text-gray-400 hover:text-red-500 focus:outline-none ml-2"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                    {item.customizationId && (
                        <div
                            className={`mt-2 pt-2 border-t border-gray-200 overflow-hidden ${expandedItems[item._id] ? 'block' : 'hidden'}`}
                        >
                            <h6 className="text-xs font-semibold text-gray-700 mb-1">Customization:</h6>
                            <div className="grid grid-cols-1 gap-1 text-xs text-gray-600">
                                {['front', 'back', 'leftSleeve', 'rightSleeve'].map(area => (
                                    item.customizationId[area]?.length > 0 && (
                                        <div key={area}>
                                            <p className="font-medium capitalize">{area}:</p>
                                            <ul className="list-disc pl-4">
                                                {item.customizationId[area].map((customization, index) => (
                                                    <li key={index} className="leading-relaxed">
                                                        <div className="flex items-center space-x-1 flex-wrap gap-1">
                                                            {customization.url && (
                                                                <div className="flex items-center space-x-0.5">
                                                                    <ImageIcon className="h-3 w-3 text-gray-500" />
                                                                    <button
                                                                        onClick={() => openImageModal(customization.url)}
                                                                        className="h-10 w-10 border-1 rounded-sm overflow-hidden shadow focus:outline-none cursor-pointer transition-transform duration-200"
                                                                    >
                                                                        <img src={customization.url} alt="Custom" className="h-full w-full object-cover" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                            {customization.text && <span>Text: <span className="font-semibold">{customization.text}</span></span>}
                                                            {customization.color && <span>Color: <span className={`inline-block w-2 h-2 rounded-full align-middle border border-gray-300`} style={{ backgroundColor: customization.color }}></span> {customization.color}</span>}
                                                            {customization.fontFamily && <span>Font: <span className="font-semibold">{customization.fontFamily}</span></span>}
                                                            {customization.fontSize && <span>Size: <span className="font-semibold">{customization.fontSize}</span></span>}
                                                            {customization.fontWeight && <span>Weight: <span className="font-semibold">{customization.fontWeight}</span></span>}
                                                            {customization.position && customization.position.x !== undefined && customization.position.y !== undefined && (
                                                                <span>Pos: <span className="font-semibold">x:{parseFloat(customization.position.x).toFixed(2)}, y:{parseFloat(customization.position.y).toFixed(2)}</span></span>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    if (item.customizationId?.userId) {
                                        onDeleteCustomization(item.productId._id, item.customizationId.userId);
                                    } else {
                                        toast.error('User information not available for deleting customization.');
                                        console.warn('No userId found in customization for item:', item);
                                    }
                                }}
                                className="mt-2 text-red-500 hover:text-red-700 focus:outline-none text-xs"
                                disabled={!item.customizationId?.userId} // Optionally disable if no userId in customization
                            >
                                Delete Customization
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex items-center justify-between mt-2">
                    <div>
                        <p className="text-xs text-gray-600">₹{calculateItemBasePrice.toFixed(2)} {calculateItemCustomizationPrice > 0 && <span className="text-indigo-500">(+₹{calculateItemCustomizationPrice.toFixed(2)})</span>} <span className="text-gray-400">x {item.quantity}</span></p>
                        <p className="font-semibold text-gray-800 text-sm">₹{(calculateItemTotalPrice * item.quantity).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden">
                        <button
                            onClick={() => onQuantityChange(item._id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || loadingItem === item._id}
                            className={`px-2 py-1 text-gray-600 hover:text-gray-800 focus:outline-none disabled:opacity-50 ${loadingItem === item._id ? 'cursor-wait' : ''}`}
                        >
                            <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-gray-700 font-medium px-2 text-sm">{item.quantity}</span>
                        <button
                            onClick={() => onQuantityChange(item._id, item.quantity + 1)}
                            disabled={loadingItem === item._id}
                            className={`px-2 py-1 text-gray-600 hover:text-gray-800 focus:outline-none ${loadingItem === item._id ? 'cursor-wait' : ''}`}
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
});

const CartPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const cartItems = useSelector(selectCartItems, shallowEqual);
    const loading = useSelector(selectCartLoading);
    const error = useSelector(selectCartError);
    const itemCount = useSelector(selectCartItemCount);
    const [expandedItems, setExpandedItems] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loadingItem, setLoadingItem] = useState(null); // To track loading state of individual items

    // Initialize all items as selected
    useEffect(() => {
        setSelectedItems(cartItems.map(item => item._id));
    }, [cartItems]);

    const calculateTotalPrice = useMemo(() => {
        return cartItems.reduce((total, item) => {
            if (selectedItems.includes(item._id)) {
                const basePrice = item.productId?.basePrice || 0;
                const selectedColorData = item.productId?.availableColors?.find(colorData => colorData.color === item.color);
                const colorPrice = selectedColorData?.price || 0;
                let customizationPrice = 0;

                if (item.customizationId) {
                    ['front', 'back', 'leftSleeve', 'rightSleeve'].forEach(area => {
                        let areaCustomizationPrice = 0;
                        let hasCustomizationInArea = false;
                        item.customizationId[area]?.forEach(customization => {
                            const printingPrice = item.productId?.availableColors?.find(colorData => colorData.color === item.color)?.printingPrices?.[area] || 0;
                            if (customization.url || customization.text) {
                                hasCustomizationInArea = true;
                            }
                            if (hasCustomizationInArea && printingPrice > areaCustomizationPrice) {
                                areaCustomizationPrice = printingPrice;
                            }
                        });
                        customizationPrice += areaCustomizationPrice;
                    });
                }
                return total + (basePrice + colorPrice + customizationPrice) * item.quantity;
            }
            return total;
        }, 0);
    }, [cartItems, selectedItems]); // Ensure cartItems is in the dependency array

    const selectedItemCount = useMemo(() => {
        return selectedItems.length;
    }, [selectedItems]);

    useEffect(() => {
        dispatch(fetchCart());
    }, [dispatch]);

    const handleQuantityChange = useCallback(async (itemId, quantity) => {
        if (quantity >= 1) {
            setLoadingItem(itemId);
            const resultAction = await dispatch(updateCartItem({ itemId, quantity }));
            setLoadingItem(null);
            if (updateCartItem.fulfilled.match(resultAction)) {
                // **Force a page reload on successful update**
                window.location.reload();
            } else if (updateCartItem.rejected.match(resultAction)) {
                toast.error('Failed to update quantity.');
                // Optionally, you might still want to refresh the cart data without a full reload
                // dispatch(fetchCart());
            }
        }
    }, [dispatch]);

    const handleRemoveItem = useCallback(async (itemId) => {
        setLoadingItem(itemId);
        const resultAction = await dispatch(removeCartItem(itemId));
        setLoadingItem(null);
        if (removeCartItem.fulfilled.match(resultAction)) {
            setSelectedItems(prev => prev.filter(id => id !== itemId));
            toast.success('Item removed from cart!');
            // **Force a page reload on successful removal**
            window.location.reload();
        } else if (removeCartItem.rejected.match(resultAction)) {
            toast.error('Failed to remove item.');
            // Optionally, you might still want to refresh the cart data without a full reload
            // dispatch(fetchCart());
        }
    }, [dispatch]);

    const handleSelectItem = useCallback((itemId) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    }, []);

    const handleSelectAll = useCallback(() => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item._id));
        }
    }, [cartItems, selectedItems.length]);

    const handleCheckout = useCallback(() => {
        const itemsToOrder = cartItems.filter(item => selectedItems.includes(item._id));
        if (itemsToOrder.length > 0) {
            // Pass the selected items to the next page (you might need to adjust your routing and state management)
            navigate('/place-order', { state: { selectedCartItems: itemsToOrder } });
        } else {
            toast.error('Please select items to proceed to checkout.');
        }
    }, [navigate, cartItems, selectedItems]);

    const toggleCustomizationDetails = useCallback((itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    }, []);

    const openImageModal = useCallback((imageUrl) => {
        setSelectedImage(imageUrl);
        document.body.classList.add('overflow-hidden');
    }, []);

    const closeImageModal = useCallback(() => {
        setSelectedImage(null);
        document.body.classList.remove('overflow-hidden');
    }, []);

    const memoizedCartItems = useMemo(() => cartItems, [cartItems]);

    const handleDeleteCustomization = useCallback(async (productId, userId) => {
        setLoadingItem(cartItems.find(item => item.productId._id === productId)?._id);
        const resultAction = await dispatch(deleteCustomizationAction({ productId, userId }));
        setLoadingItem(null);
        if (deleteCustomizationAction.fulfilled.match(resultAction)) {
            toast.success('Customization deleted for this item.');
            dispatch(fetchCart()); // Refresh the cart to reflect the changes
        } else if (deleteCustomizationAction.rejected.match(resultAction)) {
            toast.error('Failed to delete customization.');
        }
    }, [dispatch, cartItems]);

    if (loading === 'loading') {
        return <Loader />;
    }

    if (error) {
        return <Message variant="danger">{error}</Message>;
    }

    return (
        <div className="bg-gray-100 py-8 sm:py-12 mt-20 lg:py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-6 sm:mb-8">
                    Shopping Cart
                </h1>

                {loading === 'loading' ? (
                    <Loader />
                ) : memoizedCartItems.length === 0 ? (
                    <div className="py-8 text-center">
                        <p className="text-md sm:text-lg text-gray-600 mb-4">Your cart is currently empty.</p>
                        <button
                            onClick={() => navigate('/products')}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow overflow-hidden rounded-md">
                                <ul className="divide-y divide-gray-200">
                                    <li className="px-4 py-2 sm:px-6 flex items-center">
                                        <button
                                            onClick={handleSelectAll}
                                            className="focus:outline-none mr-2 sm:mr-4"
                                        >
                                            {selectedItems.length === cartItems.length ? (
                                                <CheckSquare className="h-4 w-4 sm:h-5 sm:w-5 text-indigo-500" />
                                            ) : (
                                                <Square className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                            )}
                                        </button>
                                        <span className="font-semibold text-gray-800 text-sm sm:text-base">Select All</span>
                                        {selectedItems.length > 0 && (
                                            <span className="ml-auto text-xs sm:text-sm text-gray-500">({selectedItems.length} selected)</span>
                                        )}
                                    </li>
                                    {memoizedCartItems.map((item) => (
                                        <CartItem
                                            key={item._id}
                                            item={item}
                                            onQuantityChange={handleQuantityChange}
                                            onRemoveItem={handleRemoveItem}
                                            onToggleCustomizationDetails={toggleCustomizationDetails}
                                            openImageModal={openImageModal}
                                            expandedItems={expandedItems}
                                            isItemSelected={selectedItems.includes(item._id)}
                                            onSelectItem={handleSelectItem}
                                            loadingItem={loadingItem === item._id}
                                            onDeleteCustomization={handleDeleteCustomization} // Pass the delete customization handler
                                        />
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="sticky top-20">
                            <div className="bg-white shadow overflow-hidden rounded-md px-4 py-4 sm:px-6 sm:py-6">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Summary</h2>
                                <div className="flex justify-between text-gray-600 mb-1 sm:mb-2 text-sm">
                                    <span>Subtotal ({selectedItemCount} items):</span>
                                    <span className="font-medium text-gray-800">₹{calculateTotalPrice.toFixed(2)}</span>
                                </div>
                                <div className="mb-3 sm:mb-4">
                                    {cartItems.filter(item => selectedItems.includes(item._id)).map(item => (
                                        <div key={item._id} className="py-1 text-xs text-gray-500 border-t border-gray-200">
                                            <p className="font-semibold text-gray-700 truncate">{item.productId?.name}</p>
                                            {item.color && <p className="text-xxs">Color: {item.color}</p>}
                                            {item.size && <p className="text-xxs">Size: {item.size}</p>}
                                            <p className="text-xxs">Qty: {item.quantity}</p>
                                            <p className="text-xs text-gray-600">₹{(calculateTotalPriceForItem(item)).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                                    <div className="flex justify-between text-gray-700 font-semibold text-lg mb-3 sm:mb-4">
                                        <span>Total:</span>
                                        <span>₹{calculateTotalPrice.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={handleCheckout}
                                        disabled={selectedItems.length === 0}
                                        className="w-full inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            {selectedImage && (
                <div
                    className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-75 z-50 flex justify-center items-center"
                    onClick={closeImageModal} // Close on background click
                >
                    <div
                        className="relative bg-white rounded-lg shadow-lg overflow-hidden max-w-lg max-h-screen"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
                    >
                        <button
                            onClick={closeImageModal}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <img
                            src={selectedImage}
                            alt="Customization Preview"
                            className="block w-full"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper function to calculate total price for a single item
const calculateTotalPriceForItem = (item) => {
    const basePrice = item.productId?.basePrice || 0;
    const selectedColorData = item.productId?.availableColors?.find(colorData => colorData.color === item.color);
    const colorPrice = selectedColorData?.price || 0;
    let customizationPrice = 0;

    if (item.customizationId) {
        ['front', 'back', 'leftSleeve', 'rightSleeve'].forEach(area => {
            let areaCustomizationPrice = 0;
            let hasCustomizationInArea = false;
            item.customizationId[area]?.forEach(customization => {
                const printingPrice = item.productId?.availableColors?.find(colorData => colorData.color === item.color)?.printingPrices?.[area] || 0;
                if (customization.url || customization.text) {
                    hasCustomizationInArea = true;
                }
                if (hasCustomizationInArea && printingPrice > areaCustomizationPrice) {
                    areaCustomizationPrice = printingPrice;
                }
            });
            customizationPrice += areaCustomizationPrice;
        });
    }
    return (basePrice + colorPrice + customizationPrice) * item.quantity;
};

export default CartPage;