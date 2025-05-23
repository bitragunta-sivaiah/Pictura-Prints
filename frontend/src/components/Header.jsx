import React from 'react';
import Logo from '../assets/logo.svg';
import Searcher from './Search';
import { ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleAvatarClick = () => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'user') {
        navigate('/user');
      } else if (user.role === 'branchManager') {
        navigate('/branch-manager');
      } else if (user.role === 'deliveryPartner') {
        navigate('/delivery');
      }
    } else {
      navigate('/login'); // Or handle as needed if no user
    }
  };

  return (
    <div className="w-full h-20 fixed top-0 z-30 left-0 bg-white border-b border-gray-200 p-2 flex items-center justify-center ">
      <div className="w-full mx-auto max-w-7xl h-full flex items-center justify-between  ">
        {/* logo */}
        <Link to={'/'} className="text-2xl  flex items-center ">
          <img src={Logo} className="w-10 h-10 text-red-500" alt="Logo" />
          <h1 className="font-bold hidden md:block">ictura</h1>
        </Link>
        {/* search */}
        {(user?.role === 'user' || ! user) && (
          <div className="hidden md:block mx-2">
            <Searcher />
          </div>
        )}
        {/* right side */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2 cursor-pointer" onClick={handleAvatarClick}>
                <img
                  src={user.avatar || 'https://via.placeholder.com/150'} // Use a placeholder if no avatar
                  className="w-12 h-12 border-1 object-cover rounded-full"
                  alt="User Avatar"
                />
                <p className="hidden md:block">{user.username}</p>
              </div>
            </>
          ) : (
            <>
              <Link
                to={'/login'}
                className="w-fit h-[40px] rounded font-extrabold bg-[#b1fc72] px-4 flex items-center justify-center  text-black/90  text-md"
              >
                Login
              </Link>
            </>
          )}
          {user?.role === 'user' && (
            <Link to={'/cart'} className="w-fit h-[40px] flex items-center gap-2 border rounded">
              <span>
                {' '}
                <ShoppingBag />
              </span>
              <p className="hidden md:block">Cart</p>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;