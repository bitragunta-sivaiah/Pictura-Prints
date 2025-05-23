import React, { useEffect, useRef } from 'react';
import {
    X,
    ClipboardList,
    DollarSign,
    MapPin,
    Calendar,
    User,
    Phone,
    Mail,
    Package,
    ShoppingCart,
    Info,
    Truck,
    Clock,
    Tag,
    Wallet,
    Home,
} from 'lucide-react';

const OrderDetailModal = ({ isOpen, closeModal, order }) => {
    const modalRef = useRef(null);

    // Close modal when clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                closeModal();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, closeModal]);

    // Close modal when Escape key is pressed
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape') {
                closeModal();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isOpen, closeModal]);

    if (!isOpen || !order) return null; // Don't render if not open or no order data

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' && typeof amount !== 'string') return 'N/A';
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(numAmount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Invalid Date';
        }
    };

    const getTrackingStatus = (trackingDetails) => {
        if (!trackingDetails || trackingDetails.length === 0) return 'No Tracking Info';
        return trackingDetails[trackingDetails.length - 1].status.replace(/_/g, ' ');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 animate-fade-in">
            <div ref={modalRef} className="relative w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl animate-scale-in">
                <div className="border-b pb-4 mb-4 flex items-center justify-between">
                    <h3 className="text-2xl font-bold leading-6 text-gray-900 flex items-center">
                        <ClipboardList className="w-7 h-7 mr-3 text-indigo-600" />
                        Order Details: <span className="ml-2 text-indigo-700">{order.orderNumber}</span>
                    </h3>
                    <button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 p-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                        onClick={closeModal}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="max-h-[70vh] overflow-y-auto pr-2 space-y-6 text-gray-700 custom-scrollbar">
                    {/* Order Summary */}
                    <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                        <h4 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                            <ShoppingCart className="w-5 h-5 mr-2" /> Order Summary
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <p className="flex items-center"><DollarSign className="w-4 h-4 mr-2 text-green-600" /> <strong>Total Amount:</strong> {formatCurrency(order.total)}</p>
                            <p className="flex items-center"><Wallet className="w-4 h-4 mr-2 text-purple-600" /> <strong>Payment Method:</strong> <span className="capitalize">{order.paymentMethod}</span></p>
                            <p className="flex items-center"><Info className="w-4 h-4 mr-2 text-yellow-600" /> <strong>Payment Status:</strong> <span className="capitalize">{order.paymentStatus}</span></p>
                            <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-600" /> <strong>Order Date:</strong> {formatDate(order.orderDate)}</p>
                            <p className="flex items-center"><Truck className="w-4 h-4 mr-2 text-red-600" /> <strong>Current Tracking Status:</strong> <span className="capitalize">{getTrackingStatus(order.trackingDetails)}</span></p>
                        </div>
                    </div>

                    {/* User Details */}
                    {order.user && (
                        <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                            <h4 className="text-lg font-semibold text-green-800 mb-2 flex items-center">
                                <User className="w-5 h-5 mr-2" /> Customer Details
                            </h4>
                            <p className="flex items-center"><User className="w-4 h-4 mr-2 text-gray-600" /> <strong>Name:</strong> {order.user.username}</p>
                            <p className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-600" /> <strong>Email:</strong> {order.user.email}</p>
                            <p className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-600" /> <strong>Phone:</strong> {order.user.phoneNumber}</p>
                        </div>
                    )}

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-orange-50 p-4 rounded-lg shadow-sm">
                            <h4 className="text-lg font-semibold text-orange-800 mb-2 flex items-center">
                                <MapPin className="w-5 h-5 mr-2" /> Delivery Address
                            </h4>
                            <p className="flex items-start">
                                <Home className="w-4 h-4 mt-1 mr-2 text-gray-600 flex-shrink-0" />
                                {order.shippingAddress.fullName}<br />
                                {order.shippingAddress.streetAddress}, {order.shippingAddress.apartmentSuiteUnit && `${order.shippingAddress.apartmentSuiteUnit}, `}<br />
                                {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}<br />
                                {order.shippingAddress.country}
                                {order.shippingAddress.notes && <span className="block text-sm text-gray-500 italic mt-1">Notes: {order.shippingAddress.notes}</span>}
                            </p>
                            {order.shippingAddress.phone && <p className="flex items-center mt-2"><Phone className="w-4 h-4 mr-2 text-gray-600" /> <strong>Contact:</strong> {order.shippingAddress.phone}</p>}
                        </div>
                    )}

                    {/* Items Ordered */}
                    {order.items && order.items.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                            <h4 className="text-lg font-semibold text-purple-800 mb-2 flex items-center">
                                <Package className="w-5 h-5 mr-2" /> Items
                            </h4>
                            <ul className="divide-y divide-purple-200">
                                {order.items.map((item, index) => (
                                    <li key={item._id || index} className="py-2 flex justify-between items-center text-sm">
                                        <div>
                                            {/* Assuming productName comes from the populated product field */}
                                            <p className="font-medium">{item.product?.name || 'Product Name Missing'} (Qty: {item.quantity})</p>
                                            <p className="text-gray-600">Price: {formatCurrency(item.basePrice)} each</p>
                                            {item.color && <p className="text-gray-500">Color: <span style={{ backgroundColor: item.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #ccc', verticalAlign: 'middle' }}></span> {item.color}</p>}
                                            {item.size && <p className="text-gray-500">Size: {item.size}</p>}
                                        </div>
                                        <span className="font-semibold">{formatCurrency(item.finalPrice)}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Delivery Assignment Details */}
                    {order.deliveryAssignment && (
                        <div className="bg-cyan-50 p-4 rounded-lg shadow-sm">
                            <h4 className="text-lg font-semibold text-cyan-800 mb-2 flex items-center">
                                <Truck className="w-5 h-5 mr-2" /> Delivery Assignment
                            </h4>
                            <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-600" /> <strong>Assigned At:</strong> {formatDate(order.deliveryAssignment.assignedAt)}</p>
                            <p className="flex items-center"><Info className="w-4 h-4 mr-2 text-gray-600" /> <strong>Assignment Status:</strong> <span className="capitalize">{order.deliveryAssignment.status}</span></p>
                            {order.deliveryAssignment.responseAt && (
                                <p className="flex items-center"><Clock className="w-4 h-4 mr-2 text-gray-600" /> <strong>Response At:</strong> {formatDate(order.deliveryAssignment.responseAt)}</p>
                            )}
                        </div>
                    )}

                    
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;