import {
    Layout,
    ShoppingCart,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    MapPin,
    ClipboardList,
    Truck,
    Package,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { logout } from '../store/userSlice';  
const BranchManagerDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        if (!user || user.role !== 'branchManager') {
            navigate('/'); // Redirect non-branch-manager users
        }
    }, [user, navigate]);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const branchManagerNavLinks = [
        { to: '/branch-manager', icon: <Layout className="" />, text: 'Dashboard' },
        { to: '/branch-manager/applications', icon: <Layout className="" />, text: 'New Applications' },
        { to: '/branch-manager/active_orders', icon: <Package className="" />, text: 'Active orders' },
        { to: '/branch-manager/delivery-partners', icon: <Truck className="" />, text: 'Manage Delivery Partners' },
    ];

    return (
        <div className='mt-20 pt-4 w-full h-full min-h-screen bg-gray-100'>
            <div className="flex w-full mx-3 h-full gap-4">
                {/* left side  */}
                <div className="w-full max-w-3xs bg-white border rounded-2xl h-full p-2 ">
                    <div className="flex items-center justify-center flex-col">
                        <img src={user.avatar} className='w-16 h-16 rounded-full border-1 object-cover' alt="" />
                        <p>{user.username}</p>
                        <p className='text-black/60 font-semibold'>{user.email}</p>
                        {user.managedBranch && (
                            <div className="mt-2">
                                <MapPin className="w-4 h-4 inline-block mr-1 text-gray-500" />
                                <p className='text-sm text-gray-700 inline-block'>{user.managedBranch.name || 'Branch Info Not Available'}</p>
                            </div>
                        )}
                    </div>
                    {/* Links */}
                    <div className="flex flex-col mt-10 gap-4 mx-4 items-center">
                        {
                            branchManagerNavLinks.map((link, index) => (
                                <Link
                                    key={index}
                                    to={link.to}
                                    className="flex items-center text-sm  rounded-lg text-gray-500 hover:bg-gray-200 hover:text-black/90 w-full p-2 py-3 font-semibold gap-2"
                                    onClick={closeMenu}
                                >
                                    {link.icon}
                                    <p className=''>{link.text}</p>
                                </Link>
                            ))
                        }
                    </div>
                    <button onClick={handleLogout} className='bg-red-500 text-white w-full py-3 rounded-xl mt-5 '>Logout</button>
                </div>
                {/* right side  */}
                <div className="w-full min-h-[60%] h-full  p-3 border rounded-2xl mr-5  bg-white ">
                    <main>
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default BranchManagerDashboard;