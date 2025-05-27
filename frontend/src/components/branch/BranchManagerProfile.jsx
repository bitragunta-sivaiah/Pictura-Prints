import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getManagedBranch,
  selectBranchLoading,
  selectBranchError,
  selectManagedBranch,
  selectBranchOrders,
  selectBranchActiveOrders,
  selectBranchDeliveryPartners,
  selectBranchRevenue,
} from '../../store/branchStationSlice'; // Ensure these selectors are correctly configured
import {
  selectAuthUser, // Assuming this still holds the logged-in user's general details
  updateUserProfile,
  selectAuthLoading, // To show loading state for profile update
  selectAuthError, // To show error state for profile update
} from '../../store/userSlice'; // This should be your authSlice, renamed to userSlice for clarity

import {
  Building2,
  Package,
  Bike,
  DollarSign,
  User,
  Mail,
  Phone,
  MapPin,
  ClipboardList,
  Clock,
  Briefcase,
  Loader2,
  AlertCircle,
  Users,
  CalendarDays,
  Edit,
  Save,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast'; // Import toast for user notifications

const BranchManagerProfile = () => {
  const dispatch = useDispatch();

  const branchLoading = useSelector(selectBranchLoading);
  const branchError = useSelector(selectBranchError);
  const managedBranchData = useSelector(selectManagedBranch);
  const orders = useSelector(selectBranchOrders);
  const activeOrders = useSelector(selectBranchActiveOrders);
  const deliveryPartners = useSelector(selectBranchDeliveryPartners);
  const revenue = useSelector(selectBranchRevenue);

  const currentUserAuth = useSelector(selectAuthUser); // This user object will be updated
  const userUpdateLoading = useSelector(selectAuthLoading);
  const userUpdateError = useSelector(selectAuthError);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '', // Assuming you might want to edit this if available
    address: '', // Assuming you might want to edit this if available
  });

  useEffect(() => {
    dispatch(getManagedBranch());
  }, [dispatch]);

  // Update form data when managedBranchData or currentUserAuth changes
  useEffect(() => {
    if (managedBranchData?.manager || currentUserAuth) {
      // Prioritize manager details from managedBranchData if available,
      // otherwise fallback to currentUserAuth for general user details.
      const managerInfo = managedBranchData?.manager || currentUserAuth;

      setFormData({
        username: managerInfo?.username || '',
        email: managerInfo?.email || '',
        // For phoneNumber and address, use currentUserAuth as the manager object
        // in the branch data doesn't seem to have them directly.
        phoneNumber: currentUserAuth?.phoneNumber || '',
        address: currentUserAuth?.address?.[0]?.fullAddress || '', // Assuming first address
      });
    }
  }, [managedBranchData, currentUserAuth]);

  // Handle changes in form inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile update submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserAuth?._id) {
      toast.error('User ID is missing. Cannot update profile.');
      return;
    }

    // Construct the data to send for update
    const updatePayload = {
      id: currentUserAuth._id, // User ID is essential for the API call
      username: formData.username,
      email: formData.email,
      // You might need to handle address and phone number updates carefully
      // as they might require a different API endpoint or structure
      // based on how your backend handles nested objects like 'address'.
      // For simplicity, I'm passing them directly if they were editable.
      // If your backend expects `address` as an array of objects, this needs adjustment.
      phoneNumber: formData.phoneNumber,
      address: [{ fullAddress: formData.address }], // Example: if backend expects an array
    };

    const resultAction = await dispatch(updateUserProfile(updatePayload));
    if (updateUserProfile.fulfilled.match(resultAction)) {
      toast.success('Profile updated successfully!');
      setIsEditing(false); // Exit editing mode on success
      // Re-fetch branch data to ensure consistency if manager details are
      // part of the branch details fetch
      dispatch(getManagedBranch());
    } else {
      toast.error(resultAction.payload?.message || 'Failed to update profile.');
    }
  };

  // Derive manager and branch details from the fetched data
  const managerDetails = managedBranchData?.manager;
  const branchDetails = managedBranchData;

  // --- Loading and Error States for Branch Data ---
  if (branchLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="ml-3 text-lg text-gray-700">Loading branch manager profile...</p>
      </div>
    );
  }

  if (branchError) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-red-50 p-4">
        <AlertCircle className="h-12 w-12 text-red-600 mb-4" />
        <h2 className="text-2xl font-semibold text-red-800 mb-2">Error Loading Profile</h2>
        <p className="text-red-700 text-center">{branchError}</p>
        <p className="text-red-600 text-sm mt-2">Please try again later or contact support.</p>
      </div>
    );
  }

  // Fallback if no managed branch data is found
  if (!managedBranchData || !managerDetails) {
    return (
      <div className="flex flex-col justify-center items-center h-screen  ">
        <Briefcase className="h-12 w-12 text-yellow-600 mb-4" />
        <h2 className="text-2xl font-semibold text-yellow-800 mb-2">No Branch Managed</h2>
        <p className="text-yellow-700 text-center">
          You are not currently assigned as a manager to any branch, or the details could not be loaded.
        </p>
        <p className="text-yellow-600 text-sm mt-2">
          If this is an error, please contact administration.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto bg-white shadow rounded-lg overflow-hidden">
        {/* --- Header Section --- */}
        <div className="bg-indigo-600 p-8 text-white text-center relative">
          <div className="absolute top-4 right-4">
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={handleSubmit}
                  className="p-2 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
                  disabled={userUpdateLoading}
                >
                  {userUpdateLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  ) : (
                    <Save className="h-5 w-5 text-white" />
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                  disabled={userUpdateLoading}
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-700 transition-colors"
              >
                <Edit className="h-5 w-5 text-white" />
              </button>
            )}
          </div>
          <div className="flex flex-col items-center">
            <div className="w-28 h-28 bg-indigo-200 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-md overflow-hidden">
              {managerDetails?.avatar ? (
                <img
                  src={managerDetails.avatar}
                  alt="Manager Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="h-16 w-16 text-indigo-700" />
              )}
            </div>
            <h1 className="text-4xl font-bold mb-1">
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="bg-indigo-700 text-white text-center text-4xl font-bold rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              ) : (
                managerDetails?.username || 'Branch Manager'
              )}
            </h1>
            <p className="text-indigo-200 text-lg flex items-center">
              <Briefcase className="inline-block h-5 w-5 mr-2" />
              Branch Manager
            </p>
          </div>
        </div>

        {/* --- Personal & Contact Information --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <User className="h-6 w-6 mr-2 text-indigo-500" />
            Personal & Contact Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Email:</strong>{' '}
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex-grow border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              ) : (
                managerDetails?.email || 'N/A'
              )}
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Phone:</strong>{' '}
              {isEditing ? (
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="flex-grow border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              ) : (
                currentUserAuth?.phoneNumber || 'N/A'
              )}
            </div>
            <div className="flex items-center col-span-1 md:col-span-2">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Address:</strong>{' '}
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                  className="flex-grow border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                ></textarea>
              ) : (
                currentUserAuth?.address?.[0]?.fullAddress || 'N/A'
              )}
            </div>
            {userUpdateError && (
              <p className="col-span-full text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {userUpdateError}
              </p>
            )}
          </div>
        </div>

        {/* --- Managed Branch Details (Not editable here, as it's branch-specific) --- */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <Building2 className="h-6 w-6 mr-2 text-indigo-500" />
            Managed Branch Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <p className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Name:</strong> {branchDetails.name || 'N/A'}
            </p>
            <p className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Address:</strong> {branchDetails.address || 'N/A'}, {branchDetails.city || 'N/A'}, {branchDetails.state || 'N/A'} - {branchDetails.postalCode || 'N/A'}
            </p>
            <p className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Contact Person:</strong> {branchDetails.contactPerson || 'N/A'}
            </p>
            <p className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Contact Phone:</strong> {branchDetails.contactPhone || 'N/A'}
            </p>
            <p className="flex items-center">
              <Mail className="h-5 w-5 mr-2 text-gray-500" />
              <strong className="w-24">Email:</strong> {branchDetails.email || 'N/A'}
            </p>
            <p className="flex items-center">
                <CalendarDays className="h-5 w-5 mr-2 text-gray-500" />
                <strong className="w-24 mr-2">Established:</strong>{' '}
                {branchDetails.createdAt ? new Date(branchDetails.createdAt).toLocaleDateString() : 'N/A'}
            </p>
            <p className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-gray-500" />
                <strong className="w-24">Operating Radius:</strong> {branchDetails.operatingRadius || 'N/A'} km
            </p>
          </div>
        </div>

        {/* --- Branch Statistics --- */}
        <div className="p-6 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-4 rounded-lg flex flex-col items-center shadow-sm">
            <Package className="h-8 w-8 text-blue-600 mb-2" />
            <h3 className="text-xl font-semibold text-blue-800">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-700">{orders?.length ?? 0}</p>
            <span className="text-gray-500 text-sm">All Time</span>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg flex flex-col items-center shadow-sm">
            <ClipboardList className="h-8 w-8 text-yellow-600 mb-2" />
            <h3 className="text-xl font-semibold text-yellow-800">Active Orders</h3>
            <p className="text-3xl font-bold text-yellow-700">{activeOrders?.length ?? 0}</p>
            <span className="text-gray-500 text-sm">Currently</span>
          </div>
          <div className="bg-green-50 p-4 rounded-lg flex flex-col items-center shadow-sm">
            <DollarSign className="h-8 w-8 text-green-600 mb-2" />
            <h3 className="text-xl font-semibold text-green-800">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-700">
              ${revenue?.total !== undefined ? revenue.total.toFixed(2) : '0.00'}
            </p>
            <span className="text-gray-500 text-sm">Overall</span>
          </div>
        </div>

        {/* --- Assigned Delivery Partners --- */}
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
            <Bike className="h-6 w-6 mr-2 text-indigo-500" />
            Assigned Delivery Partners ({deliveryPartners?.length ?? 0})
          </h2>
          {deliveryPartners && deliveryPartners.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {deliveryPartners.map((partner) => (
                <div key={partner._id} className="bg-gray-50 p-4 rounded-lg shadow-sm flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3 overflow-hidden">
                    {partner.avatar ? (
                      <img src={partner.avatar} alt={partner.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <Users className="h-5 w-5 text-indigo-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{partner.username || 'N/A'}</p>
                    <p className="text-sm text-gray-600">{partner.email || 'N/A'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 italic">No delivery partners assigned to this branch yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchManagerProfile;