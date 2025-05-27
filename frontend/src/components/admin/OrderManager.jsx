import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllOrders,
    updateOrderStatus,
    updateOrderTracking,
    resetOrders,
} from '../../store/orderSlice';
import { selectOrders, selectOrderLoading, selectOrderError, selectOrderSuccess } from '../../store/orderSlice';
import { Loader2, AlertCircle, CheckCircle, Package, ArrowRight, Clock, XCircle, Info, Image, Type, Maximize } from 'lucide-react'; // Added Maximize icon
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const OrderManagerPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const allOrders = useSelector(selectOrders);
    const loading = useSelector(selectOrderLoading);
    const error = useSelector(selectOrderError);
    const success = useSelector(selectOrderSuccess);
    const [statusUpdates, setStatusUpdates] = useState({});
    const [showOrderDetails, setShowOrderDetails] = useState(null);
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [recentlyUpdatedOrderId, setRecentlyUpdatedOrderId] = useState(null);
    const [showLargeImage, setShowLargeImage] = useState(null); // New state for large image modal

    const statusFilters = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Processing', value: 'processing' },
        { label: 'Shipped', value: 'shipped' },
        { label: 'At Branch', value: 'at_branch' },
        { label: 'Assigned', value: 'assigned' },
        { label: 'Picked Up', value: 'picked_up' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Out for Delivery', value: 'out_for_delivery' },
        { label: 'Delivered', value: 'delivered' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Failed', value: 'failed' },
    ];

    useEffect(() => {
        dispatch(getAllOrders());
        return () => {
            dispatch(resetOrders());
        };
    }, [dispatch]);

    useEffect(() => {
        if (success && recentlyUpdatedOrderId) {
            toast.success('Order status updated successfully!');
            setRecentlyUpdatedOrderId(null);
            dispatch(getAllOrders()); // Re-fetch orders to get the latest status
        }
    }, [dispatch, success, recentlyUpdatedOrderId]);

    useEffect(() => {
        if (selectedStatusFilter === 'all') {
            setFilteredOrders(allOrders);
        } else {
            setFilteredOrders(allOrders.filter(order => order.status === selectedStatusFilter));
        }
    }, [allOrders, selectedStatusFilter]);

    const handleStatusChange = (orderId, newStatus) => {
        setStatusUpdates(prevState => ({
            ...prevState,
            [orderId]: newStatus,
        }));
    };

    const handleUpdateStatus = (orderId) => {
        const newStatus = statusUpdates[orderId];
        if (newStatus) {
            setRecentlyUpdatedOrderId(orderId);
            dispatch(updateOrderStatus({ orderId, status: newStatus }));
            dispatch(updateOrderTracking({
                orderId,
                trackingData: {
                    status: newStatus,
                    date: new Date().toISOString(),
                },
            }));
            setStatusUpdates(prevState => ({ ...prevState, [orderId]: '' }));
        } else {
            toast.error('Please select a status to update.');
        }
    };

    const toggleOrderDetails = (orderId) => {
        setShowOrderDetails(showOrderDetails === orderId ? null : orderId);
    };

    const handleFilterChange = (status) => {
        setSelectedStatusFilter(status);
    };

    const handleImageClick = (imageUrl) => {
        setShowLargeImage(imageUrl);
    };

    const handleCloseLargeImage = () => {
        setShowLargeImage(null);
    };

    const allPossibleStatuses = [
        'pending', 'processing', 'shipped', 'at_branch', 'assigned',
        'picked_up', 'in_transit', 'out_for_delivery', 'delivered',
        'completed', 'cancelled', 'refunded', 'failed',
    ];

    const getFilteredStatusOptions = (currentStatus) => {
        return allPossibleStatuses.filter(status => status !== currentStatus);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'confirm': return <CheckCircle className="w-4 h-4 text-green-800" />;
            case 'processing': return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />;
            case 'shipped':
            case 'out_for_delivery':
            case 'in_transit': return <Package className="w-4 h-4 text-indigo-600" />;
            case 'delivered':
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'cancelled':
            case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
            case 'refunded': return <Info className="w-4 h-4 text-gray-600" />;
            default: return <Info className="w-4 h-4 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100">
                <Loader2 className="animate-spin w-12 h-12 text-indigo-600" />
                <p className="ml-3 text-lg text-gray-700">Loading orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-sm" role="alert">
                    <strong className="font-bold mr-2">Error!</strong>
                    <span className="block sm:inline">{error}</span>
                    <p className="mt-2 text-sm">Please try refreshing the page or contact support if the issue persists.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100  ">
            <div className="max-w-7xl mx-auto bg-white rounded-lg shadow  ">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6 border-b pb-4">Order Management Dashboard</h1>

                <div className="mb-6 flex flex-wrap gap-3">
                    {statusFilters.map(filter => (
                        <button
                            key={filter.value}
                            className={`py-2 px-5 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out
                                ${selectedStatusFilter === filter.value
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300 hover:text-gray-800'
                                }`}
                            onClick={() => handleFilterChange(filter.value)}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {filteredOrders.length === 0 ? (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg flex items-center justify-center space-x-3">
                        <Info className="w-6 h-6 text-yellow-600" />
                        <span className="text-lg font-medium">No orders found with the selected filter.</span>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg  ">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order #</th>
                                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order Date</th>
                                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Total</th>
                                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Payment</th>
                                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                                    <th className="py-3 px-5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Update Status</th>
    
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map(order => (
                                    <React.Fragment key={order._id}>
                                        <tr className={`border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors duration-150 ${recentlyUpdatedOrderId === order._id ? 'bg-green-50' : ''}`}>
                                            <td className="py-3 px-5 text-sm text-blue-600 font-medium cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                                {order.orderNumber}
                                            </td>
                                            <td className="py-3 px-5 text-sm text-gray-800">{order.user ? order.user.username : 'Guest'}</td>
                                            <td className="py-3 px-5 text-sm text-gray-600">{format(new Date(order.orderDate), 'MMM dd, yyyy HH:mm')}</td>
                                            <td className="py-3 px-5 text-sm text-gray-800">₹{order.total.toFixed(2)}</td>
                                            <td className="py-3 px-5 text-sm text-gray-800">
                                                {order.paymentMethod} <span className="text-gray-500 text-xs">({order.paymentStatus})</span>
                                            </td>
                                            <td className="py-3 px-5 text-sm">
                                                <p className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold text-black shadow-sm
                                                    ${order.status === 'pending' ? 'bg-yellow-300' :
                                                        order.status === 'confirm' ? 'bg-green-300' :
                                                        order.status === 'processing' ? 'bg-blue-300' :
                                                        order.status === 'shipped' ? 'bg-indigo-300' :
                                                        order.status === 'at_branch' ? 'bg-purple-300' :
                                                        order.status === 'assigned' ? 'bg-teal-300' :
                                                        order.status === 'picked_up' ? 'bg-cyan-300' :
                                                        order.status === 'in_transit' ? 'bg-sky-300' :
                                                        order.status === 'out_for_delivery' ? 'bg-lime-300' :
                                                        order.status === 'delivered' ? 'bg-green-300' :
                                                        order.status === 'completed' ? 'bg-emerald-300' :
                                                        order.status === 'cancelled' ? 'bg-red-300' :
                                                        order.status === 'refunded' ? 'bg-gray-300' :
                                                        order.status === 'failed' ? 'bg-orange-300' :
                                                        'bg-gray-400'
                                                    }`}>
                                                    {getStatusIcon(order.status)}
                                                    {order.status.replace(/_/g, ' ')}
                                                </p>
                                            </td>
                                            <td className="py-3 px-5 text-sm">
                                                <div className="flex items-center space-x-2">
                                                    <select
                                                        className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        value={statusUpdates[order._id] || ''}
                                                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                    >
                                                        <option value="">Select Status</option>
                                                        {getFilteredStatusOptions(order.status).map(status => (
                                                            <option key={status} value={status}>{status.replace(/_/g, ' ').toUpperCase()}</option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        onClick={() => handleUpdateStatus(order._id)}
                                                        disabled={!statusUpdates[order._id] || loading}
                                                    >
                                                        Update
                                                    </button>
                                                </div>
                                            </td>
                                            
                                        </tr>
                                        {showOrderDetails === order._id && (
                                            <tr>
                                                <td colSpan="8" className="p-6 bg-gray-50 border-t border-gray-200">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Info className="w-6 h-6 mr-2 text-indigo-500" />Detailed Order Information</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                        {/* Order Summary */}
                                                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                            <h4 className="font-semibold text-lg text-gray-700 mb-2">Order Summary</h4>
                                                            <p className="text-sm text-gray-600"><strong>Order Number:</strong> {order.orderNumber}</p>
                                                            <p className="text-sm text-gray-600"><strong>Order Date:</strong> {format(new Date(order.orderDate), 'PPP p')}</p>
                                                            <p className="text-sm text-gray-600"><strong>Payment Method:</strong> {order.paymentMethod}</p>
                                                            <p className="text-sm text-gray-600"><strong>Payment Status:</strong> {order.paymentStatus}</p>
                                                            <p className="text-sm text-gray-600"><strong>Shipping Cost:</strong> ₹{order.shippingCost ? order.shippingCost.toFixed(2) : '0.00'}</p>
                                                            <p className="text-sm text-gray-600"><strong>Tax:</strong> ₹{order.tax ? order.tax.toFixed(2) : '0.00'}</p>
                                                            <p className="text-sm text-gray-600   font-bold"><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                                                        </div>

                                                        {/* Shipping Address */}
                                                        {order.shippingAddress && (
                                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                                <h4 className="font-semibold text-lg text-gray-700 mb-2">Shipping Address</h4>
                                                                <p className="text-sm text-gray-600"><strong>{order.shippingAddress.fullName}</strong></p>
                                                                <p className="text-sm text-gray-600">{order.shippingAddress.streetAddress}</p>
                                                                {order.shippingAddress.apartmentSuiteUnit && <p className="text-sm text-gray-600">{order.shippingAddress.apartmentSuiteUnit}</p>}
                                                                <p className="text-sm text-gray-600">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                                                                <p className="text-sm text-gray-600">Country: {order.shippingAddress.country}</p>
                                                                <p className="text-sm text-gray-600">Phone: {order.shippingAddress.phone}</p>
                                                                {order.shippingAddress.notes && <p className="text-sm text-gray-600">Notes: {order.shippingAddress.notes}</p>}
                                                            </div>
                                                        )}

                                                        {/* Billing Address */}
                                                        {order.billingAddress && (
                                                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                                <h4 className="font-semibold text-lg text-gray-700 mb-2">Billing Address</h4>
                                                                <p className="text-sm text-gray-600"><strong>{order.billingAddress.fullName}</strong></p>
                                                                <p className="text-sm text-gray-600">{order.billingAddress.streetAddress}</p>
                                                                {order.billingAddress.apartmentSuiteUnit && <p className="text-sm text-gray-600">{order.billingAddress.apartmentSuiteUnit}</p>}
                                                                <p className="text-sm text-gray-600">{order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.postalCode}</p>
                                                                <p className="text-sm text-gray-600">Country: {order.billingAddress.country}</p>
                                                                <p className="text-sm text-gray-600">Phone: {order.billingAddress.phone}</p>
                                                                {order.billingAddress.notes && <p className="text-sm text-gray-600">Notes: {order.billingAddress.notes}</p>}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Order Items */}
                                                    <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                        <h4 className="font-semibold text-lg text-gray-700 mb-3">Order Items</h4>
                                                        <div className="space-y-4">
                                                            {order.items && order.items.map(item => (
                                                                <div key={item._id} className="border border-gray-200 rounded-md p-3 bg-gray-50">
                                                                    <p className="text-md font-medium text-gray-800">
                                                                        <strong>Product:</strong> {item.product ? item.product.name : 'N/A'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-600 mt-1">
                                                                        <span>Color: <span style={{ backgroundColor: item.color, display: 'inline-block', width: '15px', height: '15px', borderRadius: '50%', border: '1px solid #ccc', verticalAlign: 'middle' }}></span> {item.color}</span>,
                                                                        <span> Size: {item.size}</span>,
                                                                        <span> Quantity: {item.quantity}</span>,
                                                                        <span> Price: ₹{item.finalPrice.toFixed(2)}</span>
                                                                    </p>

                                                                    {item.customizations && item.customizations.length > 0 && (
                                                                        <div className="mt-3">
                                                                            <h5 className="font-semibold text-sm text-gray-700 mb-2">Customizations:</h5>
                                                                            {item.customizations.map(customization => (
                                                                                <div key={customization._id} className="ml-4 border-1 rounded-lg border-indigo-200 pl-4 py-1">
                                                                                    {Object.keys(customization).filter(key => ['front', 'back', 'leftSleeve', 'rightSleeve'].includes(key)).map(area => (
                                                                                        customization[area] && customization[area].length > 0 && (
                                                                                            <div key={area} className="mb-2">
                                                                                                <p className="text-xs font-medium text-gray-700 capitalize">{area.replace(/([A-Z])/g, ' $1')}:</p>
                                                                                                <div className="ml-2 space-y-1">
                                                                                                    {customization[area].map((detail, idx) => (
                                                                                                        <div key={idx} className="flex items-center text-xs text-gray-600">
                                                                                                            {detail.url && (
                                                                                                                <div className="flex items-center mr-3">
                                                                                                                    <Image className="w-4 h-4 mr-1 text-gray-500" />
                                                                                                                    <span>Custom Image: </span>
                                                                                                                    <button
                                                                                                                        onClick={() => handleImageClick(detail.url)}
                                                                                                                        className="text-blue-500 hover:underline ml-1 flex items-center"
                                                                                                                    >
                                                                                                                        View Image <Maximize className="w-3 h-3 ml-1" />
                                                                                                                    </button>
                                                                                                                </div>
                                                                                                            )}
                                                                                                            {detail.text && (
                                                                                                                <div className="flex items-center">
                                                                                                                    <Type className="w-4 h-4 mr-1 text-gray-500" />
                                                                                                                    Text: "{detail.text}"
                                                                                                                    {detail.fontFamily && `, Font: ${detail.fontFamily}`}
                                                                                                                    {detail.fontSize && `, Size: ${detail.fontSize}`}
                                                                                                                    {detail.fontWeight && `, Weight: ${detail.fontWeight}`}
                                                                                                                    {detail.fontCase && `, Case: ${detail.fontCase}`}
                                                                                                                    {detail.color && <span className="ml-1">, Color: <span style={{ backgroundColor: detail.color, display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', border: '1px solid #ccc', verticalAlign: 'middle' }}></span></span>}
                                                                                                                </div>
                                                                                                            )}
                                                                                                        </div>
                                                                                                    ))}
                                                                                                </div>
                                                                                            </div>
                                                                                        )
                                                                                    ))}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Tracking History */}
                                                    <div className="mt-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                                        <h4 className="font-semibold text-lg text-gray-700 mb-3">Tracking History</h4>
                                                        {order.trackingDetails && order.trackingDetails.length > 0 ? (
                                                            <ol className="relative border-l border-gray-200 space-y-4 ml-2">
                                                                {order.trackingDetails.map((track, index) => (
                                                                    <li key={index} className="ml-6">
                                                                        <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white">
                                                                            {getStatusIcon(track.status)}
                                                                        </span>
                                                                        <h5 className="flex items-center mb-1 text-sm font-semibold text-gray-800">
                                                                            {track.status.replace(/_/g, ' ').toUpperCase()}
                                                                        </h5>
                                                                        <time className="block mb-2 text-xs font-normal leading-none text-gray-500">
                                                                            {format(new Date(track.date), 'PPP p')}
                                                                        </time>
                                                                        {track.location && <p className="text-sm text-gray-600">Location: {track.location}</p>}
                                                                    </li>
                                                                ))}
                                                            </ol>
                                                        ) : (
                                                            <p className="text-base text-gray-500 italic">No tracking information available for this order yet.</p>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Large Image Modal */}
            {showLargeImage && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75 p-4">
                    <div className="relative bg-white rounded-lg shadow-xl max-w-3xl max-h-[90vh] overflow-hidden">
                        <button
                            onClick={handleCloseLargeImage}
                            className="absolute top-3 right-3 text-gray-800 hover:text-gray-600 bg-white rounded-full p-2 shadow-md focus:outline-none"
                            aria-label="Close image viewer"
                        >
                            <XCircle className="w-6 h-6" />
                        </button>
                        <img
                            src={showLargeImage}
                            alt="Customization"
                            className="max-w-full max-h-full object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagerPage;