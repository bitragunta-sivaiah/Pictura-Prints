import React from 'react';
import { Link } from 'react-router-dom';
// Import specific Lucide React icons for admin features
import {
    LineChart,        // For analytics/insights
    ShieldCheck,      // For security/control
    Users,            // For user management
    LayoutDashboard,  // For overall system management
    ShoppingCart,     // For orders
    Settings,         // For configuration
} from 'lucide-react';

// Assuming you have a relevant 3D image for admin oversight, data, or system control
import AdminDashboard3D from '../assets/adminImg.png'; // Placeholder for an admin-specific image

const AdminHero = () => {
    // Define a professional color palette, consistent with an admin interface
    const primaryColorAdmin = '#1A73E8'; // A strong blue for authority and control
    const secondaryAccentColor = '#00BFA5'; // A vibrant green for positive indicators
    const textColorPrimary = '#212121';
    const textColorSecondary = '#5F6368'; // Lighter gray for secondary text
    const backgroundColor = '#F8F9FA'; // A very light gray, clean and professional

    return (
        <div className={`bg-[${backgroundColor}] max-sm:mt-20 py-20 relative overflow-hidden`}>
            {/* Subtle Background Pattern (Tailwind-like) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(26,115,232,0.05),transparent)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(0,191,165,0.05),transparent)]"></div>

            <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="text-center md:text-left">
                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[${textColorPrimary}] mb-6`}>
                            Command Center: Oversee & Optimize Your Platform
                        </h1>
                        <p className={`text-lg md:text-xl text-[${textColorSecondary}] mb-8`}>
                            Gain comprehensive control over your entire system. Manage users, track orders,
                            analyze performance metrics, and ensure seamless operations from a unified dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link to={'/admin/analysis'} // Link to your main dashboard/analytics
                                className={`bg-[${primaryColorAdmin}] hover:bg-blue-700 text-black hover:text-white font-semibold py-3 px-6 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-300`}
                            >
                                Go to Dashboard
                            </Link>
                            <Link to={'/admin/settings'} // Link to primary settings/configuration
                                className={`bg-white hover:bg-gray-100 text-[${primaryColorAdmin}] font-semibold py-3 px-6 rounded-md shadow-md border border-[${primaryColorAdmin}] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition duration-300`}
                            >
                                System Settings
                            </Link>
                        </div>
                        {/* Modern Benefit Highlights for Admin */}
                        <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-blue-100 text-[${primaryColorAdmin}]`}>
                                    <LineChart className="h-6 w-6" /> {/* Icon for Insights/Analytics */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Actionable Insights</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-green-100 text-[${secondaryAccentColor}]`}>
                                    <ShieldCheck className="h-6 w-6" /> {/* Icon for Security/Control */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Full Control</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-purple-100 text-purple-700`}>
                                    <Users className="h-6 w-6" /> {/* Icon for User Management */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>User Management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-orange-100 text-orange-700`}>
                                    <ShoppingCart className="h-6 w-6" /> {/* Icon for Order Tracking */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Order Tracking</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: 3D Admin Dashboard Image */}
                    <div className="relative">
                        <div className="relative rounded-lg overflow-hidden">
                            <img
                                src={AdminDashboard3D}
                                alt="Admin Dashboard"
                                className="w-full mx-auto md:mx-0 object-cover"
                            />
                            {/* Subtle gradient overlay on the image for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                        {/* Optional: Floating effect (requires animation library or custom CSS) */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminHero;