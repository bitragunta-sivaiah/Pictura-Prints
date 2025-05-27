import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, resetOrder, cancelOrder } from '../../store/orderSlice';
import { requestReturn } from '../../store/returnOrderSlice';
import { format } from 'date-fns';
import {
    ArrowLeftIcon,
    MapPinIcon,
    PackageIcon,
    CreditCardIcon,
    HomeIcon,
    ReceiptIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    InfoIcon,
    StarIcon as LucideStarIcon,
    RotateCwIcon,
    BanIcon,
    PhoneCallIcon,
    UserIcon,
    X,
} from 'lucide-react';

const OPEN_CAGE_API_KEY = 'b80ec623de954c3abd3bd564ccdcf27b'; // Replace with your actual key

const Loader = () => (
    <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
    </div>
);
 

const Message = ({ variant = 'info', children }) => (
    <div className={`bg-${variant}-50 border border-${variant}-300 text-${variant}-700 px-4 py-3 rounded relative`} role="alert">
        <strong className="font-semibold">{variant === 'danger' ? 'Error!' : 'Info:'}</strong>
        <span className="block sm:inline">{children}</span>
    </div>
);

const StarRating = ({ rating, onRate }) => {
    const stars = Array.from({ length: 5 }, (_, index) => index + 1);
    return (
        <div className="flex items-center">
            {stars.map((star) => (
                <LucideStarIcon
                    key={star}
                    className={`w-5 h-5 cursor-pointer ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                    onClick={() => onRate(star)}
                />
            ))}
        </div>
    );
};

const OrderDetails = () => {
    const { id: orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { order, loading: orderLoading, error: orderError } = useSelector((state) => state.order);

    // State for managing modals and local data
    const [isOrderTrackingModalOpen, setIsOrderTrackingModalOpen] = useState(false); // Renamed for clarity
    const [isReturnTrackingModalOpen, setIsReturnTrackingModalOpen] = useState(false); // New state for return tracking modal
    const [locationNames, setLocationNames] = useState({});
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [returnItemsDetails, setReturnItemsDetails] = useState([]);
    const [generalReturnReason, setGeneralReturnReason] = useState('');
const [showCustomDetails, setShowCustomDetails] = useState(false);
 const [modalImageUrl, setModalImageUrl] = useState(null);

    // Function to open the modal with the clicked image
    const openImageModal = (imageUrl) => {
        setModalImageUrl(imageUrl);
    };

    // Function to close the modal
    const closeImageModal = () => {
        setModalImageUrl(null);
    };


    const toggleCustomDetails = () => {
        setShowCustomDetails(!showCustomDetails);
    };
    // Random tracking numbers for demonstration (replace with actual backend logic if needed)
    const [orderTrackingNumber, setOrderTrackingNumber] = useState('');
    const [returnTrackingNumber, setReturnTrackingNumber] = useState('');

    const { loading: returnLoading, error: returnError, success: returnSuccess } = useSelector((state) => state.returnOrder);
    const { loading: cancelLoading, error: cancelError, success: cancelSuccess } = useSelector((state) => state.order);

    useEffect(() => {
        dispatch(getOrderDetails(orderId));
        return () => {
            dispatch(resetOrder());
        };
    }, [dispatch, orderId]);

    useEffect(() => {
        if (order) {
            // Generate a random order tracking number if it doesn't exist or if the order changes
            if (!orderTrackingNumber) {
                setOrderTrackingNumber(`ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
            }

            // Generate a random return tracking number if returnDetails exist and it doesn't exist yet
            if (order.returnDetails && order.returnDetails.return_id && !returnTrackingNumber) {
                setReturnTrackingNumber(`RET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
            } else if (!order.returnDetails && returnTrackingNumber) {
                // Clear return tracking number if returnDetails are no longer present
                setReturnTrackingNumber('');
            }
        }
    }, [order, orderTrackingNumber, returnTrackingNumber]);

    useEffect(() => {
        if (order && order.items && isReturnModalOpen) {
            setReturnItemsDetails(
                order.items.map(item => ({
                    productId: item.product._id || item.product,
                    quantity: item.quantity,
                    returnReason: '',
                    condition: '',
                    otherReason: ''
                }))
            );
            setGeneralReturnReason('');
        }
    }, [order, isReturnModalOpen]);

    const parseLocationString = (locationStr) => {
        if (!locationStr || typeof locationStr !== 'string') {
            return null;
        }

        try {
            const parsed = JSON.parse(locationStr);
            if (typeof parsed === 'object' && parsed !== null && 'latitude' in parsed && 'longitude' in parsed) {
                return { lat: parseFloat(parsed.latitude), lng: parseFloat(parsed.longitude) };
            }
        } catch (e) {
            // Not a JSON string, continue
        }

        let cleanedStr = locationStr.replace(/"/g, '');

        const latLngMatch = cleanedStr.match(/Lat:\s*([-\d.]+),\s*Lng:\s*([-\d.]+)/);
        if (latLngMatch && latLngMatch.length === 3) {
            return { lat: parseFloat(latLngMatch[1]), lng: parseFloat(latLngMatch[2]) };
        }

        const commaSplit = cleanedStr.split(',').map(s => s.trim());
        if (commaSplit.length === 2 && !isNaN(parseFloat(commaSplit[0])) && !isNaN(parseFloat(commaSplit[1]))) {
            return { lat: parseFloat(commaSplit[1]), lng: parseFloat(commaSplit[0]) };
        }

        return null;
    };


    useEffect(() => {
        const processTrackingDetails = (details, typePrefix) => {
            if (details) {
                details.forEach((track, index) => {
                    const parsed = parseLocationString(track.location);
                    if (parsed) {
                        fetchLocationName(parsed.lat, parsed.lng, `${typePrefix}-${track._id || index}`);
                    }
                });
            }
        };

        if (order) {
            processTrackingDetails(order.trackingDetails, 'track');
            // Process return tracking details too
            processTrackingDetails(order.returnTrackingDetails, 'returnTrack');
        }
    }, [order]);

    useEffect(() => {
        if (returnSuccess) {
            alert('Return request submitted successfully!');
            setIsReturnModalOpen(false);
            setReturnItemsDetails([]);
            setGeneralReturnReason('');
            dispatch(getOrderDetails(orderId)); // Re-fetch order to show updated return status/tracking
        }
    }, [returnSuccess, dispatch, orderId]);

    useEffect(() => {
        if (cancelSuccess) {
            alert('Order cancelled successfully!');
            dispatch(getOrderDetails(orderId)); // Re-fetch order to show updated status
        }
    }, [cancelSuccess, dispatch, orderId]);

    const fetchLocationName = async (latitude, longitude, key) => {
        try {
            const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${latitude},${longitude}&key=${OPEN_CAGE_API_KEY}&pretty=1`
            );
            const data = await response.json();
            if (data?.results?.[0]?.components) {
                const components = data.results[0].components;
                const area =
                    components.neighbourhood ||
                    components.suburb ||
                    components.village ||
                    components.town;
                const city = components.city || components.town || components.village;
                const state = components.state;
                const formattedLocation = `${area ? area + ", " : ""}${
                    city ? city + ", " : ""
                }${state || ""}`;
                setLocationNames((prev) => ({
                    ...prev,
                    [key]: formattedLocation.trimEnd(", "),
                }));
            } else if (data?.results?.[0]?.formatted) {
                setLocationNames((prev) => ({
                    ...prev,
                    [key]: data.results[0].formatted,
                }));
            } else {
                setLocationNames((prev) => ({
                    ...prev,
                    [key]: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (Name not found)`,
                }));
            }
        } catch (error) {
            console.error(`Error fetching location name for ${key}:`, error);
            setLocationNames((prev) => ({
                ...prev,
                [key]: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)} (Error fetching name)`,
            }));
        }
    };

    // Renamed for clarity for Order Tracking Modal
    const openOrderTrackingModal = () => {
        setIsOrderTrackingModalOpen(true);
    };

    const closeOrderTrackingModal = () => {
        setIsOrderTrackingModalOpen(false);
    };

    // New functions for Return Tracking Modal
    const openReturnTrackingModal = () => {
        setIsReturnTrackingModalOpen(true);
    };

    const closeReturnTrackingModal = () => {
        setIsReturnTrackingModalOpen(false);
    };

    const handleReviewSubmit = () => {
        navigate(`/order/${order._id}/feedback`);
    };

    const openReturnModal = () => {
        setIsReturnModalOpen(true);
    };

    const closeReturnModal = () => {
        setIsReturnModalOpen(false);
        setReturnItemsDetails([]);
        setGeneralReturnReason('');
    };

    const handleReturnItemChange = (index, field, value) => {
        const updatedDetails = [...returnItemsDetails];
        updatedDetails[index][field] = value;
        setReturnItemsDetails(updatedDetails);
    };

    const handleReturnSubmit = () => {
        const isValidItemDetails = returnItemsDetails.every(item =>
            item.returnReason.trim() !== '' &&
            item.condition.trim() !== '' &&
            (item.returnReason !== 'other' || item.otherReason.trim() !== '')
        );

        if (!generalReturnReason.trim()) {
            alert('Please provide a general reason for the return.');
            return;
        }

        if (!isValidItemDetails) {
            alert('Please provide a return reason and condition for all items, and specify if "Other" is selected.');
            return;
        }

        const formattedReturnItems = returnItemsDetails.map(item => ({
            product: item.productId,
            quantity: item.quantity,
            returnReason: item.returnReason === 'other' ? item.otherReason : item.returnReason,
            condition: item.condition
        }));

        const returnData = {
            orderId: order._id,
            reason: generalReturnReason,
            returnItems: formattedReturnItems,
        };

        dispatch(requestReturn(returnData));
    };

    const handleCancelOrder = () => {
        if (window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
            dispatch(cancelOrder(order._id));
        }
    };

   const renderTrackingHistory = (trackingDetails, typePrefix, showAll = false, showPaymentSummary = false) => {
    if (!trackingDetails || trackingDetails.length === 0) {
        return <p className="text-gray-700 text-sm">No tracking information available yet.</p>;
    }

    // Sort details from oldest to newest for chronological display if showing all
    const sortedTrackingDetails = [...trackingDetails].sort((a, b) => new Date(a.date) - new Date(b.date));
    // If not showing all, just get the latest one (which is the last element after sorting oldest to newest)
    const detailsToRender = showAll ? sortedTrackingDetails : [sortedTrackingDetails[sortedTrackingDetails.length - 1]];

    return (
        <>
            <ul className="relative"> {/* Removed divide-y for a cleaner timeline */}
                {detailsToRender.map((track, index) => {
                    const isFailedOrCancelled = ['cancelled', 'failed', 'refunded', 'failed_delivery', 'denied'].includes(track.status);
                    const circleColor = isFailedOrCancelled ? 'border-red-500 bg-red-500' : 'border-green-500 bg-green-500';
                    const uniqueKey = track._id || `${typePrefix}-${track.status}-${track.date}-${index}`;
                    const locationDisplayKey = `${typePrefix}-${track._id || (trackingDetails.findIndex(t => (t._id || t.status + t.date) === (track._id || track.status + track.date)))}`;

                    return (
                        <li key={uniqueKey} className="flex items-start relative">
                            {/* Vertical line for timeline - only for full history and if not the last item */}
                            {showAll && index < detailsToRender.length - 1 && (
                                <div className={`absolute left-[10.5px] top-4 w-0.5 ${isFailedOrCancelled ? 'bg-red-300' : 'bg-green-300'} z-0`} style={{ height: 'calc(100% + 8px)' }}></div>
                            )}
                            <div className={`relative w-6 h-6 z-10 rounded-full border-2 ${circleColor} bg-white flex items-center justify-center`}>
                                <div className={`w-3 h-3 z-20 rounded-full ${circleColor}`}></div>
                            </div>
                            <div className="ml-4 flex-grow pb-8"> {/* Added padding-bottom to create space for the line to extend */}
                                <p className="font-semibold text-gray-800 text-sm capitalize">{track.status.replace(/_/g, ' ')}</p>
                                <p className="text-gray-600 text-xs">{format(new Date(track.date), 'dd MMM, h:mm a')}</p>
                                {track.location && (
                                    <p className="text-gray-500 text-xs">
                                        Location: {locationNames[locationDisplayKey] || track.location}
                                    </p>
                                )}
                              
                               
                            </div>
                        </li>
                    );
                })}
            </ul>

            {/* Payment Summary for Return Tracking */}
            {showPaymentSummary && order.returnDetails && order.returnDetails.actual_refund_amount != null && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="font-semibold text-green-800 mb-2 flex items-center">
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        Return Payment Summary
                    </h3>
                    <p className="text-green-700">
                        Refund Amount: <span className="font-bold text-lg">₹{(order.returnDetails.actual_refund_amount / 100).toFixed(2)}</span>
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                        {order.returnDetails.current_return_status === 'Refunded' ?
                            `Refund processed on: ${format(new Date(order.returnTrackingDetails.find(t => t.status === 'refunded')?.date || order.returnDetails.last_updated), 'dd MMM, h:mm a')}` :
                            'Refund is pending or in progress.'
                        }
                    </p>
                </div>
            )}
        </>
    );
};


    if (orderLoading) {
        return <Loader />;
    }

    if (orderError || returnError || cancelError) {
        return <Message variant="danger">{orderError || returnError || cancelError}</Message>;
    }

    if (!order) {
        return <Message>Order not found.</Message>;
    }

    // Determine the main status to display
    const displayStatus = order.returnDetails && order.returnDetails.current_return_status
        ? `Return: ${order.returnDetails.current_return_status}`
        : order.status;

    const isProblematicStatus = ['cancelled', 'failed', 'refunded', 'failed_delivery', 'denied'].includes(order.status) || (order.returnDetails && ['denied', 'cancelled'].includes(order.returnDetails.current_return_status));
    const statusTextColor = isProblematicStatus ? 'text-red-700' : 'text-blue-700';
    const statusIcon = order.returnDetails && order.returnDetails.current_return_status ? (
        <RotateCwIcon className="inline-block ml-1 w-4 h-4 text-yellow-600" />
    ) : isProblematicStatus ? (
        <XCircleIcon className="inline-block ml-1 w-4 h-4 text-red-500" />
    ) : order.status === 'delivered' ? (
        <CheckCircleIcon className="inline-block ml-1 w-4 h-4 text-green-500" />
    ) : (
        <ClockIcon className="inline-block ml-1 w-4 h-4 text-yellow-500 animate-pulse" />
    );

    const isCancellable = order.status === 'pending' || order.status === 'confirm';
    // Returnable if delivered and no return request exists yet
    const isReturnable = order.status === 'delivered' && (!order.returnDetails || !order.returnDetails.return_id);

    const showDeliveryPartnerInfo = order.status === 'out_for_delivery' && order.deliveryPartner && order.deliveryPartner.username && order.deliveryPartner.phoneNumber;

    // Check if there is any return tracking data available
    const hasReturnTracking = order.returnTrackingDetails && order.returnTrackingDetails.length > 0;
    // Check if there is any order tracking data available
    const hasOrderTracking = order.trackingDetails && order.trackingDetails.length > 0;


    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
                <div className="mb-6">
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition duration-200 font-medium"
                    >
                        <ArrowLeftIcon className="mr-2 w-5 h-5" />
                        Back to Orders
                    </button>
                    <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mt-4">Order Details</h1>
                    <p className="text-gray-500 mt-1">Order Number: {order.orderNumber}</p>
                </div>

               {/* Section 1: User Details */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <UserIcon className="mr-2 w-5 h-5 text-teal-500" />
                            User Details
                        </h2>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <p className="text-gray-700">
                            <span className="font-semibold">Username:</span> {order.user.username}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-semibold">Email:</span> {order.user.email}
                        </p>
                    </div>
                </div>

                {/* Section 2: Order and Product Details */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <PackageIcon className="mr-2 w-5 h-5 text-indigo-500" />
                            Order & Product Summary
                        </h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {order.items &&
                            order.items.map((item) => {
                                const colorMatch = item.product?.availableColors?.find(
                                    (colorObj) => colorObj.color === item.color
                                );
                                const imageUrl = colorMatch?.images?.front;

                                return (
                                    <li key={item._id} className="px-4 py-4 sm:px-6 flex items-center">
                                        <div className="w-24 h-24 rounded-md overflow-hidden shadow-sm mr-4">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                    <InfoIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-gray-800">{item.product?.name}</p>
                                            <div className="flex items-center text-sm text-gray-600">
                                                Color:
                                                <span
                                                    className="inline-block w-5 h-5 rounded-full ml-1 shadow-sm"
                                                    style={{ backgroundColor: item.color }}
                                                ></span>
                                                <span className="ml-2 font-medium">{item.color}</span>,
                                                <span className="ml-4">Size: <span className="font-medium">{item.size}</span></span>
                                            </div>
                                          {item.customizations && item.customizations.length > 0 && (
                <div className="mt-2"> {/* Added margin-top for spacing below other item details */}
                    <button
                        onClick={toggleCustomDetails}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 text-sm"
                    >
                        {showCustomDetails ? 'Hide Customization Details' : 'Show Customization Details'}
                    </button>

                    {showCustomDetails && (
                        <div className="mt-2 p-3 border rounded-md bg-gray-50"> {/* Added some padding, border, and background for the details section */}
                            <p className="text-xs text-gray-500 font-semibold mb-2">Customizations:</p>
                            <ul className="list-disc pl-4 mt-1">
                                {item.customizations.map((customization, idx) => (
                <li key={customization._id || idx} className="text-xs text-gray-600 mb-2">
                    {/* Front Customizations */}
                    {customization.front && customization.front.length > 0 && (
                        <div className="mb-1">
                            <p className="font-medium">Front Design:</p>
                            {customization.front.map((f, fIdx) => (
                                <div key={f._id || fIdx} className="ml-2">
                                    {f.url && (
                                        <img
                                            src={f.url}
                                            alt="Front Design"
                                            className="w-10 h-auto mt-1 border-1 rounded cursor-pointer" // Added cursor-pointer
                                            onClick={() => openImageModal(f.url)} // Added onClick handler
                                        />
                                    )}
                                    {f.text && (
                                        <p style={{
                                            fontFamily: f.fontFamily || 'sans-serif',
                                            
                                            fontWeight: f.fontWeight || 'normal',
                                            color: f.color || '#000000',
                                            textTransform: f.fontCase === 'uppercase' ? 'uppercase' :
                                                f.fontCase === 'lowercase' ? 'lowercase' : 'none'
                                        }}className='text-md mt-2'>
                                            Text: {f.text}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Back Customizations */}
                    {customization.back && customization.back.length > 0 && (
                        <div className="mb-1">
                            <p className="font-medium">Back Design:</p>
                            {customization.back.map((b, bIdx) => (
                                <div key={b._id || bIdx} className="ml-2">
                                    {b.url && (
                                        <img
                                            src={b.url}
                                            alt="Back Design"
                                            className="max-w-xs h-auto mt-1 border rounded cursor-pointer" // Added cursor-pointer
                                            onClick={() => openImageModal(b.url)} // Added onClick handler
                                        />
                                    )}
                                    {b.text && (
                                        <p style={{
                                            fontFamily: b.fontFamily || 'sans-serif',
                                            
                                            fontWeight: b.fontWeight || 'normal',
                                            color: b.color || '#000000',
                                            textTransform: b.fontCase === 'uppercase' ? 'uppercase' :
                                                b.fontCase === 'lowercase' ? 'lowercase' : 'none'
                                        }} className='text-md mt-2'>
                                            Text: {b.text}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Left Sleeve Customizations */}
                    {customization.leftSleeve && customization.leftSleeve.length > 0 && (
                        <div className="mb-1">
                            <p className="font-medium">Left Sleeve Design:</p>
                            {customization.leftSleeve.map((l, lIdx) => (
                                <div key={l._id || lIdx} className="ml-2">
                                    {l.url && (
                                        <img
                                            src={l.url}
                                            alt="Left Sleeve Design"
                                            className="max-w-xs h-auto mt-1 border rounded cursor-pointer" // Added cursor-pointer
                                            onClick={() => openImageModal(l.url)} // Added onClick handler
                                        />
                                    )}
                                    {l.text && (
                                        <p style={{
                                            fontFamily: l.fontFamily || 'sans-serif',
                                            
                                            fontWeight: l.fontWeight || 'normal',
                                            color: l.color || '#000000',
                                            textTransform: l.fontCase === 'uppercase' ? 'uppercase' :
                                                l.fontCase === 'lowercase' ? 'lowercase' : 'none'
                                        }} className='text-md mt-2'>
                                            Text: {l.text}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Right Sleeve Customizations */}
                    {customization.rightSleeve && customization.rightSleeve.length > 0 && (
                        <div className="mb-1">
                            <p className="font-medium">Right Sleeve Design:</p>
                            {customization.rightSleeve.map((r, rIdx) => (
                                <div key={r._id || rIdx} className="ml-2">
                                    {r.url && (
                                        <img
                                            src={r.url}
                                            alt="Right Sleeve Design"
                                            className="max-w-xs h-auto mt-1 border rounded cursor-pointer" // Added cursor-pointer
                                            onClick={() => openImageModal(r.url)} // Added onClick handler
                                        />
                                    )}
                                    {r.text && (
                                        <p style={{
                                            fontFamily: r.fontFamily || 'sans-serif',
                                         
                                            fontWeight: r.fontWeight || 'normal',
                                            color: r.color || '#000000',
                                            textTransform: r.fontCase === 'uppercase' ? 'uppercase' :
                                                r.fontCase === 'lowercase' ? 'lowercase' : 'none'
                                        }} className='text-md mt-2'>
                                            Text: {r.text}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </li>
            ))}

                            </ul>
                        </div>
                    )}
                </div>
            )}
                                            <p className="text-gray-700 text-sm mt-1">
                                                Quantity: <span className="font-semibold">{item.quantity}</span>
                                            </p>
                                            <p className="text-gray-800 font-bold mt-1">
                                                Price: ₹{(item.finalPrice) }
                                            </p>
                                        </div>
                                    </li>
                                );
                            })}
                    </ul>
                </div>


                {/* Section 2: Order Status */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <ClockIcon className="mr-2 w-5 h-5 text-gray-600" />
                            Order Status
                        </h2>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <p className={`text-xl font-semibold ${statusTextColor} flex items-center capitalize`}>
                            {displayStatus.replace(/_/g, ' ')} {statusIcon}
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                            Order placed on: {format(new Date(order.orderDate), 'dd MMM, h:mm a')}
                        </p>
                        {order.expectedDeliveryDate && (
                            <p className="text-gray-600 text-sm mt-1">
                                Expected Delivery: {format(new Date(order.expectedDeliveryDate), 'dd MMM')}
                            </p>
                        )}
                        {showDeliveryPartnerInfo && (
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                                <h3 className="font-semibold text-blue-800 mb-1">Your Delivery Partner:</h3>
                                <p className="text-blue-700 text-sm">
                                    Name: <span className="font-medium">{order.deliveryPartner.username}</span>
                                </p>
                                <p className="text-blue-700 text-sm flex items-center mt-1">
                                    Phone: <span className="font-medium mr-2">{order.deliveryPartner.phoneNumber}</span>
                                    <a
                                        href={`tel:${order.deliveryPartner.phoneNumber}`}
                                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400"
                                    >
                                        <PhoneCallIcon className="w-3 h-3 mr-1" /> Call
                                    </a>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 3: Tracking Details (Current Status) - Unified for Order & Return */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <MapPinIcon className="mr-2 w-5 h-5 text-green-500" />
                            Tracking Information
                        </h2>
                    </div>
                    <div className="p-4 sm:p-6">
                        {/* Conditional Rendering for Return Tracking vs. Order Tracking */}
                        {hasReturnTracking ? (
                            <>
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Current Return Status</h3>
                                {/* Display only the latest return status initially */}
                                {renderTrackingHistory(order.returnTrackingDetails, 'returnTrack', false)}
                                <button
                                    onClick={openReturnTrackingModal} // Open new return tracking modal
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                                >
                                    <RotateCwIcon className="mr-2 w-4 h-4" /> View Return Tracking History
                                </button>
                            </>
                        ) : hasOrderTracking ? (
                            <>
                                <h3 className="text-md font-semibold text-gray-800 mb-2">Current Order Delivery Status</h3>
                                {/* Display only the latest order delivery status initially */}
                                {renderTrackingHistory(order.trackingDetails, 'track', false)}
                                <button
                                    onClick={openOrderTrackingModal} // Open order tracking modal
                                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <MapPinIcon className="mr-2 w-4 h-4" /> View Order Tracking History
                                </button>
                            </>
                        ) : (
                            <p className="text-gray-700 text-sm">No tracking information available yet for this order.</p>
                        )}
                    </div>
                </div>

                <div className='grid grid-cols-2 lg:grid-cols-3 gap-4'>
  {/* Section 4: Shipping Address */}
                <div className="bg-white shadow rounded-lg h-fit overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <HomeIcon className="mr-2 w-5 h-5 text-purple-500" />
                            Shipping Address
                        </h2>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <address className="text-gray-700 not-italic">
                            <p className="font-semibold">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.state}, {order.shippingAddress.country}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </address>
                    </div>
                </div>
                {/* Section 4: Billing Address */}
                <div className="bg-white shadow rounded-lg h-fit overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <HomeIcon className="mr-2 w-5 h-5 text-purple-500" />
                            Billing Address
                        </h2>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <address className="text-gray-700 not-italic">
                            <p className="font-semibold">{order.billingAddress.fullName}</p>
                            <p>{order.billingAddress.address}</p>
                            <p>{order.billingAddress.city}, {order.billingAddress.postalCode}</p>
                            <p>{order.billingAddress.state}, {order.billingAddress.country}</p>
                            <p>Phone: {order.billingAddress.phone}</p>
                        </address>
                    </div>
                </div>

                {/* Section 5: Payment Summary */}
                <div className="bg-white shadow rounded-lg h-fit overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <ReceiptIcon className="mr-2 w-5 h-5 text-emerald-500" />
                            Payment Summary
                        </h2>
                    </div>
                    <div className="px-4 py-5 sm:px-6">
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Items Price:</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                                    ₹{(order.total)}
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Shipping Price:</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                                    ₹{(order.shipping) }
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Tax Price:</dt>
                                <dd className="mt-1 text-sm text-gray-900 font-semibold">
                                    ₹{(order.tax) }
                                </dd>
                            </div>
                            <div className="sm:col-span-1">
                                <dt className="text-sm font-medium text-gray-500">Total Price:</dt>
                                <dd className="mt-1 text-lg text-indigo-600 font-bold">
                                    ₹{(order.total) }
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Payment Method:</dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                    {order.paymentMethod}
                                </dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Payment Status:</dt>
                                <dd className={`mt-1 text-sm font-semibold ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                    {order.paymentStatus}
                                    {order.paidAt && <span className="text-gray-500 ml-2">on {format(new Date(order.paidAt), 'dd MMM, h:mm a')}</span>}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
</div>

                {/* Section 6: Actions */}
                <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
                    <div className="px-4 py-5 sm:px-6 bg-gray-50 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                            <InfoIcon className="mr-2 w-5 h-5 text-gray-600" />
                            Actions
                        </h2>
                    </div>
                    <div className="px-4 py-5 sm:px-6 flex flex-wrap gap-3">
                        {isCancellable && (
                            <button
                                onClick={handleCancelOrder}
                                disabled={cancelLoading}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <BanIcon className="mr-2 w-4 h-4" />
                                {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                            </button>
                        )}

                        {isReturnable && (
                            <button
                                onClick={openReturnModal}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                            >
                                <RotateCwIcon className="mr-2 w-4 h-4" /> Request Return
                            </button>
                        )}

                        {order.status === 'delivered' && order.deliveryPartner && (
                            <button
                                onClick={handleReviewSubmit}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                                <LucideStarIcon className="mr-2 w-4 h-4" /> Rate Delivery
                            </button>
                        )}
                    </div>
                </div>

                {/* Order Tracking Modal */}
                {isOrderTrackingModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                        <div className="relative p-6 w-full max-w-lg mx-auto bg-white rounded-lg shadow-xl">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Order Tracking History</h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                    onClick={closeOrderTrackingModal}
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-4 max-h-96 overflow-y-auto">
                                <p className="text-gray-700 text-sm mb-4">Tracking Number: <span className="font-semibold">{orderTrackingNumber}</span></p>
                                {renderTrackingHistory(order.trackingDetails, 'track', true)}
                            </div>
                            <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200"
                                    onClick={closeOrderTrackingModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Return Tracking Modal */}
                {isReturnTrackingModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                        <div className="relative p-6 w-full max-w-lg mx-auto bg-white rounded-lg shadow-xl">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Return Tracking History</h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                    onClick={closeReturnTrackingModal}
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-4 max-h-96 overflow-y-auto">
                                <p className="text-gray-700 text-sm mb-4">Return Tracking Number: <span className="font-semibold">{returnTrackingNumber}</span></p>
                                {renderTrackingHistory(order.returnTrackingDetails, 'returnTrack', true, true)}
                            </div>
                            <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                                <button
                                    type="button"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200"
                                    onClick={closeReturnTrackingModal}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Return Request Modal */}
                {isReturnModalOpen && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
                        <div className="relative p-6 w-full max-w-2xl mx-auto bg-white rounded-lg shadow-xl">
                            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                                <h3 className="text-xl font-semibold text-gray-900">Request Return for Order {order.orderNumber}</h3>
                                <button
                                    type="button"
                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                                    onClick={closeReturnModal}
                                >
                                    <XCircleIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="mt-4 max-h-96 overflow-y-auto pr-2">
                                {returnError && <Message variant="danger" className="mb-4">{returnError}</Message>}
                                <div className="mb-4">
                                    <label htmlFor="generalReason" className="block text-sm font-medium text-gray-700 mb-1">
                                        General Reason for Return:
                                    </label>
                                    <textarea
                                        id="generalReason"
                                        value={generalReturnReason}
                                        onChange={(e) => setGeneralReturnReason(e.target.value)}
                                        rows="3"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        placeholder="e.g., Item not as described, changed mind, etc."
                                    ></textarea>
                                </div>

                                <h4 className="text-md font-medium text-gray-800 mb-3">Item-specific Return Details:</h4>
                                {order.items.map((item, index) => (
                                    <div key={item._id} className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
                                        <p className="font-semibold text-gray-800 mb-2">
                                            {item.product?.name} ({item.quantity} pcs)
                                        </p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label htmlFor={`reason-${item._id}`} className="block text-sm font-medium text-gray-700">
                                                    Return Reason:
                                                </label>
                                                <select
                                                    id={`reason-${item._id}`}
                                                    value={returnItemsDetails[index]?.returnReason || ''}
                                                    onChange={(e) => handleReturnItemChange(index, 'returnReason', e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="">Select a reason</option>
                                                    <option value="damaged">Damaged or Defective</option>
                                                    <option value="wrong_item">Wrong Item Received</option>
                                                    <option value="not_as_described">Not as Described</option>
                                                    <option value="size_issue">Size Issue</option>
                                                    <option value="changed_mind">Changed Mind</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor={`condition-${item._id}`} className="block text-sm font-medium text-gray-700">
                                                    Condition:
                                                </label>
                                                <select
                                                    id={`condition-${item._id}`}
                                                    value={returnItemsDetails[index]?.condition || ''}
                                                    onChange={(e) => handleReturnItemChange(index, 'condition', e.target.value)}
                                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="">Select condition</option>
                                                    <option value="new">New / Unused</option>
                                                    <option value="used">Used / Worn (explain below)</option>
                                                    <option value="damaged">Damaged (explain below)</option>
                                                </select>
                                            </div>
                                        </div>
                                        {returnItemsDetails[index]?.returnReason === 'other' && (
                                            <div className="mt-4">
                                                <label htmlFor={`otherReason-${item._id}`} className="block text-sm font-medium text-gray-700 mb-1">
                                                    Please specify "Other" reason:
                                                </label>
                                                <input
                                                    type="text"
                                                    id={`otherReason-${item._id}`}
                                                    value={returnItemsDetails[index]?.otherReason || ''}
                                                    onChange={(e) => handleReturnItemChange(index, 'otherReason', e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                    placeholder="e.g., received wrong size, but not in options"
                                                />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
                                <button
                                    type="button"
                                    className="mr-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md border border-gray-300 hover:bg-gray-200"
                                    onClick={closeReturnModal}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleReturnSubmit}
                                    disabled={returnLoading}
                                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {returnLoading ? 'Submitting...' : 'Submit Return Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
{/* Image Modal/Lightbox */}
            {modalImageUrl && (
                <div
                    className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={closeImageModal} // Close modal when clicking outside the image
                >
                    <div className="relative" onClick={e => e.stopPropagation()}> {/* Prevent closing when clicking on the image */}
                        <img
                            src={modalImageUrl}
                            alt="Full Screen Customization"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow"
                        />
                        <button
                            className="absolute top-2 right-2 bg-white text-gray-800 rounded-full p-2 text-lg font-bold hover:bg-gray-200"
                            onClick={closeImageModal}
                        >
                            <X/>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;