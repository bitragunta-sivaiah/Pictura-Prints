import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getBranchStationDetails, // To get order details
  clearBranchDetails,
  getDeliveryPartnersForBranch, // To get available delivery partners for the branch
  clearDeliveryPartners,
  assignDeliveryPartnerToOrder, // To assign the order
  resetAssignDeliveryPartnerSuccess,
} from '../../store/branchStationSlice';
import { Loader2, Package, User, MapPin, Truck } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const BranchManagerAssignOrder = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    branchStationDetails,
    loading: orderDetailsLoading,
    error: orderDetailsError,
    deliveryPartners,
    loading: deliveryPartnersLoading,
    error: deliveryPartnersError,
    assignDeliveryPartnerSuccess,
    loading: assignmentLoading,
    error: assignmentError,
  } = useSelector((state) => state.branchStation); // Corrected selector to branchStation
  const [selectedDeliveryPartner, setSelectedDeliveryPartner] = useState('');
  const [currentBranchId, setCurrentBranchId] = useState(null);

  useEffect(() => {
    // Fetch branch details based on the order's branchId once it's available
    if (orderId && !branchStationDetails?._id) {
      // We need to fetch the order separately first to get its branchId
      const fetchOrderAndBranch = async () => {
        try {
          const response = await API.get(`/api/orders/${orderId}`); // Assuming an endpoint to fetch a single order
          const orderData = response.data;
          if (orderData?.branchStation) {
            setCurrentBranchId(orderData.branchStation);
            dispatch(getBranchStationDetails(orderData.branchStation));
            dispatch(getDeliveryPartnersForBranch(orderData.branchStation));
          } else {
            toast.error('Order does not have associated branch information.');
          }
        } catch (error) {
          toast.error(error?.response?.data?.message || 'Failed to fetch order details.');
        }
      };
      fetchOrderAndBranch();
    } else if (branchStationDetails?._id) {
      dispatch(getDeliveryPartnersForBranch(branchStationDetails._id));
    }

    return () => {
      dispatch(clearBranchDetails());
      dispatch(clearDeliveryPartners());
    };
  }, [dispatch, orderId, branchStationDetails?._id]);

  // Find the specific order from the fetched branch details
  const orderDetails = branchStationDetails?.orders?.find((order) => order._id === orderId);

  useEffect(() => {
    if (assignDeliveryPartnerSuccess) {
      toast.success('Order assigned successfully!');
      dispatch(resetAssignDeliveryPartnerSuccess());
      navigate(`/branch/orders`); // Redirect to the orders list page
    }

    if (assignmentError) {
      toast.error(`Failed to assign order: ${assignmentError?.message || 'Something went wrong.'}`);
    }
  }, [assignDeliveryPartnerSuccess, assignmentError, navigate, dispatch]);

  const handleDeliveryPartnerChange = (event) => {
    setSelectedDeliveryPartner(event.target.value);
  };

  const handleAssignOrder = () => {
    if (selectedDeliveryPartner && currentBranchId) {
      dispatch(
        assignDeliveryPartnerToOrder({
          branchId: currentBranchId,
          orderId: orderId,
          deliveryPartnerId: selectedDeliveryPartner,
        })
      );
    } else if (!selectedDeliveryPartner) {
      toast.error('Please select a delivery partner.');
    } else {
      toast.error('Branch information is not available for this order.');
    }
  };

  if (orderDetailsLoading || deliveryPartnersLoading || assignmentLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="flex justify-center items-center">
          <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
          <span className="ml-2">Loading Details...</span>
        </div>
      </div>
    );
  }

  if (orderDetailsError || deliveryPartnersError) {
    return (
      <div className="container mx-auto p-8 text-red-500">
        Error: {orderDetailsError?.message || deliveryPartnersError?.message || 'Failed to load details.'}
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="container mx-auto p-8 text-gray-600">
        <p>Order details not found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-semibold mb-4">Assign Order to Delivery Partner</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2">Order Information</h3>
        <p>
          <strong>Order ID:</strong> {orderDetails._id}
        </p>
        <p>
          <strong>Customer:</strong> {orderDetails.user?.username || 'Guest'}
        </p>
        <p>
          <strong>Order Date:</strong> {format(new Date(orderDetails.orderDate), 'dd-MM-yyyy HH:mm')}
        </p>
        <p>
          <strong>Status:</strong> {orderDetails.status.replace(/_/g, ' ')}
        </p>
        <p>
          <strong>Total:</strong> ₹{orderDetails.total}
        </p>
        <h4 className="text-md font-semibold mt-2 mb-1">Shipping Address:</h4>
        {orderDetails.shippingAddress && (
          <div>
            <p>{orderDetails.shippingAddress.fullName}</p>
            <p>{orderDetails.shippingAddress.streetAddress}, {orderDetails.shippingAddress.apartmentSuiteUnit}</p>
            <p>{orderDetails.shippingAddress.city}, {orderDetails.shippingAddress.state} - {orderDetails.shippingAddress.postalCode}</p>
          </div>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-4">
        <h3 className="text-lg font-semibold mb-2">Available Delivery Partners</h3>
        {deliveryPartners && deliveryPartners.length > 0 ? (
          <div className="space-y-2">
            <label htmlFor="deliveryPartner" className="block text-gray-700 text-sm font-bold mb-2">
              Select Delivery Partner:
            </label>
            <select
              id="deliveryPartner"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedDeliveryPartner}
              onChange={handleDeliveryPartnerChange}
            >
              <option value="">-- Select Partner --</option>
              {deliveryPartners.map((partner) => (
                <option key={partner._id} value={partner._id}>
                  {partner.user?.username}
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignOrder}
              className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={!selectedDeliveryPartner || assignmentLoading}
            >
              {assignmentLoading ? <Loader2 className="animate-spin h-5 w-5 mr-2 inline-block" /> : <Truck className="h-5 w-5 mr-2 inline-block" />}
              Assign Order
            </button>
          </div>
        ) : (
          <p className="text-gray-600">No delivery partners are currently available for this branch.</p>
        )}
      </div>

      <button
        onClick={() => navigate('/branch/orders')}
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Back to Orders
      </button>
    </div>
  );
};

export default BranchManagerAssignOrder;