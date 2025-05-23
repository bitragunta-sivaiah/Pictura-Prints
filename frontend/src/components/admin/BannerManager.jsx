import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBanners,
  createBanner,
  updateBannerByNumber,
  deleteBannerById,
  uploadImage,
  clearUploadState,
  clearBannerDetails,
  selectAllBanners,
  selectBannersLoading,
  selectBannersError,
  selectIsUploadingImage,
  selectUploadedImageUrl,
  selectUploadImageError,
} from '../../store/bannerSlice';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, X, Image as ImageIcon, Filter } from 'lucide-react';
import { SketchPicker } from 'react-color'; // Import SketchPicker

const positions = [
  // Normal Banners
  'homepage_hero_banner',
  'homepage_featured_banner',
  'product_detail_top_banner',
  'product_category_sidebar_banner',
  'checkout_banner',
  'mobile_splash_screen_banner',
  'mobile_in_app_promo_banner',
  'user_dashboard_alert_banner',
  // Advertisements
  'homepage_advertisement',
  'product_listing_advertisement',
  'product_detail_advertisement',
  'checkout_advertisement',
  'other_advertisement',
];

const BannerManager = () => {
  const dispatch = useDispatch();
  const banners = useSelector(selectAllBanners);
  const loading = useSelector(selectBannersLoading);
  const error = useSelector(selectBannersError);
  const uploadingImage = useSelector(selectIsUploadingImage);
  const uploadedImageUrl = useSelector(selectUploadedImageUrl);
  const uploadImageError = useSelector(selectUploadImageError);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null); // For editing
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    bannerNumber: '',
    desktopImage: [],
    mobileImage: [],
    postBg: '#ffffff', // Default background color
    position: '',
    imageUrl: '',
    navigateLink: '',
    startDate: '',
    endDate: '',
    isActive: true,
    priority: 0,
  });
  const [desktopImageFile, setDesktopImageFile] = useState(null);
  const [mobileImageFile, setMobileImageFile] = useState(null);
  const [imageUrlFile, setImageUrlFile] = useState(null);
  const [filterPosition, setFilterPosition] = useState('');
  const [displayColorPicker, setDisplayColorPicker] = useState(false); // State for color picker visibility

  useEffect(() => {
    dispatch(fetchBanners());
  }, [dispatch]);

  useEffect(() => {
    if (uploadedImageUrl && uploadingImage === false && !uploadImageError) {
      if (desktopImageFile) {
        setFormData((prev) => ({ ...prev, desktopImage: [...prev.desktopImage, uploadedImageUrl] }));
        setDesktopImageFile(null);
      } else if (mobileImageFile) {
        setFormData((prev) => ({ ...prev, mobileImage: [...prev.mobileImage, uploadedImageUrl] }));
        setMobileImageFile(null);
      } else if (imageUrlFile) {
        setFormData((prev) => ({ ...prev, imageUrl: uploadedImageUrl }));
        setImageUrlFile(null);
      }
      dispatch(clearUploadState());
    } else if (uploadImageError) {
      toast.error(`Image upload failed: ${uploadImageError}`);
      dispatch(clearUploadState());
    }
  }, [uploadedImageUrl, uploadingImage, uploadImageError, desktopImageFile, mobileImageFile, imageUrlFile, dispatch]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e, type) => {
    if (e.target.files[0]) {
      if (type === 'desktop') {
        setDesktopImageFile(e.target.files[0]);
      } else if (type === 'mobile') {
        setMobileImageFile(e.target.files[0]);
      } else if (type === 'imageUrl') {
        setImageUrlFile(e.target.files[0]);
      }
    }
  };

  const handleUploadImage = async (file, type) => {
    if (!file) {
      toast.error('No file selected for upload.');
      return;
    }
    await dispatch(uploadImage(file));
  };

  const handleRemoveImage = (type, indexToRemove) => {
    if (type === 'desktop') {
      setFormData((prev) => ({
        ...prev,
        desktopImage: prev.desktopImage.filter((_, index) => index !== indexToRemove),
      }));
    } else if (type === 'mobile') {
      setFormData((prev) => ({
        ...prev,
        mobileImage: prev.mobileImage.filter((_, index) => index !== indexToRemove),
      }));
    }
  };

  const openCreateModal = () => {
    setCurrentBanner(null);
    setFormData({
      title: '',
      description: '',
      bannerNumber: '',
      desktopImage: [],
      mobileImage: [],
      postBg: '#ffffff', // Reset to default
      position: '',
      imageUrl: '',
      navigateLink: '',
      startDate: '',
      endDate: '',
      isActive: true,
      priority: 0,
    });
    setDesktopImageFile(null);
    setMobileImageFile(null);
    setImageUrlFile(null);
    dispatch(clearUploadState());
    setIsModalOpen(true);
  };

  const openEditModal = (banner) => {
    setCurrentBanner(banner);
    setFormData({
      title: banner.title || '',
      description: banner.description || '',
      bannerNumber: banner.bannerNumber || '',
      desktopImage: banner.desktopImage || [],
      mobileImage: banner.mobileImage || [],
      postBg: banner.postBg || '#ffffff', // Set existing background or default
      position: banner.position || '',
      imageUrl: banner.imageUrl || '',
      navigateLink: banner.navigateLink || '',
      startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
      endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
      isActive: banner.isActive,
      priority: banner.priority,
    });
    setDesktopImageFile(null);
    setMobileImageFile(null);
    setImageUrlFile(null);
    dispatch(clearUploadState());
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setDisplayColorPicker(false); // Close color picker when modal closes
    dispatch(clearBannerDetails());
    dispatch(clearUploadState());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSubmit = {
      ...formData,
      bannerNumber: Number(formData.bannerNumber),
      priority: Number(formData.priority),
      startDate: formData.startDate ? new Date(formData.startDate) : undefined,
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
    };

    // Basic validation
    if (!dataToSubmit.title || !dataToSubmit.position || !dataToSubmit.bannerNumber) {
      toast.error('Title, Banner Number, and Position are required.');
      return;
    }

    if (
      dataToSubmit.position.includes('advertisement') &&
      !dataToSubmit.imageUrl
    ) {
      toast.error('Image URL is required for advertisement banners.');
      return;
    }

    if (
      !dataToSubmit.position.includes('advertisement') &&
      (dataToSubmit.desktopImage.length === 0 || dataToSubmit.mobileImage.length === 0)
    ) {
      toast.error('Desktop and Mobile images are required for normal banners.');
      return;
    }

    if (currentBanner) {
      await dispatch(updateBannerByNumber({ bannerNumber: currentBanner.bannerNumber, bannerData: dataToSubmit }));
    } else {
      await dispatch(createBanner(dataToSubmit));
    }
    setIsModalOpen(false);
    dispatch(fetchBanners()); // Refresh the list
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      await dispatch(deleteBannerById(id));
      dispatch(fetchBanners()); // Refresh the list
    }
  };

  const filteredBanners = filterPosition
    ? banners.filter((banner) => banner.position === filterPosition)
    : banners;

  const isAdvertisement = formData.position.includes('advertisement');

  // Color picker handlers
  const handleClickColorPicker = () => {
    setDisplayColorPicker(!displayColorPicker);
  };

  const handleCloseColorPicker = () => {
    setDisplayColorPicker(false);
  };

  const handleChangeColor = (color) => {
    setFormData((prev) => ({ ...prev, postBg: color.hex }));
  };

  if (loading && !isModalOpen) {
    return <div className="text-center py-4 text-lg">Loading banners...</div>;
  }

  if (error && !isModalOpen) {
    return <div className="text-center py-4 text-lg text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">Banner Manager</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center shadow-md transition duration-300"
        >
          <Plus className="mr-2" size={20} /> Add New Banner
        </button>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow-md flex items-center space-x-4">
        <Filter size={20} className="text-gray-600" />
        <label htmlFor="filterPosition" className="text-gray-700 font-medium">Filter by Position:</label>
        <select
          id="filterPosition"
          name="filterPosition"
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 flex-grow"
        >
          <option value="">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
            </option>
          ))}
        </select>
        {filterPosition && (
          <button
            onClick={() => setFilterPosition('')}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {filteredBanners.length === 0 ? (
        <div className="text-center py-8 text-gray-600 text-lg">No banners found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBanners.map((banner) => (
                <tr key={banner._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{banner.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{banner.bannerNumber}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{banner.position.replace(/_/g, ' ')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {banner.isActive ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactive</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{banner.priority}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {banner.startDate ? new Date(banner.startDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {banner.endDate ? new Date(banner.endDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openEditModal(banner)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit Banner"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(banner._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Banner"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Banner Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">{currentBanner ? 'Edit Banner' : 'Create New Banner'}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="bannerNumber" className="block text-sm font-medium text-gray-700">Banner Number</label>
                  <input
                    type="number"
                    id="bannerNumber"
                    name="bannerNumber"
                    value={formData.bannerNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                  <select
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a position</option>
                    {positions.map((pos) => (
                      <option key={pos} value={pos}>
                        {pos.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Conditional Image Upload Fields */}
              {isAdvertisement ? (
                // Advertisement fields
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL (for Advertisements)</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <input
                      type="file"
                      id="imageUrlFile"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'imageUrl')}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleUploadImage(imageUrlFile, 'imageUrl')}
                      disabled={!imageUrlFile || uploadingImage}
                      className={`py-2 px-4 rounded-md text-white font-semibold flex items-center ${
                        !imageUrlFile || uploadingImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {uploadingImage ? 'Uploading...' : <><ImageIcon className="mr-2" size={18} /> Upload Image</>}
                    </button>
                  </div>
                  {formData.imageUrl && (
                    <div className="mt-2 flex items-center space-x-2">
                      <p className="text-sm text-gray-600 truncate">{formData.imageUrl}</p>
                      <img src={formData.imageUrl} alt="Uploaded" className="w-16 h-16 object-cover rounded-md border" />
                    </div>
                  )}
                  <input
                    type="text"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    placeholder="Or enter image URL directly"
                    className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {/* Post Background for Advertisement banners */}
                  <div>
                    <label htmlFor="postBg" className="block text-sm font-medium text-gray-700">Post Background</label>
                    <div className="relative">
                      <div
                        onClick={handleClickColorPicker}
                        style={{ background: formData.postBg }}
                        className="mt-1 w-full h-10 border border-gray-300 rounded-md shadow-sm cursor-pointer flex items-center justify-center text-gray-800 font-semibold"
                      >
                        {formData.postBg}
                      </div>
                      {displayColorPicker && (
                        <div className="absolute z-10 top-full mt-2">
                          <div className="fixed inset-0" onClick={handleCloseColorPicker} />
                          <SketchPicker color={formData.postBg} onChange={handleChangeColor} />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                // Normal banner fields (desktopImage, mobileImage, postBg)
                <>
                  <div>
                    <label htmlFor="desktopImage" className="block text-sm font-medium text-gray-700">Desktop Images</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="file"
                        id="desktopImageFile"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'desktop')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        multiple
                      />
                      <button
                        type="button"
                        onClick={() => handleUploadImage(desktopImageFile, 'desktop')}
                        disabled={!desktopImageFile || uploadingImage}
                        className={`py-2 px-4 rounded-md text-white font-semibold flex items-center ${
                          !desktopImageFile || uploadingImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {uploadingImage ? 'Uploading...' : <><ImageIcon className="mr-2" size={18} /> Upload</>}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.desktopImage.map((imgUrl, index) => (
                        <div key={index} className="relative group">
                          <img src={imgUrl} alt={`Desktop ${index}`} className="w-20 h-20 object-cover rounded-md border" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('desktop', index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="mobileImage" className="block text-sm font-medium text-gray-700">Mobile Images</label>
                    <div className="flex items-center space-x-2 mt-1">
                      <input
                        type="file"
                        id="mobileImageFile"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, 'mobile')}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        multiple
                      />
                      <button
                        type="button"
                        onClick={() => handleUploadImage(mobileImageFile, 'mobile')}
                        disabled={!mobileImageFile || uploadingImage}
                        className={`py-2 px-4 rounded-md text-white font-semibold flex items-center ${
                          !mobileImageFile || uploadingImage ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {uploadingImage ? 'Uploading...' : <><ImageIcon className="mr-2" size={18} /> Upload</>}
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.mobileImage.map((imgUrl, index) => (
                        <div key={index} className="relative group">
                          <img src={imgUrl} alt={`Mobile ${index}`} className="w-20 h-20 object-cover rounded-md border" />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage('mobile', index)}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove image"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Post Background for Normal Banners */}
                  <div>
                    <label htmlFor="postBg" className="block text-sm font-medium text-gray-700">Post Background</label>
                    <div className="relative">
                      <div
                        onClick={handleClickColorPicker}
                        style={{ background: formData.postBg }}
                        className="mt-1 w-full h-10 border border-gray-300 rounded-md shadow-sm cursor-pointer flex items-center justify-center text-gray-800 font-semibold"
                      >
                        {formData.postBg}
                      </div>
                      {displayColorPicker && (
                        <div className="absolute z-10 top-full mt-2">
                          <div className="fixed inset-0" onClick={handleCloseColorPicker} />
                          <SketchPicker color={formData.postBg} onChange={handleChangeColor} />
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="navigateLink" className="block text-sm font-medium text-gray-700">Navigation Link</label>
                <input
                  type="text"
                  id="navigateLink"
                  name="navigateLink"
                  value={formData.navigateLink}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">Is Active</label>
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <input
                    type="number"
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {currentBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManager;