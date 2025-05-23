import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  getAllOrders,
  selectOrders,
  selectOrderLoading,
  selectOrderError,
} from '../../store/orderSlice'; // Adjust path if necessary
import {
  fetchProducts,
  selectAllProducts,
  selectProductsError,
} from '../../store/productSlice'; // Adjust path if necessary
import {
  getAllBranchStations,
  selectBranchStations,
  selectAdminBranchLoading,
  selectAdminBranchError,
} from '../../store/adminBranchSlice'; // Adjust path if necessary

import {
  getBranchStationDetails,
  getOrdersForBranch,
  getDeliveryPartnersForBranch, // This action fetches DPs for a specific branch
  getBranchRevenue,
  selectBranchLoading,
  selectBranchError,
  selectBranchStationDetails,
  selectBranchOrders,
  selectBranchActiveOrders,
  selectBranchDeliveryPartners, // This selector provides DPs for the specific branch
  selectBranchRevenue,
} from '../../store/branchStationSlice'; // Adjust path to your branchStationSlice

import {
  getAllUsers,
  selectAllUsers,
  selectAuthLoading,
  selectAuthError,
} from '../../store/userSlice'; // Adjust path if necessary

import {
  fetchDeliveryPartners, // This action fetches ALL DPs globally
  selectDeliveryPartners, // This selector provides ALL DPs globally
  selectDeliveryPartnerLoading,
  selectDeliveryPartnerError,
} from '../../store/deliveryPartnerSlice'; // Adjust path if necessary


import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend, LineElement, PointElement } from 'chart.js';
import { Package, ShoppingBag, DollarSign, Clock, Users, MapPin, Truck, TrendingUp, Loader2 } from 'lucide-react'; // Changed back to lucide-react as it's the standard
import { toast } from 'react-hot-toast';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

const AdminAnalysisPage = () => {
  const dispatch = useDispatch();

  // State for the selected branch in the dropdown
  const [selectedBranchId, setSelectedBranchId] = useState('');

  // Selectors for Global Data (from their respective slices)
  const orders = useSelector(selectOrders);
  const orderLoading = useSelector(selectOrderLoading);
  const orderError = useSelector(selectOrderError);

  const products = useSelector(selectAllProducts);
  const productsError = useSelector(selectProductsError);

  const users = useSelector(selectAllUsers);
  const authLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  // Selectors for ALL Branch Stations (from adminBranchSlice)
  const allBranches = useSelector(selectBranchStations);
  const allBranchesLoading = useSelector(selectAdminBranchLoading);
  const allBranchesError = useSelector(selectAdminBranchError);

  // Selectors for ALL Delivery Partners (from deliveryPartnerSlice) - Used for general overview if needed
  const allDeliveryPartners = useSelector(selectDeliveryPartners);
  const deliveryPartnerLoading = useSelector(selectDeliveryPartnerLoading);
  const deliveryPartnerError = useSelector(selectDeliveryPartnerError);

  // Selectors for SPECIFIC Branch Station Details (from branchStationSlice)
  const branchLoading = useSelector(selectBranchLoading);
  const branchError = useSelector(selectBranchError);
  const branchDetails = useSelector(selectBranchStationDetails);
  const branchAllOrders = useSelector(selectBranchOrders);
  const branchActiveOrders = useSelector(selectBranchActiveOrders);
  const branchDeliveryPartners = useSelector(selectBranchDeliveryPartners); // This will be used for selected branch's DPs
  const branchRevenue = useSelector(selectBranchRevenue);

  // 1. Fetch all global data and the list of all branches and all delivery partners on component mount
  useEffect(() => {
    dispatch(getAllOrders());
    dispatch(fetchProducts());
    dispatch(getAllUsers());
    dispatch(getAllBranchStations()); // Fetch all branches for the dropdown
    dispatch(fetchDeliveryPartners()); // Fetch all delivery partners (global list)
  }, [dispatch]);

  // 2. Set the initial selected branch once allBranches are loaded
  useEffect(() => {
    if (allBranches.length > 0 && !selectedBranchId) {
      setSelectedBranchId(allBranches[0]._id); // Automatically select the first branch
    }
  }, [allBranches, selectedBranchId]);

  // 3. Fetch branch-specific data when selectedBranchId changes
  useEffect(() => {
    if (selectedBranchId) {
      dispatch(getBranchStationDetails(selectedBranchId));
      dispatch(getOrdersForBranch(selectedBranchId));
      dispatch(getDeliveryPartnersForBranch(selectedBranchId)); // Fetch DPs for the selected branch
      dispatch(getBranchRevenue(selectedBranchId));
    }
  }, [dispatch, selectedBranchId]);

  // Handle errors using toast notifications
  useEffect(() => {
    if (orderError) toast.error(`Order Data Error: ${orderError}`);
    if (productsError) toast.error(`Product Data Error: ${productsError}`);
    if (authError) toast.error(`User Data Error: ${authError}`);
    if (allBranchesError) toast.error(`All Branches Data Error: ${allBranchesError}`);
    if (branchError) toast.error(`Selected Branch Data Error: ${branchError}`);
    if (deliveryPartnerError) toast.error(`Delivery Partner Data Error: ${deliveryPartnerError}`);
  }, [orderError, productsError, authError, allBranchesError, branchError, deliveryPartnerError]);

  // --- Data Processing for Analysis ---

  // Global Metrics
  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0).toFixed(2);
  const pendingOrdersCount = orders.filter(order => order.status === 'pending').length;
  const deliveredOrdersCount = orders.filter(order => order.status === 'delivered').length;

  // Orders by Status
  const ordersByStatus = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});
  const orderStatusLabels = Object.keys(ordersByStatus);
  const orderStatusData = Object.values(ordersByStatus);

  // Orders by Payment Method
  const ordersByPaymentMethod = orders.reduce((acc, order) => {
    acc[order.paymentMethod] = (acc[order.paymentMethod] || 0) + 1;
    return acc;
  }, {});
  const paymentMethodLabels = Object.keys(ordersByPaymentMethod);
  const paymentMethodData = Object.values(ordersByPaymentMethod);

  // User Roles Distribution
  const userRoles = users.reduce((acc, user) => {
    acc[user.role] = (acc[user.role] || 0) + 1;
    return acc;
  }, {});
  const userRoleLabels = Object.keys(userRoles);
  const userRoleData = Object.values(userRoles);

  // Daily Order Trend (last 7 days)
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().split('T')[0]; //YYYY-MM-DD
  }).reverse();

  const dailyOrders = last7Days.map(date =>
    orders.filter(order => new Date(order.createdAt).toISOString().split('T')[0] === date).length
  );


  // --- Chart Data Configurations ---

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          font: {
            size: 10
          }
        }
      },
      title: {
        display: false
      },
      tooltip: {
        bodyFont: {
          size: 10
        },
        titleFont: {
          size: 12
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 9
          }
        }
      },
      y: {
        ticks: {
          font: {
            size: 9
          }
        }
      }
    }
  };


  const orderStatusChartConfig = {
    labels: orderStatusLabels,
    datasets: [
      {
        label: 'Number of Orders',
        data: orderStatusData,
        backgroundColor: [
          'rgba(255, 159, 64, 0.7)', // Pending/Processing
          'rgba(75, 192, 192, 0.7)', // Delivered
          'rgba(255, 99, 132, 0.7)', // Cancelled
          'rgba(54, 162, 235, 0.7)', // Shipped
          'rgba(153, 102, 255, 0.7)', // Other
        ],
        borderColor: [
          'rgba(255, 159, 64, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const paymentMethodChartConfig = {
    labels: paymentMethodLabels,
    datasets: [
      {
        label: 'Payment Methods',
        data: paymentMethodData,
        backgroundColor: [
          'rgba(100, 181, 246, 0.7)', // Blue - PayPal
          'rgba(129, 212, 250, 0.7)', // Light Blue - Cash on Delivery
          'rgba(174, 213, 129, 0.7)', // Light Green - Stripe/Card
          'rgba(255, 138, 101, 0.7)', // Orange - Other
        ],
        borderColor: [
          'rgba(100, 181, 246, 1)',
          'rgba(129, 212, 250, 1)',
          'rgba(174, 213, 129, 1)',
          'rgba(255, 138, 101, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const userRoleChartConfig = {
    labels: userRoleLabels,
    datasets: [
      {
        label: 'User Roles',
        data: userRoleData,
        backgroundColor: [
          'rgba(144, 202, 249, 0.7)', // User
          'rgba(255, 204, 128, 0.7)', // Admin
          'rgba(165, 214, 167, 0.7)', // Delivery Partner
          'rgba(220, 231, 117, 0.7)', // Branch Manager
        ],
        borderColor: [
          'rgba(144, 202, 249, 1)',
          'rgba(255, 204, 128, 1)',
          'rgba(165, 214, 167, 1)',
          'rgba(220, 231, 117, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const dailyOrderTrendChartConfig = {
    labels: last7Days,
    datasets: [
      {
        label: 'Orders per Day (Last 7 Days)',
        data: dailyOrders,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <h1 className="text-4xl font-extrabold text-gray-900 mb-10 border-b-4 border-blue-600 pb-3">
        Admin Analytics Dashboard
      </h1>

      {/* Global Key Performance Indicators (KPIs) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7 mb-12">
        <div className="bg-white p-7 rounded-2xl shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <p className="text-base text-gray-600 font-medium">Total Orders</p>
            {orderLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-blue-500 mt-2" />
            ) : (
              <p className="text-4xl font-bold text-gray-900 mt-2">{orders.length}</p>
            )}
          </div>
          <ShoppingBag className="text-blue-600 w-14 h-14 opacity-80" strokeWidth={1.5} />
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <p className="text-base text-gray-600 font-medium">Total Products</p>
            {/* productsLoading removed here as requested */}
            <p className="text-4xl font-bold text-gray-900 mt-2">{products.length}</p>
          </div>
          <Package className="text-green-600 w-14 h-14 opacity-80" strokeWidth={1.5} />
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <p className="text-base text-gray-600 font-medium">Total Revenue</p>
            {orderLoading ? ( // Assuming revenue is derived from orders
              <Loader2 className="w-8 h-8 animate-spin text-purple-500 mt-2" />
            ) : (
              <p className="text-4xl font-bold text-gray-900 mt-2">${totalRevenue}</p>
            )}
          </div>
          <DollarSign className="text-purple-600 w-14 h-14 opacity-80" strokeWidth={1.5} />
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-lg flex items-center justify-between transition-transform transform hover:scale-105">
          <div>
            <p className="text-base text-gray-600 font-medium">Active Users</p>
            {authLoading ? (
              <Loader2 className="w-8 h-8 animate-spin text-pink-500 mt-2" />
            ) : (
              <p className="text-4xl font-bold text-gray-900 mt-2">{users.length}</p>
            )}
          </div>
          <Users className="text-pink-600 w-14 h-14 opacity-80" strokeWidth={1.5} />
        </div>
      </section>

      {/* Global Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-7 mb-12">
        <div className="bg-white p-7 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Status Distribution</h2>
          {orderLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Loading chart data...</span>
            </div>
          ) : (
            <div className="h-64">
              <Bar data={orderStatusChartConfig} options={chartOptions} />
            </div>
          )}
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-lg flex flex-col items-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Payment Method Breakdown</h2>
          {orderLoading ? (
            <div className="flex items-center justify-center h-64 text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Loading chart data...</span>
            </div>
          ) : (
            <div className="w-full max-w-sm mx-auto h-64">
              <Doughnut data={paymentMethodChartConfig} options={chartOptions} />
            </div>
          )}
        </div>

        <div className="bg-white p-7 rounded-2xl shadow-lg col-span-1 lg:col-span-2">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Daily Order Trend (Last 7 Days)</h2>
          {orderLoading ? (
            <div className="flex items-center justify-center h-72 text-gray-600">
              <Loader2 className="w-8 h-8 animate-spin mr-2" />
              <span>Loading chart data...</span>
            </div>
          ) : (
            <div className="h-72">
              <Line data={dailyOrderTrendChartConfig} options={chartOptions} />
            </div>
          )}
        </div>
      </section>

      {/* User Role Distribution */}
      <section className="bg-white p-7 rounded-2xl shadow-lg mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">User Role Distribution</h2>
        {authLoading ? (
          <div className="flex items-center justify-center h-64 text-gray-600">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Loading user data...</span>
          </div>
        ) : (
          <div className="w-full max-w-sm mx-auto h-64">
            <Doughnut data={userRoleChartConfig} options={chartOptions} />
          </div>
        )}
      </section>

      {/* Delivery Partners (Selected Branch) Section - THIS IS THE SECTION YOU ASKED TO RE-VERIFY */}
      <section className="bg-white p-7 rounded-2xl shadow-lg mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Delivery Partners (Selected Branch)</h2>
        {!selectedBranchId ? (
          <p className="text-center text-gray-500 mt-4">Select a branch above to view its delivery partners.</p>
        ) : branchLoading ? ( // Use branchLoading as DPs are fetched with branch details
          <div className="flex items-center justify-center text-gray-600 mt-4">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Fetching delivery partners for this branch...</span>
          </div>
        ) : branchDeliveryPartners.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {branchDeliveryPartners.map((dp) => (
                  <tr key={dp._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{dp.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dp.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dp.phoneNumber || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${dp.deliveryPartnerDetails?.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {dp.deliveryPartnerDetails?.availability || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {branchDetails?.name || 'N/A'} {/* Always the selected branch's name */}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500 mt-4">No delivery partners found for this branch.</p>
        )}
      </section>

      {/* Branch Specific Analytics */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b-2 border-gray-300 pb-2">
          Branch-Specific Analytics
        </h2>
        <div className="mb-6">
          <label htmlFor="branch-select" className="block text-lg font-medium text-gray-700 mb-2">
            Select Branch for Details:
          </label>
          {allBranchesLoading ? (
            <div className="flex items-center text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span>Loading branches...</span>
            </div>
          ) : (
            <select
              id="branch-select"
              className="mt-1 block w-full md:w-1/2 p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-base"
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              disabled={allBranches.length === 0}
            >
              <option value="">
                {allBranches.length === 0 ? '-- No Branches Available --' : '-- Select a Branch --'}
              </option>
              {allBranches.map((branch) => (
                <option key={branch._id} value={branch._id}>
                  {branch.name} ({branch.location?.coordinates ? `Lat: ${branch.location.coordinates[1]}, Lng: ${branch.location.coordinates[0]}` : 'Location N/A'})
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedBranchId && branchLoading && (
          <div className="flex items-center justify-center text-gray-600 mt-4">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Fetching branch data...</span>
          </div>
        )}

        {selectedBranchId && !branchLoading && branchError && (
          <div className="text-red-500 text-center mt-4">Error loading branch data: {branchError}</div>
        )}

        {/* Display Branch Details only if selected and not loading/error */}
        {selectedBranchId && !branchLoading && branchDetails && (
          <div className="bg-white p-7 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Details for {branchDetails.name || `Branch ID: ${selectedBranchId}`}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="flex items-center text-gray-700">
                <MapPin className="w-5 h-5 mr-2 text-red-500" />
                <p>
                  Location: {' '}
                  {branchDetails.location?.coordinates
                    ? `Lat: ${branchDetails.location.coordinates[1]}, Lng: ${branchDetails.location.coordinates[0]}`
                    : 'N/A'}
                </p>
              </div>
              <div className="flex items-center text-gray-700">
                <Users className="w-5 h-5 mr-2 text-indigo-500" />
                <p>Manager: {branchDetails.manager?.username || 'Not assigned'}</p>
              </div>
              <div className="flex items-center text-gray-700">
                <Truck className="w-5 h-5 mr-2 text-orange-500" />
                <p>Delivery Partners: {branchDeliveryPartners.length}</p>
              </div>
              <div className="flex items-center text-gray-700">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                <p>Branch Revenue: ${branchRevenue?.totalRevenue?.toFixed(2) || '0.00'}</p>
              </div>
            </div>

            <h4 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Active Orders for this Branch Today</h4>
            {branchLoading ? (
              <div className="flex items-center justify-center text-gray-600 mt-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Fetching branch orders...</span>
              </div>
            ) : branchActiveOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Partner</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {branchActiveOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order._id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                            ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                            ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : ''}
                            ${order.status === 'processing' ? 'bg-indigo-100 text-indigo-800' : ''}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.deliveryPartner?.username || 'Unassigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No active orders for this branch today.</p>
            )}

            {/* This section for "Delivery Partners at this Branch" remains as it is, using branchDeliveryPartners */}
            <h4 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Delivery Partners at this Branch</h4>
            {branchLoading ? (
              <div className="flex items-center justify-center text-gray-600 mt-4">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span>Fetching branch delivery partners...</span>
              </div>
            ) : branchDeliveryPartners.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {branchDeliveryPartners.map(dp => (
                  <li key={dp._id} className="py-3 flex justify-between items-center text-gray-700">
                    <span>{dp.username} ({dp.email})</span>
                    <span className="text-sm text-gray-500">Role: {dp.role}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600">No delivery partners assigned to this branch.</p>
            )}

          </div>
        )}
      </section>

      {/* Recent Global Orders Table */}
      <section className="bg-white p-7 rounded-2xl shadow-lg mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Recent Global Orders</h2>
        {orderLoading ? (
          <div className="flex items-center justify-center text-gray-600 mt-4">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span>Fetching global orders...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placed On</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.slice(0, 10).map((order) => ( // Show last 10 global orders
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order._id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user?.username || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.total?.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                        ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                        ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : ''}
                        ${order.status === 'processing' ? 'bg-indigo-100 text-indigo-800' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {orders.length === 0 && !orderLoading && (
            <p className="text-center text-gray-500 mt-4">No global orders available.</p>
        )}
      </section>
    </div>
  );
};

export default AdminAnalysisPage;