// RegisterPage.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, Eye, EyeOff, X } from 'lucide-react';
import Logo from '../assets/logo.svg';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, selectAuthError, selectAuthLoading, selectAuthUser, clearError } from '../store/userSlice';
import RegisterImage from '../assets/register.jpg';
import toast, { Toaster } from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { username, phone, email, password } = formData;
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
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(registerUser( formData ));
  };
  return (
    <div className="h-[100vh] w-full bg-white flex items-center justify-center">
      <Toaster />
      <div className="hidden md:block bg-indigo-500 w-1/2 h-[100vh] text-white relative rounded-l-lg">
        <img src={RegisterImage} alt="Welcome Illustration" className="w-full h-full object-cover" />
      </div>
      <div className="relative shadow-md h-full rounded-r-lg md:rounded-lg overflow-hidden mx-auto md:w-1/2 w-full">
        {/* logo */}
        <div className="flex items-center justify-between mt-10 mx-3 w-full">
          <div className="text-2xl flex items-center ">
            <img src={Logo} className="w-10 h-10 text-red-500" alt="Logo" />
            <h1 className="font-bold">ictura</h1>
          </div>
          <Link to={'/'} className="hover:border p-[10px] hover:bg-gray-50 mr-10 rounded-md">
            <X />
          </Link>
        </div>
        <div className="lg:px-10 md:px-5 px-3 flex flex-col items-center justify-center w-full h-full">
          <h2 className="text-3xl md:text-5xl font-semibold text-center mb-6 heading">Join Today!</h2>

          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div className="mt-1 flex items-center h-[45px] gap-2 border rounded-md shadow-sm">
                <div className="pointer-events-none text-gray-500 pl-3">
                  <User className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="outline-none w-full h-[45px] sm:text-sm rounded-md pr-3"
                  placeholder="Choose a username"
                  value={username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1 flex items-center h-[45px] gap-2 border rounded-md shadow-sm">
                <div className="pointer-events-none text-gray-500 pl-3">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  className="outline-none w-full h-[45px] sm:text-sm rounded-md pr-3"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 flex items-center h-[45px] gap-2 border rounded-md shadow-sm">
                <div className="pointer-events-none text-gray-500 pl-3">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="outline-none w-full h-[45px] sm:text-sm rounded-md pr-3"
                  placeholder="you@example.com"
                  value={email}
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
                {loading ? 'Sign Up...' : 'SignUp'}
              </button>
            </div>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-green-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;