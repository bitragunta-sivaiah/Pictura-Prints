import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  uploadImage,
  clearCategoryDetails,
  clearUploadedImageUrl,
  selectAllCategories,
  selectCategoryById,
  selectCategoriesLoading,
  selectCategoriesError,
  selectIsUploadingImage,
  selectUploadedImageUrl,
  selectUploadImageError,
  fetchCategoryById,
} from '../../store/categorySlice';
import { toast } from 'react-hot-toast';
import { Plus, Edit, Trash, Upload, X, ImagePlus } from 'lucide-react';
import { debounce } from 'lodash';

// Reusable Components (Styled with Tailwind CSS)
const Loader = ({ message }) => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    {message && <p className="ml-2 text-gray-600">{message}</p>}
  </div>
);

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
      <div className="relative bg-white w-full max-w-md rounded-lg shadow-xl p-6">
        <div className="flex items-start justify-between mb-4 border-b border-gray-200 pb-2">
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close modal</span>
          </button>
        </div>
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
};

const InputField = ({ label, type, name, value, onChange, required, placeholder }) => (
  <div className="mb-4">
    <label htmlFor={name} className="block text-gray-700 text-sm font-bold mb-2">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {type === 'textarea' ? (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        placeholder={placeholder}
      />
    )}
  </div>
);

const Button = ({ children, onClick, primary, secondary, danger, disabled, loading, size = 'medium', type = 'button' }) => {
  const baseClasses = 'font-semibold rounded focus:outline-none flex  items-center gap-1 shadow-sm transition duration-150 ease-in-out';
  const sizeClasses = size === 'small' ? 'py-1 px-2 text-sm' : 'py-2 px-4';
  const primaryClasses = primary ? 'bg-blue-500 hover:bg-blue-700 text-white' : '';
  const secondaryClasses = secondary ? 'bg-gray-300 hover:bg-gray-400 text-gray-700' : '';
  const dangerClasses = danger ? 'bg-red-500 hover:bg-red-700 text-white' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const loadingClasses = loading ? 'animate-pulse cursor-wait' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses} ${primaryClasses} ${secondaryClasses} ${dangerClasses} ${disabledClasses} ${loadingClasses}`}
      disabled={disabled || loading}
    >
      {loading ? <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white border-solid mr-2"></span> : null}
      {children}
    </button>
  );
};

const CategoryManager = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const categoryDetails = useSelector(selectCategoryById);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);
  const uploadingImage = useSelector(selectIsUploadingImage);
  const uploadedImageUrl = useSelector(selectUploadedImageUrl);
  const uploadImageError = useSelector(selectUploadImageError);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentCategory, setCurrentCategory] = useState({ _id: null, name: '', description: '', imageUrl: '' });
  const [imageFile, setImageFile] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (categoryDetails) {
      setCurrentCategory(categoryDetails);
    }
  }, [categoryDetails]);

  useEffect(() => {
    if (uploadedImageUrl) {
      setCurrentCategory(prev => ({ ...prev, imageUrl: uploadedImageUrl }));
      setImageFile(null);
    }
  }, [uploadedImageUrl]);

  useEffect(() => {
    setFilteredCategories(
      categories.filter(cat =>
        cat.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        cat.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      )
    );
  }, [categories, debouncedSearchTerm]);

  const debouncedSearch = useCallback(
    debounce((term) => {
      setDebouncedSearchTerm(term);
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const openCreateModal = () => {
    setCurrentCategory({ _id: null, name: '', description: '', imageUrl: '' });
    setImageFile(null);
    dispatch(clearUploadedImageUrl());
    setIsCreateModalOpen(true);
  };

  const openEditModal = (category) => {
    dispatch(fetchCategoryById(category._id));
    dispatch(clearUploadedImageUrl());
    setIsEditModalOpen(true);
  };

  const closeCreateModal = () => setIsCreateModalOpen(false);
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    dispatch(clearCategoryDetails());
    setCurrentCategory({ _id: null, name: '', description: '', imageUrl: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentCategory(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleImageUpload = () => {
    if (imageFile) {
      dispatch(uploadImage(imageFile));
    } else if (!currentCategory.imageUrl && currentCategory._id) {
      toast.error('Please select an image to upload for the category.');
    } else if (!currentCategory.imageUrl && !currentCategory._id && imageFile) {
      dispatch(uploadImage(imageFile));
    }
  };

  const handleRemoveImage = () => {
    setCurrentCategory(prev => ({ ...prev, imageUrl: '' }));
    dispatch(clearUploadedImageUrl());
    setImageFile(null);
  };

  const handleCreateCategory = () => {
    if (!currentCategory.name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    const slug = currentCategory.name.toLowerCase().replace(/\s+/g, '-');
    dispatch(createCategory({ ...currentCategory, slug }));
    closeCreateModal();
  };

  const handleUpdateCategory = () => {
    if (!currentCategory.name.trim()) {
      toast.error('Category name is required.');
      return;
    }
    if (categoryDetails?._id) {
      const slug = currentCategory.name.toLowerCase().replace(/\s+/g, '-');
      dispatch(updateCategory({ id: categoryDetails._id, categoryData: { ...currentCategory, slug } }));
      closeEditModal();
    }
  };

  const handleDeleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory(id));
    }
  };

  if (loading) {
    return <Loader message="Fetching categories..." />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Category Management</h1>
        <Button onClick={openCreateModal} primary>
          <Plus className="mr-2 h-4 w-4" />
          Create New Category
        </Button>
      </div>

      <div className="mb-4">
        <InputField
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {filteredCategories.length > 0 ? (
        <div className="overflow-x-auto shadow-md rounded-md">
          <table className="w-full table-auto">
            <thead className="bg-gray-100 border-b-2 border-gray-200">
              <tr className="text-left">
                <th className="py-3 px-4 font-semibold text-gray-600">Name</th>
                <th className="py-3 px-4 font-semibold text-gray-600">Slug</th>
                <th className="py-3 px-4 font-semibold text-gray-600">Description</th>
                {/* <th className="py-3 px-4 font-semibold text-gray-600">Image</th> */}
                <th className="py-3 px-4 font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredCategories.map(category => (
                <tr key={category._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="py-3 px-4">{category.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">{category.slug}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{category.description}</td>
                  {/* <td className="py-3 px-4">
                    {category.imageUrl && (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-10 w-10 object-cover rounded-md shadow-sm"
                      />
                    )}
                  </td> */}
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <Button onClick={() => openEditModal(category)} size="small" >
                        <Edit className="h-4 w-4" />
                        <span className=" ">Edit</span>
                      </Button>
                      <Button onClick={() => handleDeleteCategory(category._id)} size="small" danger>
                        <Trash className="h-4 w-4" />
                        <span className=" ">Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-4 text-gray-500">No categories found.</div>
      )}

      {/* Create Category Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Create New Category">
        <InputField
          label="Name"
          type="text"
          name="name"
          value={currentCategory.name}
          onChange={handleInputChange}
          required
          placeholder="Enter category name"
        />
        <InputField
          label="Description"
          type="textarea"
          name="description"
          value={currentCategory.description}
          onChange={handleInputChange}
          placeholder="Enter category description (optional)"
        />

        <div className="mb-4">
          <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
            Image
          </label>
          <div className="flex items-center space-x-4">
            {currentCategory.imageUrl && (
              <div className="relative">
                <img
                  src={currentCategory.imageUrl}
                  alt="Uploaded"
                  className="h-16 w-16 object-cover rounded-md shadow-sm"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full shadow-md p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {!currentCategory.imageUrl && (
              <>
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="border border-dashed border-gray-400 rounded-md p-2 flex flex-col items-center justify-center">
                    <ImagePlus className="h-6 w-6 text-gray-500 mb-1" />
                    <span className="text-sm text-gray-500">Upload Image</span>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>
                <Button type="button" onClick={handleImageUpload} disabled={!imageFile && !currentCategory.imageUrl} loading={uploadingImage}>
                  <Upload className="mr-2 h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload'}
                </Button>
              </>
            )}
          </div>
          {uploadImageError && <p className="text-red-500 text-xs italic">{uploadImageError}</p>}
        </div>

        <div className="flex justify-end space-x-2">
          <Button secondary onClick={closeCreateModal}>Cancel</Button>
          <Button primary onClick={handleCreateCategory} loading={loading && !categoryDetails}>
            Create
          </Button>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Category">
        {loading && categoryDetails === null ? (
          <Loader message="Fetching category details..." />
        ) : (
          <>
            <InputField
              label="Name"
              type="text"
              name="name"
              value={currentCategory.name}
              onChange={handleInputChange}
              required
              placeholder="Enter category name"
            />
            <InputField
              label="Description"
              type="textarea"
              name="description"
              value={currentCategory.description}
              onChange={handleInputChange}
              placeholder="Enter category description (optional)"
            />

            <div className="mb-4">
              <label htmlFor="edit-image" className="block text-gray-700 text-sm font-bold mb-2">
                Image
              </label>
              <div className="flex items-center space-x-4">
                {currentCategory.imageUrl && (
                  <div className="relative">
                    <img
                      src={currentCategory.imageUrl}
                      alt="Uploaded"
                      className="h-16 w-16 object-cover rounded-md shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full shadow-md p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {!currentCategory.imageUrl && (
                  <>
                    <label htmlFor="edit-image-upload" className="cursor-pointer">
                      <div className="border border-dashed border-gray-400 rounded-md p-2 flex flex-col items-center justify-center">
                        <ImagePlus className="h-6 w-6 text-gray-500 mb-1" />
                        <span className="text-sm text-gray-500">Upload Image</span>
                      </div>
                      <input
                        id="edit-image-upload"
                        type="file"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                    <Button type="button" onClick={handleImageUpload} disabled={!imageFile && !currentCategory.imageUrl} loading={uploadingImage}>
                      <Upload className="mr-2 h-4 w-4" />
                      {uploadingImage ? 'Uploading...' : 'Upload'}
                    </Button>
                  </>
                )}
              </div>
              {uploadImageError && <p className="text-red-500 text-xs italic">{uploadImageError}</p>}
            </div>

            <div className="flex justify-end space-x-2">
              <Button secondary onClick={closeEditModal}>Cancel</Button>
              <Button primary onClick={handleUpdateCategory} loading={loading && categoryDetails !== null}>
                Update
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default CategoryManager;