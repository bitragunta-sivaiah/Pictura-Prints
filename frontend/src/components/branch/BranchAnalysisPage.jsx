import React, { useEffect, useMemo, useState } from 'react'; // Import useState
import { Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Package, Truck, Users, DollarSign, Loader2, AlertCircle, CalendarDays, Clock, MapPin, UserCheck } from 'lucide-react'; // Added UserCheck icon
import { useSelector, useDispatch } from 'react-redux';

// Import all relevant actions and selectors from branchStationSlice
import {
  getManagedBranch,
  selectBranchLoading,
  selectBranchError,
  selectManagedBranch,
  selectBranchActiveOrders,
  selectBranchDeliveryPartners,
  getOrdersForBranch,
  selectBranchOrders,
  getActiveOrdersForBranch,
  getDeliveryPartnersForBranch,
  getBranchRevenue,
  selectBranchRevenue,
} from '../../store/branchStationSlice';

// Import selectors and actions from deliveryPartnerSlice for individual DP details
import {
  fetchMyDeliveryProfile,
  selectMyDeliveryProfile,
  selectDeliveryPartnerLoading, // Use this for DP profile loading
  selectDeliveryPartnerError,   // Use this for DP profile error
  fetchDeliveryPartnerById, // NEW: Import this thunk to fetch a specific DP by ID
  selectDeliveryPartnerDetails, // NEW: Selector for details of a single DP (from fetchDeliveryPartnerById)
} from '../../store/deliveryPartnerSlice';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

// ---
// Helper Components (StatCard, OrdersTable remain the same)
// ---

const StatCard = ({ icon: Icon, title, value, colorClass }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:scale-105">
    <div className={`p-3 rounded-full ${colorClass} bg-opacity-20`}>
      <Icon className={`${colorClass} w-6 h-6`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

const OrdersTable = ({ orders, title }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">{title}</h3>
    {!orders || orders.length === 0 ? (
      <p className="text-gray-600">No {title.toLowerCase()} found.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Order ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order._id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.user?.username || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{order.total ? order.total.toFixed(2) : '0.00'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${order.status === 'processing' ? 'bg-indigo-100 text-indigo-800' : ''}
                    ${order.status === 'shipped' ? 'bg-blue-100 text-blue-800' : ''}
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                    ${order.status === 'cancelled' || order.status === 'refunded' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// MODIFIED: DeliveryPartnersTable to be clickable
const DeliveryPartnersTable = ({ deliveryPartners, onSelectDeliveryPartner }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-xl font-semibold text-gray-800 mb-4">Branch Delivery Partners</h3>
    {!deliveryPartners || deliveryPartners.length === 0 ? (
      <p className="text-gray-600">No delivery partners found for this branch.</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orders</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">Earnings</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {deliveryPartners.map((dp) => (
              <tr key={dp._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer" onClick={() => onSelectDeliveryPartner(dp._id)}>
                  {dp.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dp.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${dp.deliveryPartnerDetails?.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {dp.deliveryPartnerDetails?.availability || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{dp.deliveryPartnerDetails?.currentOrders?.length || 0}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₹{dp.deliveryPartnerDetails?.totalEarnings ? dp.deliveryPartnerDetails.totalEarnings.toFixed(2) : '0.00'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ---
// Chart Components (RevenueChart, OrderStatusChart remain the same)
// ---

const RevenueChart = ({ revenueData }) => {
  if (!revenueData || revenueData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center h-full min-h-[300px]">
        <p className="text-gray-600">No revenue data available for charting for this branch.</p>
      </div>
    );
  }

  const chartData = {
    labels: revenueData.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Revenue (Branch)',
        data: revenueData.map(item => item.amount),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.3,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: 'Inter',
          },
        },
      },
      title: {
        display: true,
        text: 'Branch Revenue Trend Over Time',
        font: {
          size: 18,
          family: 'Inter',
        },
        color: '#374151',
      },
      tooltip: {
        titleFont: {
          family: 'Inter',
        },
        bodyFont: {
          family: 'Inter',
        },
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed.y); // Indian Rupee
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: 'Inter',
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        ticks: {
          font: {
            family: 'Inter',
          },
          callback: function(value) {
            return '₹' + value; // Indian Rupee symbol
          }
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-96 flex flex-col">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Branch Revenue Overview</h3>
      <div className="flex-grow">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

const OrderStatusChart = ({ statusData }) => {
  if (!statusData || Object.keys(statusData).length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-center h-full min-h-[300px]">
        <p className="text-gray-600">No order status data available for charting for this branch.</p>
      </div>
    );
  }

  const backgroundColors = {
    'pending': '#FCD34D', // Yellow
    'processing': '#818CF8', // Indigo
    'shipped': '#60A5FA', // Blue
    'delivered': '#4ADE80', // Green
    'cancelled': '#EF4444', // Red
    'refunded': '#F87171', // Light Red
    'default': '#D1D5DB' // Gray
  };

  const chartData = {
    labels: Object.keys(statusData),
    datasets: [
      {
        data: Object.values(statusData),
        backgroundColor: Object.keys(statusData).map(status => backgroundColors[status] || backgroundColors['default']),
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          font: {
            family: 'Inter',
          },
        },
      },
      title: {
        display: true,
        text: 'Branch Orders by Status',
        font: {
          size: 18,
          family: 'Inter',
        },
        color: '#374151',
      },
      tooltip: {
        titleFont: {
          family: 'Inter',
        },
        bodyFont: {
          family: 'Inter',
        },
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            if (label) {
              const value = context.parsed;
              const total = context.dataset.data.reduce((acc, current) => acc + current, 0);
              const percentage = ((value / total) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            }
            return '';
          }
        }
      },
    },
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg h-96 flex flex-col">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">Branch Order Status Distribution</h3>
      <div className="flex-grow flex items-center justify-center">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

// ---
// Main BranchAnalysisPage Component
// ---

const BranchAnalysisPage = () => {
  const dispatch = useDispatch();
  const [selectedDeliveryPartnerId, setSelectedDeliveryPartnerId] = useState(null);

  // Selectors from branchStationSlice
  const branchLoading = useSelector(selectBranchLoading);
  const branchError = useSelector(selectBranchError);
  const managedBranch = useSelector(selectManagedBranch);
  const branchOrders = useSelector(selectBranchOrders);
  const activeOrders = useSelector(selectBranchActiveOrders);
  const deliveryPartners = useSelector(selectBranchDeliveryPartners); // This is an array of DPs for the branch
  const branchRevenue = useSelector(selectBranchRevenue);

  // Selectors from deliveryPartnerSlice
  const myDeliveryProfile = useSelector(selectMyDeliveryProfile);
  const deliveryPartnerLoading = useSelector(selectDeliveryPartnerLoading); // Loading for myProfile/selected DP
  const deliveryPartnerError = useSelector(selectDeliveryPartnerError);   // Error for myProfile/selected DP
  const selectedDeliveryPartnerDetails = useSelector(selectDeliveryPartnerDetails); // Details of the selected DP

  // Determine if the current user is a delivery partner based on myProfile and managedBranch
  const isDeliveryPartner = useMemo(() => {
    return managedBranch?.isDeliveryPartner === true && myDeliveryProfile !== null;
  }, [managedBranch, myDeliveryProfile]);


  useEffect(() => {
    // Fetch the managed branch details first
    dispatch(getManagedBranch());
    // Also try to fetch the delivery partner profile if the user might be one
    dispatch(fetchMyDeliveryProfile());
  }, [dispatch]);

  // Once managedBranch is loaded and approved, fetch other branch-specific data
  useEffect(() => {
    if (managedBranch && managedBranch.managerApplication?.status === 'approved' && managedBranch._id) {
      const branchId = managedBranch._id;
      dispatch(getOrdersForBranch(branchId));
      dispatch(getActiveOrdersForBranch(branchId));
      dispatch(getDeliveryPartnersForBranch(branchId)); // This fetches the list for the table
      dispatch(getBranchRevenue(branchId));
    }
  }, [dispatch, managedBranch]);

  // NEW: Effect to fetch details of a specific delivery partner when ID changes
  useEffect(() => {
    if (selectedDeliveryPartnerId) {
      dispatch(fetchDeliveryPartnerById(selectedDeliveryPartnerId));
    }
  }, [dispatch, selectedDeliveryPartnerId]);


  // Derived State for Analytics
  const { totalBranchRevenue, monthlyBranchRevenueData, branchOrderStatusCounts } = useMemo(() => {
    let revenueSum = 0;
    const monthlyData = {};
    const statusCounts = {};

    branchOrders.forEach(order => {
      if (order.createdAt && order.total) {
        const date = new Date(order.createdAt);
        const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
        monthlyData[yearMonth] = (monthlyData[yearMonth] || 0) + order.total;
      }

      if (order.status) {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      }
    });

    const sortedMonthlyData = Object.keys(monthlyData)
      .sort()
      .map(key => ({
        month: key,
        amount: monthlyData[key]
      }));

    revenueSum = branchRevenue?.totalRevenue || 0;

    return {
      totalBranchRevenue: revenueSum,
      monthlyBranchRevenueData: sortedMonthlyData,
      branchOrderStatusCounts: statusCounts,
    };
  }, [branchOrders, branchRevenue]);

  // Combine loading and error states for a comprehensive check
  const overallLoading = branchLoading || deliveryPartnerLoading; // Now also includes loading for selected DP
  const overallError = branchError || deliveryPartnerError;       // Now also includes error for selected DP

  // Handler for clicking a delivery partner's name
  const handleSelectDeliveryPartner = (id) => {
    setSelectedDeliveryPartnerId(id);
  };

  if (overallLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
        <div className="flex flex-col items-center space-y-4 text-gray-600">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          <p className="text-lg font-medium">Loading analysis data...</p>
        </div>
      </div>
    );
  }

  if (overallError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-md flex items-center space-x-3">
          <AlertCircle className="w-6 h-6" />
          <p className="font-semibold">Error: {overallError}</p>
        </div>
      </div>
    );
  }

  if (!managedBranch || managedBranch.managerApplication?.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-6 py-4 rounded-xl shadow-md flex items-center space-x-3">
          <AlertCircle className="w-6 h-6" />
          <p className="font-semibold">Access Denied: Your branch manager application is not approved or branch data is missing.</p>
        </div>
      </div>
    );
  }

  const managerUsername = managedBranch.manager?.username || 'Branch Manager';
  const branchName = managedBranch.name || 'N/A';
  const branchAddress = managedBranch.address || 'N/A';
  const branchCity = managedBranch.city || 'N/A';

  const totalActiveOrders = activeOrders ? activeOrders.length : 0;
  const totalDeliveryPartners = deliveryPartners ? deliveryPartners.length : 0;

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <header className="mb-8 p-6 bg-white rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Branch Analysis Dashboard</h1>
        <p className="text-lg text-gray-600">
          Welcome, <span className="font-semibold text-blue-600">{managerUsername}</span>!
        </p>
        <p className="text-md text-gray-500 mt-1">
          Managing: <span className="font-medium text-gray-700">{branchName}</span> (Branch: {managedBranch.name})
        </p>
        <p className="text-md text-gray-500 mt-1">
          Location: <span className="font-medium text-gray-700">{branchAddress}, {branchCity}</span>
        </p>
      </header>

      {/* Overview Statistics (all related to the managed branch) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Package} title="Total Orders (Branch)" value={branchOrders.length} colorClass="text-blue-500" />
        <StatCard icon={CalendarDays} title="Active Orders (Branch)" value={totalActiveOrders} colorClass="text-purple-500" />
        <StatCard icon={Truck} title="Delivery Partners (Branch)" value={totalDeliveryPartners} colorClass="text-green-500" />
        <StatCard icon={DollarSign} title="Total Branch Revenue" value={`₹${totalBranchRevenue.toFixed(2)}`} colorClass="text-orange-500" />
      </section>

      {/* Charts Section (all related to the managed branch) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <RevenueChart revenueData={monthlyBranchRevenueData} />
        <OrderStatusChart statusData={branchOrderStatusCounts} />
      </section>

      {/* Orders Table (all related to the managed branch) */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OrdersTable orders={branchOrders} title="All Orders for This Branch" />
        <OrdersTable orders={activeOrders} title="Active Orders for This Branch" />
      </section>

      {/* Delivery Partners Table (all related to the managed branch) */}
      <section className="mb-8">
        {/* Pass the handler to the table */}
        <DeliveryPartnersTable deliveryPartners={deliveryPartners} onSelectDeliveryPartner={handleSelectDeliveryPartner} />
      </section>

      {/* NEW: Display details of selected delivery partner */}
      {selectedDeliveryPartnerId && selectedDeliveryPartnerDetails?.deliveryPartnerDetails ? (
        <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <UserCheck className="w-6 h-6 mr-2 text-indigo-600" /> Details for {selectedDeliveryPartnerDetails.username}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
            <p><span className="font-semibold">Email:</span> {selectedDeliveryPartnerDetails.email}</p>
            <p><span className="font-semibold">Phone:</span> {selectedDeliveryPartnerDetails.phoneNumber || 'N/A'}</p>
            <p><span className="font-semibold">Role:</span> {selectedDeliveryPartnerDetails.role}</p>
            <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedDeliveryPartnerDetails.deliveryPartnerDetails.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{selectedDeliveryPartnerDetails.deliveryPartnerDetails.availability}</span></p>
            <p><span className="font-semibold">Approval:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${selectedDeliveryPartnerDetails.deliveryPartnerDetails.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{selectedDeliveryPartnerDetails.deliveryPartnerDetails.approvalStatus}</span></p>
            <p><span className="font-semibold">Vehicle Type:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.vehicleType || 'N/A'}</p>
            <p><span className="font-semibold">Vehicle No.:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.vehicleNumber || 'N/A'}</p>
            <p><span className="font-semibold">License No.:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.licenseNumber || 'N/A'}</p>
            <p><span className="font-semibold">Insurance No.:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.insuranceNumber || 'N/A'}</p>
            <p><span className="font-semibold">Total Deliveries:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.totalDeliveries || 0}</p>
            <p><span className="font-semibold">Total Earnings:</span> ₹{selectedDeliveryPartnerDetails.deliveryPartnerDetails.totalEarnings ? selectedDeliveryPartnerDetails.deliveryPartnerDetails.totalEarnings.toFixed(2) : '0.00'}</p>
            <p><span className="font-semibold">Rating:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.rating ? `${selectedDeliveryPartnerDetails.deliveryPartnerDetails.rating} / 5` : 'N/A'}</p>
            <p className="col-span-full flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-500" /><span className="font-semibold">Preferred Radius:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.preferredDeliveryRadius || 'N/A'} km</p>
            {selectedDeliveryPartnerDetails.deliveryPartnerDetails.bio && <p className="col-span-full"><span className="font-semibold">Bio:</span> {selectedDeliveryPartnerDetails.deliveryPartnerDetails.bio}</p>}
          </div>
          {selectedDeliveryPartnerDetails.deliveryPartnerDetails.workingHours && Object.keys(selectedDeliveryPartnerDetails.deliveryPartnerDetails.workingHours).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-lg mb-2">Working Hours:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(selectedDeliveryPartnerDetails.deliveryPartnerDetails.workingHours).map(([day, hours]) => (
                  <li key={day} className="flex items-center space-x-2 text-gray-700">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{day}:</span>
                    {hours.isAvailable ? (
                      <span className="text-green-600 flex items-center"><Clock className="w-4 h-4 mr-1"/> {hours.startTime} - {hours.endTime}</span>
                    ) : (
                      <span className="text-red-600">Unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedDeliveryPartnerDetails.deliveryPartnerDetails.documents && selectedDeliveryPartnerDetails.deliveryPartnerDetails.documents.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-lg mb-2">Documents:</h4>
              <div className="flex flex-wrap gap-3">
                {selectedDeliveryPartnerDetails.deliveryPartnerDetails.documents.map((docUrl, index) => (
                  <a key={index} href={docUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline flex items-center">
                    <img src={docUrl} alt={`Document ${index + 1}`} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                    <span className="ml-2">View Document {index + 1}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : selectedDeliveryPartnerId && overallLoading ? (
        <section className="bg-white p-6 rounded-xl shadow-lg mb-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-2" />
          <p className="text-gray-600">Loading delivery partner details...</p>
        </section>
      ) : selectedDeliveryPartnerId && overallError ? (
        <section className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-md flex items-center space-x-3 mb-8">
          <AlertCircle className="w-6 h-6" />
          <p className="font-semibold">Error loading delivery partner details: {overallError}</p>
        </section>
      ) : null}

      {/* Conditional rendering for My Delivery Partner Profile */}
      {isDeliveryPartner && myDeliveryProfile?.deliveryPartnerDetails ? (
        <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Truck className="w-6 h-6 mr-2 text-indigo-600" /> Your Delivery Partner Profile
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
            <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${myDeliveryProfile.deliveryPartnerDetails.availability === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{myDeliveryProfile.deliveryPartnerDetails.availability}</span></p>
            <p><span className="font-semibold">Approval:</span> <span className={`px-2 py-1 rounded-full text-xs font-semibold ${myDeliveryProfile.deliveryPartnerDetails.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{myDeliveryProfile.deliveryPartnerDetails.approvalStatus}</span></p>
            <p><span className="font-semibold">Total Deliveries:</span> {myDeliveryProfile.deliveryPartnerDetails.totalDeliveries || 0}</p>
            <p><span className="font-semibold">Total Earnings:</span> ₹{myDeliveryProfile.deliveryPartnerDetails.totalEarnings ? myDeliveryProfile.deliveryPartnerDetails.totalEarnings.toFixed(2) : '0.00'}</p>
            <p><span className="font-semibold">Rating:</span> {myDeliveryProfile.deliveryPartnerDetails.rating ? `${myDeliveryProfile.deliveryPartnerDetails.rating} / 5` : 'N/A'}</p>
            <p className="col-span-full flex items-center"><MapPin className="w-4 h-4 mr-1 text-gray-500" /><span className="font-semibold">Preferred Radius:</span> {myDeliveryProfile.deliveryPartnerDetails.preferredDeliveryRadius || 'N/A'} km</p>
          </div>
          {myDeliveryProfile.deliveryPartnerDetails.workingHours && Object.keys(myDeliveryProfile.deliveryPartnerDetails.workingHours).length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-lg mb-2">Working Hours:</h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {Object.entries(myDeliveryProfile.deliveryPartnerDetails.workingHours).map(([day, hours]) => (
                  <li key={day} className="flex items-center space-x-2 text-gray-700">
                    <CalendarDays className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{day}:</span>
                    {hours.isAvailable ? (
                      <span className="text-green-600 flex items-center"><Clock className="w-4 h-4 mr-1"/> {hours.startTime} - {hours.endTime}</span>
                    ) : (
                      <span className="text-red-600">Unavailable</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : managedBranch?.isDeliveryPartner && !myDeliveryProfile ? ( // Changed condition for pending/loading profile
        <section className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Truck className="w-6 h-6 mr-2 text-indigo-600" /> Your Delivery Partner Profile Status
          </h3>
          <p className="text-gray-600">
            Your delivery partner profile is being loaded or is not fully set up.
            Please ensure your application is complete and approved.
          </p>
        </section>
      ) : null}
    </div>
  );
};

export default BranchAnalysisPage;