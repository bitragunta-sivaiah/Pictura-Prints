import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAddress, updateAddress, fetchAddressById } from '../store/addressSlice';
import { selectAddress, selectAddressLoading, selectAddressError } from '../store/addressSlice';
import { Loader2, Save, MapPin, Phone, Home, User, X } from 'lucide-react';

const geocode = async (city, state, country) => {
    const apiKey = 'b80ec623de954c3abd3bd564ccdcf27b'; // Replace with your OpenCage Data API key
    const query = `${city}, ${state}, ${country}`;

    try {
        const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&pretty=1`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const { lat, lng } = data.results[0].geometry;
            return { latitude: lat, longitude: lng };
        } else {
            throw new Error('Geocoding failed: No results found');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
};

const AddressForm = ({ addressId, onSuccess, onCancel }) => {
    const dispatch = useDispatch();
    const addressData = useSelector(selectAddress);
    const loading = useSelector(selectAddressLoading);
    const error = useSelector(selectAddressError);

    const [formData, setFormData] = useState({
        fullName: '',
        streetAddress: '',
        apartmentSuiteUnit: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        phone: '',
        isDefault: false,
        notes: '',
        location: {
            type: 'Point',
            coordinates: [0, 0],
        },
    });

    const [isGeocoding, setIsGeocoding] = useState(false);

    useEffect(() => {
        if (addressId) {
            dispatch(fetchAddressById(addressId));
        }
    }, [addressId, dispatch]);

    useEffect(() => {
        if (addressData && addressId) {
            setFormData(addressData);
        } else if (!addressId) {
            setFormData({
                fullName: '',
                streetAddress: '',
                apartmentSuiteUnit: '',
                city: '',
                state: '',
                postalCode: '',
                country: 'India',
                phone: '',
                isDefault: false,
                notes: '',
                location: {
                    type: 'Point',
                    coordinates: [0, 0],
                },
            });
        }
    }, [addressData, addressId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsGeocoding(true);
        try {
            const { latitude, longitude } = await geocode(
                formData.city,
                formData.state,
                formData.country
            );
            const updatedFormData = {
                ...formData,
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude], // Ensure coordinates are set here
                },
            };

            if (addressId) {
                await dispatch(updateAddress({ id: addressId, addressData: updatedFormData })).unwrap();
            } else {
                await dispatch(createAddress(updatedFormData)).unwrap();
            }
            onSuccess();
        } catch (err) {
            console.error('handleSubmit Error:', err);
        } finally {
            setIsGeocoding(false);
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-700">
                    <MapPin className="text-blue-500" /> Address Form
                </h2>
                {onCancel && (
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                )}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            {[
                { name: 'fullName', label: 'Full Name', icon: <User /> },
                { name: 'streetAddress', label: 'Street Address', icon: <Home /> },
                { name: 'apartmentSuiteUnit', label: 'Apartment/Suite/Unit', icon: <Home /> },
                { name: 'city', label: 'City', icon: <MapPin /> },
                { name: 'state', label: 'State', icon: <MapPin /> },
                { name: 'postalCode', label: 'Postal Code', icon: <MapPin /> },
                { name: 'phone', label: 'Phone Number', icon: <Phone /> },
                { name: 'notes', label: 'Notes (Optional)', icon: <MapPin /> },
            ].map(({ name, label, icon }) => (
                <div key={name} className="flex items-center gap-2 border border-gray-300 rounded px-3 py-2">
                    {icon}
                    <input
                        type="text"
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        placeholder={label}
                        className="w-full focus:outline-none"
                    />
                </div>
            ))}

            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="accent-blue-500"
                />
                <label className="text-gray-700">Set as Default Address</label>
            </div>

            <div className="flex justify-end gap-4">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-semibold disabled:opacity-50"
                        disabled={loading || isGeocoding}
                    >
                        Cancel
                    </button>
                )}
                <button
                    type="submit"
                    onClick={handleSubmit}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
                    disabled={loading || isGeocoding}
                >
                    {loading || isGeocoding ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Save />
                    )}
                    {addressId ? 'Update' : 'Save'}
                </button>
            </div>
        </div >
    );
};

export default AddressForm;
