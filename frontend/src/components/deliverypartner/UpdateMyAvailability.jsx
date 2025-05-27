import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateMyAvailability, selectMyDeliveryProfile, selectDeliveryPartnerLoading, selectDeliveryPartnerError, fetchMyDeliveryProfile, clearError } from '../../store/deliveryPartnerSlice'; // Ensure clearError is imported
import { toast } from 'react-hot-toast';
import { Clock, Calendar, CheckCircle, XCircle, Loader2, Edit3, Save, X } from 'lucide-react';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const availabilityOptions = [ 'offline','available', 'on_delivery', 'offline', 'break'];

const UpdateMyAvailability = () => {
    const dispatch = useDispatch();
    const myProfile = useSelector(selectMyDeliveryProfile);
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);

    const [currentAvailability, setCurrentAvailability] = useState('');
    const [workingHours, setWorkingHours] = useState({});
    const [isEditingWorkingHours, setIsEditingWorkingHours] = useState(false);

    useEffect(() => {
        dispatch(fetchMyDeliveryProfile());
    }, [dispatch]);

    useEffect(() => {
        if (myProfile?.deliveryPartnerDetails) {
            setCurrentAvailability(myProfile.deliveryPartnerDetails.availability || '');
            const initializedWorkingHours = daysOfWeek.reduce((acc, day) => {
                acc[day] = myProfile.deliveryPartnerDetails.workingHours?.[day] || { startTime: '09:00', endTime: '17:00', isAvailable: false };
                return acc;
            }, {});
            setWorkingHours(initializedWorkingHours);
        }
    }, [myProfile]);

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleAvailabilityChange = async (e) => {
        const newAvailability = e.target.value;
        setCurrentAvailability(newAvailability);
        try {
            await dispatch(updateMyAvailability({ availability: newAvailability })).unwrap();
            toast.success('Availability updated!');
        } catch (err) {
            console.error('Failed to update availability:', err);
        }
    };

    const handleWorkingHoursChange = (day, field, value) => {
        setWorkingHours(prevHours => ({
            ...prevHours,
            [day]: {
                ...prevHours[day],
                [field]: value
            }
        }));
    };

    const handleWorkingHoursToggle = (day) => {
        setWorkingHours(prevHours => ({
            ...prevHours,
            [day]: {
                ...prevHours[day],
                isAvailable: !prevHours[day]?.isAvailable
            }
        }));
    };

    const saveWorkingHours = async () => {
        try {
            await dispatch(updateMyAvailability({ workingHours: workingHours })).unwrap();
            toast.success('Working hours updated!');
            setIsEditingWorkingHours(false);
        } catch (err) {
            console.error('Failed to update working hours:', err);
        }
    };

    if (!myProfile && loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
                <Loader2 className="animate-spin text-blue-600 mr-3" size={32} />
                <p className="text-gray-700 text-lg font-medium">Fetching your delivery profile...</p>
            </div>
        );
    }

    if (error && !loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50 p-4">
                <XCircle className="text-red-600 mr-3" size={32} />
                <p className="text-red-800 text-lg font-medium">Error loading profile: {error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen   flex flex-col items-center justify-center py-4 sm:py-6">
            <div className="bg-white rounded-2xl shadow p-2 md:p-10 w-full max-w-3xl  ">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-6 sm:mb-8 text-center tracking-tight">
                    Your Availability & Schedule
                </h2>

                {/* Current Availability Section */}
                <div className="mb-8 p-1 sm:p-6 bg-gray-50 border border-gary-200 rounded-xl shadow  ">
                    <h3 className="text-lg sm:text-xl font-bold text-indigo-800 flex items-center mb-4 sm:mb-5 border-b pb-3 border-indigo-200">
                        <CheckCircle className="mr-2 sm:mr-3 text-indigo-600" size={20} sm-size={24} /> Current Status
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
                        <label htmlFor="availability" className="text-base sm:text-lg font-medium text-gray-700 flex-shrink-0">
                            Set Your Availability:
                        </label>
                        <div className="relative w-full sm:w-auto">
                            <select
                                id="availability"
                                value={currentAvailability}
                                onChange={handleAvailabilityChange}
                                disabled={loading}
                                className="block w-full px-4 py-2 sm:px-5 sm:py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base capitalize transition-all duration-200 ease-in-out appearance-none bg-white pr-10 disabled:bg-gray-100 disabled:text-gray-500 cursor-pointer"
                            >
                                {availabilityOptions.map(option => (
                                    <option key={option} value={option}>
                                        {option.replace('_', ' ')}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 6.096 6.924 4.682 8.338l4.611 4.612z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    {loading && (
                        <p className="text-indigo-500 text-xs sm:text-sm mt-3 sm:mt-4 flex items-center justify-center animate-pulse">
                            <Loader2 className="animate-spin mr-2" size={16} sm-size={18} /> Updating status...
                        </p>
                    )}
                </div>

                {/* Working Hours Section */}
                <div className="p-1 sm:p-6 bg-gray-50 border border-teal-200 rounded-xl shadow ">
                    <h3 className="text-lg sm:text-xl font-bold text-teal-800 flex items-center mb-4 sm:mb-5 border-b pb-3 border-teal-200">
                        <Calendar className="mr-2 sm:mr-3 text-teal-600" size={20} sm-size={24} /> Manage Working Hours
                    </h3>

                    {!isEditingWorkingHours ? (
                        <div className="mb-4">
                            <ul className="divide-y divide-gray-200">
                                {daysOfWeek.map(day => (
                                    <li key={day} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3">
                                        <span className="font-semibold text-gray-800 text-base sm:text-lg w-full sm:w-1/3 mb-2 sm:mb-0">{day}:</span>
                                        <span className="flex items-center text-gray-600 text-sm sm:text-base w-full sm:w-2/3">
                                            {workingHours[day]?.isAvailable ? (
                                                <>
                                                    <Clock className="mr-2 text-gray-500" size={16} sm-size={18} />
                                                    <span className="font-medium">
                                                        {workingHours[day]?.startTime || 'Not Set'} - {workingHours[day]?.endTime || 'Not Set'}
                                                    </span>
                                                </>
                                            ) : (
                                                <span className="text-red-500 flex items-center font-medium">
                                                    <XCircle className="mr-2" size={16} sm-size={18} /> Not Available
                                                </span>
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            <button
                                onClick={() => setIsEditingWorkingHours(true)}
                                className="mt-6 sm:mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center group"
                            >
                                <Edit3 className="mr-3 text-white group-hover:rotate-6 transition-transform duration-300" size={20} />
                                Edit Working Hours
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4 sm:space-y-5">
                            {daysOfWeek.map(day => (
                                <div key={day} className="flex flex-col md:flex-row items-start md:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                    <label className="font-semibold text-gray-800 text-sm sm:text-base md:w-1/4 flex-shrink-0 mb-1 md:mb-0">{day}:</label>
                                    <div className="flex flex-col sm:flex-row flex-grow items-start sm:items-center gap-3 w-full">
                                        <input
                                            type="time"
                                            value={workingHours[day]?.startTime || ''}
                                            onChange={(e) => handleWorkingHoursChange(day, 'startTime', e.target.value)}
                                            className="w-full sm:w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            disabled={!workingHours[day]?.isAvailable}
                                        />
                                        <span className="text-gray-500 font-medium hidden sm:block">-</span> {/* Hide hyphen on very small screens */}
                                        <input
                                            type="time"
                                            value={workingHours[day]?.endTime || ''}
                                            onChange={(e) => handleWorkingHoursChange(day, 'endTime', e.target.value)}
                                            className="w-full sm:w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200 disabled:bg-gray-100 disabled:text-gray-500"
                                            disabled={!workingHours[day]?.isAvailable}
                                        />
                                        <label className="flex items-center cursor-pointer ml-auto sm:ml-4 flex-shrink-0 mt-2 sm:mt-0">
                                            <input
                                                type="checkbox"
                                                checked={workingHours[day]?.isAvailable || false}
                                                onChange={() => handleWorkingHoursToggle(day)}
                                                className="form-checkbox h-5 w-5 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500 transition-all duration-200"
                                            />
                                            <span className="ml-2 text-gray-700 text-sm font-medium">Available</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6 sm:mt-8">
                                <button
                                    onClick={() => setIsEditingWorkingHours(false)}
                                    className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 flex items-center justify-center"
                                >
                                    <X className="mr-2" size={18} /> Cancel
                                </button>
                                <button
                                    onClick={saveWorkingHours}
                                    disabled={loading}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-5 rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 flex items-center justify-center disabled:bg-green-300 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2" size={20} /> Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2" size={20} /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpdateMyAvailability;