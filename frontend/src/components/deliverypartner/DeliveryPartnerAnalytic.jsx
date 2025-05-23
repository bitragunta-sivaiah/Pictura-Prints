import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
    selectMyActiveOrdersToday,
    selectTotalAssignedOrders,
    selectDeliveryPartnerRevenue,
    selectDeliveryPartnerLoading,
    selectDeliveryPartnerError,
    fetchMyActiveOrdersToday,
    fetchMyTotalAssignedOrders,
    fetchMyRevenue,
} from '../../store/deliveryPartnerSlice'; 
import { Clock, Package, Coins, CalendarDays,  Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const DeliveryPartnerAnalytics = () => {
    const dispatch = useDispatch();
    const activeOrdersToday = useSelector(selectMyActiveOrdersToday);
    const totalAssignedOrders = useSelector(selectTotalAssignedOrders);
    const revenueData = useSelector(selectDeliveryPartnerRevenue);
    const loading = useSelector(selectDeliveryPartnerLoading);
    const error = useSelector(selectDeliveryPartnerError);

    useEffect(() => {
        dispatch(fetchMyActiveOrdersToday());
        dispatch(fetchMyTotalAssignedOrders());
        dispatch(fetchMyRevenue());
    }, [dispatch]);

    const calculateOrderEarning = (order) => {
        return order.totalPrice > 500 ? 50 : 30;
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading analytics...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error loading analytics: {error}</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-semibold text-gray-800 mb-6">Delivery Partner Analytics</h1>

                {/* Overview Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white shadow-md rounded-lg p-6 flex items-center">
                        <div className="bg-indigo-100 text-indigo-500 rounded-md p-2 mr-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Today's Orders</p>
                            <p className="text-xl font-semibold text-gray-800">{activeOrdersToday?.length || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 flex items-center">
                        <div className="bg-green-100 text-green-500 rounded-md p-2 mr-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Weekly Orders</p>
                            <p className="text-xl font-semibold text-gray-800">{revenueData?.weeklyOrders || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 flex items-center">
                        <div className="bg-blue-100 text-blue-500 rounded-md p-2 mr-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Monthly Orders</p>
                            <p className="text-xl font-semibold text-gray-800">{revenueData?.monthlyOrders || 0}</p>
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 flex items-center">
                        <div className="bg-yellow-100 text-yellow-500 rounded-md p-2 mr-4">
                            <Package className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Orders</p>
                            <p className="text-xl font-semibold text-gray-800">{totalAssignedOrders || 0}</p>
                        </div>
                    </div>
                </div>

                {/* Earnings Overview */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Coins className="w-5 h-5 mr-2 text-yellow-500" /> Earnings
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="p-4 border rounded-md">
                            <p className="text-sm text-gray-500">Today's Earnings</p>
                            <p className="text-lg font-semibold text-green-500">₹ {revenueData?.todayEarnings?.toFixed(2) || 0.00}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <p className="text-sm text-gray-500">Weekly Earnings</p>
                            <p className="text-lg font-semibold text-green-500">₹ {revenueData?.weeklyEarnings?.toFixed(2) || 0.00}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <p className="text-sm text-gray-500">Monthly Earnings</p>
                            <p className="text-lg font-semibold text-green-500">₹ {revenueData?.monthlyEarnings?.toFixed(2) || 0.00}</p>
                        </div>
                        <div className="p-4 border rounded-md">
                            <p className="text-sm text-gray-500">Total Earnings</p>
                            <p className="text-lg font-semibold text-green-500">₹ {revenueData?.totalEarnings?.toFixed(2) || 0.00}</p>
                        </div>
                    </div>
                </div>

                {/* Today's Order Details */}
                {activeOrdersToday && activeOrdersToday.length > 0 && (
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                            <Package className="w-5 h-5 mr-2 text-blue-500" /> Today's Order Details
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery Time</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Price</th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Earning</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {activeOrdersToday.map(order => (
                                        <tr key={order._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{order._id}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                                                {order.deliveredAt ? (
                                                    <div className="flex items-center">
                                                        <Clock className="w-4 h-4 mr-1 text-gray-500" />
                                                        {format(parseISO(order.deliveredAt), 'hh:mm a')}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-500">Pending</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">₹ {order.totalPrice?.toFixed(2) || 0.00}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">₹ {calculateOrderEarning(order)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeOrdersToday && activeOrdersToday.length === 0 && (
                    <div className="bg-white shadow-md rounded-lg p-6 text-gray-600">
                        <Package className="w-6 h-6 inline-block mr-2" /> No orders delivered today yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeliveryPartnerAnalytics;