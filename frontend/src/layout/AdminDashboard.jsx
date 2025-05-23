import {
  GalleryHorizontalEnd,
  ShoppingCart,
  UserRound,
  Users,
  Layout,
  Settings,
  LogOut,
  Menu,
  X,
  Images,
  ChartBarStacked,
  AlignCenterVertical,
  Puzzle,
  Split,
  GitPullRequest,
  Bell,
  CalendarRange,
  Package,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../store/userSlice'; // Adjust path as needed

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/'); // Redirect non-admin users
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

  const adminNavLinks = [
    { to: '/admin/analysis', icon: <Layout className="" />, text: 'Dashboard' },

    // Content Management
    { to: '/admin/products', icon: <AlignCenterVertical className="" />, text: 'Manage Products' },
    { to: '/admin/categories', icon: <ChartBarStacked className="" />, text: 'Manage Categories' },
    { to: '/admin/banners', icon: <Images className="" />, text: 'Manage Banners' },

    // User & Access
    { to: '/admin/users', icon: <Users className="" />, text: 'Manage Users' },
    { to: '/admin/branch-stations', icon: <Split className="" />, text: '  Branch Stations' },

    // Order Management
    { to: '/admin/orders', icon: <Package className="" />, text: 'Manage Orders' },
    { to: '/admin/returnorders', icon: <Package className="" />, text: '  Return Orders' },
    { to: '/admin/Branch', icon: <Package className="" />, text: 'Orders to Branch Station' },

 

    // Communication & Feedback
    { to: '/admin/requests', icon: <GitPullRequest className="" />, text: 'Requests' },
    { to: '/admin/notifications', icon: <Bell className="" />, text: 'Notifications' },

    
  ];

  return (
    <div className='mt-20 pt-4 w-full h-full min-h-screen bg-gray-100'>
      <div className="flex w-full mx-3 h-full gap-4">
        {/* left side  */}
        <div className="w-full max-w-3xs bg-white border rounded-2xl h-full p-2  ">
          <div className="flex items-center justify-center flex-col">
            <img src={user.avatar} className='w-16 h-16 rounded-full border-1 object-cover' alt="" />
            <p className="font-semibold text-lg">{user.username}</p>
            <p className='text-black/60 text-sm'>{user.email}</p>
          </div>
          {/* Links */}
          <div className="flex flex-col mt-10 gap-2 mx-4">
            {adminNavLinks.map((link, index) => (
              <Link
                key={index}
                to={link.to}
                className={`flex items-center text-sm rounded-lg text-gray-500 hover:bg-gray-200 hover:text-black/90 w-full p-2 py-3 font-semibold gap-2 ${
                  location.pathname === link.to ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' : ''
                }`}
                onClick={closeMenu}
              >
                {link.icon}
                <p className='text-sm'>{link.text}</p>
              </Link>
            ))}
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

export default AdminDashboard;