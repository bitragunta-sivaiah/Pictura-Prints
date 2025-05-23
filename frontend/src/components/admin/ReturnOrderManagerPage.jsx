import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchAllReturnsAdmin,
    fetchReturnDetailsAdmin,
    updateReturnStatusAdmin,
    approveRejectReturnAdmin,
    processRefundAdmin,
    resetAllReturnsAdmin,
    resetReturnDetailsAdmin,
    resetUpdateReturnStatus,
    resetApproveRejectReturn,
    resetProcessRefund,
    selectAllReturnsAdminState,
    selectReturnDetailsAdminState,
    selectUpdateReturnStatusState,
    selectApproveRejectReturnState,
    selectProcessRefundState,
} from '../../store/returnOrderSlice'; // Ensure this path is correct
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, X, PackageCheck, DollarSign, Loader2, Info } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

// Reusable Loader Component
const Loader = () => (
    <div className="flex justify-center items-center h-48">
        <Loader2 className="animate-spin h-10 w-10 text-indigo-500" />
    </div>
);

// Reusable Message Component
const Message = ({ variant = 'info', children }) => {
    const colorClasses = {
        info: 'bg-blue-50 border-blue-300 text-blue-700',
        danger: 'bg-red-50 border-red-300 text-red-700',
        success: 'bg-green-50 border-green-300 text-green-700',
    };
    return (
        <div className={`${colorClasses[variant]} px-4 py-3 rounded relative`} role="alert">
            <strong className="font-semibold">{variant === 'danger' ? 'Error!' : 'Info:'}</strong>
            <span className="block sm:inline">{children}</span>
        </div>
    );
};

const ReturnOrderManagerPage = () => {
    const dispatch = useDispatch();
    const [returnStatus, setReturnStatus] = useState('');
    const [refundStatus, setRefundStatus] = useState('');
    const [refundAmount, setRefundAmount] = useState('');
    const [refundReason, setRefundReason] = useState('');
    const [returnTrackingNumber, setReturnTrackingNumber] = useState('');
    const [returnLabelImageUrl, setReturnLabelImageUrl] = useState('');
    const [selectedReturnId, setSelectedReturnId] = useState(null);

    // State to manage conditions of returned items
    const [returnedItemsConditions, setReturnedItemsConditions] = useState({});

    // Redux state selectors
    const {
        loading: loadingAll,
        error: errorAll,
        data: allReturns,
    } = useSelector(selectAllReturnsAdminState);

    const {
        loading: loadingDetails,
        error: errorDetails,
        data: returnDetails,
    } = useSelector(selectReturnDetailsAdminState);

    const {
        loading: loadingUpdateStatus,
        success: successUpdateStatus,
        error: errorUpdateStatus,
    } = useSelector(selectUpdateReturnStatusState);

    const {
        loading: loadingApproveReject,
        success: successApproveReject,
        error: errorApproveReject,
    } = useSelector(selectApproveRejectReturnState);

    const {
        loading: loadingProcessRefund,
        success: successProcessRefund,
        error: errorProcessRefund,
    } = useSelector(selectProcessRefundState);

    // Step 1: Fetch all returns on component mount and reset states on unmount
    useEffect(() => {
        dispatch(fetchAllReturnsAdmin());

        return () => {
            dispatch(resetAllReturnsAdmin());
            dispatch(resetReturnDetailsAdmin());
            dispatch(resetUpdateReturnStatus());
            dispatch(resetApproveRejectReturn());
            dispatch(resetProcessRefund());
        };
    }, [dispatch]);

    // Step 2: Fetch details of a selected return order
    useEffect(() => {
        if (selectedReturnId) {
            dispatch(fetchReturnDetailsAdmin(selectedReturnId));
        } else {
            // Reset details when no return is selected (e.g., closing the details view)
            dispatch(resetReturnDetailsAdmin());
        }
    }, [dispatch, selectedReturnId]);

    // Step 3: Populate form fields when returnDetails are loaded or updated
    useEffect(() => {
        if (returnDetails) {
            setReturnStatus(returnDetails.returnStatus || '');
            setReturnTrackingNumber(returnDetails.returnTrackingNumber || '');
            setReturnLabelImageUrl(returnDetails.returnLabelImageUrl || '');
            setRefundStatus(returnDetails.refundStatus || '');
            // Ensure refundAmount is a number for consistent handling
            setRefundAmount(returnDetails.refundAmount?.toString() || '');
            setRefundReason(returnDetails.refundReason || '');

            // Initialize returnedItemsConditions state based on fetched details
            const initialConditions = {};
            returnDetails.items?.forEach(item => { // Changed from `returnedItems` to `items` based on common schema
                initialConditions[item.product._id] = item.condition || '';
            });
            setReturnedItemsConditions(initialConditions);
        } else {
            // Clear form fields if no returnDetails are available (e.g., after closing details)
            setReturnStatus('');
            setReturnTrackingNumber('');
            setReturnLabelImageUrl('');
            setRefundStatus('');
            setRefundAmount('');
            setRefundReason('');
            setReturnedItemsConditions({});
        }
    }, [returnDetails]);

    // Step 4: Handle success/error toasts and re-fetch data after actions
    useEffect(() => {
        if (successUpdateStatus) {
            toast.success('Return status updated successfully!');
            dispatch(resetUpdateReturnStatus());
            if (selectedReturnId) dispatch(fetchReturnDetailsAdmin(selectedReturnId));
            dispatch(fetchAllReturnsAdmin());
        }
        if (errorUpdateStatus) {
            toast.error(`Failed to update return status: ${errorUpdateStatus}`);
            dispatch(resetUpdateReturnStatus());
        }
        if (successApproveReject) {
            toast.success('Return approval updated successfully!');
            dispatch(resetApproveRejectReturn());
            if (selectedReturnId) dispatch(fetchReturnDetailsAdmin(selectedReturnId));
            dispatch(fetchAllReturnsAdmin());
        }
        if (errorApproveReject) {
            toast.error(`Failed to update return approval: ${errorApproveReject}`);
            dispatch(resetApproveRejectReturn());
        }
        if (successProcessRefund) {
            toast.success('Refund processed successfully!');
            dispatch(resetProcessRefund());
            if (selectedReturnId) dispatch(fetchReturnDetailsAdmin(selectedReturnId));
            dispatch(fetchAllReturnsAdmin());
        }
        if (errorProcessRefund) {
            toast.error(`Failed to process refund: ${errorProcessRefund}`);
            dispatch(resetProcessRefund());
        }
    }, [
        dispatch,
        successUpdateStatus,
        errorUpdateStatus,
        successApproveReject,
        errorApproveReject,
        successProcessRefund,
        errorProcessRefund,
        selectedReturnId,
    ]);

    // Step 5: Handlers for UI interactions
    const handleShowDetails = (returnOrder) => {
        setSelectedReturnId(returnOrder._id);
    };

    const handleCloseDetails = () => {
        setSelectedReturnId(null);
        // Form states are reset by the useEffect that watches `returnDetails`
    };

    const handleUpdateStatus = (e) => {
        e.preventDefault();
        if (selectedReturnId && returnStatus) {
            // Note: The `updateReturnStatusAdmin` thunk in your `returnOrderSlice`
            // should be designed to accept `returnTrackingNumber`, `returnLabelImageUrl`,
            // and an array of `returnedItems` with their conditions.
            // If it doesn't, you'll need to modify your Redux slice accordingly.
            const updatedItemsConditions = returnDetails.items.map(item => ({
                product: item.product._id,
                condition: returnedItemsConditions[item.product._id] || item.condition // Use current state or existing condition
            }));

            dispatch(
                updateReturnStatusAdmin({
                    returnId: selectedReturnId,
                    returnStatus,
                    returnTrackingNumber,
                    returnLabelImageUrl,
                    returnedItems: updatedItemsConditions, // Sending updated item conditions
                    // If you have a separate thunk for adding tracking events, call it here.
                    // e.g., addReturnTrackingEventAdmin({ returnId: selectedReturnId, status: trackingEventStatus, location: trackingEventLocation, notes: trackingEventNotes })
                })
            );
        } else {
            toast.error('Please select a status and a return order to update.');
        }
    };

    const handleApprove = () => {
        if (selectedReturnId) {
            dispatch(approveRejectReturnAdmin({ returnId: selectedReturnId, isApproved: true }));
        } else {
            toast.error('No return order selected for approval.');
        }
    };

    const handleReject = () => {
        if (selectedReturnId) {
            dispatch(approveRejectReturnAdmin({ returnId: selectedReturnId, isApproved: false }));
        } else {
            toast.error('No return order selected for rejection.');
        }
    };

    const handleProcessRefund = (e) => {
        e.preventDefault();
        // Calculate the total refund amount based on returned items and their prices
        // Assuming `returnDetails.items` contains `price` for each item.
        let calculatedRefundAmount = 0;
        if (returnDetails && returnDetails.items) {
            calculatedRefundAmount = returnDetails.items.reduce((total, item) => {
                // You might want to adjust this logic if refund amount depends on item condition or original order total
                return total + (item.quantity * item.price);
            }, 0);
        }

        if (selectedReturnId && refundStatus && calculatedRefundAmount > 0) {
            dispatch(
                processRefundAdmin({
                    returnId: selectedReturnId,
                    refundStatus,
                    refundAmount: calculatedRefundAmount, // Use the calculated amount
                    refundReason,
                })
            );
            setRefundStatus('');
            setRefundAmount(''); // Clear this as it's now auto-calculated
            setRefundReason('');
        } else {
            toast.error('Please select a refund status and ensure items are specified for refund.');
        }
    };


    const handleItemConditionChange = (productId, condition) => {
        setReturnedItemsConditions(prev => ({
            ...prev,
            [productId]: condition
        }));
    };

    // Step 6: Helper to get the selected return order
    const selectedReturn = allReturns?.find(returnOrder => returnOrder._id === selectedReturnId);

    // Step 7: Define all possible return statuses from the model
    const returnStatusOptions = [
        'pending',
        'approved',
        'rejected',
        'pending_pickup',
        'picked_up',
        'in_transit',
        'returned_to_branch',
        'delivered_to_warehouse',
        'return_processing',
        'refund_initiated',
        'refunded',
        'exchange_initiated',
        'exchanged',
        'closed',
        'failed_pickup',
        'failed_delivery_to_warehouse',
    ];

    const refundStatusOptions = [
        'not_requested',
        'requested',
        'approved',
        'processed',
        'failed',
    ];

    return (
        <div className="container mx-auto p-6 bg-gray-100 min-h-screen font-inter">
            <h1 className="text-3xl font-bold mb-6 text-gray-900">Return Order Management</h1>

            <div className="bg-white shadow-lg overflow-hidden rounded-xl mb-8">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Return ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Request Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Details</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loadingAll ? (
                            <tr><td colSpan="6"><div className="py-6"><Loader /></div></td></tr>
                        ) : errorAll ? (
                            <tr><td colSpan="6"><Message variant="danger">{errorAll}</Message></td></tr>
                        ) : (
                            allReturns?.length > 0 ? (
                                allReturns.map((returnOrder) => (
                                    <tr
                                        key={returnOrder._id}
                                        className={`hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${selectedReturnId === returnOrder._id ? 'bg-indigo-50' : ''}`}
                                        onClick={() => handleShowDetails(returnOrder)}
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {returnOrder._id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {returnOrder.orderNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {returnOrder.user?.username || 'N/A'} ({returnOrder.user?.email || 'N/A'})
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(returnOrder.returnRequestDate), 'MMM d, yyyy h:mm a')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                returnOrder.returnStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                returnOrder.returnStatus === 'approved' || returnOrder.returnStatus === 'picked_up' || returnOrder.returnStatus === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                                                returnOrder.returnStatus === 'delivered_to_warehouse' || returnOrder.returnStatus === 'return_processing' ? 'bg-purple-100 text-purple-800' :
                                                returnOrder.returnStatus === 'refunded' || returnOrder.returnStatus === 'closed' ? 'bg-green-100 text-green-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {returnOrder.returnStatus?.replace(/_/g, ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleShowDetails(returnOrder)}
                                                className="text-indigo-600 hover:text-indigo-900 focus:outline-none transition-colors duration-200"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="6"><Message variant="info">No return requests found.</Message></td></tr>
                            )
                        )}
                    </tbody>
                </table>
            </div>

            {selectedReturnId && (
                <div className="mt-8 bg-white shadow-lg overflow-hidden rounded-xl p-8">
                    <div className="mb-6">
                        <button onClick={handleCloseDetails} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-200">
                            <ArrowLeft className="mr-2 -ml-1 h-5 w-5 text-gray-500" />
                            Close Details
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900">
                        Return Details - Return ID: {selectedReturnId} (Order #{
                        returnDetails?.orderNumber || selectedReturn?.orderNumber || 'N/A'})
                    </h2>

                    {loadingDetails ? (
                        <Loader />
                    ) : errorDetails ? (
                        <Message variant="danger">{errorDetails}</Message>
                    ) : returnDetails ? (
                        <div>
                            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div>
                                    <p className="text-sm text-gray-500">User:</p>
                                    <p className="font-semibold text-gray-700">{returnDetails.user?.username || 'N/A'} ({returnDetails.user?.email || 'N/A'})</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Request Date:</p>
                                    <p className="font-semibold text-gray-700">{format(new Date(returnDetails.returnRequestDate), 'MMM d, yyyy h:mm a')}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Return Reason:</p>
                                    <p className="text-gray-700">{returnDetails.returnReason || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Current Return Status:</p>
                                    <p className="font-semibold text-gray-700 capitalize">{returnDetails.returnStatus?.replace(/_/g, ' ') || 'pending'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Return Tracking Number:</p>
                                    <p className="text-gray-700">{returnDetails.returnTrackingNumber || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Return Label Image:</p>
                                    {returnDetails.returnLabelImageUrl ? (
                                        <a href={returnDetails.returnLabelImageUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">View Label</a>
                                    ) : (
                                        <p className="text-gray-700">N/A</p>
                                    )}
                                </div>
                            </div>

                            <div className="mb-6 border-t pt-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-900">Returned Items:</h3>
                                {returnDetails.items?.length > 0 ? (
                                    <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200">
                                        {returnDetails.items.map((item) => {
                                            const colorProduct = item.product?.availableColors?.find(
                                                (c) => c.color === item.color
                                            );
                                            const imageUrl = colorProduct?.images?.front;

                                            return (
                                                <li key={item.product._id} className="px-4 py-4 sm:px-6 flex items-center bg-white hover:bg-gray-50 transition-colors duration-200">
                                                    <div className="w-24 h-24 rounded-md overflow-hidden shadow-sm mr-4 flex-shrink-0">
                                                        {imageUrl ? (
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                                <Info className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-grow">
                                                        <p className="font-semibold text-gray-800 text-lg">{item.product?.name}</p>
                                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                                            Color:
                                                            <span
                                                                className="inline-block w-5 h-5 rounded-full ml-1 shadow-sm border border-gray-200"
                                                                style={{ backgroundColor: item.color }}
                                                            ></span>
                                                            <span className="ml-2 font-medium capitalize">{item.color}</span>,
                                                            <span className="ml-4">Size: <span className="font-medium uppercase">{item.size}</span></span>
                                                        </div>
                                                        {item.customizations && item.customizations.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-gray-500 font-medium">Customizations:</p>
                                                                <ul className="list-disc list-inside text-xs text-gray-600">
                                                                    {item.customizations.map((customizationId) => (
                                                                        <li key={customizationId}>
                                                                            Customization ID: {customizationId}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        <p className="text-gray-700 font-medium mt-2">Quantity: {item.quantity}</p>
                                                        <p className="text-sm text-gray-600">Price per item: ${item.finalPrice?.toFixed(2) || '0.00'}</p> {/* Added price per item */}
                                                        <p className="text-sm text-gray-600">Return Reason: {item.returnReason || returnDetails.returnReason || 'N/A'}</p>
                                                        <div className="mt-2">
                                                            <label htmlFor={`condition-${item.product._id}`} className="block text-sm font-medium text-gray-700">
                                                                Condition:
                                                            </label>
                                                            <select
                                                                id={`condition-${item.product._id}`}
                                                                value={returnedItemsConditions[item.product._id] || ''}
                                                                onChange={(e) => handleItemConditionChange(item.product._id, e.target.value)}
                                                                className="mt-1 block w-full sm:w-auto py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                                            >
                                                                <option value="">Select Condition</option>
                                                                <option value="good">Good</option>
                                                                <option value="damaged">Damaged</option>
                                                                <option value="used">Used</option>
                                                                <option value="missing_parts">Missing Parts</option>
                                                            </select>
                                                            <p className="text-xs text-gray-500 mt-1">Current: <span className="font-semibold capitalize">{item.condition || 'Not set'}</span></p>
                                                        </div>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                ) : (
                                    <p className="text-gray-700">No items specified for return.</p>
                                )}
                                <div className="mt-4 text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                        Estimated Return Total: ${returnDetails?.items?.reduce((total, item) => total + (item.quantity * item.finalPrice), 0).toFixed(2) || '0.00'}
                                    </p>
                                    <p className="text-sm text-gray-600">(This is the total of the returned items' original prices)</p>
                                </div>
                            </div>

                            <div className="mb-6 border-t pt-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-900">Return Tracking History:</h3>
                                {returnDetails.returnTrackingDetails?.length > 0 ? (
                                    <ul className="space-y-3">
                                        {returnDetails.returnTrackingDetails.map((track, index) => (
                                            <li key={index} className="bg-gray-50 p-4 rounded-lg shadow-sm border border-gray-200">
                                                <p className="font-semibold text-gray-800 capitalize">{track.status.replace(/_/g, ' ')}</p>
                                                <p className="text-sm text-gray-600">Date: {format(new Date(track.date), 'MMM d, yyyy h:mm a')}</p>
                                                <p className="text-sm text-gray-600">Location: {track.location || 'N/A'}</p>
                                                {track.notes && <p className="text-xs text-gray-500 mt-1">Notes: {track.notes}</p>}
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-700">No return tracking history available.</p>
                                )}
                            </div>

                            <div className="mb-6 border-t pt-6">
                                <h3 className="text-xl font-bold mb-4 text-gray-900">Update Return Status</h3>
                                <form onSubmit={handleUpdateStatus} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="returnStatus" className="block text-sm font-medium text-gray-700">
                                            New Return Status
                                        </label>
                                        <select
                                            id="returnStatus"
                                            value={returnStatus}
                                            onChange={(e) => setReturnStatus(e.target.value)}
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        >
                                            <option value="">Select Status</option>
                                            {returnStatusOptions.map(status => (
                                                <option key={status} value={status}>
                                                    {status.replace(/_/g, ' ')}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="returnTrackingNumber" className="block text-sm font-medium text-gray-700">
                                            Return Tracking Number (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="returnTrackingNumber"
                                            value={returnTrackingNumber}
                                            onChange={(e) => setReturnTrackingNumber(e.target.value)}
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Enter tracking number"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="returnLabelImageUrl" className="block text-sm font-medium text-gray-700">
                                            Return Label Image URL (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            id="returnLabelImageUrl"
                                            value={returnLabelImageUrl}
                                            onChange={(e) => setReturnLabelImageUrl(e.target.value)}
                                            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            placeholder="Enter image URL"
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end items-center">
                                        <button
                                            type="submit"
                                            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${loadingUpdateStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={loadingUpdateStatus}
                                        >
                                            {loadingUpdateStatus ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <PackageCheck className="mr-2 -ml-1 h-5 w-5" />}
                                            Update Status
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {(returnDetails.returnStatus === 'pending' || returnDetails.returnStatus === 'rejected') && (
                                <div className="mb-6 border-t pt-6">
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">Approve/Reject Return</h3>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleApprove}
                                            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 ${loadingApproveReject ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={loadingApproveReject}
                                        >
                                            {loadingApproveReject ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Check className="mr-2 -ml-1 h-5 w-5" />}
                                            Approve Return
                                        </button>
                                        <button
                                            onClick={handleReject}
                                            className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 ${loadingApproveReject ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            disabled={loadingApproveReject}
                                        >
                                            {loadingApproveReject ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <X className="mr-2 -ml-1 h-5 w-5" />}
                                            Reject Return
                                        </button>
                                    </div>
                                </div>
                            )}

                            {(returnDetails.returnStatus === 'delivered_to_warehouse' || returnDetails.returnStatus === 'return_processing') && (
                                <div className="mb-6 border-t pt-6">
                                    <h3 className="text-xl font-bold mb-4 text-gray-900">Process Refund</h3>
                                    <form onSubmit={handleProcessRefund} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="refundStatus" className="block text-sm font-medium text-gray-700">
                                                Refund Status
                                            </label>
                                            <select
                                                id="refundStatus"
                                                value={refundStatus}
                                                onChange={(e) => setRefundStatus(e.target.value)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                            >
                                                <option value="">Select Refund Status</option>
                                                {refundStatusOptions.map(status => (
                                                    <option key={status} value={status}>
                                                        {status.replace(/_/g, ' ')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-700">
                                                Refund Amount (Calculated from returned items)
                                            </label>
                                            <input
                                                type="number"
                                                id="refundAmount"
                                                value={returnDetails?.items?.reduce((total, item) => total + (item.quantity * item.price), 0).toFixed(2) || '0.00'}
                                                disabled // This field is now disabled as it's auto-calculated
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-600"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label htmlFor="refundReason" className="block text-sm font-medium text-gray-700">
                                                Refund Reason (Optional)
                                            </label>
                                            <textarea
                                                id="refundReason"
                                                rows="3"
                                                value={refundReason}
                                                onChange={(e) => setRefundReason(e.target.value)}
                                                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                placeholder="Enter refund reason"
                                            ></textarea>
                                        </div>
                                        <div className="md:col-span-2 flex justify-end items-center">
                                            <button
                                                type="submit"
                                                className={`inline-flex items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ${loadingProcessRefund ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                disabled={loadingProcessRefund}
                                            >
                                                {loadingProcessRefund ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <DollarSign className="mr-2 -ml-1 h-5 w-5" />}
                                                Process Refund
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Message variant="info">Select a return order to view its details.</Message>
                    )}
                </div>
            )}
        </div>
    );
};

export default ReturnOrderManagerPage;