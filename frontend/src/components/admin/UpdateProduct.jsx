import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { X, ImagePlus, Trash } from 'lucide-react';
import { SketchPicker } from 'react-color';
import {
    updateProduct,
    resetProduct,
    selectProductsLoading,
    selectProductsError,
    clearProductDetails,
    fetchProductBySlug,
    selectProductById,
} from '../../store/productSlice';
import { fetchCategories, selectAllCategories } from '../../store/categorySlice';
import {
    uploadImageToCloudinary,
    selectImageUrl,
    selectLoading as selectCloudinaryLoading,
    selectError as selectCloudinaryError,
    clearImageUrl,
} from '../../store/cloundarySlice';
import { toast } from 'react-hot-toast';

const UpdateProductPage = () => {
    const { slugId } = useParams(); // Corrected: useParams returns an object
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const categories = useSelector(selectAllCategories);
    const productDetails = useSelector(selectProductById);
    const imageUrl = useSelector(selectImageUrl);
    const cloudinaryLoading = useSelector(selectCloudinaryLoading);
    const cloudinaryError = useSelector(selectCloudinaryError);
    const productLoading = useSelector(selectProductsLoading);
    const productError = useSelector(selectProductsError);

    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [basePrice, setBasePrice] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState([]);
    const [newTag, setNewTag] = useState('');
    const [availableColors, setAvailableColors] = useState([]);
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [newSize, setNewSize] = useState('');
    const [uploadingImageForColorIndex, setUploadingImageForColorIndex] = useState(null);

    useEffect(() => {
    dispatch(fetchCategories());
    console.log('slugId from useParams:', slugId);
    if (slugId) {
        dispatch(fetchProductBySlug(slugId));
    }
    return () => {
        dispatch(clearProductDetails());
    };
}, [dispatch, slugId]);

useEffect(() => {
    if (productDetails) {
        console.log('Fetched product details:', productDetails);
        setName(productDetails.name || '');
        setSlug(productDetails.slug || '');
        setDescription(productDetails.description || '');
        setBrand(productDetails.brand || '');
        setBasePrice(productDetails.basePrice ? productDetails.basePrice.toString() : '');
        setCategory(productDetails.category?._id || '');
        setTags(productDetails.tags || []);
        setAvailableColors(productDetails.availableColors || []);
    }
}, [productDetails]);

    useEffect(() => {
        if (cloudinaryError) {
            toast.error(cloudinaryError);
            dispatch(clearImageUrl());
            setUploadingImageForColorIndex(null); // Clear loading state on error
        }
    }, [cloudinaryError, dispatch]);

    useEffect(() => {
        if (productError) {
            toast.error(productError);
            dispatch(resetProduct());
        }

        if (productLoading === 'succeeded' && productError === null) {
            toast.success('Product updated successfully!');
            dispatch(resetProduct());
            // DO NOT call onBack() here. Let the user stay on the edit page.
        } else if (productLoading === 'failed') {
            // Error toast is already handled above
            dispatch(resetProduct());
        }
    }, [productLoading, productError, dispatch]); // Removed 'navigate' and 'onBack'

    const handleColorChange = (color) => {
        const updatedColors = [...availableColors];
        updatedColors[selectedColorIndex].color = color.hex;
        setAvailableColors(updatedColors);
    };

    const handleImageUpload = (e, imageType, colorIndex) => {
        const file = e.target.files[0];
        if (file) {
            setUploadingImageForColorIndex(colorIndex); // Set loading state for this color
            dispatch(uploadImageToCloudinary(file)).then((result) => {
                setUploadingImageForColorIndex(null); // Clear loading state
                if (result.payload && typeof result.payload === 'string') {
                    const updatedColors = [...availableColors];
                    updatedColors[colorIndex].images[imageType] = result.payload;
                    setAvailableColors(updatedColors);
                }
            });
        }
    };

    const handleRemoveImage = (imageType, colorIndex) => {
        const updatedColors = [...availableColors];
        updatedColors[colorIndex].images[imageType] = '';
        setAvailableColors(updatedColors);
        dispatch(clearImageUrl()); // Optionally clear the global image URL state
    };

    const handleInputChange = (e, index, field) => {
        const { value } = e.target;
        const updatedColors = [...availableColors];
        updatedColors[index][field] = value;
        setAvailableColors(updatedColors);
    };

    const handleprintingPriceChange = (e, index, location) => {
        const { value } = e.target;
        const updatedColors = [...availableColors];
        updatedColors[index].printingPrices[location] = parseInt(value, 10) || 0;
        setAvailableColors(updatedColors);
    };

    const handleAddColor = () => {
        setAvailableColors([
            ...availableColors,
            {
                color: '#f0f0f0',
                images: { front: '', back: '', leftSleeve: '', rightSleeve: '', additional: [] },
                printingPrices: { front: 0, back: 0, sleeve: 0 },
                sizes: ['S', 'M', 'L'],
                price: '',
                inventory: '',
            },
        ]);
    };

    const handleRemoveColor = (indexToRemove) => {
        if (availableColors.length > 1) {
            setAvailableColors(availableColors.filter((_, index) => index !== indexToRemove));
            if (selectedColorIndex >= indexToRemove && selectedColorIndex > 0) {
                setSelectedColorIndex(selectedColorIndex - 1);
            }
        } else {
            toast.error('At least one color is required.');
        }
    };

    const handleAddTag = () => {
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleAddSize = (index) => {
        if (newSize.trim()) {
            const updatedColors = [...availableColors];
            if (!updatedColors[index].sizes.includes(newSize.trim().toUpperCase())) {
                updatedColors[index].sizes = [...updatedColors[index].sizes, newSize.trim().toUpperCase()];
                setAvailableColors(updatedColors);
            } else {
                toast.error('Size already exists for this color.');
            }
            setNewSize('');
        }
    };

    const handleRemoveSize = (colorIndex, sizeToRemove) => {
        const updatedColors = [...availableColors];
        updatedColors[colorIndex].sizes = updatedColors[colorIndex].sizes.filter(
            (size) => size !== sizeToRemove
        );
        setAvailableColors(updatedColors);
    };

const handleSubmit = (e) => {
        e.preventDefault();
        if (!productDetails?._id) {
            toast.error('Product details not loaded yet. Please try again.');
            return;
        }
        const productData = {
            id: productDetails._id, // Now we can safely access _id
            name,
            slug,
            description,
            brand,
            basePrice: parseFloat(basePrice),
            category,
            tags,
            availableColors,
        };
        dispatch(updateProduct(productData));
    };

    if (!productDetails && slugId) {
        return (
            <div className="flex justify-center items-center h-screen">
                <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="ml-2">Loading product details...</span>
            </div>
        );
    }

    if (!productDetails && !slugId) { // Corrected condition
        return <div>Error: No product ID provided for editing.</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
                <h1 className="text-2xl font-semibold mb-6 text-gray-800">Edit Product</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                    {/* Basic Information */}
                    <div className="bg-gray-50 p-4 rounded-md shadow-inner">
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">Basic Information</h2>
                        <div className="mb-2">
                            <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-1">
                                Name:
                            </label>
                            <input
                                type="text"
                                id="name"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            {name && <p className="text-gray-500 text-xs mt-1">Generated Slug: {name.toLowerCase().replace(/[\s-]+/g, '-')}</p>}
                        </div>
                        <div className="mb-2">
                            <label htmlFor="slug" className="block text-gray-700 text-sm font-bold mb-1">
                                Slug (optional, auto-generated):
                            </label>
                            <input
                                type="text"
                                id="slug"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={slug}
                                onChange={(e) => setSlug(e.target.value)}
                            />
                            {slug && <p className="text-gray-500 text-xs mt-1">{slug}</p>}
                        </div>
                        <div className="mb-2">
                            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-1">
                                Description:
                            </label>
                            <textarea
                                id="description"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-24"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                            {description && <p className="text-gray-500 text-xs mt-1">{description.substring(0, 100)}...</p>}
                        </div>
                        <div className="mb-2">
                            <label htmlFor="brand" className="block text-gray-700 text-sm font-bold mb-1">
                                Brand:
                            </label>
                            <input
                                type="text"
                                id="brand"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                value={brand}
                                onChange={(e) => setBrand(e.target.value)}
                            />
                            {brand && <p className="text-gray-500 text-xs mt-1">{brand}</p>}
                        </div>
                        <div className="mb-2">
                            <label htmlFor="basePrice" className="block text-gray-700 text-sm font-bold mb-1">
                                Base Price:
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="basePrice"
                                    className="shadow appearance-none border rounded w-full py-2 pl-3 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={basePrice}
                                    onChange={(e) => setBasePrice(e.target.value)}
                                    required
                                    min="0"
                                />
                            </div>
                            {basePrice && <p className="text-gray-500 text-xs mt-1">₹{basePrice}</p>}
                        </div>
                        <div className="mb-2">
                            <label htmlFor="category" className="block text-gray-700 text-sm font-bold mb-1">
                                Category:
                            </label>
                            <div className="relative">
                                <select
                                    id="category"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                            {category && <p className="text-gray-500 text-xs mt-1">Selected Category ID: {category}</p>}
                        </div>
                        <div className="mb-2">
                            <label className="block text-gray-700 text-sm font-bold mb-1">Tags:</label>
                            <div className="flex items-center mb-1">
                                <input
                                    type="text"
                                    className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    placeholder="Add a tag"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTag}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="inline-flex items-center bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                                    >
                                        {tag}
                                        <button
                                            type="button"
                                            className="ml-1 text-gray-500 hover:text-gray-700 focus:outline-none"
                                            onClick={() => handleRemoveTag(tag)}
                                        >
                                          <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Available Colors */}
                    <div>
                        <h2 className="text-xl font-semibold mb-3 text-gray-700">Available Colors</h2>
                        {availableColors.map((colorData, index) => (
                            <div key={index} className="mb-6 p-4 border rounded shadow-sm bg-white">
                                <div className="flex justify-between items-center mb-3">
                                    <h3 className="font-semibold text-lg text-gray-800">Color {index + 1}</h3>
                                    {availableColors.length > 1 && (
                                        <button
                                            type="button"
                                            className="text-red-500 hover:text-red-700 focus:outline-none"
                                            onClick={() => handleRemoveColor(index)}
                                        >
                                            <Trash size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Color Picker */}
                                <div className="flex items-center mb-3">
                                    <div
                                        className="w-8 h-8 rounded-full cursor-pointer shadow"
                                        style={{ backgroundColor: colorData.color }}
                                        onClick={() => {
                                            setSelectedColorIndex(index);
                                            setShowColorPicker(!showColorPicker);
                                        }}
                                    />
                                    <span className="ml-2 text-gray-700">{colorData.color.toUpperCase()}</span>
                                </div>
                                {showColorPicker && selectedColorIndex === index && (
                                    <div className="mb-3">
                                        <SketchPicker color={colorData.color} onChange={handleColorChange} />
                                    </div>
                                )}

                                {/* Images */}
                                <div className="flex flex-wrap gap-3 mb-3">
                                    {Object.entries(colorData.images).map(([key, value]) => (
                                        <div key={key}>
                                            <label className="block text-gray-700 text-sm font-bold mb-1 capitalize">
                                                {key}:
                                            </label>
                                            {value ? (
                                                <div className="relative w-fit h-fit">
                                                    <img src={value} alt={key} className="w-24 h-24 object-cover rounded border shadow-sm" />
                                                    <button
                                                        type="button"
                                                        className="absolute top-0 right-0 bg-gray-300 rounded-full w-6 h-6 flex items-center justify-center text-red-500 hover:text-red-700 focus:outline-none"
                                                        onClick={() => handleRemoveImage(key, index)}
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <label className="w-24 h-24 border-dashed border-2 border-gray-400 rounded flex items-center justify-center cursor-pointer shadow-sm">
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        onChange={(e) => handleImageUpload(e, key, index)}
                                                    />
                                                    <ImagePlus size={24} className="text-gray-400" />
                                                </label>
                                            )}
                                            {uploadingImageForColorIndex === index && (
                                                <div className="text-blue-500 text-xs mt-1">Uploading...</div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Printing Prices */}
                                <div className="grid grid-cols-3 gap-3 mb-3">
                                    {Object.entries(colorData.printingPrices).map(([location, price]) => (
                                        <div key={location}>
                                            <label
                                                htmlFor={`printingPrice-${index}-${location}`}
                                                className="block text-gray-700 text-sm font-bold mb-1 capitalize"
                                            >
                                                Printing Price ({location}):
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    id={`printingPrice-${index}-${location}`}
                                                    className="shadow appearance-none border rounded w-full py-2 pl-3 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    value={price}
                                                    onChange={(e) => handlePrintingPriceChange(e, index, location)}
                                                    min="0"
                                                />
                                            </div>
                                            {price > 0 && <p className="text-gray-500 text-xs mt-1">₹{price}</p>}
                                        </div>
                                    ))}
                                </div>

                                {/* Sizes */}
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">Sizes:</label>
                                    <div className="flex items-center mb-2">
                                        <input
                                            type="text"
                                            className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                                            value={newSize}
                                            onChange={(e) => setNewSize(e.target.value)}
                                            placeholder="Add size (e.g., XL)"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleAddSize(index)}
                                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline text-sm"
                                        >
                                            Add
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {colorData.sizes.map((size) => (
                                            <span
                                                key={size}
                                                className="inline-flex items-center bg-orange-200 rounded-full px-3 py-1 text-sm font-semibold text-orange-500"
                                            >
                                                {size}
                                                <button
                                                    type="button"
                                                    className="ml-1 text-orange-500 font-semibold hover:text-gray-700 focus:outline-none"
                                                    onClick={() => handleRemoveSize(index, size)}
                                                >
                                                    <X size={12} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Price and Inventory */}
                                <div className="grid grid-cols-2 gap-3 mt-4">
                                    <div>
                                        <label
                                            htmlFor={`price-${index}`}
                                            className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                            Price:
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id={`price-${index}`}
                                                className="shadow appearance-none border rounded w-full py-2 pl-3 pr-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                value={colorData.price}
                                                onChange={(e) => handleInputChange(e, index, 'price')}
                                                required
                                                min="0"
                                            />
                                        </div>
                                        {colorData.price && <p className="text-gray-500 text-xs mt-1">₹{colorData.price}</p>}
                                    </div>
                                    <div>
                                        <label
                                            htmlFor={`inventory-${index}`}
                                            className="block text-gray-700 text-sm font-bold mb-2"
                                        >
                                            Inventory:
                                        </label>
                                        <input
                                            type="number"
                                            id={`inventory-${index}`}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            value={colorData.inventory}
                                            onChange={(e) => handleInputChange(e, index, 'inventory')}
                                            required
                                            min="0"
                                        />
                                        {colorData.inventory >= 0 && (
                                            <p className="text-gray-500 text-xs mt-1">{colorData.inventory} in stock</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={handleAddColor}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
                        >
                            Add New Color
                        </button>
                    </div>

                    {/* Submit and Cancel Buttons */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            className={`bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline ${
                                productLoading === 'pending' || cloudinaryLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={productLoading === 'pending' || cloudinaryLoading}
                        >
                            {productLoading === 'pending' || cloudinaryLoading ? 'Updating...' : 'Update Product'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateProductPage;