// src/pages/BranchDeliveryPartners.jsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectBranchDeliveryPartners,
  selectBranchLoading,
  selectBranchError,
  selectManagedBranch,
  getDeliveryPartnersForBranch,
  addDeliveryPartnerToBranch,
  removeDeliveryPartnerFromBranch,
  resetAddDeliveryPartnerSuccess,
  resetRemoveDeliveryPartnerSuccess,
  selectAddDeliveryPartnerSuccess,
  selectRemoveDeliveryPartnerSuccess,
} from '../../store/branchStationSlice'; // Adjust path
import { toast } from 'react-hot-toast';
import {
  PlusCircle,
  Truck,
  UserMinus,
  UserPlus,
  XCircle,
  Info,
  Building,
  Mail,
  Phone,
  Clock,
  Car,
  ClipboardList,
  DollarSign,
  Star,
  FileText,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle
} from 'lucide-react'; // Import necessary Lucide icons

const BranchDeliveryPartners = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectBranchLoading);
  const error = useSelector(selectBranchError);
  const deliveryPartners = useSelector(selectBranchDeliveryPartners);
  const managedBranch = useSelector(selectManagedBranch);
  const addSuccess = useSelector(selectAddDeliveryPartnerSuccess);
  const removeSuccess = useSelector(selectRemoveDeliveryPartnerSuccess);

  const [isAddingPartner, setIsAddingPartner] = useState(false);
  const [newPartnerId, setNewPartnerId] = useState('');
  const [selectedPartner, setSelectedPartner] = useState(null); // State to hold the selected partner for details
  const [selectedDocument, setSelectedDocument] = useState(null); // New state for displaying document image

  const branchId = managedBranch?._id;

  useEffect(() => {
    if (branchId) {
      dispatch(getDeliveryPartnersForBranch(branchId));
    }
  }, [dispatch, branchId]);

  useEffect(() => {
    if (addSuccess) {
      toast.success('Delivery partner added successfully!');
      setIsAddingPartner(false);
      setNewPartnerId('');
      dispatch(resetAddDeliveryPartnerSuccess());
      if (branchId) {
        dispatch(getDeliveryPartnersForBranch(branchId));
      }
    }
  }, [addSuccess, dispatch, branchId]);

  useEffect(() => {
    if (removeSuccess) {
      toast.success('Delivery partner removed successfully!');
      dispatch(resetRemoveDeliveryPartnerSuccess());
      if (branchId) {
        dispatch(getDeliveryPartnersForBranch(branchId));
      }
    }
  }, [removeSuccess, dispatch, branchId]);

  const handleAddPartner = () => {
    if (branchId && newPartnerId) {
      dispatch(addDeliveryPartnerToBranch({ branchId, deliveryPartnerId: newPartnerId }));
    } else {
      toast.error('Please enter a valid delivery partner ID.');
    }
  };

  const handleRemovePartner = (userId) => {
    if (window.confirm('Are you sure you want to remove this delivery partner?')) {
      if (branchId) {
        dispatch(removeDeliveryPartnerFromBranch({ branchId, userId }));
      }
    }
  };

  const openPartnerDetails = (partner) => {
    setSelectedPartner(partner);
    setSelectedDocument(null); // Reset selected document when opening new partner details
  };

  const closePartnerDetails = () => {
    setSelectedPartner(null);
    setSelectedDocument(null); // Reset selected document when closing modal
  };

  const handleDocumentClick = (docUrl) => {
    // If the clicked document is already selected, deselect it (toggle)
    if (selectedDocument === docUrl) {
      setSelectedDocument(null);
    } else {
      setSelectedDocument(docUrl);
    }
  };

  const formatWorkingHours = (hours) => {
    if (!hours) return 'N/A';
    return Object.entries(hours)
      .map(([day, { startTime, endTime, isAvailable }]) => {
        if (isAvailable && startTime && endTime) {
          return `${day}: ${startTime} - ${endTime}`;
        }
        return `${day}: Unavailable`;
      })
      .join(', ');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading && !deliveryPartners.length && !selectedPartner) {
    return (
      <div className="flex justify-center items-center h-48">
        <p className="text-gray-600">Loading delivery partners...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-4 bg-red-100 text-red-700 rounded-md">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!managedBranch) {
    return (
      <div className="text-center p-4 bg-yellow-100 text-yellow-700 rounded-md">
        <p>You are not managing any branch. Please apply for a branch manager position.</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <Truck className="mr-3 text-blue-600" size={32} />
        Delivery Partners for {managedBranch?.name || 'Your Branch'}
      </h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Current Delivery Partners</h2>
        {deliveryPartners && deliveryPartners.length > 0 ? (
          <ul className="space-y-4">
            {deliveryPartners.map((partner) => (
              <li
                key={partner._id}
                className="flex items-center justify-between p-4 bg-gray-100 rounded-md shadow-sm hover:bg-gray-200 transition duration-200 cursor-pointer"
              >
                <div className="flex items-center" onClick={() => openPartnerDetails(partner)}>
                  <img
                    src={partner.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${partner.username}`}
                    alt={partner.username}
                    className="w-10 h-10 rounded-full mr-4 object-cover"
                  />
                  <span className="text-lg font-medium text-gray-800 hover:text-blue-600">
                    {partner.username}
                  </span>
                  <span className="text-sm text-gray-500 ml-4">({partner.email})</span>
                  {partner.deliveryPartnerDetails?.availableStatus ? (
                    <span className="ml-3 px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                      Online
                    </span>
                  ) : (
                    <span className="ml-3 px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                      Offline
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleRemovePartner(partner._id)}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-200"
                  aria-label="Remove delivery partner"
                >
                  <UserMinus size={18} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No delivery partners assigned to this branch yet.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add New Delivery Partner</h2>
        {isAddingPartner ? (
          <div className="flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Enter Delivery Partner User ID"
              value={newPartnerId}
              onChange={(e) => setNewPartnerId(e.target.value)}
              className="p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex space-x-4">
              <button
                onClick={handleAddPartner}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-200 flex items-center justify-center"
                disabled={loading}
              >
                {loading ? (
                  'Adding...'
                ) : (
                  <>
                    <PlusCircle size={20} className="mr-2" />
                    Add Partner
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setIsAddingPartner(false);
                  setNewPartnerId('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200 flex items-center justify-center"
              >
                <XCircle size={20} className="mr-2" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingPartner(true)}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-200"
          >
            <UserPlus className="mr-2" />
            Add Delivery Partner
          </button>
        )}
      </div>

      {/* Delivery Partner Details Modal */}
      {selectedPartner && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all sm:scale-100">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <Info className="mr-2 text-blue-600" />
                {selectedPartner.username}'s Details
              </h3>
              <button
                onClick={closePartnerDetails}
                className="p-2 rounded-full hover:bg-gray-100 transition duration-200"
              >
                <XCircle size={24} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              {/* User Basic Info */}
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="text-lg font-semibold mb-2 flex items-center"><UserPlus className="mr-2" size={18}/> User Information</h4>
                <p><strong className="flex items-center"><Mail className="mr-2" size={16}/> Email:</strong> {selectedPartner.email}</p>
                <p><strong className="flex items-center"><Phone className="mr-2" size={16}/> Phone:</strong> {selectedPartner.phoneNumber || 'N/A'}</p>
                <p><strong className="flex items-center"><Building className="mr-2" size={16}/> Role:</strong> {selectedPartner.role}</p>
                <p>
                  <strong className="flex items-center">
                    <ClipboardList className="mr-2" size={16}/> Assigned Orders:
                  </strong>{' '}
                  {selectedPartner.assignedOrders?.length > 0
                    ? selectedPartner.assignedOrders.join(', ')
                    : 'None'}
                </p>
                <p>
                  <strong className="flex items-center">
                    <CheckCircle className="mr-2" size={16}/> Approval Status:
                  </strong>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedPartner.deliveryPartnerDetails?.approvalStatus === 'approved'
                      ? 'bg-green-100 text-green-700'
                      : selectedPartner.deliveryPartnerDetails?.approvalStatus === 'pending'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedPartner.deliveryPartnerDetails?.approvalStatus || 'N/A'}
                  </span>
                </p>
                 <p>
                  <strong className="flex items-center">
                    <Info className="mr-2" size={16}/> Availability:
                  </strong>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    selectedPartner.deliveryPartnerDetails?.availableStatus
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {selectedPartner.deliveryPartnerDetails?.availability || 'N/A'}
                  </span>
                </p>
              </div>

              {/* Delivery Partner Specific Details */}
              {selectedPartner.deliveryPartnerDetails && (
                <div className="bg-purple-50 p-4 rounded-md">
                  <h4 className="text-lg font-semibold mb-2 flex items-center"><Truck className="mr-2" size={18}/> Delivery Partner Details</h4>
                  <p><strong className="flex items-center"><Car className="mr-2" size={16}/> Vehicle Type:</strong> {selectedPartner.deliveryPartnerDetails.vehicleType || 'N/A'}</p>
                  <p><strong className="flex items-center"><FileText className="mr-2" size={16}/> License Number:</strong> {selectedPartner.deliveryPartnerDetails.licenseNumber || 'N/A'}</p>
                  <p><strong className="flex items-center"><Calendar className="mr-2" size={16}/> License Expiry:</strong> {formatDate(selectedPartner.deliveryPartnerDetails.licenseExpiryDate)}</p>
                  <p><strong className="flex items-center"><FileText className="mr-2" size={16}/> Insurance Number:</strong> {selectedPartner.deliveryPartnerDetails.insuranceNumber || 'N/A'}</p>
                  <p><strong className="flex items-center"><Calendar className="mr-2" size={16}/> Insurance Expiry:</strong> {formatDate(selectedPartner.deliveryPartnerDetails.insuranceExpiryDate)}</p>
                  <p><strong className="flex items-center"><Car className="mr-2" size={16}/> Vehicle Number:</strong> {selectedPartner.deliveryPartnerDetails.vehicleNumber || 'N/A'}</p>
                  <p><strong className="flex items-center"><FileText className="mr-2" size={16}/> Aadhar Number:</strong> {selectedPartner.deliveryPartnerDetails.aadharNumber || 'N/A'}</p>
                  <p><strong className="flex items-center"><MapPin className="mr-2" size={16}/> Preferred Radius:</strong> {selectedPartner.deliveryPartnerDetails.preferredDeliveryRadius || 'N/A'} km</p>
                </div>
              )}

              {/* Earnings and Performance */}
              {selectedPartner.deliveryPartnerDetails && (
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="text-lg font-semibold mb-2 flex items-center"><DollarSign className="mr-2" size={18}/> Performance & Earnings</h4>
                  <p><strong className="flex items-center"><DollarSign className="mr-2" size={16}/> Current Earnings:</strong> ₹{selectedPartner.deliveryPartnerDetails.earnings || 0}</p>
                  <p><strong className="flex items-center"><DollarSign className="mr-2" size={16}/> Total Earnings:</strong> ₹{selectedPartner.deliveryPartnerDetails.totalEarnings || 0}</p>
                  <p><strong className="flex items-center"><ClipboardList className="mr-2" size={16}/> Total Deliveries:</strong> {selectedPartner.deliveryPartnerDetails.totalDeliveries || 0}</p>
                  <p><strong className="flex items-center"><Star className="mr-2" size={16}/> Rating:</strong> {selectedPartner.deliveryPartnerDetails.rating || 0}/5</p>
                </div>
              )}

              {/* Working Hours */}
              {selectedPartner.deliveryPartnerDetails?.workingHours && (
                <div className="bg-orange-50 p-4 rounded-md col-span-1 md:col-span-2">
                  <h4 className="text-lg font-semibold mb-2 flex items-center"><Clock className="mr-2" size={18}/> Working Hours</h4>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(selectedPartner.deliveryPartnerDetails.workingHours).map(([day, { startTime, endTime, isAvailable }]) => (
                      <li key={day} className={`flex items-center ${isAvailable ? 'text-gray-700' : 'text-red-500'}`}>
                        {isAvailable ? <CheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0"/> : <AlertCircle size={16} className="mr-2 text-red-500 flex-shrink-0"/>}
                        <strong>{day}:</strong> {isAvailable ? `${startTime} - ${endTime}` : 'Unavailable'}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Documents */}
              {selectedPartner.deliveryPartnerDetails?.documents?.length > 0 && (
                <div className="bg-rose-50 p-4 rounded-md col-span-1 md:col-span-2">
                  <h4 className="text-lg font-semibold mb-2 flex items-center"><FileText className="mr-2" size={18}/> Documents</h4>
                  <div className="flex flex-wrap gap-4">
                    {selectedPartner.deliveryPartnerDetails.documents.map((doc, index) => (
                      <button
                        key={index}
                        onClick={() => handleDocumentClick(doc)}
                        className={`flex items-center px-4 py-2 rounded-md transition duration-200
                          ${selectedDocument === doc ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                      >
                        <FileText size={16} className="mr-2" /> Document {index + 1}
                      </button>
                    ))}
                  </div>
                  {selectedDocument && (
                    <div className="mt-4 border border-gray-300 rounded-md p-2 bg-gray-50 flex justify-center items-center overflow-hidden">
                      <img
                        src={selectedDocument}
                        alt="Selected Document"
                        className="max-w-full max-h-96 object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Manager Application Details (if any) */}
              {selectedPartner.managerApplication && (
                <div className="bg-yellow-50 p-4 rounded-md col-span-1 md:col-span-2">
                  <h4 className="text-lg font-semibold mb-2 flex items-center"><Info className="mr-2" size={18}/> Manager Application Status</h4>
                  <p><strong>Status:</strong> {selectedPartner.managerApplication.status}</p>
                  <p><strong>Application Date:</strong> {formatDate(selectedPartner.managerApplication.applicationDate)}</p>
                  {selectedPartner.managerApplication.documents?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      <strong>Application Documents:</strong>
                      {selectedPartner.managerApplication.documents.map((doc, index) => (
                        <button
                          key={`mgr-doc-${index}`}
                          onClick={() => handleDocumentClick(doc)}
                          className={`px-3 py-1 text-xs rounded-md
                            ${selectedDocument === doc ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                        >
                          Doc {index + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchDeliveryPartners;