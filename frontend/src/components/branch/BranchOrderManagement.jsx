import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getManagedBranch,
    getOrdersForBranch,
    selectBranchLoading,
    selectBranchError,
    selectManagedBranch,
    selectBranchOrders,
    clearOrders
} from '../../store/branchStationSlice'; // Adjust path

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
    Eye, // New: for view details icon
    Tag,
    Receipt,
    RefreshCcw,
    Euro,
    ClipboardX,
    ArrowLeftRight
} from 'lucide-react';

// Helper for status icons (can remain outside or inside for reuse)
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
        default: return <ClipboardList className="text-gray-500" size={18} />;
    }
};

// Helper for status styling (can remain outside or inside for reuse)
const getStatusClasses = (status) => {
    switch (status) {
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'processing': return 'bg-blue-100 text-blue-800';
        case 'assigned':
        case 'assigned_for_shipping': return 'bg-indigo-100 text-indigo-800';
        case 'out_for_delivery':
        case 'in_transit': return 'bg-purple-100 text-purple-800';
        case 'delivered': return 'bg-green-100 text-green-800';
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
    ].filter(Boolean); // Filter out null/undefined parts
    return parts.join(', ');
};


// OrderDetailModal component (defined within the same file for simplicity,
// but can be moved to its own file like `OrderDetailModal.jsx`)
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
                            <span className="font-medium">Customer:</span> {order.user?.username || 'N/A'} ({order.user?.email || 'N/A'})
                        </p>
                        {order.deliveryPartner && (
                            <p className="flex items-center">
                                <Truck className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Assigned Delivery Partner:</span> {order.deliveryPartner.username} ({order.deliveryPartner.email})
                            </p>
                        )}
                         {order.deliveryAssignment && order.deliveryAssignment.status && (
                            <p className="flex items-center">
                                <Truck className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Delivery Assignment Status:</span> {order.deliveryAssignment.status?.replace(/_/g, ' ').toUpperCase()}
                            </p>
                        )}
                        {order.deliveryOrderEarning > 0 && (
                             <p className="flex items-center">
                                <DollarSign className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Delivery Earning:</span> ${order.deliveryOrderEarning.toFixed(2)}
                            </p>
                        )}
                    </div>

                    {/* Financial Details */}
                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <DollarSign className="mr-2 text-indigo-600" size={20} />
                            Financial Overview
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <p className="flex items-center">
                                <Receipt className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Payment Method:</span> {order.paymentMethod?.toUpperCase() || 'N/A'}
                            </p>
                            <p className="flex items-center">
                                <CheckCircle className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Payment Status:</span> {order.paymentStatus?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                            </p>
                            <p className="flex items-center">
                                <DollarSign className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Subtotal:</span> ${order.subtotal?.toFixed(2) || '0.00'}
                            </p>
                            <p className="flex items-center">
                                <DollarSign className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Shipping Cost:</span> ${order.shippingCost?.toFixed(2) || '0.00'}
                            </p>
                            <p className="flex items-center">
                                <DollarSign className="mr-2 text-gray-500" size={16} />
                                <span className="font-medium">Tax:</span> ${order.tax?.toFixed(2) || '0.00'}
                            </p>
                            {order.discountAmount > 0 && (
                                <p className="flex items-center">
                                    <Tag className="mr-2 text-gray-500" size={16} />
                                    <span className="font-medium">Discount:</span> ${order.discountAmount?.toFixed(2) || '0.00'}
                                </p>
                            )}
                            <p className="flex items-center font-bold text-lg text-gray-900 col-span-full">
                                <DollarSign className="mr-2 text-indigo-600" size={20} />
                                <span className="font-medium">Total Amount:</span> ${order.total?.toFixed(2) || 'N/A'}
                            </p>
                             {order.codCollectedAmount > 0 && (
                                <p className="flex items-center">
                                    <DollarSign className="mr-2 text-gray-500" size={16} />
                                    <span className="font-medium">COD Collected:</span> ${order.codCollectedAmount.toFixed(2)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Addresses */}
                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <MapPin className="mr-2 text-indigo-600" size={20} />
                            Addresses
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">Shipping Address:</h4>
                                <p>{order.shippingAddress?.fullName || 'N/A'}</p>
                                <p>{formatAddress(order.shippingAddress)}</p>
                                <p>Phone: {order.shippingAddress?.phone || 'N/A'}</p>
                                {order.shippingAddress?.notes && <p>Notes: {order.shippingAddress.notes}</p>}
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-800 mb-1">Billing Address:</h4>
                                {/* Assuming billingAddress structure is similar to shippingAddress */}
                                <p>{order.billingAddress?.fullName || 'N/A'}</p>
                                <p>{formatAddress(order.billingAddress)}</p>
                                <p>Phone: {order.billingAddress?.phone || 'N/A'}</p>
                                {order.billingAddress?.notes && <p>Notes: {order.billingAddress.notes}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="border-t border-gray-200 pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <ShoppingCart className="mr-2 text-indigo-600" size={20} />
                            Order Items
                        </h3>
                        {order.items && order.items.length > 0 ? (
                            <ul className="space-y-3">
                                {order.items.map((item, idx) => (
                                    <li key={idx} className="border border-gray-100 p-3 rounded-md bg-white">
                                        <div className="flex justify-between items-center text-sm font-medium text-gray-900">
                                            <span>{item.product?.name || 'N/A'}</span>
                                            <span>x{item.quantity}</span>
                                            <span>${item.finalPrice?.toFixed(2) || item.basePrice?.toFixed(2) || 'N/A'}</span>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {item.color && <span className="mr-3">Color: {item.color}</span>}
                                            {item.size && <span className="mr-3">Size: {item.size}</span>}
                                            {item.customizations && item.customizations.length > 0 && (
                                                <span>Customizations: {item.customizations.map(c => c.name).join(', ')}</span>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-600">No items listed for this order.</p>
                        )}
                    </div>

                    {/* Return Details (if applicable) */}
                    {order.isReturnRequested && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <ArrowLeftRight className="mr-2 text-orange-600" size={20} />
                                Return & Refund Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                                <p className="flex items-center">
                                    <RefreshCcw className="mr-2 text-gray-500" size={16} />
                                    <span className="font-medium">Return Status:</span> {order.returnStatus?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                                </p>
                                <p className="flex items-center">
                                    <ClipboardX className="mr-2 text-gray-500" size={16} />
                                    <span className="font-medium">Return Reason:</span> {order.returnReason || 'N/A'}
                                </p>
                                {order.returnRequestDate && (
                                    <p className="flex items-center">
                                        <Calendar className="mr-2 text-gray-500" size={16} />
                                        <span className="font-medium">Return Requested On:</span> {new Date(order.returnRequestDate).toLocaleString()}
                                    </p>
                                )}
                                <p className="flex items-center">
                                    <Receipt className="mr-2 text-gray-500" size={16} />
                                    <span className="font-medium">Refund Status:</span> {order.refundStatus?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                                </p>
                                {order.refundStatus === 'refunded' && order.refundAmount > 0 && (
                                    <p className="flex items-center">
                                        <Euro className="mr-2 text-gray-500" size={16} />
                                        <span className="font-medium">Refund Amount:</span> ${order.refundAmount?.toFixed(2) || '0.00'}
                                    </p>
                                )}
                            </div>
                            {order.returnedItems && order.returnedItems.length > 0 && (
                                <div className="mt-4">
                                    <h5 className="text-sm font-semibold text-gray-700 mb-2">Returned Items:</h5>
                                    <ul className="list-disc list-inside text-xs text-gray-600">
                                        {order.returnedItems.map((item, idx) => (
                                            <li key={idx}>
                                                {item.product?.name || 'Unknown Product'} (x{item.quantity}) - Reason: {item.returnReason?.replace(/_/g, ' ') || 'N/A'}, Condition: {item.condition || 'N/A'}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tracking History */}
                    {order.trackingDetails && order.trackingDetails.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <Truck className="mr-2 text-indigo-600" size={20} />
                                Tracking History
                            </h3>
                            <div className="space-y-3">
                                {order.trackingDetails
                                    .slice() // create a shallow copy to avoid modifying the original array
                                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by date, newest first
                                    .map((tracking, idx) => (
                                    <div key={idx} className="flex items-start text-sm bg-gray-50 p-3 rounded-md shadow-sm">
                                        <div className="flex-shrink-0 mt-1">
                                            <OrderStatusIcon status={tracking.status} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium text-gray-900 capitalize">
                                                {tracking.status?.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-gray-600">
                                                <Calendar size={12} className="inline mr-1" />
                                                {new Date(tracking.date).toLocaleString()}
                                            </p>
                                            {tracking.location && (
                                                <p className="text-gray-600">
                                                    <MapPin size={12} className="inline mr-1" />
                                                    {tracking.location}
                                                </p>
                                            )}
                                            {tracking.notes && (
                                                <p className="text-gray-600 italic">"{tracking.notes}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                     {/* Return Tracking History (if applicable) */}
                    {order.isReturnRequested && order.returnTrackingDetails && order.returnTrackingDetails.length > 0 && (
                        <div className="border-t border-gray-200 pt-4">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                                <ArrowLeftRight className="mr-2 text-orange-600" size={20} />
                                Return Tracking History
                            </h3>
                            <div className="space-y-3">
                                {order.returnTrackingDetails
                                    .slice()
                                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                                    .map((tracking, idx) => (
                                    <div key={idx} className="flex items-start text-sm bg-gray-50 p-3 rounded-md shadow-sm">
                                        <div className="flex-shrink-0 mt-1">
                                            <OrderStatusIcon status={tracking.status} />
                                        </div>
                                        <div className="ml-3">
                                            <p className="font-medium text-gray-900 capitalize">
                                                {tracking.status?.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-gray-600">
                                                <Calendar size={12} className="inline mr-1" />
                                                {new Date(tracking.date).toLocaleString()}
                                            </p>
                                            {tracking.location && (
                                                <p className="text-gray-600">
                                                    <MapPin size={12} className="inline mr-1" />
                                                    {tracking.location}
                                                </p>
                                            )}
                                            {tracking.notes && (
                                                <p className="text-gray-600 italic">"{tracking.notes}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const BranchOrderManagement = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectBranchLoading);
    const error = useSelector(selectBranchError);
    const managedBranch = useSelector(selectManagedBranch);
    const orders = useSelector(selectBranchOrders);

    const [selectedOrder, setSelectedOrder] = useState(null); // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    useEffect(() => {
        if (!managedBranch) {
            dispatch(getManagedBranch());
        }
    }, [dispatch, managedBranch]);

    useEffect(() => {
        if (managedBranch?._id) {
            dispatch(getOrdersForBranch(managedBranch._id));
        }
        return () => {
            dispatch(clearOrders());
        };
    }, [dispatch, managedBranch]);

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    if (loading && !managedBranch && orders.length === 0) {
        return (
            <div className="flex justify-center items-center h-96 bg-white rounded-lg shadow-md p-6">
                <Loader2 className="animate-spin text-blue-500 mr-3" size={24} />
                <p className="text-lg text-gray-700">Loading branch details and orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col justify-center items-center h-96 bg-red-50 rounded-lg shadow-md p-6 border border-red-200">
                <XCircle className="text-red-600 mb-4" size={48} />
                <p className="text-xl text-red-700 font-semibold mb-2">Error Loading Orders</p>
                <p className="text-gray-600">{error}</p>
                <button
                    onClick={() => dispatch(getManagedBranch())}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (!managedBranch) {
        return (
            <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-md p-6">
                <AlertCircle className="text-yellow-600 mb-4" size={48} />
                <p className="text-xl text-yellow-700 font-semibold mb-2">No Branch Assigned</p>
                <p className="text-gray-600">You are not currently managing any branch station.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Package className="mr-3 text-indigo-600" size={32} />
                Orders for {managedBranch.name}
            </h2>

            {loading && orders.length === 0 && (
                <div className="flex justify-center items-center h-48">
                    <Loader2 className="animate-spin text-blue-500 mr-2" size={20} />
                    <p className="text-md text-gray-600">Fetching orders...</p>
                </div>
            )}

            {orders.length === 0 && !loading ? (
                <div className="text-center py-10 bg-gray-50 rounded-md">
                    <ClipboardList className="text-gray-400 mx-auto mb-4" size={64} />
                    <p className="text-xl text-gray-600 font-semibold">No Orders Found</p>
                    <p className="text-gray-500 mt-2">There are no orders to display for this branch currently.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Order Number</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Customer</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Amount</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Order Date</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Delivery Partner</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-indigo-700">
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
                                        >
                                            {order.orderNumber}
                                        </button>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">
                                        {order.user?.username || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">
                                        ${order.total?.toFixed(2) || 'N/A'}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center justify-center ${getStatusClasses(order.status)}`}>
                                            <OrderStatusIcon status={order.status} />
                                            <span className="ml-1">{order.status?.replace(/_/g, ' ').toUpperCase()}</span>
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">
                                        {new Date(order.orderDate || order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="py-3 px-4 whitespace-nowrap text-sm text-gray-800">
                                        {order.deliveryPartner?.username || 'Not Assigned'}
                                    </td>
                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                        <button
                                            onClick={() => handleViewDetails(order)}
                                            className="p-2 rounded-full text-gray-600 hover:bg-gray-200 hover:text-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                            title="View Full Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <OrderDetailModal order={selectedOrder} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default BranchOrderManagement;