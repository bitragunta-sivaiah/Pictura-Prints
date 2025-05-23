import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getActiveOrdersForBranch,
    clearActiveOrders,
    getDeliveryPartnersForBranch,
    assignDeliveryPartnerToOrder,
    resetAssignDeliveryPartnerSuccess,
    reassignOrderToDeliveryPartner,
    resetReassignDeliveryPartnerSuccess,
} from '../../store/branchStationSlice'; // Adjust the path if needed
import { Loader2, User, Clock, Truck } from 'lucide-react';
import { format } from 'date-fns';
import Select from 'react-select';
import { toast } from 'react-hot-toast';

const BranchActiveOrders = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const branchId = user?.managedBranch;
    const {
        activeOrders,
        loading,
        error,
        deliveryPartners,
        assignDeliveryPartnerSuccess,
        reassignDeliveryPartnerSuccess,
    } = useSelector((state) => state.branchStation);
    const [selectedOrderDetails, setSelectedOrderDetails] = useState(null);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [reassignModalOpen, setReassignModalOpen] = useState(false);
    const [selectedOrderToAssign, setSelectedOrderToAssign] = useState(null);
    const [selectedOrderToReassign, setSelectedOrderToReassign] = useState(null);
    const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState(null);
    const [deliveryPartnersOptions, setDeliveryPartnersOptions] = useState([]);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);

    const fetchDeliveryPartners = useCallback(() => {
        if (branchId) {
            dispatch(getDeliveryPartnersForBranch(branchId));
        }
    }, [dispatch, branchId]);

    useEffect(() => {
        if (branchId) {
            dispatch(getActiveOrdersForBranch(branchId));
            fetchDeliveryPartners();
        }

        // Fetch current location on component mount
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCurrentLocation({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationError("Could not retrieve current location.");
                    // Optionally set a default location or handle the error as needed
                    setCurrentLocation({ latitude: 16.5062, longitude: 80.6480 }); // Default to Vijayawada if fails
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        } else {
            setLocationError("Geolocation is not supported by this browser.");
            setCurrentLocation({ latitude: 16.5062, longitude: 80.6480 }); // Default to Vijayawada if not supported
        }

        return () => {
            dispatch(clearActiveOrders());
            setDeliveryPartnersOptions([]); // Clear options on unmount
        };
    }, [dispatch, branchId, fetchDeliveryPartners]);

    useEffect(() => {
        if (Array.isArray(deliveryPartners)) {
            setDeliveryPartnersOptions(
                deliveryPartners.map((dp) => ({ value: dp._id, label: dp.username || dp.name || 'Delivery Partner' }))
            );
        } else {
            setDeliveryPartnersOptions([]);
        }
    }, [deliveryPartners]);

    useEffect(() => {
        if (assignDeliveryPartnerSuccess) {
            toast.success('Delivery partner assigned successfully!');
            setAssignModalOpen(false);
            setSelectedOrderToAssign(null);
            setSelectedDeliveryPartner(null);
            dispatch(resetAssignDeliveryPartnerSuccess());
            // Optionally refresh orders and delivery partners
            dispatch(getActiveOrdersForBranch(branchId));
            fetchDeliveryPartners();
        }
    }, [assignDeliveryPartnerSuccess, dispatch, branchId, fetchDeliveryPartners]);

    useEffect(() => {
        if (reassignDeliveryPartnerSuccess) {
            toast.success('Delivery partner reassigned successfully!');
            setReassignModalOpen(false);
            setSelectedOrderToReassign(null);
            setSelectedDeliveryPartner(null);
            dispatch(resetReassignDeliveryPartnerSuccess());
            // Optionally refresh orders and delivery partners
            dispatch(getActiveOrdersForBranch(branchId));
            fetchDeliveryPartners();
        }
    }, [reassignDeliveryPartnerSuccess, dispatch, branchId, fetchDeliveryPartners]);

    const handleOrderClick = (orderId) => {
        const selectedOrder = activeOrders.find((order) => order._id === orderId);
        setSelectedOrderDetails(selectedOrder);
    };

    const handleCloseDetails = () => {
        setSelectedOrderDetails(null);
    };

    const openAssignModal = (order) => {
        setSelectedOrderToAssign(order);
        setAssignModalOpen(true);
    };

    const closeAssignModal = () => {
        setAssignModalOpen(false);
        setSelectedOrderToAssign(null);
        setSelectedDeliveryPartner(null);
    };

    const openReassignModal = (order) => {
        setSelectedOrderToReassign(order);
        setReassignModalOpen(true);
    };

    const closeReassignModal = () => {
        setReassignModalOpen(false);
        setSelectedOrderToReassign(null);
        setSelectedDeliveryPartner(null);
    };

    const handleDeliveryPartnerSelect = (option) => {
        setSelectedDeliveryPartner(option);
    };

    const handleAssignDeliveryPartner = () => {
        if (selectedOrderToAssign && selectedDeliveryPartner) {
            const locationData = currentLocation
                ? `${currentLocation.longitude}, ${currentLocation.latitude}` // Format as string if needed by backend
                : 'Unknown'; // Or handle the case where location is not available

            dispatch(
                assignDeliveryPartnerToOrder({
                    branchId: branchId,
                    orderId: selectedOrderToAssign._id,
                    deliveryPartnerId: selectedDeliveryPartner.value,
                    location: locationData,
                })
            );
        } else {
            toast.error('Please select a delivery partner.');
        }
    };

    const handleReassignDeliveryPartner = () => {
        if (selectedOrderToReassign && selectedDeliveryPartner) {
            const locationData = currentLocation
                ? `${currentLocation.longitude}, ${currentLocation.latitude}` // Format as string if needed by backend
                : 'Unknown'; // Or handle the case where location is not available
            dispatch(
                reassignOrderToDeliveryPartner({
                    branchId: branchId,
                    orderId: selectedOrderToReassign._id,
                    newDeliveryPartnerId: selectedDeliveryPartner.value, // Ensure this key matches the backend expectation
                    location: locationData,
                })
            );
        } else {
            toast.error('Please select a delivery partner for reassignment.');
        }
    };

    const getStatusColorClass = (status) => {
        switch (status) {
            case 'pending_pickup': return 'bg-yellow-100 text-yellow-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'at_branch': return 'bg-green-100 text-green-800';
            case 'assigned': return 'bg-purple-100 text-purple-800';
            case 'picked_up': return 'bg-indigo-100 text-indigo-800';
            case 'in_transit': return 'bg-sky-100 text-sky-800';
            case 'out_for_delivery': return 'bg-lime-100 text-lime-800';
            case 'delivery_accepted': return 'bg-emerald-100 text-emerald-800';
            case 'delivery_rejected': return 'bg-red-100 text-red-800';
            case 'return_requested': return 'bg-orange-100 text-orange-800';
            case 'return_initiated': return 'bg-orange-200 text-orange-900';
            case 'return_approved': return 'bg-orange-300 text-orange-900';
            case 'return_rejected': return 'bg-red-200 text-red-900';
            case 'return_picked_up': return 'bg-purple-200 text-purple-900';
            case 'return_in_transit': return 'bg-purple-300 text-purple-900';
            case 'return_delivered': return 'bg-green-200 text-green-900';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-8">
                <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
                    <span className="ml-2">Loading Active Orders...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8 text-red-500">
                Error loading active orders: {error?.message || 'Failed to fetch active orders.'}
            </div>
        );
    }

    if (!branchId) {
        return (
            <div className="container mx-auto p-8 text-yellow-500">
                <p>You are not currently managing any branch to view active orders.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <h2 className="text-2xl font-semibold mb-4">Active Orders for Managed Branch: {branchId}</h2>

            {locationError && <p className="text-red-500 mb-2">{locationError}</p>}

            {activeOrders && activeOrders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Order Date
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Total
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Delivery Partner
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Actions
                                </th>
                                <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                    Details
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {activeOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">{order._id}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2 text-gray-500" />
                                            {order.user?.username || 'Guest'}
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                        <div className="flex items-center">
                                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                            {format(new Date(order.orderDate), 'dd-MM-yyyy HH:mm')}
                                        </div>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                        <span
                                            className={`inline-block px-2 py-1 leading-tight rounded-full font-semibold text-xs ${getStatusColorClass(order.status)}`}
                                        >
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">₹{order.total}</td>
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                        {order.deliveryPartner ? (
                                            <div className="flex items-center">
                                                <Truck className="h-4 w-4 mr-2 text-gray-500" />
                                                {deliveryPartners?.find((dp) => dp._id === order.deliveryPartner)?.username ||
                                                 deliveryPartners?.find((dp) => dp._id === order.deliveryPartner)?.name ||
                                                 'Assigned'}
                                            </div>
                                        ) : (
                                            <span className="text-gray-500">Not Assigned</span>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                        {!order.deliveryPartner && deliveryPartnersOptions.length > 0 && (
                                            <button
                                                onClick={() => openAssignModal(order)}
                                                className="text-blue-600 hover:text-blue-900 focus:outline-none focus:shadow-outline-blue active:text-blue-800 mr-2"
                                            >
                                                Assign
                                            </button>
                                        )}
                                        {!order.deliveryPartner && deliveryPartnersOptions.length === 0 && (
                                            <span className="text-gray-400 mr-2">No delivery partners</span>
                                            )}
                                        {order.deliveryPartner && order.isReturnRequested && order.returnStatus !== 'return_delivered' && (
                                            <button
                                                onClick={() => openReassignModal(order)}
                                                className="text-orange-600 hover:text-orange-900 focus:outline-none focus:shadow-outline-orange active:text-orange-800"
                                            >
                                                Reassign Return
                                            </button>
                                        )}
                                    </td>
                                    <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                        <button
                                            onClick={() => handleOrderClick(order._id)}
                                            className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:shadow-outline-indigo active:text-indigo-800"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-gray-600 py-4">No active orders for your managed branch.</div>
            )}

            {selectedOrderDetails && (
                <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md overflow-y-auto max-h-screen">
                        <h2 className="text-xl font-semibold mb-4">Order Details</h2>
                        <p><strong>Order ID:</strong> {selectedOrderDetails._id}</p>
                        <p><strong>Customer:</strong> {selectedOrderDetails.user?.username || 'Guest'}</p>
                        <p><strong>Order Date:</strong> {format(new Date(selectedOrderDetails.orderDate), 'dd-MM-yyyy HH:mm:ss')}</p>
                        <p><strong>Status:</strong> {selectedOrderDetails.status.replace(/_/g, ' ')}</p><strong>Total:</strong> ₹{selectedOrderDetails.total}
                        <h3 className="text-lg font-semibold mt-4 mb-2">Items:</h3>
                        <ul>
                            {selectedOrderDetails.items.map((item) => (
                                <li key={item._id}>
                                    {item.product?.name} ({item.color}, {item.size}) - Quantity: {item.quantity} - Final Price:
                                    ₹{item.finalPrice}
                                </li>
                            ))}
                        </ul>
                        <h3 className="text-lg font-semibold mt-4 mb-2">Shipping Address:</h3>
                        {selectedOrderDetails.shippingAddress && (
                            <div>
                                <p>{selectedOrderDetails.shippingAddress.fullName}</p>
                                <p>
                                    {selectedOrderDetails.shippingAddress.streetAddress},{' '}
                                    {selectedOrderDetails.shippingAddress.apartmentSuiteUnit}
                                </p>
                                <p>
                                    {selectedOrderDetails.shippingAddress.city},{' '}
                                    {selectedOrderDetails.shippingAddress.state} -{' '}
                                    {selectedOrderDetails.shippingAddress.postalCode}
                                </p>
                                <p>{selectedOrderDetails.shippingAddress.country}</p>
                                <p>Phone: {selectedOrderDetails.shippingAddress.phone}</p>
                            </div>
                        )}
                        <h3 className="text-lg font-semibold mt-4 mb-2">Billing Address:</h3>
                        {selectedOrderDetails.billingAddress && (
                            <div>
                                <p>{selectedOrderDetails.billingAddress.fullName}</p>
                                <p>
                                    {selectedOrderDetails.billingAddress.streetAddress},{' '}
                                    {selectedOrderDetails.billingAddress.apartmentSuiteUnit}
                                </p>
                                <p>
                                    {selectedOrderDetails.billingAddress.city},{' '}
                                    {selectedOrderDetails.billingAddress.state} -{' '}
                                    {selectedOrderDetails.billingAddress.postalCode}
                                </p>
                                <p>{selectedOrderDetails.billingAddress.country}</p>
                                <p>Phone: {selectedOrderDetails.billingAddress.phone}</p>
                            </div>
                        )}
                        <h3 className="text-lg font-semibold mt-4 mb-2">Tracking Details:</h3>
                        {selectedOrderDetails.trackingDetails && selectedOrderDetails.trackingDetails.length > 0 ? (
                            <ul>
                                {selectedOrderDetails.trackingDetails.map((track) => (
                                    <li key={track._id}>
                                        <strong>Status:</strong> {track.status.replace(/_/g, ' ')} - <strong>Date:</strong>{' '}
                                        {format(new Date(track.date), 'dd-MM-yyyy HH:mm:ss')}
                                        {track.location && (
                                            <span> - <strong>Location:</strong> {track.location}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>No tracking details available.</p>
                        )}
                        <h3 className="text-lg font-semibold mt-4 mb-2">Return Details:</h3>
                        {selectedOrderDetails.isReturnRequested ? (
                            <div>
                                <p><strong>Return Requested Date:</strong> {format(new Date(selectedOrderDetails.returnRequestDate), 'dd-MM-yyyy HH:mm:ss')}</p>
                                <p><strong>Return Status:</strong> {selectedOrderDetails.returnStatus ? selectedOrderDetails.returnStatus.replace(/_/g, ' ') : 'Not Available'}</p>
                                <p><strong>Refund Status:</strong> {selectedOrderDetails.refundStatus ? selectedOrderDetails.refundStatus.replace(/_/g, ' ') : 'Not Available'}</p>
                                {selectedOrderDetails.refundAmount > 0 && (
                                    <p><strong>Refund Amount:</strong> ₹{selectedOrderDetails.refundAmount}</p>
                                )}
                            </div>
                        ) : (
                            <p>No return requested for this order.</p>
                        )}
                        <button
                            onClick={handleCloseDetails}
                            className="mt-6 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

            {assignModalOpen && selectedOrderToAssign && (
                <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Assign Delivery Partner</h2>
                        <p className="mb-4">
                            Assign a delivery partner to order: <strong>{selectedOrderToAssign._id}</strong>
                        </p>
                        <label htmlFor="deliveryPartner" className="block text-gray-700 text-sm font-bold mb-2">
                            Select Delivery Partner:
                        </label>
                        <Select
                            id="deliveryPartner"
                            options={deliveryPartnersOptions}
                            onChange={handleDeliveryPartnerSelect}
                            value={selectedDeliveryPartner}
                            className="mb-4"
                            placeholder="Select a delivery partner"
                            noOptionsMessage={() => 'No delivery partners available for this branch.'}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={closeAssignModal}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignDeliveryPartner}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={!selectedDeliveryPartner || !currentLocation}
                            >
                                Assign
                            </button>
                        </div>
                        {!currentLocation && locationError && (
                            <p className="text-red-500 text-sm mt-2">{locationError}</p>
                        )}
                        {!currentLocation && !locationError && (
                            <p className="text-yellow-500 text-sm mt-2">Fetching current location...</p>
                        )}
                    </div>
                </div>
            )}

            {reassignModalOpen && selectedOrderToReassign && (
                <div className="fixed top-0 left-0 w-full h-full bg-white bg-opacity-50 z-50 flex justify-center items-center">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-semibold mb-4">Reassign Delivery Partner</h2>
                        <p className="mb-4">
                            Reassign a delivery partner to order: <strong>{selectedOrderToReassign._id}</strong>
                        </p>
                        <label htmlFor="reassignDeliveryPartner" className="block text-gray-700 text-sm font-bold mb-2">
                            Select New Delivery Partner:
                        </label>
                        <Select
                            id="reassignDeliveryPartner"
                            options={deliveryPartnersOptions}
                            onChange={handleDeliveryPartnerSelect}
                            value={selectedDeliveryPartner}
                            className="mb-4"
                            placeholder="Select a delivery partner"
                            noOptionsMessage={() => 'No delivery partners available for this branch.'}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={closeReassignModal}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReassignDeliveryPartner}
                                className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                disabled={!selectedDeliveryPartner}
                            >
                                Reassign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BranchActiveOrders;