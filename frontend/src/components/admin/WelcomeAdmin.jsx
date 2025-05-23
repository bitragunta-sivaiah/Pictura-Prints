import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';  
import { GalleryHorizontalEnd, Layout, Settings, UserRound } from 'lucide-react';  

const WelcomeAdmin = () => {
  const { user } = useSelector((state) => state.auth);  

 
  const adminName = user?.username || "Admin";

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
                <p className="text-indigo-600 font-semibold">{user?.totalUsers || 'N/A'}</p> {/* Example data */}
              </div>
              <div>
                <p className="font-medium">New Orders Today:</p>
                <p className="text-green-600 font-semibold">{user?.newOrdersToday || 'N/A'}</p> {/* Example data */}
              </div>
              <div>
                <p className="font-medium">Total Products:</p>
                <p className="text-blue-600 font-semibold">{user?.totalProducts || 'N/A'}</p> {/* Example data */}
              </div>
              <div>
                <p className="font-medium">Pending Reviews:</p>
                <p className="text-orange-600 font-semibold">{user?.pendingReviews || 'N/A'}</p> {/* Example data */}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-md bg-gray-50 shadow-sm border border-gray-100">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">Recent Activity</h3>
            <ul className="text-sm text-gray-600 leading-relaxed list-disc pl-5">
              <li>New user <span className="font-semibold text-indigo-600">{user?.recentActivity?.newUser || 'N/A'}</span> registered.</li> {/* Example data */}
              <li>Order <span className="font-semibold text-green-600">#{user?.recentActivity?.newOrder || 'N/A'}</span> processed.</li> {/* Example data */}
              <li>Banner "<span className="font-semibold text-blue-600">{user?.recentActivity?.updatedBanner || 'N/A'}</span>" updated.</li> {/* Example data */}
              {/* Add more recent activity items */}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAdmin;