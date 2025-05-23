import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getBranchStationDetails, updateBranchStation, selectBranchStationDetails, selectAdminBranchLoading, selectAdminBranchError } from '../../store/adminBranchSlice';
import { uploadImageToCloudinary, selectImageUrl, selectLoading as selectUploadLoading, selectError as selectUploadError, clearImageUrl } from '../../store/cloundarySlice'; // Assuming correct slice name
import { toast } from 'react-hot-toast';
import { Loader2, ImagePlus } from 'lucide-react';

const UpdateBranchStation = React.memo(({ branchId, onClose }) => {
    const dispatch = useDispatch();
    const branch = useSelector(selectBranchStationDetails);
    const loading = useSelector(selectAdminBranchLoading);
    const error = useSelector(selectAdminBranchError);
    const uploadLoading = useSelector(selectUploadLoading);
    const uploadError = useSelector(selectUploadError);
    const imageUrl = useSelector(selectImageUrl);

    const [branchData, setBranchData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        contactPerson: '',
        contactPhone: '',
        email: '',
        operatingRadius: '',
    });
    const [imageFile, setImageFile] = useState(null);
    const [existingImageUrl, setExistingImageUrl] = useState('');
    const [geocodeLoading, setGeocodeLoading] = useState(false);
    const [geocodeError, setGeocodeError] = useState(null);

    const { name, address, city, state, postalCode, contactPerson, contactPhone, email, operatingRadius } = branchData;

    useEffect(() => {
        if (branchId && !branch && !loading && !error) {
            dispatch(getBranchStationDetails(branchId));
        }
    }, [dispatch, branchId, branch, loading, error]);

    useEffect(() => {
        if (branch) {
            setBranchData(prevData => ({
                name: branch.name || '',
                address: branch.address || '',
                city: branch.city || '',
                state: branch.state || '',
                postalCode: branch.postalCode || '',
                contactPerson: branch.contactPerson || '',
                contactPhone: branch.contactPhone || '',
                email: branch.email || '',
                operatingRadius: branch.operatingRadius?.toString() || '',
            }));
            setExistingImageUrl(branch.imageUrl || '');
        }
    }, [branch]);

    useEffect(() => {
        return () => {
            dispatch(clearImageUrl());
        };
    }, [dispatch]);

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setBranchData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    }, []);

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            dispatch(uploadImageToCloudinary(file));
        }
    }, [dispatch]);

    const fetchCoordinates = useCallback(async (currentAddress) => {
        if (!currentAddress) return null;
        setGeocodeLoading(true);
        setGeocodeError(null);
        try {
            const response = await fetch(
                `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
                    currentAddress
                )}&key=YOUR_OPENCAGE_API_KEY&language=en&pretty=1` // REMEMBER TO REPLACE WITH YOUR API KEY
            );
            if (!response.ok) {
                throw new Error(`Geocoding API error: ${response.status}`);
            }
            const data = await response.json();
            if (data.results && data.results.length > 0 && data.results[0].geometry) {
                const { lng, lat } = data.results[0].geometry;
                return [lng, lat]; // [longitude, latitude]
            } else {
                setGeocodeError('Could not retrieve coordinates for the given address.');
                return null;
            }
        } catch (error) {
            setGeocodeError(error.message);
            return null;
        } finally {
            setGeocodeLoading(false);
        }
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!name || !address || !city || !state || !postalCode || !contactPerson || !contactPhone || !operatingRadius) {
            toast.error('Please fill in all required fields.');
            return;
        }

        const coordinates = await fetchCoordinates(address);
        if (!coordinates) {
            toast.error(geocodeError || 'Could not retrieve coordinates for the address.');
            return;
        }

        const updatedBranchData = {
            ...branchData,
            location: {
                type: 'Point',
                coordinates: coordinates,
            },
            operatingRadius: parseFloat(operatingRadius),
            ...(imageUrl && { imageUrl }),
            ...(!imageUrl && existingImageUrl && { imageUrl: existingImageUrl }),
        };

        dispatch(updateBranchStation({ id: branchId, branchData: updatedBranchData }))
            .unwrap()
            .then(() => {
                toast.success('Branch station updated successfully!');
                onClose();
            })
            .catch((err) => {
                toast.error(`Failed to update branch: ${err?.message || 'An error occurred.'}`);
            });
    }, [branchData, address, fetchCoordinates, geocodeError, imageUrl, existingImageUrl, branchId, dispatch, onClose, name, city, state, postalCode, contactPerson, contactPhone, operatingRadius]);

    if (loading && !branch) {
        return <div className="container mx-auto p-8">Loading branch details...</div>;
    }

    if (error) {
        return <div className="container mx-auto p-8 text-red-500">Error loading branch: {error}</div>;
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mt-20 mx-auto flex flex-wrap gap-4">
            {/* Form fields (same as before) */}
            <div className="mb-4 w-full">
                <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                    Branch Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={name}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="mb-4 w-full">
                <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                    Address
                </label>
                <input
                    type="text"
                    id="address"
                    name="address"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={address}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 w-full">
                <div>
                    <label htmlFor="city" className="block text-gray-700 text-sm font-bold mb-2">
                        City
                    </label>
                    <input
                        type="text"
                        id="city"
                        name="city"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={city}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="state" className="block text-gray-700 text-sm font-bold mb-2">
                        State
                    </label>
                    <input
                        type="text"
                        id="state"
                        name="state"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={state}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 w-full">
                <div>
                    <label htmlFor="postalCode" className="block text-gray-700 text-sm font-bold mb-2">
                        Postal Code
                    </label>
                    <input
                        type="text"
                        id="postalCode"
                        name="postalCode"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={postalCode}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="contactPerson" className="block text-gray-700 text-sm font-bold mb-2">
                        Contact Person
                    </label>
                    <input
                        type="text"
                        id="contactPerson"
                        name="contactPerson"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={contactPerson}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4 w-full">
                <div>
                    <label htmlFor="contactPhone" className="block text-gray-700 text-sm font-bold mb-2">
                        Contact Phone
                    </label>
                    <input
                        type="tel"
                        id="contactPhone"
                        name="contactPhone"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={contactPhone}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div>
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                        Email
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        value={email}
                        onChange={handleInputChange}
                    />
                </div>
            </div>

            <div className="mb-4 w-full">
                <label htmlFor="operatingRadius" className="block text-gray-700 text-sm font-bold mb-2">
                    Operating Radius (in km)
                </label>
                <input
                    type="number"
                    id="operatingRadius"
                    name="operatingRadius"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    value={operatingRadius}
                    onChange={handleInputChange}
                    required
                />
            </div>

            <div className="mb-4 w-full">
                <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
                    Branch Image (Optional)
                </label>
                <div className="relative border rounded-md p-2">
                    <input
                        type="file"
                        id="image"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleImageChange}
                    />
                    <div className="flex items-center justify-center">
                        {uploadLoading ? (
                            <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                        ) : imageUrl ? (
                            <img src={imageUrl} alt="Uploaded Branch" className="max-h-20 rounded-md" />
                        ) : existingImageUrl ? (
                            <img src={existingImageUrl} alt="Existing Branch" className="max-h-20 rounded-md" />
                        ) : (
                            <div className="text-center">
                                <ImagePlus className="h-6 w-6 text-gray-400 mx-auto" />
                                <p className="text-xs text-gray-500">Upload new image</p>
                            </div>
                        )}
                    </div>
                    {uploadError && <p className="text-red-500 text-xs italic">{uploadError}</p>}
                </div>
            </div>

            <div className="flex items-center justify-end mt-4 w-full">
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2"
                    disabled={loading || uploadLoading || geocodeLoading}
                >
                    {loading || uploadLoading || geocodeLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline-block" /> : 'Update Branch'}
                </button>
                <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    onClick={onClose}
                >
                    Cancel
                </button>
            </div>
            {error && <p className="text-red-500 mt-4">{error}</p>}
            {geocodeError && <p className="text-red-500 mt-2">{geocodeError}</p>}
        </form>
    );
});

export default UpdateBranchStation;