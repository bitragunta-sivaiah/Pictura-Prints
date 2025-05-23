import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile, clearError } from '../../store/userSlice';
import { uploadImageToCloudinary, clearImageUrl } from '../../store/cloundarySlice';
import { toast } from 'react-hot-toast';
import { Edit, Check, X, ImagePlus } from 'lucide-react';

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { imageUrl, loading: imageLoading, error: imageError } = useSelector((state) => state.cloudinary);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    avatar: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  useEffect(() => {
    if (imageUrl) {
      setFormData({ ...formData, avatar: imageUrl.url }); // Access the 'url' property from the response
      dispatch(clearImageUrl());
      setAvatarFile(null);
    }
  }, [imageUrl, formData, dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
    if (imageError) {
      toast.error(imageError);
      dispatch(clearImageUrl());
    }
  }, [error, dispatch, imageError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      avatar: user?.avatar || '',
    });
    setAvatarFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ id: user?._id, ...formData }));
    setIsEditing(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      dispatch(uploadImageToCloudinary(file));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-lg shadow mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">User Profile</h2>
        {!isEditing ? (
          <button
            onClick={handleEditClick}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition duration-200"
            disabled={loading}
          >
            <Edit className="w-5 h-5 mr-2" /> Edit Profile
          </button>
        ) : (
          <div className='flex items-center gap-4'>
            <button
              onClick={handleSubmit}
              className="flex items-center bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md transition duration-200 mr-2"
              disabled={loading || imageLoading}
            >
              <Check className="w-5 h-5 mr-2" /> Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md transition duration-200"
              disabled={loading || imageLoading}
            >
              <X className="w-5 h-5 mr-2" /> Cancel
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-gray-300">
          <img
            src={formData.avatar || 'https://via.placeholder.com/150'}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
          {isEditing && (
            <label htmlFor="avatar-upload" className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white cursor-pointer">
              <ImagePlus className="w-6 h-6" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          )}
        </div>
        {imageLoading && <span className="ml-4 text-sm text-gray-500">Uploading...</span>}
        {imageError && <span className="ml-4 text-sm text-red-500">Image upload failed.</span>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!isEditing || loading || imageLoading}
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled
          />
          <p className="text-gray-500 text-xs italic">Email cannot be changed.</p>
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-gray-700 text-sm font-bold mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            disabled={!isEditing || loading || imageLoading}
          />
          <p className="text-gray-500 text-xs italic">Optional.</p>
        </div>

        {loading && (
          <div className="text-center">
            <span className="loading loading-spinner loading-md"></span>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm italic">{error}</p>
        )}
      </form>
    </div>
  );
};

export default UserProfilePage;