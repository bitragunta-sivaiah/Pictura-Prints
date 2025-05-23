import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    getAllBranchStations, // To get the list of branches (which might include applications)
    approveBranchManagerApplication,
    rejectBranchManagerApplication,
} from '../../store/adminBranchSlice';
import { selectBranchStations, selectAdminBranchLoading, selectAdminBranchError } from '../../store/adminBranchSlice';
import { Loader2, CheckCircle, XCircle, X } from 'lucide-react'; // Import the X icon for close
import { toast } from 'react-hot-toast';

const AdminBranchManagerApplications = () => {
    const dispatch = useDispatch();
    const branchStations = useSelector(selectBranchStations);
    const loadingBranches = useSelector(selectAdminBranchLoading);
    const errorBranches = useSelector(selectAdminBranchError);
    const [loadingActions, setLoadingActions] = useState({});
    const [selectedDocument, setSelectedDocument] = useState(null);

    useEffect(() => {
        dispatch(getAllBranchStations());
    }, [dispatch]);

    const handleApprove = async (branchId, userId) => {
        setLoadingActions((prev) => ({ ...prev, [`approve-${branchId}-${userId}`]: true }));
        try {
            await dispatch(approveBranchManagerApplication({ branchId, userId })).unwrap();
            toast.success('Application approved successfully!');
            dispatch(getAllBranchStations()); // Refresh data
        } catch (error) {
            toast.error(`Failed to approve application: ${error?.message || 'An error occurred'}`);
        } finally {
            setLoadingActions((prev) => ({ ...prev, [`approve-${branchId}-${userId}`]: false }));
        }
    };

    const handleReject = async (branchId, userId) => {
        const rejectionReason = prompt('Enter the reason for rejection:');
        if (rejectionReason) {
            setLoadingActions((prev) => ({ ...prev, [`reject-${branchId}-${userId}`]: true }));
            try {
                await dispatch(rejectBranchManagerApplication({ branchId, userId, rejectionReason })).unwrap();
                toast.success('Application rejected successfully!');
                dispatch(getAllBranchStations()); // Refresh data
            } catch (error) {
                toast.error(`Failed to reject application: ${error?.message || 'An error occurred'}`);
            } finally {
                setLoadingActions((prev) => ({ ...prev, [`reject-${branchId}-${userId}`]: false }));
            }
        }
    };

    const handleDocumentClick = (docUrl) => {
        setSelectedDocument(docUrl);
    };

    const handleClosePreview = () => {
        setSelectedDocument(null);
    };

    if (loadingBranches) {
        return (
            <div className="container mx-auto p-8 text-center">
                <Loader2 className="animate-spin h-10 w-10 mx-auto text-blue-500" />
                <p className="mt-4">Loading Branches...</p>
            </div>
        );
    }

    if (errorBranches) {
        return (
            <div className="container mx-auto p-8 text-center text-red-500">
                Error loading branches: {errorBranches}
            </div>
        );
    }

    const branchesWithApplications = branchStations ? branchStations.filter(
        (branch) => branch.managerApplication
    ) : [];

    if (!branchesWithApplications || branchesWithApplications.length === 0) {
        return (
            <div className="container mx-auto p-8 text-center">
                <p>No branch manager applications found.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-2 relative">
            <h2 className="text-2xl font-semibold mb-6">Branch Manager Applications</h2>

            <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-200 shadow">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4 border-b font-medium text-left text-gray-700">Branch Name</th>
                            <th className="py-3 px-4 border-b font-medium text-left text-gray-700">Applicant Username</th>
                            <th className="py-3 px-4 border-b font-medium text-left text-gray-700">Application Date</th>
                            <th className="py-3 px-4 border-b font-medium text-left text-gray-700">Status</th>
                            <th className="py-3 px-4 border-b font-medium text-left text-gray-700">Reason</th>
                            <th className="py-3 px-4 border-b font-medium text-left text-gray-700">Documents</th>
                            <th className="py-3 px-4 border-b font-medium text-left text-gray-700">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branchesWithApplications.map((branch) => (
                            <tr key={branch._id} className="hover:bg-gray-50">
                                <td className="py-3 px-4 border-b">{branch.name}</td>
                                <td className="py-3 px-4 border-b">
                                    {branch.managerApplication?.user?.username || 'N/A'}
                                </td>
                                <td className="py-3 px-4 border-b">{branch.managerApplication?.applicationDate ? new Date(branch.managerApplication.applicationDate).toLocaleDateString() : 'N/A'}</td>
                                <td className="py-3 px-4 border-b">{branch.managerApplication?.status || 'N/A'}</td>
                                <td className="py-3 px-4 border-b w-[250px]">{branch.managerApplication?.reason || 'N/A'}</td>
                                <td className="py-3 px-4 border-b">
                                    {branch.managerApplication?.documents && branch.managerApplication.documents.length > 0 ? (
                                        <ul className="list-disc pl-4">
                                            {branch.managerApplication.documents.map((docUrl, index) => (
                                                <li key={index}>
                                                    <button
                                                        onClick={() => handleDocumentClick(docUrl)}
                                                        className="text-blue-500 hover:underline focus:outline-none"
                                                    >
                                                        Document {index + 1}
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        'No documents uploaded'
                                    )}
                                </td>
                                <td className="py-3 px-4 border-b">
                                    {branch.managerApplication?.status === 'pending' && branch.managerApplication?.user?._id && (
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => handleApprove(branch._id, branch.managerApplication.user._id)}
                                                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 flex items-center gap-2 h-fit px-2 rounded focus:outline-none focus:shadow-outline"
                                                disabled={loadingActions[`approve-${branch._id}-${branch.managerApplication.user._id}`]}
                                            >
                                                {loadingActions[`approve-${branch._id}-${branch.managerApplication.user._id}`] ? (
                                                    <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                                                ) : (
                                                    <CheckCircle className="h-5 w-5" />
                                                )}
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleReject(branch._id, branch.managerApplication.user._id)}
                                                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-2 flex items-center gap-2 h-fit rounded focus:outline-none focus:shadow-outline"
                                                disabled={loadingActions[`reject-${branch._id}-${branch.managerApplication.user._id}`]}
                                            >
                                                {loadingActions[`reject-${branch._id}-${branch.managerApplication.user._id}`] ? (
                                                    <Loader2 className="animate-spin h-5 w-5 mx-auto" />
                                                ) : (
                                                    <XCircle className="h-5 w-5" />
                                                )}
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                    {branch.managerApplication?.status !== 'pending' && branch.managerApplication?.status && (
                                        <span className={`font-semibold ${branch.managerApplication.status === 'approved' ? 'text-green-500' : 'text-red-500'}`}>
                                            {branch.managerApplication.status.charAt(0).toUpperCase() + branch.managerApplication.status.slice(1)}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedDocument && (
                <div className="fixed top-0 left-0 w-full h-full bg-white z-50 bg-opacity-80 flex justify-center items-center">
                    <div className="bg-white rounded-md w-[500px] h-[500px] overflow-hidden p-2 relative">
                        <button
                            onClick={handleClosePreview}
                            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <img src={selectedDocument} alt="Document Preview" className="w-full h-full object-cover" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBranchManagerApplications;