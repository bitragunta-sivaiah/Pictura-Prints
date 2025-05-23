import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchBranchDeliveryPartnerApplications, // Assuming this will now fetch ALL applications
    approveDeliveryPartnerApplication,
    rejectDeliveryPartnerApplication,
    selectPendingDeliveryPartnerApplications, // This selector might need to be updated or a new one created
    selectDeliveryPartnerLoading,
    selectDeliveryPartnerError,
} from '../../store/deliveryPartnerSlice';
import { UserRound, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ImagePreviewModal = ({ imageUrl, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50">
        <div className="relative bg-white rounded-md shadow-lg max-w-4xl max-h-screen overflow-auto">
            <img src={imageUrl} alt="Document Preview" className="block w-full" />
            <button
                onClick={onClose}
                className="absolute top-2 right-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-3 rounded-full text-sm"
            >
                Close
            </button>
        </div>
    </div>
);

const DeliveryPartnerApplicationsAdmin = () => {
    const dispatch = useDispatch();
    // Assuming selectPendingDeliveryPartnerApplications now returns ALL applications
    const allApplications = useSelector(selectPendingDeliveryPartnerApplications);
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);
    const [rejectReason, setRejectReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState('');

    // Filter applications to show only those with 'processing' approvalStatus
    const pendingApplications = allApplications.filter(
        (app) => app?.deliveryPartnerDetails?.approvalStatus === 'pending' && app?.deliveryPartnerApplication?.status === 'processing'
    );

    useEffect(() => {
        dispatch(fetchBranchDeliveryPartnerApplications()); // This action should now fetch all applications
    }, [dispatch]);

    const handleApprove = async (userId) => {
        await dispatch(approveDeliveryPartnerApplication(userId));
        toast.success('Application approved!');
        dispatch(fetchBranchDeliveryPartnerApplications()); // Re-fetch all applications to update the list
    };

    const openRejectModal = (userId) => {
        setSelectedApplicationId(userId);
        setShowRejectModal(true);
        setRejectReason('');
    };

    const closeRejectModal = () => {
        setShowRejectModal(false);
        setSelectedApplicationId(null);
        setRejectReason('');
    };

    const handleReject = async () => {
        await dispatch(rejectDeliveryPartnerApplication({ userId: selectedApplicationId, rejectionReason: rejectReason }));
        toast.success('Application rejected!');
        closeRejectModal();
        dispatch(fetchBranchDeliveryPartnerApplications()); // Re-fetch all applications to update the list
    };

    const openImagePreview = (imageUrl) => {
        setSelectedImageUrl(imageUrl);
        setShowImageModal(true);
    };

    const closeImagePreview = () => {
        setShowImageModal(false);
        setSelectedImageUrl('');
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="animate-spin w-8 h-8" />
                <span className="ml-2">Loading Applications...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-red-500">Error: {error}</div>
        );
    }

    return (
        <div className="p-4">
            <h2 className="text-2xl font-semibold mb-4">Delivery Partner Applications</h2>
            {pendingApplications.length === 0 ? (
                <p>No pending delivery partner applications.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border text-sm border-gray-200 rounded-md">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="py-2 px-4 border-b font-semibold text-left">User</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Applied On</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Vehicle</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">License</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Insurance</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Aadhar</th>
                                <th className="py-2 px-4 border-b font-semibold text-left">Documents</th>
                                <th className="py-2 px-4 border-b font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingApplications.map((app) => (
                                <tr key={app._id} className="hover:bg-gray-50 text-xs">
                                    <td className="py-2 px-4 border-b">
                                        <div className="flex items-center">
                                            <UserRound className="w-4 h-4 mr-2 text-gray-600" />
                                            {app.username}
                                        </div>
                                    </td>
                                    <td className="py-2 px-4 border-b">{new Date(app.deliveryPartnerApplication?.applicationDate).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b">{app.deliveryPartnerApplication?.vehicleType} ({app.deliveryPartnerApplication?.vehicleNumber})</td>
                                    <td className="py-2 px-4 border-b text-xs">
                                        {app.deliveryPartnerApplication?.licenseNumber} (Expires on{' '}
                                        {new Date(app.deliveryPartnerApplication?.licenseExpiryDate).toLocaleDateString()}
                                        )
                                    </td>
                                    <td className="py-2 px-4 border-b">
                                        {app.deliveryPartnerApplication?.insuranceNumber} (Expires on{' '}
                                        {new Date(app.deliveryPartnerApplication?.insuranceExpiryDate).toLocaleDateString()}
                                        )
                                    </td>
                                    <td className="py-2 px-4 border-b">{app.deliveryPartnerApplication?.aadharNumber}</td>
                                    <td className="py-2 px-4 border-b">
                                        <ul className="list-disc pl-4 w-full">
                                            {app.deliveryPartnerApplication?.documents?.map((docUrl, index) => (
                                                <li key={index} className='list-none'>
                                                    <button
                                                        onClick={() => openImagePreview(docUrl)}
                                                        className="text-blue-500 hover:underline flex mt-3 items-center gap-1 w-full"
                                                    >
                                                        <Eye className="w-4 h-4 mr-1" /> <p>Document{index + 1}</p>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="py-2 px-4 flex items-center gap-4 justify-center h-full mt-[10%] text-center">
                                        <button
                                            onClick={() => handleApprove(app._id)}
                                            className="bg-green-500 hover:bg-green-700 h-fit flex items-center gap-1 text-white font-bold py-2 px-3 rounded-md text-sm mr-2"
                                        >
                                            <CheckCircle className="w-4 h-4 inline-block mr-1" /> Approve
                                        </button>
                                        <button
                                            onClick={() => openRejectModal(app._id)}
                                            className="bg-red-500 hover:bg-red-700 h-fit flex items-center gap-1 text-white font-bold py-2 px-3 rounded-md text-sm"
                                        >
                                            <XCircle className="w-4 h-4 inline-block mr-1" /> Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
                    <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
                        <h2 className="text-lg font-semibold mb-4">Reject Application</h2>
                        <label htmlFor="rejectionReason" className="block text-gray-700 text-sm font-bold mb-2">
                            Reason for Rejection:
                        </label>
                        <textarea
                            id="rejectionReason"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
                            rows="3"
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md mr-2"
                                onClick={closeRejectModal}
                            >
                                Cancel
                            </button>
                            <button
                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md"
                                onClick={handleReject}
                                disabled={!rejectReason.trim()}
                            >
                                Reject Application
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Preview Modal */}
            {showImageModal && (
                <ImagePreviewModal imageUrl={selectedImageUrl} onClose={closeImagePreview} />
            )}
        </div>
    );
};

export default DeliveryPartnerApplicationsAdmin;