import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
    selectCartTotalPrice,
    selectCartLoading,
    selectCartError,
    removeCartItem,
} from "../store/cartSlice";
import { createOrder, resetOrder } from "../store/orderSlice";
import {
    fetchAddresses,
    deleteAddress,
    selectAddresses,
    selectAddressLoading,
    selectAddressError,
    clearAddress as clearAddressState,
} from "../store/addressSlice";
import AddressForm from "../components/AddressForm";
import { toast } from "react-hot-toast";
import {
    ShoppingCart,
    MapPin,
    Loader2,
    Plus,
    Trash,
    Edit,
    CheckCircle,
    DollarSign,
    Phone,
} from "lucide-react";
import { FaCcPaypal } from "react-icons/fa";

const PlaceOrder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Retrieve selected cart items from the location state
    const selectedCartItems = location.state?.selectedCartItems || [];

    // Selectors for cart state
    const cartTotalPrice = useSelector(selectCartTotalPrice);
    const cartLoading = useSelector(selectCartLoading);
    const cartError = useSelector(selectCartError);

    // Selectors for address state
    const addresses = useSelector(selectAddresses);
    const addressLoading = useSelector(selectAddressLoading);
    const addressError = useSelector(selectAddressError);

    // Selector for order state
    const {
        order,
        loading: orderLoading,
        error: orderError,
        success: orderSuccess,
    } = useSelector((state) => state.order);

    // Local state management
    const [step, setStep] = useState(1);
    const [selectedShippingAddress, setSelectedShippingAddress] = useState(null);
    const [selectedBillingAddress, setSelectedBillingAddress] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [localTotalPrice, setLocalTotalPrice] = useState(0);

    // Fetch addresses on component mount
    useEffect(() => {
        dispatch(fetchAddresses());
    }, [dispatch]);

    // Handle order placement success
    useEffect(() => {
        if (orderSuccess && order) {
            toast.success("Order placed successfully!");
            // Remove only the ordered items from the cart
            selectedCartItems.forEach(item => {
                dispatch(removeCartItem(item._id));
            });
            dispatch(resetOrder());
            dispatch(clearAddressState());
            if (paymentMethod === "paypal" && order?.approveUrl) {
                window.location.href = order.approveUrl;
            } else {
                navigate(`/sucessorder/${order._id}`);
            }
        }
    }, [order, orderSuccess, navigate, dispatch, paymentMethod, selectedCartItems]);

    // Calculate the local total price based on selected cart items
    useEffect(() => {
        const total = selectedCartItems.reduce((sum, item) => {
            let basePrice = item.productId?.basePrice || 0;
            let customizationPrice = 0;
            let colorPrice = 0;

            if (item.customizationId) {
                ["front", "back", "leftSleeve", "rightSleeve"].forEach((area) => {
                    let hasCustomizationInArea = false;
                    const customizationsInArea = item.customizationId[area];
                    if (Array.isArray(customizationsInArea)) {
                        customizationsInArea.forEach((customization) => {
                            if (customization.url || customization.text) {
                                hasCustomizationInArea = true;
                            }
                        });
                        if (hasCustomizationInArea) {
                            customizationPrice +=
                                item.productId?.availableColors?.find(
                                    (c) => c.color === item.color
                                )?.printingPrices?.[area] || 0;
                        }
                    }
                });
            }

            const selectedColorData = item.productId?.availableColors?.find(
                (colorData) => colorData.color === item.color
            );
            colorPrice = selectedColorData?.price || 0;

            return (
                sum + (basePrice + customizationPrice + colorPrice) * item.quantity
            );
        }, 0);
        setLocalTotalPrice(total);
    }, [selectedCartItems]);


    // Navigation handlers for checkout steps
    const handleNext = () => {
        setStep(step + 1);
    };

    const handlePrevious = () => {
        setStep(step - 1);
    };

    // Address selection handlers
    const handleSelectShippingAddress = (address) => {
        setSelectedShippingAddress(address);
    };

    const handleSelectBillingAddress = (address) => {
        setSelectedBillingAddress(address);
    };

    // Payment method selection handler
    const handlePaymentMethodChange = (e) => {
        setPaymentMethod(e.target.value);
    };

    // Address form visibility handlers
    const handleShowAddressForm = (editId = null) => {
        setEditingAddressId(editId);
        setShowAddressForm(true);
    };

    const handleCloseAddressForm = () => {
        setShowAddressForm(false);
        setEditingAddressId(null);
    };

    // Handler for successful address form submission
    const handleAddressFormSuccess = () => {
        setShowAddressForm(false);
        setEditingAddressId(null);
        dispatch(fetchAddresses());
        toast.success(editingAddressId ? "Address updated successfully!" : "Address added successfully!");
    };

    // Handler for deleting an address
    const handleDeleteAddress = (addressIdToDelete) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            dispatch(deleteAddress(addressIdToDelete));
            toast.success("Address deleted successfully!");
        }
    };

    // Handler for removing an item from the order summary
    const handleRemoveItem = (itemId) => {
        dispatch(removeCartItem(itemId));
        // Optionally, you might want to update the localTotalPrice here
        // or it will be recalculated in the useEffect hook.
    };

    // Handler for placing the order
    const handlePlaceOrder = useCallback(() => {
        if (!selectedShippingAddress) {
            toast.error("Please select a shipping address.");
            return;
        }
        if (!selectedBillingAddress) {
            toast.error("Please select a billing address.");
            return;
        }

        const orderItems = selectedCartItems.map((item) => ({
            product: item.productId._id,
            quantity: item.quantity,
            basePrice: item.productId.basePrice,
            finalPrice:
                (item.productId.basePrice || 0) +
                (item.productId?.availableColors?.find(
                    (c) => c.color === item.color
                )?.price || 0) +
                (item.customizationId
                    ? Object.keys(item.customizationId).reduce((totalCustomizationPrice, area) => {
                        const customizationsInArea = item.customizationId[area];
                        const hasCustomizationInArea = Array.isArray(customizationsInArea) && customizationsInArea.some(
                            (customization) => customization.url || customization.text
                        );
                        return hasCustomizationInArea
                            ? totalCustomizationPrice +
                            (item.productId?.availableColors?.find(
                                (c) => c.color === item.color
                            )?.printingPrices?.[area] || 0)
                            : totalCustomizationPrice;
                    }, 0)
                    : 0),
            color: item.color,
            size: item.size,
            customizations: item.customizationId,
        }));

        const orderData = {
            items: orderItems,
            shippingAddress: selectedShippingAddress._id,
            billingAddress: selectedBillingAddress._id,
            paymentMethod: paymentMethod,
            shippingCost: 0,
            total: localTotalPrice,
        };

        dispatch(createOrder(orderData));
    }, [
        dispatch,
        selectedCartItems,
        selectedShippingAddress,
        selectedBillingAddress,
        paymentMethod,
        localTotalPrice,
    ]);

    // PayPal button component (mock implementation)
    const PayPalButton = () => (
        <button
            onClick={() => toast.error("PayPal integration will be implemented here.")}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={orderLoading}
        >
            {orderLoading ? (
                <Loader2 className="animate-spin" />
            ) : (
                <FaCcPaypal className="h-5 w-5 inline-block mr-2" />
            )}{" "}
            Proceed with PayPal
        </button>
    );

    return (
        <div className="container mx-auto mt-20 p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
                <ShoppingCart className="text-blue-500" /> Secure Checkout
            </h1>

            {/* Order Summary Step */}
            <div className="mb-8">
                <div className="flex items-center text-gray-500 mb-2">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 1 ? "bg-blue-500 text-white" : "border border-gray-300"
                        }`}
                    >
                        {step > 1 ? <CheckCircle className="h-5 w-5" /> : "1"}
                    </div>
                    <div
                        className={`ml-4 font-semibold ${step >= 1 ? "text-blue-500" : ""}`}
                    >
                        Order Summary
                    </div>
                    {step > 1 && (
                        <hr className="flex-grow border-t border-gray-300 ml-4" />
                    )}
                </div>

                {step === 1 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Review Your Order
                        </h2>
                        {selectedCartItems.length > 0 ? (
                            <ul className="space-y-4">
                                {selectedCartItems.map((item) => {
                                    const selectedColorData = item.productId?.availableColors?.find(
                                        (c) => c.color === item.color
                                    );
                                    const colorPrice = selectedColorData?.price || 0;
                                    const customizationPriceForItem = item.customizationId
                                        ? Object.keys(item.customizationId).reduce(
                                            (totalCustomizationPrice, area) => {
                                                const customizationsInArea = item.customizationId[area];
                                                const hasCustomizationInArea = Array.isArray(customizationsInArea) && customizationsInArea.some(
                                                    (customization) =>
                                                        customization.url || customization.text
                                                );
                                                return hasCustomizationInArea
                                                    ? totalCustomizationPrice +
                                                    (item.productId?.availableColors?.find(
                                                        (c) => c.color === item.color
                                                    )?.printingPrices?.[area] || 0)
                                                    : totalCustomizationPrice;
                                            },
                                            0
                                        )
                                        : 0;
                                    return (
                                        <li
                                            key={item._id}
                                            className="flex items-center justify-between border-b pb-2"
                                        >
                                            <div className="flex items-center">
                                                {selectedColorData?.images?.front && (
                                                    <div className="w-20 h-20 rounded-md overflow-hidden mr-4 shadow-sm">
                                                        <img
                                                            src={selectedColorData.images.front}
                                                            alt={item.productId?.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <h6 className="font-semibold text-gray-800">
                                                        {item.productId?.name || "N/A"}
                                                    </h6>
                                                    <p className="text-sm text-gray-600">
                                                        <div className="flex items-center gap-1">
                                                            <p>Color: </p><div
                                                                className="ml-2 w-4 h-4 rounded-full shadow border border-gray-300"
                                                                style={{ backgroundColor: selectedColorData?.color }}
                                                                title={`Color: ${selectedColorData?.color}`}
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {item.size && ` Size: ${item.size}`}
                                                        </div>
                                                    </p>
                                                    {item.customizationId && (
                                                        <p className="text-xs text-gray-500 italic">
                                                            Customized
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-gray-700">
                                                {item.quantity} x (₹{(item.productId?.basePrice || 0).toFixed(2)}
                                                {colorPrice > 0 && ` + ₹${colorPrice.toFixed(2)}`}
                                                {customizationPriceForItem > 0 && ` + ₹${customizationPriceForItem.toFixed(2)}`})
                                            </div>
                                            {/* <button
                                                onClick={() => handleRemoveItem(item._id)}
                                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                            >
                                                <Trash className="h-4 w-4 inline-block" />
                                            </button> */}
                                        </li>
                                    );
                                })}
                                <li className="flex items-center justify-between font-semibold text-gray-800 py-2">
                                    <span>Subtotal:</span>
                                    <span>₹{localTotalPrice.toFixed(2)}</span>
                                </li>
                                {/* Add shipping cost and final total display here if applicable */}
                                <button
                                    onClick={handleNext}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-4"
                                >
                                    Proceed to Address
                                </button>
                            </ul>
                        ) : (
                            <p className="text-gray-600">Your order summary is empty.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Shipping & Billing Address Step */}
            <div className="mb-8">
                <div className="flex items-center text-gray-500 mb-2">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 2 ? "bg-blue-500 text-white" : "border border-gray-300"
                        }`}
                    >
                        {step > 2 ? <CheckCircle className="h-5 w-5" /> : "2"}
                    </div>
                    <div
                        className={`ml-4 font-semibold ${step >= 2 ? "text-blue-500" : ""}`}
                    >
                        Shipping & Billing Address
                    </div>
                    {step > 2 && (
                        <hr className="flex-grow border-t border-gray-300 ml-4" />
                    )}
                    {step === 2 && (
                        <button
                            onClick={() => handleShowAddressForm()}
                            className="ml-4 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded focus:outline-none focus:shadow-outline text-sm"
                        >
                            <Plus className="h-4 w-4 inline-block mr-1" /> Add New Address
                        </button>
                    )}
                </div>

                {step === 2 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Select Shipping & Billing Addresses
                        </h2>
                        {addressLoading ? (
                            <div className="flex justify-center">
                                <Loader2 className="animate-spin" />
                            </div>
                        ) : addressError ? (
                            <p className="text-red-500">{addressError}</p>
                        ) : addresses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Shipping Address Selection */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">
                                        Shipping Address
                                    </h3>
                                    {addresses.map((address) => (
                                        <div
                                            key={`shipping-${address._id}`}
                                            className={`border rounded-md p-4 mb-2 cursor-pointer ${
                                                selectedShippingAddress?._id === address._id
                                                    ? "border-blue-500 shadow-md"
                                                    : "border-gray-300 hover:shadow-sm"
                                            }`}
                                            onClick={() => handleSelectShippingAddress(address)}
                                        >
                                            <p className="font-semibold text-gray-800">
                                                {address.fullName}
                                            </p>
                                            <p className="text-gray-600">
                                                {address.streetAddress}, {address.apartmentSuiteUnit}
                                            </p>
                                            <p className="text-gray-600">
                                                {address.city}, {address.state} {address.postalCode},{" "}
                                                {address.country}
                                            </p>
                                            <p className="text-gray-600">
                                                <Phone className="h-4 w-4 inline-block mr-1" />{" "}
                                                {address.phone}
                                            </p>
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShowAddressForm(address._id);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-800 mr-2 text-sm"
                                                >
                                                    <Edit className="h-4 w-4 inline-block" /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAddress(address._id);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    <Trash className="h-4 w-4 inline-block" /> Delete
                                                </button>
                                            </div>
                                            {selectedShippingAddress?._id === address._id && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Billing Address Selection */}
                                <div>
                                    <h3 className="font-semibold text-gray-700 mb-2">
                                        Billing Address
                                    </h3>
                                    {addresses.map((address) => (
                                        <div
                                            key={`billing-${address._id}`}
                                            className={`border rounded-md p-4 mb-2 cursor-pointer ${
                                                selectedBillingAddress?._id === address._id
                                                    ? "border-blue-500 shadow-md"
                                                    : "border-gray-300 hover:shadow-sm"
                                            }`}
                                            onClick={() => handleSelectBillingAddress(address)}
                                        >
                                            <p className="font-semibold text-gray-800">
                                                {address.fullName}
                                            </p>
                                            <p className="text-gray-600">
                                                {address.streetAddress}, {address.apartmentSuiteUnit}
                                            </p>
                                            <p className="text-gray-600">
                                                {address.city}, {address.state} {address.postalCode},{" "}
                                                {address.country}
                                            </p>
                                            <p className="text-gray-600">
                                                <Phone className="h-4 w-4 inline-block mr-1" />{" "}
                                                {address.phone}
                                            </p>
                                            <div className="flex justify-end mt-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleShowAddressForm(address._id);
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-800 mr-2 text-sm"
                                                >
                                                    <Edit className="h-4 w-4 inline-block" /> Edit
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteAddress(address._id);
                                                    }}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    <Trash className="h-4 w-4 inline-block" /> Delete
                                                </button>
                                            </div>
                                            {selectedBillingAddress?._id === address._id && (
                                                <div className="absolute top-2 right-2">
                                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-600">No addresses found. Please add an address.</p>
                        )}

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handlePrevious}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Back to Summary
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={!selectedShippingAddress || !selectedBillingAddress}
                                className={`bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                    !selectedShippingAddress || !selectedBillingAddress
                                        ? "opacity-50 cursor-not-allowed"
                                        : ""
                                }`}
                            >
                                Proceed to Payment
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Payment Method Step */}
            <div>
                <div className="flex items-center text-gray-500 mb-2">
                    <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            step >= 3 ? "bg-blue-500 text-white" : "border border-gray-300"
                        }`}
                    >
                        {step > 3 ? <CheckCircle className="h-5 w-5" /> : "3"}
                    </div>
                    <div
                        className={`ml-4 font-semibold ${step >= 3 ? "text-blue-500" : ""}`}
                    >
                        Payment Method
                    </div>
                </div>

                {step === 3 && (
                    <div>
                        <h2 className="text-xl font-semibold mb-4 text-gray-700">
                            Choose Your Payment Method
                        </h2>
                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-5 w-5 text-blue-600"
                                    value="cod"
                                    checked={paymentMethod === "cod"}
                                    onChange={handlePaymentMethodChange}
                                />
                                <span className="ml-2 text-gray-700">Cash on Delivery (COD)</span>
                            </label>
                        </div>
                        <div className="mb-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    className="form-radio h-5 w-5 text-blue-600"
                                    value="paypal"
                                    checked={paymentMethod === "paypal"}
                                    onChange={handlePaymentMethodChange}
                                />
                                <span className="ml-2 text-gray-700 flex items-center">
                                    <FaCcPaypal className="h-5 w-5 mr-2" /> PayPal
                                </span>
                            </label>
                        </div>

                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handlePrevious}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Back to Address
                            </button>
                            <button
                                onClick={handlePlaceOrder}
                                disabled={orderLoading}
                                className={`bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                    orderLoading ? "opacity-50 cursor-not-allowed" : ""
                                }`}
                            >
                                {orderLoading ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        <DollarSign className="h-4 w-4 inline-block mr-1" />{" "}
                                        Place Order - ₹{localTotalPrice.toFixed(2)}
                                    </>
                                )}
                            </button>
                            {paymentMethod === "paypal" && !orderLoading && (
                                <div className="ml-4">
                                    {/* Mock PayPal Button */}
                                    <PayPalButton />
                                </div>
                            )}
                        </div>
                        {orderError && (
                            <p className="text-red-500 mt-4">Error placing order: {orderError}</p>
                        )}
                        {cartError && (
                            <p className="text-red-500 mt-4">Error in cart operations: {cartError}</p>
                        )}
                    </div>
                )}
            </div>

            {/* Address Form Modal */}
            {showAddressForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4 text-gray-800">
                            {editingAddressId ? "Edit Address" : "Add New Address"}
                        </h2>
                        <AddressForm
                            onSuccess={handleAddressFormSuccess}
                            onCancel={handleCloseAddressForm}
                            editingAddressId={editingAddressId}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlaceOrder;