import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllOrders } from '../../store/orderSlice';
import { assignOrderToBranch, resetAssignOrderSuccess } from '../../store/adminBranchSlice';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle, XCircle, MapPin, RotateCw } from 'lucide-react';
import { format } from 'date-fns';

const AdminAssignOrderToBranch = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { orders, loading: loadingOrders, error: errorOrders } = useSelector((state) => state.order);
    const { loading: assigningOrder, error: assignError, assignOrderSuccess } = useSelector(
        (state) => state.adminBranch
    );
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [assigning, setAssigning] = useState(false);
    const [showReturnOrders, setShowReturnOrders] = useState(false); // State to toggle return orders

    const fetchOrders = useCallback(() => {
        dispatch(getAllOrders());
    }, [dispatch]);

    useEffect(() => {
        fetchOrders();

        // Cleanup function for when the component unmounts
        return () => {
            dispatch(resetAssignOrderSuccess());
        };
    }, [dispatch, fetchOrders]);

    useEffect(() => {
        if (assignOrderSuccess) {
            // Show success toast with order ID and branch name
            // toast.success(`Order ${assignOrderSuccess.orderId} assigned successfully to branch: ${assignOrderSuccess.branchStation?.name || 'N/A'}!`);
            dispatch(resetAssignOrderSuccess()); // Reset success state in Redux
            fetchOrders(); // Refresh order list to reflect the assignment
            setSelectedOrderId(''); // Clear the ID of the order that was just assigned
            setAssigning(false); // Reset assigning state
        }

        if (assignError) {
            // Show error toast with the error message
            toast.error(assignError?.message || 'Failed to assign order.');
            setAssigning(false); // Reset assigning state
            setSelectedOrderId(''); // Clear the selected order ID on error
        }
    }, [assignOrderSuccess, assignError, dispatch, fetchOrders]);

    const handleAssign = useCallback(async (orderId) => {
        // Prevent multiple assignments if one is already in progress
        if (assigning) {
            toast.info("An assignment is already in progress. Please wait.");
            return; // Exit early if already assigning
        }

        setSelectedOrderId(orderId); // Set the order ID being processed
        setAssigning(true); // Indicate that an assignment process has started

        if (navigator.geolocation) {
            // Attempt to get the current position
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationArray = [longitude, latitude]; // Format as [longitude, latitude] for backend

                    // Dispatch the assignOrderToBranch action with the obtained location
                    dispatch(assignOrderToBranch({ orderId, location: locationArray }));
                    // Success/Error handling (and setting assigning to false) will be done in the useEffect
                },
                (error) => {
                    // This callback is executed if geolocation fails (e.g., user denies, timeout)
                    console.error("Error getting location:", error);
                    let errorMessage = "Current location is required for assignment. Please enable location services or try again.";
                    if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = "Location access denied. Please allow location access in your browser settings to assign orders.";
                    } else if (error.code === error.TIMEOUT) {
                        errorMessage = "Could not get your location in time. Please ensure a stable internet connection and try again.";
                    }
                    toast.error(errorMessage);
                    setAssigning(false); // Reset assigning state as we won't proceed with the dispatch
                    setSelectedOrderId(''); // Clear selected order ID
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 } // Options for geolocation
            );
        } else {
            // If geolocation is not supported by the browser
            toast.error("Geolocation is not supported by this browser. Cannot assign order without location.");
            setAssigning(false); // Reset assigning state
            setSelectedOrderId(''); // Clear selected order ID
        }
    }, [assigning, dispatch]); // Dependencies for useCallback

    // Memoize filtered order lists to prevent unnecessary re-renders
    const unassignedOrders = React.useMemo(() => {
        return orders ? orders.filter(order => !order.branchStation && !order.isReturnRequested) : [];
    }, [orders]);

    const assignableReturnOrders = React.useMemo(() => {
        return orders ? orders.filter(order =>
            order.isReturnRequested &&
            ['approved', 'picked_up', 'pending'].includes(order.returnStatus)
            // Orders with existing delivery assignments are intentionally included if they are return requests
        ) : [];
    }, [orders]);

    const ordersToShow = showReturnOrders ? assignableReturnOrders : unassignedOrders;

    // --- Loading and Error States ---
    if (loadingOrders) {
        return (
            <div className="container mx-auto p-8 flex justify-center items-center h-screen">
                <Loader2 className="animate-spin h-10 w-10 text-blue-500 mr-2" />
                <span>Loading Orders...</span>
            </div>
        );
    }

    if (errorOrders) {
        return (
            <div className="container mx-auto p-8 text-red-500 text-center">
                <XCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
                Error loading orders: {errorOrders?.message || 'Failed to fetch orders.'}
            </div>
        );
    }

    // --- Main Component Render ---
    return (
        <div className="container mx-auto p-8">
            <h2 className="text-3xl font-bold mb-4 text-gray-800">Assign Order to Nearest Branch</h2>
            <p className="mb-6 text-gray-600 border-b pb-4">
                This page allows you to view new orders and {showReturnOrders ? 'return pickup requests ' : ''}
                and automatically assign them to the nearest branch based on your current location.
                Click the "Assign" button next to an order to initiate the assignment process.
                <br />
                <strong className="text-red-600">Please ensure your browser's location services are enabled.</strong>
            </p>

            <div className="mb-6">
                <button
                    onClick={() => setShowReturnOrders(!showReturnOrders)}
                    className={`px-6 py-2 rounded-lg text-base font-medium transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        showReturnOrders
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-500'
                            : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
                    }`}
                >
                    {showReturnOrders ? 'Show New Orders' : 'Show Return Pickup Requests'}
                </button>
                <span className="ml-3 text-sm text-gray-500">
                    ({showReturnOrders ? assignableReturnOrders.length : unassignedOrders.length} {showReturnOrders ? 'return requests' : 'new orders'})
                </span>
            </div>

            <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-200">
                <table className="min-w-full bg-white divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Order Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Shipping Address
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {ordersToShow && ordersToShow.length > 0 ? (
                            ordersToShow.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {order._id}
                                        {order.isReturnRequested && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                <RotateCw className="h-4 w-4 mr-1" />
                                                Return
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.user?.username || 'Guest'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {format(new Date(order.orderDate), 'MMM d, yyyy h:mm a')}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">
                                        {order.shippingAddress?.streetAddress || 'N/A'},{' '}
                                        {order.shippingAddress?.city || 'N/A'},{' '}
                                        {order.shippingAddress?.state || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {order.status}
                                        {order.isReturnRequested && order.returnStatus && (
                                            <span className="ml-1 text-xs italic text-gray-600">
                                                (Return: {order.returnStatus.replace(/_/g, ' ')})
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleAssign(order._id)}
                                            className={`inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                                assigning && selectedOrderId === order._id ? 'cursor-not-allowed opacity-60' : ''
                                            }`}
                                            disabled={assigning && selectedOrderId === order._id}
                                        >
                                            {assigning && selectedOrderId === order._id ? (
                                                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                                            ) : (
                                                <MapPin className="h-5 w-5 mr-2" />
                                            )}
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500" colSpan="6">
                                    No {showReturnOrders ? 'return pickup requests' : 'new'} orders available to assign.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Success and Error Messages (remain largely the same) */}
            {assignOrderSuccess && (
                <div className="mt-6 p-4 bg-green-50 text-green-700 border border-green-300 rounded-md flex items-center shadow-sm">
                    <CheckCircle className="h-6 w-6 mr-3 text-green-500" />
                    <span className="font-medium">Order {assignOrderSuccess.orderId} successfully assigned to branch: {assignOrderSuccess.branchStation?.name || 'N/A'}!</span>
                </div>
            )}

            {assignError && (
                <div className="mt-6 p-4 bg-red-50 text-red-700 border border-red-300 rounded-md flex items-center shadow-sm">
                    <XCircle className="h-6 w-6 mr-3 text-red-500" />
                    <span className="font-medium">Error assigning order {selectedOrderId}: {assignError?.message || 'Failed to assign.'}</span>
                </div>
            )}
        </div>
    );
};

export default AdminAssignOrderToBranch;