// src/components/branch/BranchOrdersDashboard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getManagedBranch,
  getOrdersForBranch,
  selectManagedBranch,
  selectBranchOrders,
  selectBranchLoading,
  selectBranchError,
} from '../../store/branchStationSlice';
import { Package, Truck, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'; // Changed MoreHorizontal to Chevron icons for clarity
import { toast } from 'react-hot-toast';

const BranchOrdersDashboard = () => {
  const dispatch = useDispatch();
  const managedBranch = useSelector(selectManagedBranch);
  const orders = useSelector(selectBranchOrders);
  const loading = useSelector(selectBranchLoading);
  const error = useSelector(selectBranchError);

  const [showOrderDetails, setShowOrderDetails] = useState({});
  const [filterStatus, setFilterStatus] = useState('all'); // State for status filtering

  useEffect(() => {
    dispatch(getManagedBranch());
  }, [dispatch]);

  useEffect(() => {
    if (managedBranch && managedBranch._id) {
      dispatch(getOrdersForBranch(managedBranch._id));
    }
  }, [dispatch, managedBranch]);

  useEffect(() => {
    if (error) {
      toast.error(`Failed to load branch data: ${error}`);
    }
  }, [error]);

  const totalOrders = orders ? orders.length : 0;
  const pendingOrders = orders ? orders.filter(order => order.status === 'pending').length : 0;
  const deliveredOrders = orders ? orders.filter(order => order.status === 'delivered').length : 0;
  const inTransitOrders = orders ? orders.filter(order => ['in_transit', 'out_for_delivery'].includes(order.status)).length : 0;
  const returnedOrders = orders ? orders.filter(order => order.isReturnRequested).length : 0; // New: Count of returned orders

  const toggleDetails = (orderId) => {
    setShowOrderDetails(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'return_completed': return 'bg-indigo-100 text-indigo-800'; // Distinct color for returns
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_transit':
      case 'out_for_delivery': return 'bg-blue-100 text-blue-800'; // Blue for in-transit
      case 'picked_up': return 'bg-teal-100 text-teal-800'; // Teal for picked up
      case 'refunded': return 'bg-pink-100 text-pink-800'; // Pink for refunded
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Filtered orders based on selected status
  const filteredOrders = orders?.filter(order => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'returns') return order.isReturnRequested; // Filter by return requests
    return order.status === filterStatus;
  }) || [];

  if (loading && !orders) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"> {/* Better loading height */}
        <p className="text-xl text-gray-600 animate-pulse">Loading branch data and orders...</p>
      </div>
    );
  }

  if (error && !orders) {
    return (
      <div className="text-red-600 text-center p-8 bg-red-50 rounded-lg shadow-md max-w-lg mx-auto my-8">
        <p className="font-bold text-xl mb-2">Error Loading Orders</p>
        <p className="text-lg mb-4">{error}</p>
        <p>Please ensure you are assigned to a branch, verify your network connection, or try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Branch Operations Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10"> {/* Adjusted grid for 5 cards */}
        {/* Card Component could be extracted for reusability */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center justify-center space-y-3 transform hover:scale-105 transition-transform duration-200">
          <div className="p-3 bg-blue-100 rounded-full">
            <Package className="h-7 w-7 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow  flex flex-col items-center justify-center space-y-3 transform hover:scale-105 transition-transform duration-200">
          <div className="p-3 bg-yellow-100 rounded-full">
            <Clock className="h-7 w-7 text-yellow-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Pending</p>
          <p className="text-3xl font-bold text-gray-900">{pendingOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow  flex flex-col items-center justify-center space-y-3 transform hover:scale-105 transition-transform duration-200">
          <div className="p-3 bg-blue-100 rounded-full"> {/* Changed to blue for in-transit consistency */}
            <Truck className="h-7 w-7 text-blue-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">In Transit</p>
          <p className="text-3xl font-bold text-gray-900">{inTransitOrders}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow  flex flex-col items-center justify-center space-y-3 transform hover:scale-105 transition-transform duration-200">
          <div className="p-3 bg-green-100 rounded-full">
            <CheckCircle className="h-7 w-7 text-green-600" />
          </div>
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Delivered</p>
          <p className="text-3xl font-bold text-gray-900">{deliveredOrders}</p>
        </div>

        {/* New: Returned Orders Card */}
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center justify-center space-y-3 transform hover:scale-105 transition-transform duration-200">
          <div className="p-3 bg-red-100 rounded-full">
            <Package className="h-7 w-7 text-red-600" /> {/* Reusing Package for returns */}
          </div>
          <p className="text-gray-600 text-sm font-medium uppercase tracking-wide">Returns</p>
          <p className="text-3xl font-bold text-gray-900">{returnedOrders}</p>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Orders for {managedBranch?.name || 'Your Branch'}</h2>

      {/* Filter and Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="mb-4 md:mb-0">
          <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mr-2">Filter by Status:</label>
          <select
            id="statusFilter"
            className="mt-1 block w-full md:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="shipped">Shipped</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="return_requested">Return Requested</option>
            <option value="pending_pickup">Pending Pickup</option>
            <option value="picked_up">Picked Up</option>
            <option value="return_processing">Return Processing</option>
            <option value="refund_initiated">Refund Initiated</option>
            <option value="refunded">Refunded</option>
            <option value="return_completed">Return Completed</option>
            <option value="returns">All Returns</option> {/* New filter for all return-related orders */}
          </select>
        </div>
        {/* Future: Add a search bar here */}
        {/* <div>
          <input
            type="text"
            placeholder="Search orders..."
            className="block w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div> */}
      </div>

      {/* Order List */}
      {filteredOrders.length === 0 && !loading ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-600">
          <p>No orders found matching your filter criteria for this branch.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 md:mb-0">Order <span className="text-blue-700">#{order.orderNumber}</span></h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusBadgeClasses(order.status)}`}>
                      {(order.status?.replace(/_/g, ' ') || 'UNKNOWN').toUpperCase()}
                    </span>
                    {order.isReturnRequested && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-700">
                        RETURN REQUESTED
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700 border-b pb-4 mb-4">
                  <p><strong className="font-medium">Customer:</strong> {order.user?.username || 'N/A'}</p>
                  <p><strong className="font-medium">Order Date:</strong> {new Date(order.orderDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  <p><strong className="font-medium">Total:</strong> <span className="font-semibold text-green-700">${order.total?.toFixed(2)}</span></p>
                  <p><strong className="font-medium">Payment:</strong> {(order.paymentMethod || 'N/A').toUpperCase()} ({order.paymentStatus?.replace(/_/g, ' ') || 'N/A'})</p>
                  <p><strong className="font-medium">Delivery Partner:</strong> {order.deliveryPartner?.username || 'Unassigned'}</p>
                  <p><strong className="font-medium">Branch:</strong> {order.branchStation?.name || 'N/A'}</p>
                </div>

                <button
                  onClick={() => toggleDetails(order._id)}
                  className="w-full flex justify-center items-center py-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  {showOrderDetails[order._id] ? (
                    <>Hide Details <ChevronUp className="ml-2 h-5 w-5" /></>
                  ) : (
                    <>Show More Details <ChevronDown className="ml-2 h-5 w-5" /></>
                  )}
                </button>
              </div>

              {showOrderDetails[order._id] && (
                <div className="bg-gray-50 p-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Order Items:</h4>
                  <div className="overflow-x-auto mb-5">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map(item => (
                          <tr key={item._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product?.name || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${item.finalPrice?.toFixed(2) || '0.00'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Size: {item.size || 'N/A'}, Color: {item.color || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Shipping & Billing Address:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 text-gray-700">
                    <div>
                      <p className="font-medium text-gray-600 mb-1">Shipping Address:</p>
                      <p>{order.shippingAddress?.fullName || 'N/A'}</p>
                      <p>{order.shippingAddress?.streetAddress}, {order.shippingAddress?.apartmentSuiteUnit}</p>
                      <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}, {order.shippingAddress?.postalCode}</p>
                      <p>{order.shippingAddress?.country}</p>
                      <p>Phone: {order.shippingAddress?.phone || 'N/A'}</p>
                      {order.shippingAddress?.notes && <p className="text-sm italic">Notes: {order.shippingAddress.notes}</p>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-600 mb-1">Billing Address (Same as Shipping):</p>
                      {/* You might want to display billing address if different, otherwise indicate it's the same */}
                      <p>{order.billingAddress?.fullName || 'N/A'}</p>
                      <p>{order.billingAddress?.streetAddress}, {order.billingAddress?.apartmentSuiteUnit}</p>
                      <p>{order.billingAddress?.city}, {order.billingAddress?.state}, {order.billingAddress?.postalCode}</p>
                      <p>{order.billingAddress?.country}</p>
                      <p>Phone: {order.billingAddress?.phone || 'N/A'}</p>
                    </div>
                  </div>

                  {order.trackingDetails && order.trackingDetails.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-lg font-semibold text-gray-800 mb-3">Tracking History:</h4>
                      <ol className="relative border-l border-gray-200 ml-4">
                        {order.trackingDetails.map((track, index) => (
                          <li key={index} className="mb-4 ml-6">
                            <div className="absolute w-3 h-3 bg-blue-500 rounded-full  mt-2.5 -left-[12px] border border-white"></div>
                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">{new Date(track.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</time>
                            <h5 className="text-base font-semibold text-gray-900">{(track.status?.replace(/_/g, ' ') || 'UNKNOWN').toUpperCase()}</h5>
                            {track.location && <p className="text-sm text-gray-600">Location: {track.location}</p>}
                            {track.notes && <p className="text-sm text-gray-600">Notes: "{track.notes}"</p>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {order.returnTrackingDetails && order.returnTrackingDetails.length > 0 && (
                    <div className="mb-5">
                      <h4 className="text-lg font-semibold text-red-700 mb-3">Return Tracking History:</h4>
                      <ol className="relative border-l border-red-300 ml-4">
                        {order.returnTrackingDetails.map((track, index) => (
                          <li key={index} className="mb-4 ml-6">
                            <div className="absolute w-3 h-3 bg-red-500 rounded-full mt-2.5 -left-[12px] border border-white"></div>
                            <time className="mb-1 text-sm font-normal leading-none text-gray-500">{new Date(track.date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</time>
                            <h5 className="text-base font-semibold text-red-800">{(track.status?.replace(/_/g, ' ') || 'UNKNOWN').toUpperCase()}</h5>
                            {track.location && <p className="text-sm text-gray-600">Location: {track.location}</p>}
                            {track.notes && <p className="text-sm text-gray-600">Notes: "{track.notes}"</p>}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BranchOrdersDashboard;