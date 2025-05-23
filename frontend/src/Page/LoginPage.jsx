// LoginPage.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, X } from 'lucide-react';
import Logo from '../assets/logo.svg';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthError, selectAuthLoading, selectAuthUser, clearError } from '../store/userSlice';

import LoginImage from '../assets/LoginMugs.png';
import toast, { Toaster } from 'react-hot-toast';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { identifier, password } = formData;
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const user = useSelector(selectAuthUser);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError()); // Clear the error state after displaying the toast
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (user) {
      navigate('/'); // Redirect to the home page upon successful login
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier) {
      toast.error('Please enter your Email, Username, or Phone.');
      return;
    }
    if (!password) {
      toast.error('Please enter your password.');
      return;
    }

    dispatch(loginUser({ identifier, password }));
  };

  return (
    <div className="h-[100vh] w-full bg-white flex items-center justify-center">
      <Toaster />
      <div className="hidden md:block bg-indigo-500 w-1/2 h-[100vh] text-white relative rounded-l-lg">
        <img src={LoginImage} alt="Welcome Illustration" className="w-full h-full object-cover" />
        <div className="bottom-5 lg:left-[15%] absolute w-full text-black flex items-start flex-col px-8">
          <h2 className="text-3xl text-black/70 mt-6 font-bold text-center">Unlock Your Potential</h2>
          <p className="mt-2 text-lg text-black/80">Join our community and discover new possibilities.</p>
        </div>
      </div>
      <div className="relative shadow-md h-full rounded-r-lg md:rounded-lg overflow-hidden mx-auto md:w-1/2 w-full">
        {/* logo */}
        <div className="flex items-center justify-between mt-10 mx-3 w-full">
          <div className="text-2xl flex items-center ">
            <img src={Logo} className="w-10 h-10 text-red-500" alt="Logo" />
            <h1 className="font-bold">ictura</h1>
          </div>
          <Link to={'/'} className="hoverborder p-[10px] hover:bg-gray-50 mr-10">
            <X />
          </Link>
        </div>
        <div className="lg:px-10 md:px-5 px-3 flex flex-col items-center justify-center w-full h-full">
          <h2 className="text-3xl md:text-5xl font-semibold text-center mb-6 heading">WELCOME BACK.</h2>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Email or Username or Phone
              </label>
              <div className="mt-1 flex items-center h-[45px] gap-2 border rounded-md shadow-sm">
                <div className="pointer-events-none text-gray-500 pl-3">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="identifier"
                  id="identifier"
                  className="outline-none w-full h-[45px] sm:text-sm rounded-md pr-3"
                  placeholder="your@email.com or username or phone"
                  value={identifier}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative flex items-center h-[45px] gap-2 border rounded-md shadow-sm">
                <div className="pointer-events-none text-gray-500 pl-3">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  id="password"
                  className="outline-none w-full h-[45px] sm:text-sm rounded-md pr-10"
                  placeholder="********"
                  value={password}
                  onChange={handleChange}
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={handleTogglePassword}>
                  {showPassword ? <EyeOff className="h-5 w-5 text-gray-500" /> : <Eye className="h-5 w-5 text-gray-500" />}
                </div>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div>
              <button
                type="submit"
                className={`w-full py-3 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer bg-green-600 text-white font-medium hover:bg-green-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Login'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-green-600 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;