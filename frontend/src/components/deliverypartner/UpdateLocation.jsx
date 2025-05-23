import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPinIcon, LocateIcon } from 'lucide-react';
import { updateMyLocation, selectDeliveryPartnerLoading, selectDeliveryPartnerError } from '../../store/deliveryPartnerSlice';
import { toast } from 'react-hot-toast';

const OPEN_CAGE_API_KEY = 'b80ec623de954c3abd3bd564ccdcf27b';  

const UpdateLocation = () => {
    const dispatch = useDispatch();
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');
    const [address, setAddress] = useState('');
    const [isFetchingAddress, setIsFetchingAddress] = useState(false);
    const [autoFetchEnabled, setAutoFetchEnabled] = useState(false); // Control auto-fetch

    useEffect(() => {
        if (error) {
            toast.error(error);
        }

        // Automatically fetch location if enabled and we don't have coordinates yet
        if (autoFetchEnabled && !latitude && !longitude) {
            handleAutoFetch();
        }
    }, [error, autoFetchEnabled, latitude, longitude]);

  const fetchAddressFromCoords = async (lat, lng) => {
    setIsFetchingAddress(true);
    try {
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPEN_CAGE_API_KEY}&pretty=1`
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
            const components = data.results[0].components;
            let road = components.road || components.footway || components.path || 'Unnamed Road'; // Try different possibilities
            const neighbourhood = components.neighbourhood ? `, ${components.neighbourhood}` : '';
            const city = components.city || components.town || components.village || '';
            const state = components.state ? `, ${components.state}` : '';
            const postcode = components.postcode ? ` - ${components.postcode}` : '';
            const country = components.country ? `, ${components.country}` : '';

            const detailedAddress = `${road}${neighbourhood}, ${city}${state}${postcode}${country}`;
            setAddress(detailedAddress);
        } else {
            setAddress('Address not found');
        }
    } catch (error) {
        setAddress('Error fetching address');
        toast.error('Failed to fetch address from coordinates.');
    } finally {
        setIsFetchingAddress(false);
    }
};

    useEffect(() => {
        if (latitude && longitude && autoFetchEnabled) {
            fetchAddressFromCoords(latitude, longitude);
        }
    }, [latitude, longitude, autoFetchEnabled]);

    const handleManualUpdate = () => {
        const lat = parseFloat(latitude);
        const lng = parseFloat(longitude);

        if (isNaN(lat) || isNaN(lng)) {
            toast.error('Please enter valid latitude and longitude.');
            return;
        }

        dispatch(updateMyLocation({ coordinates: [lng, lat] }));
    };

    const handleAutoFetch = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude.toString();
                const lng = position.coords.longitude.toString();
                setLatitude(lat);
                setLongitude(lng);
                dispatch(updateLocation({ coordinates: [position.coords.longitude, position.coords.latitude] }));
                toast.success('Location updated automatically!');
                // Optionally fetch address immediately after auto-fetch
                if (OPEN_CAGE_API_KEY !== 'YOUR_OPENCAGE_API_KEY') {
                    fetchAddressFromCoords(lat, lng);
                }
            },
            (err) => {
                toast.error(`Error fetching location: ${err.message}`);
            }
        );
    };

    const toggleAutoFetch = () => {
        setAutoFetchEnabled(!autoFetchEnabled);
        if (!autoFetchEnabled && !latitude && !longitude) {
            // Initiate auto-fetch immediately when enabled for the first time
            handleAutoFetch();
        }
    };

    return (
        <div className="p-6 rounded-md shadow-md bg-white">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Update Your Location</h2>

            <div className="mb-4">
                <label htmlFor="latitude" className="block text-gray-700 text-sm font-bold mb-2">
                    <MapPinIcon className="inline-block mr-1 h-4 w-4" /> Latitude:
                </label>
                <input
                    type="number"
                    id="latitude"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="Enter latitude"
                />
            </div>

            <div className="mb-4">
                <label htmlFor="longitude" className="block text-gray-700 text-sm font-bold mb-2">
                    <MapPinIcon className="inline-block mr-1 h-4 w-4" /> Longitude:
                </label>
                <input
                    type="number"
                    id="longitude"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="Enter longitude"
                />
            </div>

            <button
                onClick={handleManualUpdate}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
            >
                {loading ? 'Updating...' : 'Update Manually'}
            </button>

            <div className="mt-4">
                <label className="inline-flex items-center">
                    <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-green-600 rounded focus:ring-green-500"
                        checked={autoFetchEnabled}
                        onChange={toggleAutoFetch}
                        disabled={loading}
                    />
                    <span className="ml-2 text-gray-700">Enable Auto Fetch Location</span>
                </label>
                {autoFetchEnabled && isFetchingAddress && <p className="mt-2 text-sm text-gray-500">Fetching address...</p>}
                {autoFetchEnabled && address && <p className="mt-2 text-sm text-gray-700">Current Address: {address}</p>}
            </div>

            <div className="mt-6">
                <button
                    onClick={handleAutoFetch}
                    className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={loading || autoFetchEnabled}
                >
                    <LocateIcon className="inline-block mr-2 h-4 w-4" /> Fetch Current Location
                </button>
                {loading && <p className="mt-2 text-sm text-gray-500">Updating location...</p>}
            </div>
        </div>
    );
};

export default UpdateLocation;