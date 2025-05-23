import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    applyDeliveryPartner,
    selectDeliveryPartnerLoading,
    selectDeliveryPartnerError,
} from '../../store/deliveryPartnerSlice';
import {
    uploadImageToCloudinary,
    selectImageUrl,
    selectLoading as selectImageLoading,
    selectError as selectImageError,
    clearImageUrl,
} from '../../store/cloundarySlice';
import {
    getAllBranchStations,
    selectBranchStations,
    selectAdminBranchLoading,
    selectAdminBranchError,
} from '../../store/adminBranchSlice';
import { toast, Toaster } from 'react-hot-toast';
import { ArrowLeft, Car, FileUp, XCircle, User, MapPin, Bike, Image, Loader2 } from 'lucide-react';
import { FaMotorcycle } from 'react-icons/fa6';
import { GiScooter } from 'react-icons/gi';
import Select from 'react-select';

const vehicleOptions = [
    { value: 'motorcycle', label: 'Motorcycle' },
    { value: 'car', label: 'Car' },
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'scooter', label: 'Scooter' },
    { value: 'other', label: 'Other' },
];

const requiredDocumentsList = [
    'License',
    'Insurance',
    'Aadhar Card',
    // Add more required documents if needed
];

// Use React.memo to prevent unnecessary re-renders of the Input component
const Input = React.memo(({ id, name, type, value, onChange, className, placeholder }) => (
    <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm ${className}`}
        placeholder={placeholder}
    />
));

const ApplyDeliveryPartner = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);
    const imageUrl = useSelector(selectImageUrl);
    const imageLoading = useSelector(selectImageLoading);
    const imageError = useSelector(selectImageError);
    const branchStations = useSelector(selectBranchStations);
    const branchStationLoading = useSelector(selectAdminBranchLoading);
    const branchStationError = useSelector(selectAdminBranchError);

    const [applicationData, setApplicationData] = useState({
        vehicleType: null,
        licenseNumber: '',
        licenseExpiryDate: '',
        insuranceNumber: '',
        insuranceExpiryDate: '',
        vehicleNumber: '',
        aadharNumber: '',
        documents: Array(requiredDocumentsList.length).fill(null), // Array to hold uploaded URLs, same length as required documents
        branchStation: null,
        profileImage: null,
        profileImageUrl: '',
    });
    const [uploadingDocuments, setUploadingDocuments] = useState(Array(requiredDocumentsList.length).fill(false)); // Track upload status for each document
    const [documentErrors, setDocumentErrors] = useState(Array(requiredDocumentsList.length).fill(null));         // Store errors for each document
    const [documentPreviews, setDocumentPreviews] = useState(Array(requiredDocumentsList.length).fill(null)); // Store previews
    const [branchStationOptions, setBranchStationOptions] = useState([]);

    useEffect(() => {
        dispatch(getAllBranchStations());
    }, [dispatch]);

    useEffect(() => {
        if (branchStations && branchStations.length > 0) {
            const options = branchStations.map((station) => ({
                value: station._id,
                label: station.name,
            }));
            setBranchStationOptions(options);
        }
    }, [branchStations]);

    useEffect(() => {
        if (error) {
            toast.error(error);
        }
        if (imageError) {
            toast.error(imageError);
        }
        if (branchStationError) {
            toast.error(branchStationError);
        }
    }, [error, imageError, branchStationError]);

    useEffect(() => {
        return () => {
            dispatch(clearImageUrl());
        };
    }, [dispatch]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setApplicationData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleVehicleTypeChange = (selectedOption) => {
        setApplicationData((prevData) => ({
            ...prevData,
            vehicleType: selectedOption,
        }));
    };

    const handleBranchStationChange = (selectedOption) => {
        setApplicationData((prevData) => ({
            ...prevData,
            branchStation: selectedOption,
        }));
    };

    const handleDocumentChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            // Update uploading state for the specific document
            setUploadingDocuments(prev => {
                const next = [...prev];
                next[index] = true;
                return next;
            });
            // Clear previous errors
            setDocumentErrors(prev => {
                const next = [...prev];
                next[index] = null;
                return next;
            });

            const reader = new FileReader();
            reader.onloadend = () => {
                setDocumentPreviews(prev => {
                    const next = [...prev];
                    next[index] = reader.result;
                    return next;
                });
            };
            reader.readAsDataURL(file);

            dispatch(uploadImageToCloudinary(file))
                .unwrap()
                .then(imageUrl => {
                    setApplicationData(prevData => {
                        const newDocuments = [...prevData.documents];
                        newDocuments[index] = imageUrl;   // Update the document URL at the correct index
                        return { ...prevData, documents: newDocuments };
                    });
                    // Update uploading state
                    setUploadingDocuments(prev => {
                        const next = [...prev];
                        next[index] = false;
                        return next;
                    });
                    toast.success(`${requiredDocumentsList[index]} uploaded!`);
                })
                .catch(err => {
                    console.error('Document upload failed:', err);
                    toast.error(`Failed to upload ${requiredDocumentsList[index]}.`);
                    // Update uploading state and error
                    setUploadingDocuments(prev => {
                        const next = [...prev];
                        next[index] = false;
                        return next;
                    });
                    setDocumentErrors(prev => {
                        const next = [...prev];
                        next[index] = err?.message || 'Upload failed';
                        return next;
                    });
                });
        }
    };

    const handleRemoveDocument = (index) => {
        setApplicationData(prevData => {
            const newDocuments = [...prevData.documents];
            newDocuments[index] = null; // Clear the URL at the index
            return { ...prevData, documents: newDocuments };
        });
        setDocumentPreviews(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
        setDocumentErrors(prev => {
            const next = [...prev];
            next[index] = null;
            return next;
        });
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setApplicationData(prevData => ({
                ...prevData,
                profileImage: file,
                profileImageUrl: URL.createObjectURL(file),
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Check if all required documents have been uploaded
        if (applicationData.documents.some(doc => !doc)) {
            toast.error('Please upload all the required documents.');
            return;
        }

        let profileImageUrl = '';
        if (applicationData.profileImage) {
            profileImageUrl = await dispatch(
                uploadImageToCloudinary(applicationData.profileImage)
            ).unwrap();
            if (!profileImageUrl) {
                toast.error('Failed to upload profile image.');
                return;
            }
        }

        if (!applicationData.vehicleType || !applicationData.branchStation) {
            toast.error('Please select your vehicle type and preferred branch station.');
            return;
        }

        const submitData = {
            ...applicationData,
            vehicleType: applicationData.vehicleType.value,
            branchStation: applicationData.branchStation.value,
            documents: applicationData.documents, // Ensure documents are included
            profileImage: profileImageUrl,
        };

        dispatch(applyDeliveryPartner(submitData));
        navigate('/user/profile');
    };

    const getVehicleIcon = (type) => {
        switch (type) {
            case 'motorcycle':
                return <FaMotorcycle className="w-5 h-5" />;
            case 'car':
                return <Car className="w-5 h-5" />;
            case 'bicycle':
                return <Bike className="w-5 h-5" />;
            case 'scooter':
                return <GiScooter className="w-5 h-5" />;
            default:
                return <Car className="w-5 h-5" />;
        }
    };

    return (
        <div className="min-h-screen bg-white py-6">
            <Toaster />
            <div className="relative py-3">
                <div className="relative px-4 py-10 bg-white rounded-md">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="max-w-6xl mt-10 w-full mx-auto">
                        <div>
                            <h1 className="text-2xl font-semibold text-gray-800 mb-6">
                                Become a Delivery Partner
                            </h1>
                        </div>
                        <form onSubmit={handleSubmit} className="flex w-full flex-wrap gap-4">
                            {/* --- Other Form Fields --- */}
                            <div className=" ">
                                <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
                                    License Number
                                </label>
                                <Input
                                    id="licenseNumber"
                                    name="licenseNumber"
                                    type="text"
                                    value={applicationData.licenseNumber}
                                    onChange={handleInputChange}
                                    className="border h-[45px] rounded-md shadow px-4"
                                    placeholder="Enter your license number"
                                />
                            </div>
                            <div className=" ">
                                <label htmlFor="licenseExpiryDate" className="block text-sm font-medium text-gray-700">
                                    License Expiry Date
                                </label>
                                <Input
                                    id="licenseExpiryDate"
                                    name="licenseExpiryDate"
                                    type="date"
                                    value={applicationData.licenseExpiryDate}
                                    onChange={handleInputChange}
                                    className="border h-[45px] rounded-md shadow px-4"

                                />
                            </div>

                            <div className=" ">
                                <label htmlFor="insuranceNumber" className="block text-sm font-medium text-gray-700">
                                    Insurance Number
                                </label>
                                <Input
                                    id="insuranceNumber"
                                    name="insuranceNumber"
                                    type="text"
                                    value={applicationData.insuranceNumber}
                                    onChange={handleInputChange}
                                    className="border h-[45px] rounded-md shadow px-4"
                                    placeholder="Enter your insurance number"
                                />
                            </div>
                            <div className=" ">
                                <label htmlFor="insuranceExpiryDate" className="block text-sm font-medium text-gray-700">
                                    Insurance Expiry Date
                                </label>
                                <Input
                                    id="insuranceExpiryDate"
                                    name="insuranceExpiryDate"
                                    type="date"
                                    value={applicationData.insuranceExpiryDate}
                                    onChange={handleInputChange}
                                    className="border h-[45px] rounded-md shadow px-4"
                                />
                            </div>

                            <div className=" ">
                                <label htmlFor="vehicleNumber" className="block text-sm font-medium text-gray-700">
                                    Vehicle Number
                                </label>
                                <Input
                                    id="vehicleNumber"
                                    name="vehicleNumber"
                                    type="text"
                                    value={applicationData.vehicleNumber}
                                    onChange={handleInputChange}
                                    className="border h-[45px] rounded-md shadow px-4"
                                    placeholder="Enter your vehicle number"
                                />
                            </div>

                            <div className=" ">
                                <label htmlFor="aadharNumber" className="block text-sm font-medium text-gray-700">
                                    Aadhar Number
                                </label>
                                <Input
                                    id="aadharNumber"
                                    name="aadharNumber"
                                    type="text"
                                    value={applicationData.aadharNumber}
                                    onChange={handleInputChange}
                                    className="border h-[45px] rounded-md shadow px-4"
                                    placeholder="Enter your Aadhar number"
                                />
                            </div>

                            <div className=" ">
                                <label className="block text-sm font-medium text-gray-700">
                                    Vehicle Type
                                </label>
                                <Select
                                    options={vehicleOptions}
                                    value={applicationData.vehicleType}
                                    onChange={handleVehicleTypeChange}
                                    placeholder="Select vehicle type"
                                    className="mt-1"
                                />
                            </div>
                            {/* --- End Other Form Fields --- */}
                            <div className="w-full">
                                <label
                                    htmlFor="profileImage"
                                    className="  text-sm font-medium text-gray-700 flex items-center gap-2"
                                >
                                    <Image className="w-4 h-4" /> Profile Image (Optional)
                                </label>
                                <div className="mt-1 flex items-center justify-center w-full">
                                    <label
                                        htmlFor="dropzone-profile-image"
                                        className="flex flex-col items-center justify-center w-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Image className="w-6 h-6 text-gray-400" />
                                            <p className="mb-2 text-sm text-gray-500">
                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-gray-500">PNG, JPG, JPEG</p>
                                        </div>
                                        <input
                                            id="dropzone-profile-image"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleProfileImageChange}
                                        />
                                    </label>
                                </div>
                                {applicationData.profileImageUrl && (
                                    <div className="mt-2">
                                        <img
                                            src={applicationData.profileImageUrl}
                                            alt="Profile Preview"
                                            className="w-20 h-20 object-cover rounded"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="w-full mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Required Documents</label>
                                {requiredDocumentsList.map((doc, index) => (
                                    <div key={index} className="mb-3">
                                        <label htmlFor={`document-${index}`} className="block text-gray-600 text-xs font-semibold mb-1">
                                            {doc}
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <input
                                                type="file"
                                                id={`document-${index}`}
                                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:shadow-outline"
                                                onChange={(e) => handleDocumentChange(e, index)}
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                {applicationData.documents[index] ? (
                                                    <span className="text-green-500 text-sm">Uploaded</span>
                                                ) : uploadingDocuments[index] && !documentErrors[index] ? (
                                                    <Loader2 className="animate-spin h-5 w-5 text-blue-500" />
                                                ) : (
                                                    <FileUp className="h-5 w-5 text-gray-400" />
                                                )}
                                            </div>
                                        </div>
                                        {documentPreviews[index] && (
                                            <div className="mt-2 flex items-center">
                                                <img src={documentPreviews[index]} alt={`Uploaded ${doc}`} className="h-12 w-12 object-cover rounded mr-2" />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDocument(index)}
                                                    className="text-red-500 hover:text-red-700 focus:outline-none"
                                                >
                                                    <XCircle className="h-5 w-5" /> Remove
                                                </button>
                                            </div>
                                        )}
                                        {documentErrors[index] && <p className="text-red-500 text-xs italic">{documentErrors[index]}</p>}
                                    </div>
                                ))}
                                {applicationData.documents.some(doc => !doc) && (
                                    <p className="text-yellow-600 text-xs italic">Please upload all required documents.</p>
                                )}
                            </div>

                            <div className="w-full">
                                <label
                                    htmlFor="branchStation"
                                    className="  text-sm font-medium text-gray-700 flex items-center gap-2"
                                >
                                    <MapPin className="w-4 h-4" /> Preferred Branch Station
                                </label>
                                {branchStationLoading ? (
                                    <p className="mt-1 text-gray-500 text-sm">Loading branch stations...</p>
                                ) : branchStationError ? (
                                    <p className="mt-1 text-red-500 text-sm">{branchStationError}</p>
                                ) : (
                                    <Select
                                        id="branchStation"
                                        options={branchStationOptions}
                                        value={applicationData.branchStation}
                                        onChange={handleBranchStationChange}
                                        placeholder="Select your preferred branch"
                                        className="mt-1 block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                                    />
                                )}
                            </div>
                            <div className="w-full mt-6">
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={loading || imageLoading || branchStationLoading || uploadingDocuments.some(Boolean) || applicationData.documents.some(doc => !doc)}
                                >
                                    {loading || imageLoading || branchStationLoading
                                        ? 'Submitting Application...'
                                        : uploadingDocuments.some(Boolean) ? 'Uploading Documents...' : 'Submit Application'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="mt-2 w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplyDeliveryPartner;