import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchMyDeliveredOrders,
    selectMyDeliveredOrders,
    selectDeliveryPartnerLoading,
    selectDeliveryPartnerError,
    clearError,
} from '../../store/deliveryPartnerSlice'; // Removed fetchMyRevenue and selectDeliveryPartnerRevenue
import { toast } from 'react-hot-toast';
import {
    Car,
    DollarSign,
    Calendar,
    UtensilsCrossed,
    CheckCircle,
    XCircle,
    MapPin,
    Clock,
    Package,
    Tag,
    Sun,           // For Today
    Target,        // For This Week
    Award,         // For Monthly
   
    TrendingUp,     // For average earning
    IndianRupee
} from 'lucide-react'; // Lucide icons

import OrderDetailModal from './OrderDetailModal';

const DeliveryPartnerEarning = () => {
    const dispatch = useDispatch();
    const deliveredOrders = useSelector(selectMyDeliveredOrders);
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // State to hold calculated daily, weekly, monthly, and total stats
    const [dailyWeeklyMonthlyStats, setDailyWeeklyMonthlyStats] = useState({
        todayEarnings: 0,
        todayOrders: 0,
        weeklyEarnings: 0,
        weeklyOrders: 0,
        monthlyEarnings: 0,
        monthlyOrders: 0,
        totalEarnings: 0, // Overall total
        totalOrders: 0,   // Overall total
    });

    useEffect(() => {
        dispatch(fetchMyDeliveredOrders());
        // fetchMyRevenue is not needed if we calculate from deliveredOrders
    }, [dispatch]);

    // Effect to calculate stats whenever deliveredOrders changes
    useEffect(() => {
        let todayE = 0;
        let todayO = 0;
        let weeklyE = 0;
        let weeklyO = 0;
        let monthlyE = 0;
        let monthlyO = 0;
        let totalE = 0;
        let totalO = 0;

        const now = new Date();
        // Set to start of current day (midnight)
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);

        // Set to start of current week (Sunday midnight)
        // new Date().getDay() returns 0 for Sunday, 1 for Monday, etc.
        const dayOfWeek = now.getDay(); // 0 for Sunday, 1 for Monday
        const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek, 0, 0, 0, 0);

        // Set to start of current month (1st day midnight)
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

        deliveredOrders.forEach(order => {
            // Using `updatedAt` for the delivered timestamp as per your sample data
            const deliveredDate = new Date(order.updatedAt);
            const orderEarning = parseFloat(order.deliveryOrderEarning) || 0; // Parse string to float

            // Always add to overall total
            totalE += orderEarning;
            totalO += 1;

            // Check for Today
            if (deliveredDate >= todayStart) {
                todayE += orderEarning;
                todayO += 1;
            }

            // Check for This Week
            if (deliveredDate >= weekStart) {
                weeklyE += orderEarning;
                weeklyO += 1;
            }

            // Check for This Month
            if (deliveredDate >= monthStart) {
                monthlyE += orderEarning;
                monthlyO += 1;
            }
        });

        setDailyWeeklyMonthlyStats({
            todayEarnings: todayE,
            todayOrders: todayO,
            weeklyEarnings: weeklyE,
            weeklyOrders: weeklyO,
            monthlyEarnings: monthlyE,
            monthlyOrders: monthlyO,
            totalEarnings: totalE,
            totalOrders: totalO,
        });

    }, [deliveredOrders]); // Recalculate whenever deliveredOrders changes

    useEffect(() => {
        if (error) {
            toast.error(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const formatCurrency = (amount) => {
        if (typeof amount !== 'number' && typeof amount !== 'string') return 'N/A';
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount)) return 'N/A';
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
        }).format(numAmount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Invalid Date';
        }
    };

    // Use calculated totals for overall average
    const calculatedAvgEarningPerOrder =
        dailyWeeklyMonthlyStats.totalOrders > 0
            ? dailyWeeklyMonthlyStats.totalEarnings / dailyWeeklyMonthlyStats.totalOrders
            : 0;

    const openOrderDetails = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const closeOrderDetails = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // Conditional loading state check: If loading AND no data yet
    if (loading && dailyWeeklyMonthlyStats.totalOrders === 0) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="ml-4 text-lg text-gray-700">Loading earnings data...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen  ">
            <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h1 className="text-xl sm:text-4xl font-bold text-gray-800 mb-8 flex items-center justify-center">
                    <IndianRupee className="w-9 h-9 mr-3 text-green-600" /> Your Delivery Earnings & Performance
                </h1>

                {/* Main Revenue Section - Now using calculated total stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                    {/* Total Earnings */}
                    <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-lg p-3 shadow-xl flex items-center justify-between transform transition-transform hover:scale-105 duration-300">
                        <div>
                            <p className="text-sm font-semibold opacity-90">Total Earnings (All Time)</p>
                            <p className="text-3xl font-extrabold mt-1">
                                {formatCurrency(dailyWeeklyMonthlyStats.totalEarnings)}
                            </p>
                        </div>
                        <DollarSign className="w-14 h-14 opacity-75" />
                    </div>

                    {/* Total Delivered Orders */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-lg p-6 shadow-xl flex items-center justify-between transform transition-transform hover:scale-105 duration-300">
                        <div>
                            <p className="text-md font-semibold opacity-90">Total Delivered Orders</p>
                            <p className="text-4xl font-extrabold mt-1">
                                {dailyWeeklyMonthlyStats.totalOrders}
                            </p>
                        </div>
                        <CheckCircle className="w-14 h-14 opacity-75" />
                    </div>

                    {/* Average Earning per Order */}
                    <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-lg p-6 shadow-xl flex items-center justify-between transform transition-transform hover:scale-105 duration-300">
                        <div>
                            <p className="text-md font-semibold opacity-90">Average Earning per Order</p>
                            <p className="text-4xl font-extrabold mt-1">
                                {formatCurrency(calculatedAvgEarningPerOrder)}
                            </p>
                        </div>
                        <TrendingUp className="w-14 h-14 opacity-75" />
                    </div>
                </div>

                {/* Daily, Weekly, Monthly Summary - Now using calculated stats */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <Calendar className="w-7 h-7 mr-3 text-orange-600" /> Performance Summary
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {/* Today's Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md flex flex-col items-start transform transition-transform hover:scale-105 duration-300">
                        <div className="flex items-center mb-3">
                            <Sun className="w-7 h-7 mr-3 text-yellow-500" />
                            <p className="text-sm font-semibold text-gray-700">Today</p>
                        </div>
                        <p className="text-xl font-extrabold text-green-700 mb-2">
                            {formatCurrency(dailyWeeklyMonthlyStats.todayEarnings)}
                        </p>
                        <p className="text-md text-gray-600">
                            <span className="font-semibold">{dailyWeeklyMonthlyStats.todayOrders}</span> orders delivered
                        </p>
                    </div>

                    {/* This Week's Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md flex flex-col items-start transform transition-transform hover:scale-105 duration-300">
                        <div className="flex items-center mb-3">
                            <Target className="w-7 h-7 mr-3 text-red-500" />
                            <p className="text-sm font-semibold text-gray-700">This Week</p>
                        </div>
                        <p className="text-xl font-extrabold text-green-700 mb-2">
                            {formatCurrency(dailyWeeklyMonthlyStats.weeklyEarnings)}
                        </p>
                        <p className="text-md text-gray-600">
                            <span className="font-semibold">{dailyWeeklyMonthlyStats.weeklyOrders}</span> orders delivered
                        </p>
                    </div>

                    {/* This Month's Summary */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-md flex flex-col items-start transform transition-transform hover:scale-105 duration-300">
                        <div className="flex items-center mb-3">
                            <Award className="w-7 h-7 mr-3 text-cyan-600" />
                            <p className="text-sm font-semibold text-gray-700">This Month</p>
                        </div>
                        <p className="text-xl font-extrabold text-green-700 mb-2">
                            {formatCurrency(dailyWeeklyMonthlyStats.monthlyEarnings)}
                        </p>
                        <p className="text-md text-gray-600">
                            <span className="font-semibold">{dailyWeeklyMonthlyStats.monthlyOrders}</span> orders delivered
                        </p>
                    </div>
                </div>


                {/* Delivered Orders List */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <Package className="w-7 h-7 mr-3 text-indigo-500" /> Your Delivered Orders
                </h2>

                {loading && (deliveredOrders.length === 0) ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
                        <p className="ml-4 text-gray-600 text-lg">Fetching delivered orders...</p>
                    </div>
                ) : deliveredOrders.length > 0 ? (
                    <div className="space-y-6">
                        {deliveredOrders.map((order) => (
                            <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 transition-all duration-300 hover:shadow-md">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                    {/* Order ID & Status */}
                                    <div className="md:col-span-1">
                                        <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
                                            Order ID:{' '}
                                            <button
                                                onClick={() => openOrderDetails(order)}
                                                className="ml-2 text-indigo-600 text-sm font-mono hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
                                                title={`View details for Order ${order.orderNumber}`}
                                            >
                                                {order.orderNumber}
                                            </button>
                                        </h3>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            <CheckCircle className="w-5 h-5 mr-1 text-green-500" />
                                            Status: <span className="ml-1 font-medium capitalize text-green-700">Delivered</span> {/* Hardcoded as this list is for delivered orders */}
                                        </p>
                                    </div>

                                    {/* Order Details */}
                                    <div className="text-gray-700 md:col-span-1">
                                        <p className="flex items-center mb-1 text-sm">
                                            <Tag className="w-5 h-5 mr-2 text-gray-500" />
                                            <strong className='mr-2'>  Amount:</strong> {formatCurrency(order.total)}
                                        </p>
                                        <p className="flex items-center text-sm">
                                            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
                                            <strong  className='mr-2'>  Delivered On:</strong> {formatDate(order.updatedAt)}
                                        </p>
                                    </div>

                                    {/* Order Earning (New Block) */}
                                    <div className="text-right md:col-span-1">
                                        <p className="text-sm font-semibold text-gray-800">
                                            Your Earning:
                                        </p>
                                        <p className="text-xl font-extrabold text-green-600">
                                            {formatCurrency(parseFloat(order.deliveryOrderEarning))}
                                        </p>
                                    </div>
                                </div>
                                {/* Expanded details (optional, hidden by default or shown in modal) */}
                                <div className=" border-t border-gray-100 pt-4 text-sm text-gray-600">
                                    <p className="flex items-center mb-1">
                                        <UtensilsCrossed className="w-5 h-5 mr-2 text-gray-500" />
                                        <strong  className='mr-2'>Branch:</strong> {order.branchStation?.name || 'N/A'}
                                    </p>
                                    <p className="flex items-center">
                                        <MapPin className="w-5 h-5 mr-2 text-gray-500" />
                                        <strong  className='mr-2'>Delivery Address:</strong> {order.shippingAddress?.fullAddress || `${order.shippingAddress?.streetAddress}, ${order.shippingAddress?.city}` || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200">
                        <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-xl text-gray-600 font-semibold">No delivered orders found yet.</p>
                        <p className="text-lg text-gray-500 mt-2">Keep up the good work! More deliveries are coming.</p>
                    </div>
                )}
            </div>

            {/* Order Detail Modal */}
            <OrderDetailModal
                isOpen={isModalOpen}
                closeModal={closeOrderDetails}
                order={selectedOrder}
            />
        </div>
    );
};

export default DeliveryPartnerEarning;