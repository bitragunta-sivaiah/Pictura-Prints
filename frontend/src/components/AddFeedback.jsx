import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { CircleX, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Assuming these are your Redux slices (adjust paths as needed)
import {
    submitFeedback,
    selectFeedbackLoading,
    selectFeedbackError,
    clearFeedbackDetails,
} from '../store/feedbackSlice';
import {
    uploadImageToCloudinary,
    clearImageUrl,
    selectImageUrl,
    selectUploadProgress,
    selectLoading as selectCloudinaryLoading,
    selectError as selectCloudinaryError,
} from '../store/cloundarySlice';
import {
    getOrderDetails,
    selectOrder,
    selectOrderLoading,
    selectOrderError,
    resetOrder,
} from '../store/orderSlice';

// --- Reusable StarRating Component ---
const StarRating = ({ initialRating = 0, onRatingChange, size = 24 }) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [currentRating, setCurrentRating] = useState(initialRating);

    useEffect(() => {
        setCurrentRating(initialRating); // Keep in sync with prop changes
    }, [initialRating]);

    const handleMouseMove = (event, starIndex) => {
        const starRect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - starRect.left;
        const isHalf = x < starRect.width / 2;
        setHoverRating(starIndex + (isHalf ? 0.5 : 1));
    };

    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const handleClick = (rating) => {
        setCurrentRating(rating);
        onRatingChange(rating);
    };

    return (
        <div className="flex items-center">
            {[...Array(5)].map((_, i) => {
                const ratingValue = i + 1;
                const displayRating = hoverRating || currentRating;
                const fillPercentage =
                    displayRating >= ratingValue
                        ? 100
                        : displayRating > i && displayRating < ratingValue
                            ? (displayRating - i) * 100
                            : 0;

                return (
                    <div
                        key={i}
                        className="relative cursor-pointer"
                        onMouseMove={(e) => handleMouseMove(e, i)}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(hoverRating)}
                    >
                        <Star
                            className="text-gray-300" // Outline color
                            size={size}
                            strokeWidth={1.5}
                            fill="none" // No default fill
                        />
                        {fillPercentage > 0 && (
                            <div
                                className="absolute top-0 left-0 overflow-hidden"
                                style={{ width: `${fillPercentage}%` }}
                            >
                                <Star
                                    className="text-yellow-500" // Fill color
                                    size={size}
                                    strokeWidth={1.5}
                                    fill="currentColor" // Use fill for the color
                                />
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
// --- End StarRating Component ---


// Define aspects and issues based on the Mongoose schema
const productAspectOptions = [
    'product_quality',
    'product_accuracy',
    'pricing_value',
    'other_aspect'
];

const productIssueOptions = [
    'item_damaged',
    'item_incorrect',
    'item_missing',
    'other_issue',
];

const deliveryAspectOptions = [
    'delivery_speed',
    'delivery_packaging',
    'delivery_partner_professionalism',
    'other_aspect'
];

const deliveryIssueOptions = [
    'delivery_late',
    'delivery_failed_attempt',
    'delivery_partner_behavior',
    'packaging_poor',
    'other_issue',
];

const overallAspectOptions = [
    'overall_experience',
    'customer_service',
    'website_experience',
    'ease_of_ordering',
    'return_process',
    'refund_process',
    'other_aspect'
];

const overallIssueOptions = [
    'website_technical_issue',
    'customer_service_unresponsive',
    'return_process_difficulty',
    'refund_delay',
    'other_issue',
];

const AddFeedbackPage = () => {
    const { orderId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const order = useSelector(selectOrder);
    const orderLoading = useSelector(selectOrderLoading);
    const orderError = useSelector(selectOrderError);

    const feedbackLoading = useSelector(selectFeedbackLoading);
    const feedbackError = useSelector(selectFeedbackError);

    const uploadedImageUrl = useSelector(selectImageUrl);
    const uploadProgress = useSelector(selectUploadProgress);
    const cloudinaryLoading = useSelector(selectCloudinaryLoading);
    const cloudinaryError = useSelector(selectCloudinaryError);

    // State for Delivery Partner Feedback
    const [deliveryFeedbackState, setDeliveryFeedbackState] = useState({
        rating: 0,
        comment: '',
        aspects: [],
        issues: [],
        // media: [], // Removed as per schema
    });

    // State for Overall Order Feedback (directly maps to root fields)
    const [overallFeedbackState, setOverallFeedbackState] = useState({
        rating: 0,
        comment: '',
        aspects: [],
        issues: [],
        // media: [], // Removed as per schema
    });

    // State for Product Specific Feedbacks (keyed by product._id)
    const [productFeedbacksState, setProductFeedbacksState] = useState({});

    // This state tracks which feedback section is currently attempting to upload media
    const [activeMediaUploadFor, setActiveMediaUploadFor] = useState(null); // 'delivery', 'overall', or product._id

    // Effect to fetch order details on component mount
    useEffect(() => {
        if (orderId) {
            dispatch(getOrderDetails(orderId));
        }
        // Cleanup Redux state on unmount
        return () => {
            dispatch(resetOrder());
            dispatch(clearFeedbackDetails());
            dispatch(clearImageUrl()); // Clear any lingering image uploads from Cloudinary slice
        };
    }, [dispatch, orderId]);

    // Effect to display errors
    useEffect(() => {
        if (orderError) {
            toast.error(`Error fetching order: ${orderError}`);
        }
        if (feedbackError) {
            toast.error(`Feedback submission error: ${feedbackError}`);
        }
        if (cloudinaryError) {
            toast.error(`Image upload error: ${cloudinaryError}`);
        }
    }, [orderError, feedbackError, cloudinaryError]);

    // Effect to handle uploaded image URL and update respective feedback state
    useEffect(() => {
        if (uploadedImageUrl && activeMediaUploadFor) {
            // Only product feedback has a media array
            if (productFeedbacksState[activeMediaUploadFor]) {
                setProductFeedbacksState((prev) => ({
                    ...prev,
                    [activeMediaUploadFor]: {
                        ...(prev[activeMediaUploadFor] || { media: [] }), // Ensure media array exists
                        media: [...(prev[activeMediaUploadFor]?.media || []), uploadedImageUrl],
                    },
                }));
            }
            dispatch(clearImageUrl()); // Clear URL from Cloudinary slice, ready for next upload
            setActiveMediaUploadFor(null); // Reset active upload context
        }
    }, [uploadedImageUrl, activeMediaUploadFor, dispatch, productFeedbacksState]); // Added productFeedbacksState to dependency array

    const handleRatingChange = (type, id, rating) => {
        if (type === 'delivery') {
            setDeliveryFeedbackState((prev) => ({ ...prev, rating }));
        } else if (type === 'overall') {
            setOverallFeedbackState((prev) => ({ ...prev, rating }));
        } else if (type === 'product') {
            setProductFeedbacksState((prev) => ({
                ...prev,
                [id]: { ...(prev[id] || {}), rating },
            }));
        }
    };

    const handleCommentChange = (type, id, comment) => {
        if (type === 'delivery') {
            setDeliveryFeedbackState((prev) => ({ ...prev, comment }));
        } else if (type === 'overall') {
            setOverallFeedbackState((prev) => ({ ...prev, comment }));
        } else if (type === 'product') {
            setProductFeedbacksState((prev) => ({
                ...prev,
                [id]: { ...(prev[id] || {}), comment },
            }));
        }
    };

    const handleAspectChange = (type, id, aspect) => {
        const updater = (prevItem) => {
            const currentAspects = prevItem?.aspects || [];
            return currentAspects.includes(aspect)
                ? currentAspects.filter((a) => a !== aspect)
                : [...currentAspects, aspect];
        };

        if (type === 'delivery') {
            setDeliveryFeedbackState((prev) => ({
                ...prev,
                aspects: updater(prev),
            }));
        } else if (type === 'overall') {
            setOverallFeedbackState((prev) => ({
                ...prev,
                aspects: updater(prev),
            }));
        } else if (type === 'product') {
            setProductFeedbacksState((prev) => ({
                ...prev,
                [id]: {
                    ...(prev[id] || {}),
                    aspects: updater(prev[id]),
                },
            }));
        }
    };

    const handleIssueChange = (type, id, issue) => {
        const updater = (prevItem) => {
            const currentIssues = prevItem?.issues || [];
            return currentIssues.includes(issue)
                ? currentIssues.filter((i) => i !== issue)
                : [...currentIssues, issue];
        };

        if (type === 'delivery') {
            setDeliveryFeedbackState((prev) => ({
                ...prev,
                issues: updater(prev),
            }));
        } else if (type === 'overall') {
            setOverallFeedbackState((prev) => ({
                ...prev,
                issues: updater(prev),
            }));
        } else if (type === 'product') {
            setProductFeedbacksState((prev) => ({
                ...prev,
                [id]: {
                    ...(prev[id] || {}),
                    issues: updater(prev[id]),
                },
            }));
        }
    };

    const handleImageUpload = (event, productId) => { // Removed type, simplified to only accept productId
        const file = event.target.files[0];
        if (file) {
            setActiveMediaUploadFor(productId); // Only product feedback has media
            dispatch(uploadImageToCloudinary(file));
            event.target.value = null; // Clear the input so same file can be selected again
        }
    };

    const handleRemoveImage = (productId, imageUrlToRemove) => { // Removed type, simplified to only accept productId
        setProductFeedbacksState((prev) => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                media: (prev[productId]?.media || []).filter((url) => url !== imageUrlToRemove),
            },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!order) {
            toast.error('Order details not loaded. Please try again.');
            return;
        }

        // Prepare delivery feedback if applicable
        const deliveryFeedback = order.deliveryPartner && (deliveryFeedbackState.rating > 0 || deliveryFeedbackState.comment || deliveryFeedbackState.issues.length > 0 || deliveryFeedbackState.aspects.length > 0)
            ? {
                deliveryPartner: order.deliveryPartner._id,
                rating: deliveryFeedbackState.rating || 1,
                comment: deliveryFeedbackState.comment,
                aspects: deliveryFeedbackState.aspects.length > 0 ? deliveryFeedbackState.aspects : ['delivery_speed'], // Default aspect
                issues: deliveryFeedbackState.issues,
            } : null;

        // Prepare overall feedback (directly on the root feedback document)
        const overallRating = overallFeedbackState.rating || 1;
        const overallComment = overallFeedbackState.comment;
        const overallAspects = overallFeedbackState.aspects.length > 0 ? overallFeedbackState.aspects : ['overall_experience']; // Default aspect
        const overallIssues = overallFeedbackState.issues;


        // Prepare product specific feedbacks
        const productFeedbacks = [];
        order.items.forEach((item) => {
            const productFeedback = productFeedbacksState[item.product._id];
            if (productFeedback && (productFeedback.rating > 0 || productFeedback.comment || productFeedback.media?.length > 0 || productFeedback.issues?.length > 0 || productFeedback.aspects?.length > 0)) {
                productFeedbacks.push({
                    product: item.product._id,
                    rating: productFeedback.rating || 1,
                    comment: productFeedback.comment,
                    aspects: productFeedback.aspects?.length > 0 ? productFeedback.aspects : ['product_quality'], // Default aspect
                    issues: productFeedback.issues || [],
                    media: productFeedback.media || [],
                });
            }
        });

        // Basic validation: ensure at least one section has feedback
        if (overallRating === 0 && !overallComment && overallAspects.length === 0 && overallIssues.length === 0 &&
            !deliveryFeedback && productFeedbacks.length === 0) {
            toast.error('Please provide at least one rating, comment, or selected aspect/issue for any section to submit feedback.');
            return;
        }

        const feedbackData = {
            order: order._id,
            user: order.user._id,
            overallRating: overallRating,
            overallComment: overallComment,
            overallAspects: overallAspects,
            overallIssues: overallIssues,
            // Only include deliveryFeedback if it's actually provided
            ...(deliveryFeedback && { deliveryFeedback }),
            productFeedbacks: productFeedbacks, // Always include, even if empty array
        };

        console.log("Comprehensive Feedback prepared for submission:", feedbackData);

        const resultAction = await dispatch(submitFeedback(feedbackData));

        if (submitFeedback.fulfilled.match(resultAction)) {
            toast.success('Feedback submitted successfully!');
            navigate(`/my-orders/${orderId}`);
        } else {
            // Error toast is already handled by the thunk's error message
            console.error("Failed to submit feedback:", resultAction.payload);
        }
    };

    if (orderLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-gray-700">Loading order details...</p>
            </div>
        );
    }

    if (orderError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-500 text-lg">Error: {orderError}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-gray-600 text-lg">No order found for this ID.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 md:p-8 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
                Provide Feedback for Order #{order.orderNumber}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Overall Order Feedback Section */}
                <div className="bg-white p-6 rounded-lg shadow-md border border-green-200">
                    <h2 className="text-2xl font-semibold text-green-700 mb-4">
                        Overall Order Feedback
                    </h2>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Rating:
                        </label>
                        <StarRating
                            initialRating={overallFeedbackState.rating}
                            onRatingChange={(rating) =>
                                handleRatingChange('overall', null, rating)
                            }
                        />
                    </div>
                    <div className="mb-4">
                        <label
                            htmlFor="orderComment"
                            className="block text-gray-700 text-sm font-bold mb-2"
                        >
                            Comment:
                        </label>
                        <textarea
                            id="orderComment"
                            value={overallFeedbackState.comment}
                            onChange={(e) =>
                                handleCommentChange('overall', null, e.target.value)
                            }
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y min-h-[80px]"
                            placeholder="Share your overall order experience..."
                        ></textarea>
                    </div>

                    {/* Aspects for Overall Order */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Aspects:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {overallAspectOptions.map((aspect) => (
                                <label
                                    key={aspect}
                                    className={`inline-flex items-center px-3 py-1 border rounded-full text-sm cursor-pointer transition-colors duration-200 ${
                                        overallFeedbackState.aspects.includes(aspect)
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-green-100'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-green-600 hidden"
                                        checked={overallFeedbackState.aspects.includes(aspect)}
                                        onChange={() => handleAspectChange('overall', null, aspect)}
                                    />
                                    {aspect.replace(/_/g, ' ')}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Issues for Overall Order */}
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Issues:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {overallIssueOptions.map((issue) => (
                                <label
                                    key={issue}
                                    className={`inline-flex items-center px-3 py-1 border rounded-full text-sm cursor-pointer transition-colors duration-200 ${
                                        overallFeedbackState.issues.includes(issue)
                                            ? 'bg-red-500 text-white border-red-500'
                                            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-100'
                                    }`}
                                >
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-red-600 hidden"
                                        checked={overallFeedbackState.issues.includes(issue)}
                                        onChange={() => handleIssueChange('overall', null, issue)}
                                    />
                                    {issue.replace(/_/g, ' ')}
                                </label>
                            ))}
                        </div>
                    </div>
                    {/* Media upload removed as per schema */}
                </div>

                {/* Delivery Partner Feedback Section */}
                {order.deliveryPartner && (
                    <div className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                        <h2 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center">
                            Feedback for Delivery Partner:{' '}
                            <span className="ml-2 font-medium">
                                {order.deliveryPartner.name}
                            </span>
                        </h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Rating:
                            </label>
                            <StarRating
                                initialRating={deliveryFeedbackState.rating}
                                onRatingChange={(rating) =>
                                    handleRatingChange('delivery', null, rating)
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="deliveryComment"
                                className="block text-gray-700 text-sm font-bold mb-2"
                            >
                                Comment:
                            </label>
                            <textarea
                                id="deliveryComment"
                                value={deliveryFeedbackState.comment}
                                onChange={(e) =>
                                    handleCommentChange('delivery', null, e.target.value)
                                }
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y min-h-[80px]"
                                placeholder="Share your experience with the delivery partner..."
                            ></textarea>
                        </div>

                        {/* Aspects for Delivery Partner */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Aspects:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {deliveryAspectOptions.map((aspect) => (
                                    <label
                                        key={aspect}
                                        className={`inline-flex items-center px-3 py-1 border rounded-full text-sm cursor-pointer transition-colors duration-200 ${
                                            deliveryFeedbackState.aspects.includes(aspect)
                                                ? 'bg-blue-500 text-white border-blue-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-blue-100'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-blue-600 hidden"
                                            checked={deliveryFeedbackState.aspects.includes(aspect)}
                                            onChange={() =>
                                                handleAspectChange('delivery', null, aspect)
                                            }
                                        />
                                        {aspect.replace(/_/g, ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Issues for Delivery Partner */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Issues:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {deliveryIssueOptions.map((issue) => (
                                    <label
                                        key={issue}
                                        className={`inline-flex items-center px-3 py-1 border rounded-full text-sm cursor-pointer transition-colors duration-200 ${
                                            deliveryFeedbackState.issues.includes(issue)
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-100'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-red-600 hidden"
                                            checked={deliveryFeedbackState.issues.includes(issue)}
                                            onChange={() =>
                                                handleIssueChange('delivery', null, issue)
                                            }
                                        />
                                        {issue.replace(/_/g, ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>
                        {/* Media upload removed as per schema */}
                    </div>
                )}


                {/* Product Specific Feedback Sections */}
                {order.items.map((item) => (
                    <div key={item.product._id} className="bg-white p-6 rounded-lg shadow-md border border-purple-200">
                        <h2 className="text-2xl font-semibold text-purple-700 mb-4 flex items-center">
                            Feedback for Product:{' '}
                            <span className="ml-2 font-medium">
                                {item.product.name}
                            </span>
                        </h2>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Rating:
                            </label>
                            <StarRating
                                initialRating={productFeedbacksState[item.product._id]?.rating || 0}
                                onRatingChange={(rating) =>
                                    handleRatingChange('product', item.product._id, rating)
                                }
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor={`productComment-${item.product._id}`}
                                className="block text-gray-700 text-sm font-bold mb-2"
                            >
                                Comment:
                            </label>
                            <textarea
                                id={`productComment-${item.product._id}`}
                                value={productFeedbacksState[item.product._id]?.comment || ''}
                                onChange={(e) =>
                                    handleCommentChange('product', item.product._id, e.target.value)
                                }
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-y min-h-[80px]"
                                placeholder={`Share your experience with ${item.product.name}...`}
                            ></textarea>
                        </div>

                        {/* Aspects for Product */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Aspects:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {productAspectOptions.map((aspect) => (
                                    <label
                                        key={aspect}
                                        className={`inline-flex items-center px-3 py-1 border rounded-full text-sm cursor-pointer transition-colors duration-200 ${
                                            productFeedbacksState[item.product._id]?.aspects?.includes(aspect)
                                                ? 'bg-purple-500 text-white border-purple-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-purple-100'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-purple-600 hidden"
                                            checked={productFeedbacksState[item.product._id]?.aspects?.includes(aspect)}
                                            onChange={() =>
                                                handleAspectChange('product', item.product._id, aspect)
                                            }
                                        />
                                        {aspect.replace(/_/g, ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Issues for Product */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Issues:
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {productIssueOptions.map((issue) => (
                                    <label
                                        key={issue}
                                        className={`inline-flex items-center px-3 py-1 border rounded-full text-sm cursor-pointer transition-colors duration-200 ${
                                            productFeedbacksState[item.product._id]?.issues?.includes(issue)
                                                ? 'bg-red-500 text-white border-red-500'
                                                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-red-100'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="form-checkbox h-4 w-4 text-red-600 hidden"
                                            checked={productFeedbacksState[item.product._id]?.issues?.includes(issue)}
                                            onChange={() =>
                                                handleIssueChange('product', item.product._id, issue)
                                            }
                                        />
                                        {issue.replace(/_/g, ' ')}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Media Upload for Product */}
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Upload Media (Optional):
                            </label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, item.product._id)}
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                disabled={cloudinaryLoading && activeMediaUploadFor === item.product._id}
                            />
                            {cloudinaryLoading && activeMediaUploadFor === item.product._id && (
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full"
                                        style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                    <span className="text-xs text-gray-600 ml-2">{uploadProgress}% uploaded</span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(productFeedbacksState[item.product._id]?.media || []).map((url, index) => (
                                    <div key={index} className="relative w-24 h-24 border rounded overflow-hidden">
                                        <img
                                            src={url}
                                            alt={`Uploaded ${index}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(item.product._id, url)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                                            aria-label="Remove image"
                                        >
                                            <CircleX size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                <button
                    type="submit"
                    className={`w-full py-3 px-4 rounded-md text-white font-semibold transition duration-300 ${
                        feedbackLoading || cloudinaryLoading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                    disabled={feedbackLoading || cloudinaryLoading}
                >
                    {feedbackLoading ? 'Submitting Feedback...' : 'Submit All Feedback'}
                </button>
            </form>
        </div>
    );
};

export default AddFeedbackPage;