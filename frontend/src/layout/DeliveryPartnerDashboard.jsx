import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../store/userSlice';
import {
    UserRound,
    Truck,
    ListOrdered,
    MapPin,
    Settings,
    Menu,
    X // Import the close icon
} from 'lucide-react';
 

// Reusable Sidebar Component for Delivery Partner
const DeliveryPartnerSidebar = ({ user, showMobileMenu, toggleMobileMenu, showSettingsLinks, toggleSettings, handleLogout }) => {
    return (
        <aside
            className={`bg-white rounded-xl shadow-md p-6 fixed top-0 left-0 h-full z-20 transform transition-transform duration-300 ease-in-out md:sticky md:top-20 md:translate-x-0 ${
                showMobileMenu ? 'translate-x-0' : '-translate-x-full'
            } md:w-80 w-full`}
        >
            {/* Mobile Close Button */}
            <div className="md:hidden flex justify-end mb-4">
                <button onClick={toggleMobileMenu} className="focus:outline-none">
                    <X className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="flex items-center justify-center flex-col mt-12 mb-6">
                {user?.avatar && (
                    <img
                        src={user.avatar}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        alt="User Avatar"
                    />
                )}
                <h2 className="mt-2 text-xl font-semibold text-gray-800">{user?.username}</h2>
                <p className="text-sm text-gray-500">{user?.email}</p>
                {user?.deliveryPartnerDetails?.approvalStatus !== 'approved' && (
                    <p className="mt-1 text-yellow-500 text-sm italic">
                        Status: {user?.deliveryPartnerDetails?.approvalStatus || 'Pending Approval'}
                    </p>
                )}
            </div>

            <nav className="mt-8">
                <div className="flex flex-col space-y-3">
                    <Link
                        to={'/delivery/profile'}
                        className="flex items-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-indigo-600 p-3 font-medium transition duration-150 ease-in-out"
                        onClick={() => toggleMobileMenu(false)}
                    >
                        <UserRound className="w-5 h-5 mr-3" />
                        <span>My Profile</span>
                    </Link>
                   
                    <Link
                        to={'/delivery/active-orders'}
                        className="flex items-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-green-600 p-3 font-medium transition duration-150 ease-in-out"
                        onClick={() => toggleMobileMenu(false)}
                    >
                        <Truck className="w-5 h-5 mr-3" />
                        <span>Active Today Deliveries</span>
                    </Link>
                   
                    <Link
                        to={'/delivery/orders'}
                        className="flex items-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-green-600 p-3 font-medium transition duration-150 ease-in-out"
                        onClick={() => toggleMobileMenu(false)}
                    >
                        <Truck className="w-5 h-5 mr-3" />
                        <span>Veiw Orders</span>
                    </Link>
                    
                    <Link
                        to={'/delivery/update-location'}
                        className="flex items-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-red-600 p-3 font-medium transition duration-150 ease-in-out"
                        onClick={() => toggleMobileMenu(false)}
                    >
                        <MapPin className="w-5 h-5 mr-3" />
                        <span>Update Location</span>
                    </Link>
                    <Link
                        to={'/delivery/update-availability'}
                        className="flex items-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-red-600 p-3 font-medium transition duration-150 ease-in-out"
                        onClick={() => toggleMobileMenu(false)}
                    >
                        <MapPin className="w-5 h-5 mr-3" />
                        <span>Update Availability</span>
                    </Link>

                   
                </div>
            </nav>

            {/* Logout Button */}
            <button
                onClick={handleLogout}
                className="w-full bg-red-500 text-white py-3 rounded-md mt-8 hover:bg-red-600 transition duration-150 ease-in-out font-semibold"
            >
                Logout
            </button>
        </aside>
    );
};

// Main Content Component for Delivery Partner
const DeliveryPartnerMainContent = () => (
    <main className="flex-1 bg-white rounded-xl shadow p-4">
        <Outlet />
    </main>
);

// DeliveryPartnerDashboard Component
const DeliveryPartnerDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [showMobileMenu, setShowMobileMenu] = useState(true);
    const [showSettingsLinks, setShowSettingsLinks] = useState(false);

    useEffect(() => {
        if (!user || user?.role !== 'deliveryPartner') {
            navigate('/'); // Redirect if not logged in as a delivery partner
        } else {
            
        }
    }, [user, navigate, dispatch]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const toggleMobileMenu = () => {
        setShowMobileMenu(!showMobileMenu);
    };

    const toggleSettings = () => {
        setShowSettingsLinks(!showSettingsLinks);
    };

    if (!user || user?.role !== 'deliveryPartner') {
        return null; // Or a loading state if you prefer
    }

    return (
        <div className="min-h-screen bg-gray-100 relative">
            {/* Mobile Header */}
            <div className="md:hidden bg-white p-4 shadow-md fixed top-0 left-0 right-0 z-30 flex justify-between items-center">
                <Link to={'/delivery'} className="text-xl font-semibold text-gray-800">Delivery</Link>
                <button onClick={toggleMobileMenu} className="focus:outline-none">
                    <Menu className="w-6 h-6 text-gray-600" />
                </button>
            </div>

            <div className="container mx-auto px-4 py-8 md:py-16 flex md:flex-row flex-col gap-6 mt-16 md:mt-6">
                {/* Sidebar */}
                {user && (
                    <DeliveryPartnerSidebar
                        user={user}
                        showMobileMenu={showMobileMenu}
                        toggleMobileMenu={toggleMobileMenu}
                        showSettingsLinks={showSettingsLinks}
                        toggleSettings={toggleSettings}
                        handleLogout={handleLogout}
                    />
                )}

                {/* Main Content Area */}
                <DeliveryPartnerMainContent />
            </div>
        </div>
    );
};

export default DeliveryPartnerDashboard;