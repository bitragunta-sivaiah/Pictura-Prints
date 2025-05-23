import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format, parseISO } from 'date-fns';
import { MapPin, Package, Clock, User, Phone, Home, XCircle, CheckCircle, Car, Truck, Flag, IndianRupee, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';

import {
    fetchMyActiveOrdersToday,
    acceptOrderAssignment,
    rejectOrderAssignment,
    updateOrderStatus,
    selectMyActiveOrdersToday,
    selectDeliveryPartnerLoading,
    selectDeliveryPartnerError,
} from '../../store/deliveryPartnerSlice';

const DeliveryPartnerTodayActiveOrder = () => {
    const dispatch = useDispatch();
    const activeOrders = useSelector(selectMyActiveOrdersToday);
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);

    const [currentLocation, setCurrentLocation] = useState(null);
    const [orderToReject, setOrderToReject] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false);
    const [orderToUpdate, setOrderToUpdate] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [showConfirmUpdateModal, setShowConfirmUpdateModal] = useState(false);
    const [codCollectedAmount, setCodCollectedAmount] = useState('');

    // Effect to fetch active orders
    useEffect(() => {
        dispatch(fetchMyActiveOrdersToday());
    }, [dispatch]);

    // Effect to get current geolocation
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (err) => {
                    console.error("Error getting location:", err);
                    toast.error("Please enable location services to use delivery features.");
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            toast.error("Geolocation is not supported by your browser. Please use a modern browser.");
        }
    }, []);

    // Handlers for accepting and rejecting assignments
    const handleAcceptAssignment = async (orderId) => {
        if (!currentLocation) {
            toast.error("Cannot accept order: current location not available. Please enable location services and refresh.");
            return;
        }
        const location = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
        };
        const resultAction = await dispatch(acceptOrderAssignment({ orderId, location }));
        if (acceptOrderAssignment.fulfilled.match(resultAction)) {
            toast.success("Order accepted successfully!");
            dispatch(fetchMyActiveOrdersToday());
        } else {
            toast.error(resultAction.payload?.message || "Failed to accept order. Please try again.");
        }
    };

    const openRejectModal = (order) => {
        setOrderToReject(order);
        setRejectionReason('');
        setShowRejectModal(true);
    };

    const handleRejectAssignment = async () => {
        if (!orderToReject || !rejectionReason.trim()) {
            toast.error("Please provide a rejection reason.");
            return;
        }
        const resultAction = await dispatch(rejectOrderAssignment({ orderId: orderToReject._id, reason: rejectionReason }));
        if (rejectOrderAssignment.fulfilled.match(resultAction)) {
            toast.success("Order rejected successfully!");
            setShowRejectModal(false);
            setRejectionReason('');
            setOrderToReject(null);
            dispatch(fetchMyActiveOrdersToday());
        } else {
            toast.error(resultAction.payload?.message || "Failed to reject order.");
        }
    };

    // Handlers for updating order status
    const openUpdateStatusModal = (order) => {
        setOrderToUpdate(order);
        setSelectedStatus('');
        setCodCollectedAmount('');
        setShowUpdateStatusModal(true);
    };

    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setSelectedStatus(newStatus);

        if (newStatus === 'delivered' && orderToUpdate?.paymentMethod === 'cod') {
            setCodCollectedAmount(orderToUpdate.total.toFixed(2));
        } else {
            setCodCollectedAmount('');
        }
    };

    const handleUpdateStatus = async () => {
        if (!orderToUpdate || !selectedStatus) {
            toast.error("Please select a status.");
            return;
        }

        if (selectedStatus === 'delivered' && orderToUpdate.paymentMethod === 'cod') {
            if (codCollectedAmount === '' || isNaN(parseFloat(codCollectedAmount)) || parseFloat(codCollectedAmount) < 0) {
                toast.error("Please enter a valid collected amount for COD delivery.");
                return;
            }
        }

        if (!currentLocation) {
            toast.error("Cannot update status: current location not available. Please enable location services.");
            return;
        }

        const location = {
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
        };
        const data = {
            orderId: orderToUpdate._id,
            status: selectedStatus,
            location,
        };

        if (selectedStatus === 'delivered' && orderToUpdate.paymentMethod === 'cod') {
            data.codCollectedAmount = parseFloat(codCollectedAmount);
        }

        const resultAction = await dispatch(updateOrderStatus(data));
        if (updateOrderStatus.fulfilled.match(resultAction)) {
            toast.success(`Order status updated to '${selectedStatus.replace(/_/g, ' ')}' successfully.`);
            setShowUpdateStatusModal(false);
            setShowConfirmUpdateModal(false);
            setOrderToUpdate(null);
            setSelectedStatus('');
            setCodCollectedAmount('');
            dispatch(fetchMyActiveOrdersToday());
        } else {
            toast.error(resultAction.payload?.message || "Failed to update order status.");
        }
    };

    // Helper for status styling
    const getStatusColor = (status) => {
        switch (status) {
            case 'offered': return 'text-blue-600 bg-blue-100';
            case 'assigned': return 'text-indigo-600 bg-indigo-100';
            case 'accepted': return 'text-cyan-600 bg-cyan-100';
            case 'picked_up': return 'text-purple-600 bg-purple-100';
            case 'in_transit': return 'text-yellow-600 bg-yellow-100';
            case 'out_for_delivery': return 'text-orange-600 bg-orange-100';
            case 'delivered': return 'text-green-600 bg-green-100';
            case 'failed_delivery':
            case 'rejected':
            case 'cancelled':
                return 'text-red-600 bg-red-100';
            case 'pending_pickup':
                return 'text-teal-600 bg-teal-100';
            case 'picked_up_for_return':
            case 'return_in_transit':
                return 'text-amber-600 bg-amber-100'; // Added color for return in transit
            case 'return_completed':
                return 'text-green-700 bg-green-200'; // Distinct color for completed return
            case 'return_failed':
                return 'text-red-700 bg-red-200'; // Distinct color for failed return
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    // Determine the most relevant current status for display and actions
    const getCurrentOrderTrackingStatus = (order) => {
        if (order.isReturnRequested) {
            // Prioritize return status if it's active
            if (order.returnStatus && order.returnStatus !== 'completed' && order.returnStatus !== 'failed') {
                return order.returnStatus;
            }
            // If return is completed or failed, we might still want to show the final delivery status
            // or a more specific return completion/failure status if available.
            // For now, let's fall through to main tracking details if return is completed/failed.
        }

        if (order.trackingDetails && order.trackingDetails.length > 0) {
            const lastTrackingEvent = order.trackingDetails[order.trackingDetails.length - 1];
            return lastTrackingEvent.status;
        }

        return order.deliveryAssignment?.status || order.status || 'unknown';
    };

    // Conditional rendering for action buttons
    const renderOrderActions = (order) => {
        const currentDPStatus = getCurrentOrderTrackingStatus(order);

        if (order.deliveryAssignment?.status === 'offered') {
            return (
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleAcceptAssignment(order._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                        disabled={loading || !currentLocation}
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Accept
                    </button>
                    <button
                        onClick={() => openRejectModal(order)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                        disabled={loading}
                    >
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                    </button>
                </div>
            );
        }

        const activeStatuses = ['assigned', 'accepted', 'picked_up', 'in_transit', 'out_for_delivery', 'pending_pickup', 'picked_up_for_return', 'return_in_transit'];
        if (activeStatuses.includes(currentDPStatus)) {
            return (
                <button
                    onClick={() => openUpdateStatusModal(order)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={loading || !currentLocation}
                >
                    {order.isReturnRequested ? <RotateCcw className="w-4 h-4 mr-2" /> : <Car className="w-4 h-4 mr-2" />}
                    Update {order.isReturnRequested ? 'Return' : 'Delivery'} Status
                </button>
            );
        }

        if (currentDPStatus === 'delivered' || currentDPStatus === 'return_completed') {
            return (
                <span className="text-green-700 font-semibold flex items-center">
                    <Flag className="w-5 h-5 mr-2" /> {order.isReturnRequested ? 'Return Completed' : 'Delivered'}
                </span>
            );
        }
        if (['failed_delivery', 'rejected', 'cancelled', 'return_failed'].includes(currentDPStatus)) {
            return (
                <span className="text-red-700 font-semibold flex items-center">
                    <XCircle className="w-5 h-5 mr-2" /> {currentDPStatus.replace(/_/g, ' ')}
                </span>
            );
        }

        return null;
    };

    // Define next possible statuses based on current tracking status
    const getNextPossibleStatusesForUpdate = (order) => {
        const currentDPStatus = getCurrentOrderTrackingStatus(order);
        const isReturn = order.isReturnRequested;

        if (isReturn) {
            const returnStatusFlow = {
                'pending_pickup': ['picked_up', 'return_failed'],
                'picked_up_for_return': ['return_in_transit', 'return_failed'],
                'return_in_transit': ['return_completed', 'return_failed'],
            };
            return returnStatusFlow[currentDPStatus] || [];
        } else {
            const deliveryStatusFlow = {
                'accepted': ['picked_up', 'failed_delivery'],
                'picked_up': ['in_transit', 'failed_delivery'],
                'in_transit': ['out_for_delivery', 'failed_delivery'],
                'out_for_delivery': ['delivered', 'failed_delivery'],
            };
            return deliveryStatusFlow[currentDPStatus] || [];
        }
    };

    if (loading && activeOrders.length === 0) {
        return <div className="p-6 text-center text-gray-600">Loading today's active orders...</div>;
    }

    if (error) {
        return <div className="p-6 text-center text-red-600">Error: {error}</div>;
    }

    if (!activeOrders || activeOrders.length === 0) {
        return (
            <div className="p-6 bg-white rounded-lg shadow-md text-center text-gray-700">
                <Package className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-xl font-semibold">No active orders assigned for today!</p>
                <p className="text-gray-500 mt-2">Check back later for new assignments.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Today's Active Deliveries</h2>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {activeOrders.map((order) => (
                    <div key={order._id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">Order #{order.orderNumber}</h3>
                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(getCurrentOrderTrackingStatus(order))}`}>
                                    {getCurrentOrderTrackingStatus(order).replace(/_/g, ' ')}
                                </span>
                            </div>
                            {order.isReturnRequested && (
                                <div className="flex items-center text-red-600 text-sm mb-2 font-semibold">
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    <span>RETURN REQUEST</span>
                                </div>
                            )}
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                                <Clock className="w-4 h-4 mr-2" />
                                <span>Assigned: {format(parseISO(order.deliveryAssignment.assignedAt), 'MMM dd, hh:mm a')}</span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="flex items-start text-gray-700">
                                <User className="w-5 h-5 mr-3 text-blue-500" />
                                <div>
                                    <p className="font-semibold text-lg">{order.shippingAddress.fullName}</p>
                                    <a href={`tel:${order.shippingAddress.phone}`} className="text-sm flex items-center text-blue-600 hover:underline">
                                        <Phone className="w-4 h-4 mr-1" /> {order.shippingAddress.phone}
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start text-gray-700">
                                <MapPin className="w-5 h-5 mr-3 text-red-500" />
                                <div>
                                    <p className="font-semibold">Delivery Address:</p>
                                    <p className="text-sm">
                                        {order.shippingAddress.streetAddress}, {order.shippingAddress.apartmentSuiteUnit && `${order.shippingAddress.apartmentSuiteUnit}, `}
                                        {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                                    </p>
                                    {order.shippingAddress.notes && <p className="text-xs italic text-gray-500 mt-1">Notes: {order.shippingAddress.notes}</p>}
                                    {order.shippingAddress.location?.coordinates && (
                                        <a
                                            href={`https://www.google.com/maps/dir/?api=1&destination=${order.shippingAddress.location.coordinates[1]},${order.shippingAddress.location.coordinates[0]}&travelmode=driving`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline text-sm flex items-center mt-2"
                                        >
                                            <MapPin className="w-4 h-4 mr-1" /> Get Directions
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="font-semibold text-gray-700 flex items-center mb-2">
                                    <Package className="w-5 h-5 mr-3 text-green-500" />
                                    Items:
                                </p>
                                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.quantity} x {item.product.name || 'Product'} (₹{item.finalPrice.toFixed(2)})
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <p className="font-semibold text-gray-700 flex items-center">
                                    <Home className="w-5 h-5 mr-3 text-purple-500" />
                                    Payment Method: <span className="ml-2 font-normal capitalize">{order.paymentMethod}</span>
                                </p>
                                {order.paymentMethod === 'cod' && (
                                    <p className="text-sm text-gray-600 mt-1 flex items-center">
                                        <IndianRupee className="w-4 h-4 mr-1" /> Amount to Collect: <span className="font-semibold">₹{order.total.toFixed(2)}</span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="p-6 bg-gray-100 flex justify-center border-t border-gray-200">
                            {renderOrderActions(order)}
                        </div>
                    </div>
                ))}
            </div>

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Reject Order Assignment</h3>
                        <p className="mb-4 text-gray-700">Are you sure you want to reject order <span className="font-semibold">#{orderToReject?.orderNumber}</span>?</p>
                        <div className="mb-4">
                            <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">Reason for rejection:</label>
                            <textarea
                                id="rejectionReason"
                                rows="3"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Too far, already busy, vehicle issue..."
                                required
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowRejectModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRejectAssignment}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                disabled={loading || !rejectionReason.trim()}
                            >
                                Reject Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Update Status Modal */}
            {showUpdateStatusModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Update Order Status</h3>
                        <p className="mb-4 text-gray-700">Order: <span className="font-semibold">#{orderToUpdate?.orderNumber}</span></p>
                        <p className="mb-4 text-gray-700">Current Status: <span className="font-semibold capitalize">{getCurrentOrderTrackingStatus(orderToUpdate).replace(/_/g, ' ')}</span></p>
                        <div className="mb-4">
                            <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-2">Select new status:</label>
                            <select
                                id="orderStatus"
                                className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                value={selectedStatus}
                                onChange={handleStatusChange}
                            >
                                <option value="">Select a status</option>
                                {getNextPossibleStatusesForUpdate(orderToUpdate).map((status) => (
                                    <option key={status} value={status}>
                                        {status.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedStatus === 'delivered' && orderToUpdate?.paymentMethod === 'cod' && (
                            <div className="mb-4">
                                <label htmlFor="codAmount" className="block text-sm font-medium text-gray-700 mb-2">
                                    COD Collected Amount (₹):
                                </label>
                                <input
                                    type="number"
                                    id="codAmount"
                                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    value={codCollectedAmount}
                                    onChange={(e) => setCodCollectedAmount(e.target.value)}
                                    placeholder={`Enter amount (e.g., ${orderToUpdate?.total.toFixed(2)})`}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowUpdateStatusModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setShowConfirmUpdateModal(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                disabled={loading || !selectedStatus || (selectedStatus === 'delivered' && orderToUpdate?.paymentMethod === 'cod' && (codCollectedAmount === '' || isNaN(parseFloat(codCollectedAmount))))}
                            >
                                Confirm Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Update Modal */}
            {showConfirmUpdateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Confirm Status Update</h3>
                        <p className="mb-4 text-gray-700">
                            Are you sure you want to change the status of order <span className="font-semibold">#{orderToUpdate?.orderNumber}</span> to <span className="font-semibold capitalize">{selectedStatus.replace(/_/g, ' ')}</span>?
                        </p>
                        {selectedStatus === 'delivered' && orderToUpdate?.paymentMethod === 'cod' && (
                            <p className="mb-4 text-gray-700">
                                Collected COD Amount: <span className="font-semibold">₹{parseFloat(codCollectedAmount).toFixed(2)}</span>
                            </p>
                        )}
                        <p className="text-sm text-gray-600 mb-6">
                            This action will update the order's tracking information.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowConfirmUpdateModal(false)}
                                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors"
                            >
                                No, Go Back
                            </button>
                            <button
                                onClick={handleUpdateStatus}
                                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                                disabled={loading}
                            >
                                Yes, Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeliveryPartnerTodayActiveOrder;