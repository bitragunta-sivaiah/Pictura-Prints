import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMyDeliveryProfile,
    fetchMyActiveOrdersToday,
    fetchMyDeliveredOrders,
    selectDeliveryPartnerLoading,
    selectDeliveryPartnerError,
    selectMyDeliveryProfile,
    selectMyActiveOrdersToday,
    selectMyDeliveredOrders,
    clearError
} from '../../store/deliveryPartnerSlice'; // Adjust path to your slice

import {
    Package,
    Loader2,
    XCircle,
    ShoppingCart,
    Clock,
    CheckCircle,
    Truck,
    MapPin,
    DollarSign,
    Calendar,
    User,
    ClipboardList,
    AlertCircle,
    Eye,
    Tag,
    Receipt,
    RefreshCcw,
    Euro,
    ClipboardX,
    ArrowLeftRight,
    Car,
    Award
} from 'lucide-react';
import { toast } from 'react-hot-toast'; // Import toast for user feedback

// Helper for status icons
const OrderStatusIcon = ({ status }) => {
    switch (status) {
        case 'pending': return <Clock className="text-yellow-500" size={18} />;
        case 'processing': return <ShoppingCart className="text-blue-500" size={18} />;
        case 'assigned': return <Truck className="text-indigo-500" size={18} />;
        case 'out_for_delivery': return <Truck className="text-purple-500" size={18} />;
        case 'delivered': return <CheckCircle className="text-green-500" size={18} />;
        case 'cancelled': return <XCircle className="text-red-500" size={18} />;
        case 'returned':
        case 'return_completed':
        case 'return_requested':
        case 'return_processing':
        case 'pending_pickup':
        case 'picked_up':
        case 'delivered_to_warehouse':
            return <RefreshCcw className="text-orange-500" size={18} />;
        case 'refund_initiated':
        case 'refunded':
            return <Euro className="text-emerald-500" size={18} />;
        case 'accepted': // For delivery assignment status
        case 'picked_up':
            return <Car className="text-green-600" size={18} />;
        default: return <ClipboardList className="text-gray-500" size={18} />;
    }
};

// Helper for status styling
const getStatusClasses = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'assigned':
        case 'accepted': // Added for accepted assignment
        case 'assigned_for_shipping': return 'bg-indigo-100 text-indigo-800';
        case 'out_for_delivery':
        case 'in_transit': return 'bg-purple-100 text-purple-800';
        case 'delivered': return 'bg-green-100 text-green-800';
        case 'picked_up': return 'bg-teal-100 text-teal-800'; // Specific for picked up
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'return_completed':
        case 'return_requested':
        case 'return_processing':
        case 'pending_pickup':
        case 'picked_up':
        case 'delivered_to_warehouse':
            return 'bg-orange-100 text-orange-800';
        case 'refund_initiated':
        case 'refunded':
            return 'bg-emerald-100 text-emerald-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const formatAddress = (address) => {
    if (!address) return 'N/A';
    const parts = [
        address.streetAddress,
        address.apartmentSuiteUnit,
        address.city,
        address.postalCode,
        address.state,
        address.country
    ].filter(Boolean);
    return parts.join(', ');
};

// OrderDetailModal component (modified to remove status update functionality)
const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all scale-100 opacity-100">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">Order Details: {order.orderNumber}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    {/* Order Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-700">
                        <p className="flex items-center">
                            <Tag className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Order ID:</span> {order._id}
                        </p>
                        <p className="flex items-center">
                            <Calendar className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Order Date:</span> {new Date(order.orderDate || order.createdAt).toLocaleString()}
                        </p>
                        <p className="flex items-center">
                            <Clock className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Current Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusClasses(order.status)}`}>
                                {order.status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                            </span>
                        </p>
                        <p className="flex items-center">
                            <User className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Customer:</span> {order.user?.username || 'N/A'}
                        </p>
                        <p className="flex items-center">
                            <Truck className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Delivery Partner:</span> {order.deliveryPartner?.user?.username || 'Not Assigned'}
                        </p>
                        <p className="flex items-center">
                            <DollarSign className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Total Amount:</span> ${order.total?.toFixed(2) || '0.00'} {/* Changed from totalAmount to total */}
                        </p>
                        <p className="flex items-center">
                            <Receipt className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Payment Status:</span> {order.paymentStatus || 'N/A'}
                        </p>
                        <p className="flex items-center">
                            <ClipboardList className="mr-2 text-gray-500" size={16} />
                            <span className="font-medium">Order Type:</span> {order.orderType || 'N/A'}
                        </p>
                    </div>

                    {/* Shipping Address */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                            <MapPin className="mr-2" size={20} /> Shipping Address
                        </h3>
                        <p className="text-sm text-gray-700">
                            {formatAddress(order.shippingAddress)}
                        </p>
                    </div>

                    {/* Order Items */}
                    <div className="border rounded-lg p-4 bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                            <Package className="mr-2" size={20} /> Order Items
                        </h3>
                        {order.items && order.items.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {order.items.map((item, index) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product?.name || item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.finalPrice?.toFixed(2)}</td> {/* Changed from item.price to item.finalPrice */}
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${(item.quantity * item.finalPrice)?.toFixed(2)}</td> {/* Changed from item.price to item.finalPrice */}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No items found for this order.</p>
                        )}
                    </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
 
const DeliveryPartnerOrders = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);
    const myProfile = useSelector(selectMyDeliveryProfile);
    const activeOrdersToday = useSelector(selectMyActiveOrdersToday);
    const deliveredOrders = useSelector(selectMyDeliveredOrders);

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        dispatch(fetchMyDeliveryProfile());
        dispatch(fetchMyActiveOrdersToday());
        dispatch(fetchMyDeliveredOrders());

        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    if (loading && !myProfile && activeOrdersToday.length === 0 && deliveredOrders.length === 0) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin text-indigo-600" size={48} />
                <p className="ml-4 text-lg text-gray-700">Loading orders...</p>
            </div>
        );
    }
 

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center flex items-center justify-center">
                <Truck className="mr-3 text-indigo-600" size={36} /> Your Deliveries
            </h1>

            {loading && (
                <div className="flex items-center justify-center text-indigo-600 mb-4">
                    <Loader2 className="animate-spin mr-2" size={24} /> Fetching orders...
                </div>
            )}

            {/* Active Orders Today */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <Clock className="mr-2 text-blue-600" size={24} /> Active Orders Today ({activeOrdersToday.length})
                </h2>
                {activeOrdersToday && activeOrdersToday.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Address</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {activeOrdersToday.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.user?.username || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{formatAddress(order.shippingAddress)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                                                <OrderStatusIcon status={order.status} />
                                                <span className="ml-1">{order.status?.replace(/_/g, ' ').toUpperCase()}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDetails(order)}
                                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-3 py-1 border border-indigo-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <Eye className="mr-1" size={16} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No active orders assigned for today.</p>
                )}
            </div>

            {/* Delivered Orders */}
            <div className="bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                    <Award className="mr-2 text-green-600" size={24} /> Delivered Orders ({deliveredOrders.length})
                </h2>
                {deliveredOrders && deliveredOrders.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Address</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {deliveredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.user?.username || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">{formatAddress(order.shippingAddress)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(order.status)}`}>
                                                <OrderStatusIcon status={order.status} />
                                                <span className="ml-1">{order.status?.replace(/_/g, ' ').toUpperCase()}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleViewDetails(order)}
                                                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center px-3 py-1 border border-indigo-300 rounded-md shadow-sm text-sm font-medium bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <Eye className="mr-1" size={16} /> View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-600 text-center py-4">No delivered orders found.</p>
                )}
            </div>

            {isModalOpen && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
};

export default DeliveryPartnerOrders;