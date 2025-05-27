import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { GalleryHorizontalEnd, Layout, Settings, UserRound, Package, LineChart, MessageSquare } from 'lucide-react'; // Added more icons for better representation
import { getAllUsers, selectAllUsers, selectAuthUser, selectAuthLoading, selectAuthError } from '../../store/userSlice'; // Adjust path as needed
import { getAllOrders, selectOrders, selectOrderLoading, selectOrderError } from '../../store/orderSlice'; // Adjust path as needed
import { fetchBanners, selectAllBanners, selectBannersLoading, selectBannersError } from '../../store/bannerSlice'; // Adjust path as needed

const WelcomeAdmin = () => {
    const dispatch = useDispatch();

    // Selectors for authenticated user and admin data
    const { user: authUser, loading: authLoading, error: authError } = useSelector(selectAuthUser);
    const allUsers = useSelector(selectAllUsers);
    const allOrders = useSelector(selectOrders);
    const allBanners = useSelector(selectAllBanners);

    // Selectors for loading and error states of the fetched data
    const usersLoading = useSelector(selectAuthLoading); // Reusing authLoading, but might want specific selectors if loading states differ
    const ordersLoading = useSelector(selectOrderLoading);
    const bannersLoading = useSelector(selectBannersLoading);

    const usersError = useSelector(selectAuthError);
    const ordersError = useSelector(selectOrderError);
    const bannersError = useSelector(selectBannersError);

    // Fetch necessary data on component mount
    useEffect(() => {
        dispatch(getAllUsers());
        dispatch(getAllOrders());
        dispatch(fetchBanners());
    }, [dispatch]);

    const adminName = authUser?.username || "Admin";

    // Derived quick stats from fetched data
    const totalUsers = allUsers.length;
    const totalOrders = allOrders.length;
    const totalBanners = allBanners.length;

    // TODO: Implement logic to get new orders today, total products, pending reviews
    // This would likely require specific API endpoints or more complex filtering of existing data
    const newOrdersToday = 0; // Placeholder
    const totalProducts = 0; // Placeholder (assuming product slice would provide this)
    const pendingReviews = 0; // Placeholder (assuming a review slice would provide this)

    // Derived recent activity
    const recentNewUser = allUsers.length > 0 ? allUsers[allUsers.length - 1].username : 'N/A';
    const recentNewOrder = allOrders.length > 0 ? allOrders[allOrders.length - 1]._id.slice(-6) : 'N/A'; // Last 6 chars of ID
    const recentUpdatedBanner = allBanners.length > 0 ? allBanners[allBanners.length - 1].title : 'N/A'; // Assuming banners have a 'title' field

    const isLoading = usersLoading || ordersLoading || bannersLoading;
    const hasError = usersError || ordersError || bannersError;

    return (
        <div className="p-8 rounded-lg bg-white shadow-md">
            <div className="flex items-center mb-6">
                <UserRound className="w-10 h-10 text-indigo-500 mr-4" />
                <h2 className="text-2xl font-semibold text-gray-800">
                    Welcome, {adminName}!
                </h2>
                <span className="ml-2 text-indigo-500 text-lg">👋</span>
            </div>
            <p className="text-gray-600 leading-relaxed mb-8">
                Navigate through the options below to manage your custom printing clothing website.
                Keep track of users, banners, categories, and fine-tune your settings.
            </p>

            {isLoading && (
                <div className="text-center py-4">
                    <p className="text-indigo-600 font-medium">Loading admin data...</p>
                </div>
            )}

            {hasError && (
                <div className="text-center py-4 text-red-600 font-medium">
                    <p>Error loading data: {usersError || ordersError || bannersError}</p>
                </div>
            )}

            {!isLoading && !hasError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Manage Users */}
                    <Link to="/admin/users" className="block rounded-md bg-blue-50 hover:bg-blue-100 transition duration-200 shadow-sm border border-blue-100">
                        <div className="p-6">
                            <div className="flex items-center mb-3">
                                <UserRound className="w-6 h-6 text-blue-500 mr-2" />
                                <h3 className="text-lg font-semibold text-blue-700">Manage Users</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                View, edit, and control user accounts and their roles.
                            </p>
                            <span className="inline-block mt-3 text-blue-500 font-medium hover:underline">
                                Go to User Management
                            </span>
                        </div>
                    </Link>

                    {/* Manage Banners */}
                    <Link to="/admin/banners" className="block rounded-md bg-green-50 hover:bg-green-100 transition duration-200 shadow-sm border border-green-100">
                        <div className="p-6">
                            <div className="flex items-center mb-3">
                                <GalleryHorizontalEnd className="w-6 h-6 text-green-500 mr-2" />
                                <h3 className="text-lg font-semibold text-green-700">Manage Banners</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Upload, edit, and organize the promotional banners on your site.
                            </p>
                            <span className="inline-block mt-3 text-green-500 font-medium hover:underline">
                                Go to Banner Management
                            </span>
                        </div>
                    </Link>

                    {/* Manage Categories */}
                    <Link to="/admin/categories" className="block rounded-md bg-yellow-50 hover:bg-yellow-100 transition duration-200 shadow-sm border border-yellow-100">
                        <div className="p-6">
                            <div className="flex items-center mb-3">
                                <Layout className="w-6 h-6 text-yellow-500 mr-2" />
                                <h3 className="text-lg font-semibold text-yellow-700">Manage Categories</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Organize your product offerings into logical categories.
                            </p>
                            <span className="inline-block mt-3 text-yellow-500 font-medium hover:underline">
                                Go to Category Management
                            </span>
                        </div>
                    </Link>

                    {/* Manage Orders */}
                    <Link to="/admin/orders" className="block rounded-md bg-pink-50 hover:bg-pink-100 transition duration-200 shadow-sm border border-pink-100">
                        <div className="p-6">
                            <div className="flex items-center mb-3">
                                <Package className="w-6 h-6 text-pink-500 mr-2" />
                                <h3 className="text-lg font-semibold text-pink-700">Manage Orders</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                View, track, and update customer orders.
                            </p>
                            <span className="inline-block mt-3 text-pink-500 font-medium hover:underline">
                                Go to Order Management
                            </span>
                        </div>
                    </Link>

                    {/* Website Settings */}
                    <Link to="/admin/settings" className="block rounded-md bg-purple-50 hover:bg-purple-100 transition duration-200 shadow-sm border border-purple-100">
                        <div className="p-6">
                            <div className="flex items-center mb-3">
                                <Settings className="w-6 h-6 text-purple-500 mr-2" />
                                <h3 className="text-lg font-semibold text-purple-700">Website Settings</h3>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Configure general settings and preferences for your website.
                            </p>
                            <span className="inline-block mt-3 text-purple-500 font-medium hover:underline">
                                Go to Settings
                            </span>
                        </div>
                    </Link>

                    {/* Quick Stats */}
                    <div className="rounded-md bg-gray-50 shadow-sm border border-gray-100">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Stats</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                    <p className="font-medium">Total Users:</p>
                                    <p className="text-indigo-600 font-semibold">{totalUsers}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Total Orders:</p>
                                    <p className="text-green-600 font-semibold">{totalOrders}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Total Banners:</p>
                                    <p className="text-blue-600 font-semibold">{totalBanners}</p>
                                </div>
                                <div>
                                    <p className="font-medium">New Orders Today:</p>
                                    <p className="text-orange-600 font-semibold">{newOrdersToday}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Total Products:</p>
                                    <p className="text-teal-600 font-semibold">{totalProducts}</p> {/* Assumes a product slice exists */}
                                </div>
                                <div>
                                    <p className="font-medium">Pending Reviews:</p>
                                    <p className="text-red-600 font-semibold">{pendingReviews}</p> {/* Assumes a review slice exists */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="rounded-md bg-gray-50 shadow-sm border border-gray-100 col-span-1 md:col-span-2 lg:col-span-1">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Activity</h3>
                            <ul className="text-sm text-gray-600 leading-relaxed list-disc pl-5">
                                <li>New user <span className="font-semibold text-indigo-600">{recentNewUser}</span> registered.</li>
                                <li>Order <span className="font-semibold text-green-600">#{recentNewOrder}</span> processed.</li>
                                <li>Banner "<span className="font-semibold text-blue-600">{recentUpdatedBanner}</span>" updated.</li>
                                {/* Add more recent activity items by sorting or filtering your fetched data */}
                                {/* Example: <li>New product "<span className="font-semibold text-purple-600">Custom T-Shirt</span>" added.</li> */}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WelcomeAdmin;