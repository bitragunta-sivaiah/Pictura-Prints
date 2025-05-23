import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllOrders,
    updateOrderStatus,
    updateOrderTracking,
    resetOrders,
    getOrderDetails, // Import to potentially fetch more order details
} from '../../store/orderSlice';
import { selectOrders, selectOrderLoading, selectOrderError, selectOrderSuccess } from '../../store/orderSlice';
import { Loader2, AlertCircle, CheckCircle, Package, ArrowRight, Clock, XCircle, Info } from 'lucide-react';
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
            dispatch(getAllOrders());
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

    const allPossibleStatuses = [
        'pending', 'processing', 'shipped', 'at_branch', 'assigned',
        'picked_up', 'in_transit', 'out_for_delivery', 'delivered',
        'completed', 'cancelled', 'refunded', 'failed',
    ];

    const getFilteredStatusOptions = (currentStatus) => {
        return allPossibleStatuses.filter(status => status !== currentStatus);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-4">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Order Management</h1>

            <div className="mb-4 flex space-x-2 overflow-x-auto">
                {statusFilters.map(filter => (
                    <button
                        key={filter.value}
                        className={`py-2 px-4 rounded-md text-sm font-semibold ${
                            selectedStatusFilter === filter.value
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        onClick={() => handleFilterChange(filter.value)}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>

            {filteredOrders.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">No orders found with the selected filter.</span>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b font-semibold text-left">Order #</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">User</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Order Date</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Total</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Payment</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Status</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Update Status</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map(order => (
                                <React.Fragment key={order._id}>
                                    <tr className={`hover:bg-gray-50 ${recentlyUpdatedOrderId === order._id ? 'bg-green-100' : ''}`}>
                                        <td className="py-2 px-4 border-b text-blue-500 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>{order.orderNumber}</td>
                                        <td className="py-2 px-4 border-b">{order.user ? order.user.name : 'Guest'}</td>
                                        <td className="py-2 px-4 border-b">{format(new Date(order.orderDate), 'yyyy-MM-dd HH:mm')}</td>
                                        <td className="py-2 px-4 border-b">₹{order.total.toFixed(2)}</td>
                                        <td className="py-2 px-4 border-b">{order.paymentMethod} ({order.paymentStatus})</td>
                                        <td className="py-2 px-4 border-b">
                                            <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold text-white ${
                                                order.status === 'pending' ? 'bg-yellow-500' :
                                                order.status === 'processing' ? 'bg-blue-500' :
                                                order.status === 'shipped' ? 'bg-indigo-500' :
                                                order.status === 'at_branch' ? 'bg-purple-500' :
                                                order.status === 'assigned' ? 'bg-teal-500' :
                                                order.status === 'picked_up' ? 'bg-cyan-500' :
                                                order.status === 'in_transit' ? 'bg-sky-500' :
                                                order.status === 'out_for_delivery' ? 'bg-lime-500' :
                                                order.status === 'delivered' ? 'bg-green-500' :
                                                order.status === 'completed' ? 'bg-emerald-500' :
                                                order.status === 'cancelled' ? 'bg-red-500' :
                                                order.status === 'refunded' ? 'bg-gray-500' :
                                                order.status === 'failed' ? 'bg-orange-500' :
                                                'bg-gray-400'
                                            }`}>{order.status.replace(/_/g, ' ')}</span>
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <div className="flex items-center">
                                                <select
                                                    className="shadow-sm focus:ring-indigo-500 h-[45px] px-4 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                                                    value={statusUpdates[order._id] || ''}
                                                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                >
                                                    <option value="">Select Status</option>
                                                    {getFilteredStatusOptions(order.status).map(status => (
                                                        <option key={status} value={status}>{status.replace(/_/g, ' ').toUpperCase()}</option>
                                                    ))}
                                                </select>
                                                <button
                                                    className="ml-2 bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                                    onClick={() => handleUpdateStatus(order._id)}
                                                    disabled={!statusUpdates[order._id]}
                                                >
                                                    Update
                                                </button>
                                            </div>
                                        </td>
                                        <td className="py-2 px-4 border-b text-gray-600 cursor-pointer" onClick={() => toggleOrderDetails(order._id)}>
                                            <Info className="inline-block w-5 h-5" />
                                        </td>
                                    </tr>
                                    {showOrderDetails === order._id && (
                                        <tr>
                                            <td colSpan="8" className="py-4 px-4 bg-gray-50">
                                                <h3 className="font-semibold mb-2">Order Details</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <p><strong>Order Number:</strong> {order.orderNumber}</p>
                                                        <p><strong>Order Date:</strong> {format(new Date(order.orderDate), 'yyyy-MM-dd HH:mm:ss')}</p>
                                                        <p><strong>Payment Method:</strong> {order.paymentMethod}</p>
                                                        <p><strong>Payment Status:</strong> {order.paymentStatus}</p>
                                                        <p><strong>Shipping Cost:</strong> ₹{order.shippingCost ? order.shippingCost.toFixed(2) : '0.00'}</p>
                                                        <p><strong>Tax:</strong> ₹{order.tax ? order.tax.toFixed(2) : '0.00'}</p>
                                                        <p><strong>Total:</strong> ₹{order.total.toFixed(2)}</p>
                                                        {order.shippingAddress && (
                                                            <div>
                                                                <h4 className="font-semibold mt-2">Shipping Address</h4>
                                                                <p>{order.shippingAddress.addressLine1}</p>
                                                                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                                                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
                                                                <p>Country: {order.shippingAddress.country}</p>
                                                            </div>
                                                        )}
                                                        {order.billingAddress && (
                                                            <div>
                                                                <h4 className="font-semibold mt-2">Billing Address</h4>
                                                                <p>{order.billingAddress.addressLine1}</p>
                                                                {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                                                                <p>{order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.postalCode}</p>
                                                                <p>Country: {order.billingAddress.country}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold">Order Items</h4>
                                                        <ul>
                                                            {order.items && order.items.map(item => (
                                                                <li key={item._id} className="mb-1">
                                                                    <strong>Product:</strong> {item.product ? item.product.name : 'N/A'}
                                                                    {item.color && `, Color: ${item.color}`}
                                                                    {item.size && `, Size: ${item.size}`}
                                                                    , Quantity: {item.quantity}, Price: ₹{item.finalPrice.toFixed(2)}
                                                                    {item.customizations && item.customizations.length > 0 && (
                                                                        <ul className="ml-4">
                                                                            <li className="text-sm italic">Customizations:</li>
                                                                            {item.customizations.map(customization => (
                                                                                <li key={customization._id} className="text-xs italic">
                                                                                    {customization.area}: {customization.value}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                        {order.trackingDetails && order.trackingDetails.length > 0 && (
                                                            <div>
                                                                <h4 className="font-semibold mt-2">Tracking History</h4>
                                                                <ul>
                                                                    {order.trackingDetails.map((track, index) => (
                                                                        <li key={index} className="text-sm">
                                                                            <strong>Status:</strong> {track.status.replace(/_/g, ' ')},
                                                                            <strong>Date:</strong> {format(new Date(track.date), 'yyyy-MM-dd HH:mm')}
                                                                            {track.location && `, Location: ${track.location}`}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        {!order.trackingDetails || order.trackingDetails.length === 0 && (
                                                            <p className="text-sm mt-2 italic">No tracking information available.</p>
                                                        )}
                                                    </div>
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
    );
};

export default OrderManagerPage;