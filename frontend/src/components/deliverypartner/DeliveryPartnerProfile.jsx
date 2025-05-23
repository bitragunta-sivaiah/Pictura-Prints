import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchMyDeliveryProfile,
    updateMyAvailability, // Assuming this is the correct thunk to update availability and working hours
    updateDeliveryPartner, // Assuming this is the correct thunk to update other profile details
    clearError as clearDeliveryPartnerError, // Using the clearError action from the slice
    selectMyDeliveryProfile,
    selectDeliveryPartnerLoading,
    selectDeliveryPartnerError, // Using the error selector from the slice
} from '../../store/deliveryPartnerSlice';
import { uploadImageToCloudinary, clearImageUrl } from '../../store/cloundarySlice';
import { toast } from 'react-hot-toast';
import {
    Edit,
    Check,
    X,
    ImagePlus,
    Phone,
    Mail,
    User,
    Truck,
    Star,
    Navigation,
    Clock,
    ToggleLeft,
    Calendar,
} from 'lucide-react';

const DeliveryPartnerProfilePage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const deliveryPartnerData = useSelector(selectMyDeliveryProfile); // Get the entire data object
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);
    const { imageUrl, loading: imageLoading, error: imageError } = useSelector((state) => state.cloudinary);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phoneNumber: '',
        avatar: '',
        vehicleType: '',
        bio: '',
        availability: false,
        workingHours: {
            Monday: { startTime: '', endTime: '', isAvailable: false },
            Tuesday: { startTime: '', endTime: '', isAvailable: false },
            Wednesday: { startTime: '', endTime: '', isAvailable: false },
            Thursday: { startTime: '', endTime: '', isAvailable: false },
            Friday: { startTime: '', endTime: '', isAvailable: false },
            Saturday: { startTime: '', endTime: '', isAvailable: false },
            Sunday: { startTime: '', endTime: '', isAvailable: false },
        },
    });
    const [avatarFile, setAvatarFile] = useState(null);

    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Fetch delivery partner profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            dispatch(fetchMyDeliveryProfile());
        };
        fetchProfile();
    }, [dispatch]);

    // Update form data when delivery partner data is loaded
    useEffect(() => {
        if (deliveryPartnerData?.data) { // Access the 'data' property
            const { data } = deliveryPartnerData;
            setFormData({
                username: data.username || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                avatar: data.avatar || '',
                vehicleType: data.deliveryPartnerDetails?.vehicleType || '',
                bio: data.deliveryPartnerDetails?.bio || '',
                availability: data.deliveryPartnerDetails?.availability === 'online' ? true : false, // Handle 'online'/'offline'
                workingHours: data.deliveryPartnerDetails?.workingHours || {
                    Monday: { startTime: '', endTime: '', isAvailable: false },
                    Tuesday: { startTime: '', endTime: '', isAvailable: false },
                    Wednesday: { startTime: '', endTime: '', isAvailable: false },
                    Thursday: { startTime: '', endTime: '', isAvailable: false },
                    Friday: { startTime: '', endTime: '', isAvailable: false },
                    Saturday: { startTime: '', endTime: '', isAvailable: false },
                    Sunday: { startTime: '', endTime: '', isAvailable: false },
                },
            });
        }
    }, [deliveryPartnerData]);

    // Handle image upload completion
    useEffect(() => {
        if (imageUrl) {
            setFormData({ ...formData, avatar: imageUrl.url });
            dispatch(clearImageUrl());
            setAvatarFile(null);
        }
    }, [imageUrl, formData, dispatch]);

    // Handle errors from both deliveryPartnerSlice and cloudinarySlice
    useEffect(() => {
        if (error) {
            toast.error(typeof error === 'object' && error.message ? error.message : String(error));
            dispatch(clearDeliveryPartnerError());
        }
        if (imageError) {
            toast.error(imageError);
            dispatch(clearImageUrl());
        }
    }, [error, dispatch, imageError]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name.startsWith('workingHours.')) {
            const [_, day, subField] = name.split('.');
            setFormData((prevData) => ({
                ...prevData,
                workingHours: {
                    ...prevData.workingHours,
                    [day]: {
                        ...prevData.workingHours[day],
                        [subField]: type === 'checkbox' ? checked : value,
                    },
                },
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        // Reset form data to the initially fetched profile data
        if (deliveryPartnerData?.data) {
            const { data } = deliveryPartnerData;
            setFormData({
                username: data.username || '',
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                avatar: data.avatar || '',
                vehicleType: data.deliveryPartnerDetails?.vehicleType || '',
                bio: data.deliveryPartnerDetails?.bio || '',
                availability: data.deliveryPartnerDetails?.availability === 'online' ? true : false,
                workingHours: data.deliveryPartnerDetails?.workingHours || {
                    Monday: { startTime: '', endTime: '', isAvailable: false },
                    Tuesday: { startTime: '', endTime: '', isAvailable: false },
                    Wednesday: { startTime: '', endTime: '', isAvailable: false },
                    Thursday: { startTime: '', endTime: '', isAvailable: false },
                    Friday: { startTime: '', endTime: '', isAvailable: false },
                    Saturday: { startTime: '', endTime: '', isAvailable: false },
                    Sunday: { startTime: '', endTime: '', isAvailable: false },
                },
            });
        }
        setAvatarFile(null);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (deliveryPartnerData?.data?._id) { // Access the ID correctly
            const { availability, workingHours, ...otherDetails } = formData;
            const availabilityStatus = availability ? 'online' : 'offline'; // Convert boolean to 'online'/'offline'

            // Dispatch updateMyAvailability for availability and working hours
            dispatch(updateMyAvailability({ availability: availabilityStatus, workingHours }));

            // Dispatch updateDeliveryPartner for other details
            const profileData = {
                username: otherDetails.username,
                phoneNumber: otherDetails.phoneNumber,
                avatar: otherDetails.avatar,
                deliveryPartnerDetails: {
                    vehicleType: otherDetails.vehicleType,
                    bio: otherDetails.bio,
                },
            };
            dispatch(updateDeliveryPartner({ id: deliveryPartnerData.data._id, data: profileData }));

            setIsEditing(false);
        } else {
            toast.error('Delivery Partner ID not found.');
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            dispatch(uploadImageToCloudinary(file));
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow mt-10">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Delivery Partner Profile</h2>
                {!isEditing ? (
                    <button
                        onClick={handleEditClick}
                        className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-200"
                        disabled={loading}
                    >
                        <Edit className="w-5 h-5 mr-2" /> Edit Profile
                    </button>
                ) : (
                    <div className='flex items-center gap-4'>
                        <button
                            onClick={handleSubmit}
                            className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 mr-2"
                            disabled={loading || imageLoading}
                        >
                            <Check className="w-5 h-5 mr-2" /> Save
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="flex items-center bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md transition duration-200"
                            disabled={loading || imageLoading}
                        >
                            <X className="w-5 h-5 mr-2" /> Cancel
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
                    <img
                        src={formData.avatar || 'https://via.placeholder.com/150'}
                        alt="Delivery Partner Avatar"
                        className="w-full h-full object-cover"
                    />
                    {isEditing && (
                        <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer">
                            <ImagePlus className="w-6 h-6" />
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleAvatarChange}
                            />
                        </label>
                    )}
                </div>
                {imageLoading && <span className="ml-4 text-sm text-gray-500">Uploading...</span>}
                {imageError && <span className="ml-4 text-sm text-red-500">Image upload failed.</span>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
                        <User className="inline-block mr-2 w-4 h-4" /> Username
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={!isEditing || loading || imageLoading}
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        <Mail className="inline-block mr-2 w-4 h-4" /> Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled
                    />
                    <p className="text-gray-500 text-xs italic">Email cannot be changed.</p>
                </div>
                <div>
                    <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
                        <Phone className="inline-block mr-2 w-4 h-4" /> Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={!isEditing || loading || imageLoading}
                    />
                    <p className="text-gray-500 text-xs italic">Optional.</p>
                </div>
                <div>
                    <label htmlFor="vehicleType" className="block text-gray-700 text-sm font-bold mb-2">
                        <Truck className="inline-block mr-2 w-4 h-4" /> Vehicle Type
                    </label>
                    <input
                        type="text"
                        id="vehicleType"
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        disabled={!isEditing || loading || imageLoading}
                    />
                </div>
                <div>
                    <label htmlFor="bio" className="block text-gray-700 text-sm font-bold mb-2">
                        <Edit className="inline-block mr-2 w-4 h-4" /> Bio
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                        disabled={!isEditing || loading || imageLoading}
                    />
                    <p className="text-gray-500 text-xs italic">Tell us a bit about yourself (optional).</p>
                </div>

                {/* Delivery Specific Fields - Working Hours */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                        <Clock className="inline-block mr-2 w-5 h-5" /> Working Hours
                    </h3>
                    {daysOfWeek.map((day) => (
                        <div key={day} className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">{day}</label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`workingHours.${day}.isAvailable`}
                                        name={`workingHours.${day}.isAvailable`}
                                        checked={formData.workingHours[day]?.isAvailable || false}
                                        onChange={handleChange}
                                        className="form-checkbox h-5 w-5 text-green-500 focus:ring-green-500 rounded"
                                        disabled={!isEditing || loading || imageLoading}
                                    />
                                    <label htmlFor={`workingHours.${day}.isAvailable`} className="ml-2 text-gray-600 text-sm">Available</label>
                                </div>
                                {formData.workingHours[day]?.isAvailable && (
                                    <>
                                        <div>
                                            <label htmlFor={`workingHours.${day}.startTime`} className="block text-gray-700 text-xs font-bold mb-1">Start Time</label>
                                            <input
                                                type="time"
                                                id={`workingHours.${day}.startTime`}
                                                name={`workingHours.${day}.startTime`}
                                                value={formData.workingHours[day]?.startTime || ''}
                                                onChange={handleChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                                                disabled={!isEditing || loading || imageLoading}
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor={`workingHours.${day}.endTime`} className="block text-gray-700 text-xs font-bold mb-1">End Time</label>
                                            <input
                                                type="time"
                                                id={`workingHours.${day}.endTime`}
                                                name={`workingHours.${day}.endTime`}
                                                value={formData.workingHours[day]?.endTime || ''}
                                                onChange={handleChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                                                disabled={!isEditing || loading || imageLoading}
                                                />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Availability Toggle */}
                <div className="border-t pt-4 mt-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
                        <ToggleLeft className="inline-block mr-2 w-5 h-5" /> Availability
                    </h3>
                    <div className="mb-2 flex items-center">
                        <label htmlFor="availability" className="inline-flex items-center text-gray-700 text-sm font-bold mr-4">
                            Overall Availability:
                        </label>
                        <input
                            type="checkbox"
                            id="availability"
                            name="availability"
                            checked={formData.availability}
                            onChange={handleChange}
                            className="form-checkbox h-6 w-6 text-blue-500 focus:ring-blue-500 rounded cursor-pointer"
                            disabled={!isEditing || loading || imageLoading}
                        />
                        <span className={`ml-2 font-semibold ${formData.availability ? 'text-green-600' : 'text-red-600'} text-sm`}>
                            {formData.availability ? 'Available' : 'Unavailable'}
                        </span>
                        <p className="ml-4 text-gray-500 text-xs italic">This is a general availability status. Set specific hours below.</p>
                    </div>
                </div>

                {/* Read-only information */}
                {!isEditing && deliveryPartnerData?.data?.deliveryPartnerDetails && (
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Additional Information</h3>
                        {deliveryPartnerData.data.deliveryPartnerDetails?.rating && (
                            <div className="mt-2 flex items-center">
                                <Star className="inline-block mr-2 w-4 h-4 text-yellow-500" />
                                <span className="text-gray-700 text-sm font-semibold">Rating: {deliveryPartnerData.data.deliveryPartnerDetails.rating?.toFixed(1)}</span>
                            </div>
                        )}
                        {deliveryPartnerData.data.deliveryPartnerDetails?.location?.coordinates && (
                            <div className="mt-2 flex items-center">
                                <Navigation className="inline-block mr-2 w-4 h-4 text-blue-500" />
                                <span className="text-gray-700 text-sm">
                                    Current Location: {deliveryPartnerData.data.deliveryPartnerDetails.location.coordinates[1]}, {deliveryPartnerData.data.deliveryPartnerDetails.location.coordinates[0]} (Latitude, Longitude)
                                </span>
                            </div>
                        )}
                        {deliveryPartnerData.data.deliveryPartnerDetails?.vehicleType && (
                            <div className="mt-2 flex items-center">
                                <Truck className="inline-block mr-2 w-4 h-4 text-gray-700" />
                                <span className="text-gray-700 text-sm">Vehicle: {deliveryPartnerData.data.deliveryPartnerDetails.vehicleType}</span>
                            </div>
                        )}
                        {deliveryPartnerData.data.deliveryPartnerDetails?.bio && (
                            <div className="mt-2">
                                <Edit className="inline-block mr-2 w-4 h-4 text-gray-700" />
                                <span className="text-gray-700 text-sm italic">{deliveryPartnerData.data.deliveryPartnerDetails.bio}</span>
                            </div>
                        )}
                        {deliveryPartnerData.data.deliveryPartnerDetails?.workingHours && (
                            <div className="mt-4">
                                <h4 className="text-md font-semibold text-gray-700 mb-1 flex items-center">
                                    <Clock className="inline-block mr-2 w-4 h-4 text-gray-700" /> Working Hours
                                </h4>
                                {daysOfWeek.map((day) => (
                                    <div key={day} className="text-sm text-gray-600">
                                        {deliveryPartnerData.data.deliveryPartnerDetails.workingHours[day]?.isAvailable ? (
                                            `${day}: ${deliveryPartnerData.data.deliveryPartnerDetails.workingHours[day]?.startTime || 'N/A'} - ${deliveryPartnerData.data.deliveryPartnerDetails.workingHours[day]?.endTime || 'N/A'}`
                                        ) : (
                                            `${day}: Not Available`
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {loading && (
                    <div className="text-center">
                        <span className="loading loading-spinner loading-md"></span>
                    </div>
                )}

                {error && (
                    <p className="text-red-500 text-sm italic">{typeof error === 'object' && error.message ? error.message : String(error)}</p>
                )}
            </form>
        </div>
    );
};

export default DeliveryPartnerProfilePage;