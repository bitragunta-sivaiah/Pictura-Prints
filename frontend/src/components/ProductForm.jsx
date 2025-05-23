import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    createProduct,
    updateProduct,
    fetchProductById,
    resetProduct,
} from '../store/productSlice';
import {
    selectAllCategories,
    fetchCategories,
} from '../store/categorySlice';
import { uploadImageToCloudinary, clearImageUrl, selectImageUrl, selectUploadProgress } from '../store/cloundarySlice';
import { toast } from 'react-hot-toast';
import { Loader2, ImagePlus, Trash, Plus, Minus, XCircle, Palette } from 'lucide-react';
import { SketchPicker } from 'react-color';

const ProductFormPage = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Selectors
    const categories = useSelector(selectAllCategories);
    const productDetails = useSelector((state) => state.products.product);
    const createLoading = useSelector((state) => state.products.createProductLoading);
    const createError = useSelector((state) => state.products.createProductError);
    const updateLoading = useSelector((state) => state.products.updateProductLoading);
    const updateError = useSelector((state) => state.products.updateProductError);
    const fetchProductLoading = useSelector((state) => state.products.fetchProductDetailsLoading);
    const fetchProductError = useSelector((state) => state.products.fetchProductDetailsError);
    const cloudinaryImageUrl = useSelector(selectImageUrl);
    const uploadProgress = useSelector(selectUploadProgress);
    const uploadLoading = useSelector((state) => state.cloudinary.loading);
    const uploadError = useSelector((state) => state.cloudinary.error);

    // State for the form
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [brand, setBrand] = useState('');
    const [basePrice, setBasePrice] = useState(0);
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState('');
    const [availableColors, setAvailableColors] = useState([
        {
            color: '#FFFFFF',
            images: { front: '', back: '', leftSleeve: '', rightSleeve: '', additional: [] },
            printingPrices: { front: 0, back: 0, sleeve: 0 },
            sizes: ['S', 'M', 'L'], // Default sizes
            price: 0,
            stock: 0,
            showColorPicker: false,
        },
    ]);
    const [currentColorIndex, setCurrentColorIndex] = useState(null);
    const [currentImageType, setCurrentImageType] = useState('');
    const [newSize, setNewSize] = useState('');

    // Fetch categories on component mount
    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    // Fetch product details if it's an update
    useEffect(() => {
        if (productId) {
            dispatch(fetchProductById(productId));
        }
        return () => {
            dispatch(resetProduct()); // Clean up product state on unmount
            dispatch(clearImageUrl()); // Clean up cloudinary URL
        };
    }, [dispatch, productId]);

    // Populate form with product details for update
    useEffect(() => {
        if (productDetails) {
            setName(productDetails.name || '');
            setDescription(productDetails.description || '');
            setBrand(productDetails.brand || '');
            setBasePrice(productDetails.basePrice || 0);
            setCategory(productDetails.category?._id || '');
            setTags(productDetails.tags?.join(',') || '');
            setAvailableColors(productDetails.availableColors || [
                {
                    color: '#FFFFFF',
                    images: { front: '', back: '', leftSleeve: '', rightSleeve: '', additional: [] },
                    printingPrices: { front: 0, back: 0, sleeve: 0 },
                    sizes: ['S', 'M', 'L'], // Default sizes if none exist
                    price: 0,
                    stock: 0,
                    showColorPicker: false,
                },
            ]);
        }
    }, [productDetails]);

    // Handle image upload
    const handleImageUpload = useCallback(
        (file, colorIndex, imageType) => {
            if (file) {
                setCurrentColorIndex(colorIndex);
                setCurrentImageType(imageType);
                dispatch(uploadImageToCloudinary(file));
            }
        },
        [dispatch]
    );

    useEffect(() => {
        if (cloudinaryImageUrl && currentColorIndex !== null && currentImageType) {
            setAvailableColors((prevColors) =>
                prevColors.map((colorObj, index) => {
                    if (index === currentColorIndex) {
                        return {
                            ...colorObj,
                            images: {
                                ...colorObj.images,
                                [currentImageType]: cloudinaryImageUrl,
                            },
                        };
                    }
                    return colorObj;
                })
            );
            dispatch(clearImageUrl()); // Clear the URL after using it
            setCurrentColorIndex(null);
            setCurrentImageType('');
        }
    }, [cloudinaryImageUrl, currentColorIndex, currentImageType, dispatch]);

    const handleImageInputChange = (event, colorIndex, imageType) => {
        const file = event.target.files[0];
        handleImageUpload(file, colorIndex, imageType);
    };

    // Handle changes in form inputs
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        switch (name) {
            case 'name':
                setName(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'brand':
                setBrand(value);
                break;
            case 'basePrice':
                setBasePrice(Number(value));
                break;
            case 'category':
                setCategory(value);
                break;
            case 'tags':
                setTags(value);
                break;
            default:
                break;
        }
    };

    // Handle changes within availableColors array
    const handleColorChange = (index, newColor) => {
        setAvailableColors(prevColors =>
            prevColors.map((colorObj, i) =>
                i === index ? { ...colorObj, color: newColor } : colorObj
            )
        );
    };

    const handlePrintingPriceChange = (colorIndex, area, value) => {
        setAvailableColors((prevColors) =>
            prevColors.map((colorObj, index) => {
                if (index === colorIndex) {
                    return {
                        ...colorObj,
                        printingPrices: {
                            ...colorObj.printingPrices,
                            [area]: Number(value),
                        },
                    };
                }
                return colorObj;
            })
        );
    };

    const handleSizeChange = (colorIndex, index, value) => {
        setAvailableColors((prevColors) =>
            prevColors.map((colorObj, cIndex) => {
                if (cIndex === colorIndex) {
                    const updatedSizes = [...colorObj.sizes];
                    updatedSizes[index] = value.toUpperCase(); // Convert to uppercase
                    return { ...colorObj, sizes: updatedSizes };
                }
                return colorObj;
            })
        );
    };

    const handleAddSize = (colorIndex) => {
        if (!newSize.trim()) return;

        setAvailableColors((prevColors) =>
            prevColors.map((colorObj, index) => {
                if (index === colorIndex) {
                    const sizeToAdd = newSize.trim().toUpperCase();
                    if (colorObj.sizes.includes(sizeToAdd)) {
                        toast.error(`Size "${sizeToAdd}" already exists for this color.`);
                        return colorObj; // Return original state to avoid modification
                    }
                    return { ...colorObj, sizes: [...colorObj.sizes, sizeToAdd] };
                }
                return colorObj;
            })
        );
        setNewSize(''); // Clear the input after adding
    };

    const handleRemoveSize = (colorIndex, index) => {
        setAvailableColors((prevColors) =>
            prevColors.map((colorObj, cIndex) =>
                cIndex === colorIndex
                    ? { ...colorObj, sizes: colorObj.sizes.filter((_, i) => i !== index) }
                    : colorObj
            )
        );
    };

    const handleAdditionalImageChange = (colorIndex, index, value) => {
        setAvailableColors((prevColors) =>
            prevColors.map((colorObj, cIndex) =>
                cIndex === colorIndex
                    ? {
                        ...colorObj,
                        images: {
                            ...colorObj.images,
                            additional: colorObj.images.additional.map((img, i) => (i === index ? value : img)),
                        },
                    }
                    : colorObj
            )
        );
    };

    const handleAddAdditionalImage = (colorIndex) => {
        setAvailableColors((prevColors) =>
            prevColors.map((colorObj, index) =>
                index === colorIndex
                    ? { ...colorObj, images: { ...colorObj.images, additional: [...colorObj.images.additional, ''] } }
                    : colorObj
            )
        );
    };

    const handleRemoveAdditionalImage = (colorIndex, index) => {
        setAvailableColors((prevColors) =>
            prevColors.map((colorObj, cIndex) =>
                cIndex === colorIndex
                    ? {
                        ...colorObj,
                        images: {
                            ...colorObj.images,
                            additional: colorObj.images.additional.filter((_, i) => i !== index),
                        },
                    }
                    : colorObj
            )
        );
    };

    const handlePriceStockChange = (colorIndex, event) => {
        if (event && event.target) {
            const { name, value } = event.target;
            const numValue = Number(value);
            setAvailableColors((prevColors) =>
                prevColors.map((colorObj, index) =>
                    index === colorIndex ? { ...colorObj, [name]: numValue } : colorObj
                )
            );
        } else {
            console.error("Event or event.target is undefined in handlePriceStockChange", event);
        }
    };

    const handleAddColor = () => {
        setAvailableColors((prevColors) => [
            ...prevColors,
            {
                color: '#FFFFFF',
                images: { front: '', back: '', leftSleeve: '', rightSleeve: '', additional: [] },
                printingPrices: { front: 0, back: 0, sleeve: 0 },
                sizes: ['S', 'M', 'L'], // Default sizes for new color
                price: 0,
                stock: 0,
                showColorPicker: false,
            },
        ]);
    };

    const handleRemoveColor = (index) => {
        if (availableColors.length > 1) {
            setAvailableColors(availableColors.filter((_, i) => i !== index));
        } else {
            toast.error('At least one color is required.');
        }
    };

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        const productData = {
            name,
            description,
            brand,
            basePrice,
            category,
            tags: tags.split(',').map((tag) => tag.trim()),
            availableColors: availableColors.map(colorObj => ({
                ...colorObj,
                inventory: undefined, // Remove the old 'inventory' if it exists
                stock: colorObj.stock,
                price: colorObj.price, // Ensure price is included
            })),
        };

        if (productId) {
            dispatch(updateProduct({ productId, productData }))
                .unwrap()
                .then(() => {
                    toast.success('Product updated successfully!');
                    navigate('/admin/products'); // Redirect after successful update
                })
                .catch((error) => {
                    // Error is handled by the slice's rejected case and toast
                    console.error('Update failed:', error);
                });
        } else {
            dispatch(createProduct(productData))
                .unwrap()
                .then(() => {
                    toast.success('Product created successfully!');
                    navigate('/admin/products'); // Redirect after successful creation
                })
                .catch((error) => {
                    // Error is handled by the slice's rejected case and toast
                    console.error('Create failed:', error);
                });
        }
    };

    const isLoading = createLoading === 'pending' || updateLoading === 'pending' || fetchProductLoading === 'pending' || uploadLoading;
    const errorMessage = createError || updateError || fetchProductError || uploadError;

    return (
        <div className="container mx-auto p-8 bg-gray-50 rounded-lg shadow-md">
            <h1 className="text-3xl font-semibold mb-6 text-gray-800">
                {productId ? 'Edit Product' : 'Create New Product'}
            </h1>

            {isLoading && (
                <div className="flex items-center justify-center py-4">
                    <Loader2 className="animate-spin w-6 h-6 mr-2 text-indigo-500" />
                    <span className="text-gray-600">Loading...</span>
                </div>
            )}

            {errorMessage && (
                <div
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                    role="alert"
                >
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{errorMessage}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-md">
                {/* Basic Product Information */}
                <section className="bg-white rounded-md shadow p-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Product Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={name}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                                placeholder="Enter product name"
                            />
                        </div>
                        <div>
                            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
                                Brand
                            </label>
                            <input
                                type="text"
                                id="brand"
                                name="brand"
                                value={brand}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                                placeholder="Enter brand name"
                            />
                        </div>
                        <div>
                            <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700">
                                Base Price (₹)
                            </label>
                            <input
                                type="number"
                                id="basePrice"
                                name="basePrice"
                                value={basePrice}
                                onChange={handleInputChange}
                                required
                                min="0"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                                placeholder="Enter base price"
                            />
                        </div>
                        <div>
                            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                Category
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={category}
                                onChange={handleInputChange}
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={description}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm min-h-10"
                                rows="4"
                                placeholder="Enter product description"
                            />
                        </div>
                        <div className="col-span-full">
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                                Tags (comma-separated)
                            </label>
                            <input
                                type="text"
                                id="tags"
                                name="tags"
                                value={tags}
                                onChange={handleInputChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                                placeholder="e.g., casual, t-shirt, cotton"
                            />
                        </div>
                    </div>
                </section>

                {/* Available Colors Section */}
                <section className="bg-white rounded-md shadow p-4">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center justify-between">
                        Available Colors
                        <button
                            type="button"
                            onClick={handleAddColor}
                            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Color
                        </button>
                    </h2>
                    <div className="space-y-4">
                        {availableColors.map((colorObj, colorIndex) => (
                            <div key={colorIndex} className="border rounded-md p-4 space-y-4 bg-gray-50">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-700 text-lg">Color {colorIndex + 1}</h3>
                                    {availableColors.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveColor(colorIndex)}
                                            className="text-red-500 hover:text-red-700 focus:outline-none"
                                        >
                                            <XCircle className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>

                                {/* Color Picker */}
                                <div className="flex items-center space-x-4">
                                    <div
                                        className="w-10 h-10 rounded-full cursor-pointer shadow-md border border-gray-200 flex items-center justify-center"
                                        style={{ backgroundColor: colorObj.color }}
                                        onClick={() => {
                                            setAvailableColors(prev =>
                                                prev.map((c, i) =>
                                                    i === colorIndex ? { ...c, showColorPicker: !c.showColorPicker } : c
                                                )
                                            );
                                        }}
                                    >
                                        <Palette className="w-5 h-5 text-white" />
                                    </div>
                                    <span className="text-gray-700">{colorObj.color.toUpperCase()}</span>
                                </div>
                                {colorObj.showColorPicker && (
                                    <div className="mt-2">
                                        <SketchPicker
                                            color={colorObj.color}
                                            onChange={(newColor) => handleColorChange(colorIndex, newColor.hex)}
                                        />
                                    </div>
                                )}

                                {/* Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {Object.entries(colorObj.images)
                                            .filter(([key]) => key !== 'additional')
                                            .map(([key, value]) => (
                                                <div key={key} className="relative">
                                                    <label
                                                        htmlFor={`imageInput-${colorIndex}-${key}`}
                                                        className="block text-xs font-medium text-gray-500 capitalize"
                                                    >
                                                        {key}
                                                    </label>
                                                    {value && (
                                                        <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setAvailableColors(prev =>
                                                                        prev.map((c, i) =>
                                                                            i === colorIndex ? { ...c, images: { ...c.images, [key]: '' } } : c
                                                                        )
                                                                    );
                                                                }}
                                                                className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 focus:outline-none"
                                                            >
                                                                <Trash className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <div className="mt-1">
                                                        {value ? (
                                                            <img src={value} alt={key} className="w-full h-20 object-cover rounded" />
                                                        ) : (
                                                            <label
                                                                htmlFor={`imageInput-${colorIndex}-${key}`}
                                                                className="relative block w-full border-2 border-dashed border-gray-300 rounded-md py-3 text-center cursor-pointer hover:border-indigo-500 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                                            >
                                                                <div className="text-gray-500">
                                                                    <ImagePlus className="mx-auto h-6 w-6" />
                                                                    <p className="mt-1 text-xs">Upload image</p>
                                                                </div>
                                                                <input
                                                                    id={`imageInput-${colorIndex}-${key}`}
                                                                    type="file"
                                                                    className="sr-only"
                                                                    onChange={(e) => handleImageInputChange(e, colorIndex, key)}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {/* Additional Images */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images</label>
                                    <div className="space-y-2">
                                        {colorObj.images.additional.map((img, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <input
                                                    type="text"
                                                    value={img}
                                                    onChange={(e) => handleAdditionalImageChange(colorIndex, index, e.target.value)}
                                                    placeholder="Image URL"
                                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveAdditionalImage(colorIndex, index)}
                                                    className="text-red-500 hover:text-red-700 focus:outline-none"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => handleAddAdditionalImage(colorIndex)}
                                            className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 focus:outline-none"
                                        >
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Image URL
                                        </button>
                                    </div>
                                </div>

                                {/* Printing Prices */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Printing Prices (₹)</label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {Object.entries(colorObj.printingPrices).map(([area, price]) => (
                                            <div key={area} className="flex items-center space-x-2">
                                                <label
                                                    htmlFor={`printing-${colorIndex}-${area}`}
                                                    className="text-sm font-medium text-gray-600 capitalize w-20"
                                                >
                                                    {area}:
                                                </label>
                                                <input
                                                    type="number"
                                                    id={`printing-${colorIndex}-${area}`}
                                                    value={price}
                                                    onChange={(e) => handlePrintingPriceChange(colorIndex, area, e.target.value)}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-2"
                                                    min="0"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sizes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Sizes</label>
                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                        {colorObj.sizes.map((size, index) => (
                                            <div key={index} className="flex items-center space-x-1 bg-gray-100 rounded-md px-2 py-1">
                                                <input
                                                    type="text"
                                                    value={size}
                                                    onChange={(e) => handleSizeChange(colorIndex, index, e.target.value)}
                                                    className="w-16 text-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSize(colorIndex, index)}
                                                    className="text-red-500 hover:text-red-700 focus:outline-none text-xs"
                                                >
                                                    <XCircle className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={newSize}
                                                onChange={(e) => setNewSize(e.target.value)}
                                                placeholder="Add Size"
                                                className="w-20 text-sm rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 h-[30px] px-2"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleAddSize(colorIndex)}
                                                className="inline-flex items-center rounded-md bg-indigo-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                            >
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Price and Stock */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor={`price-${colorIndex}`} className="block text-sm font-medium text-gray-700">
                                            Price (₹)
                                        </label>
                                        <input
                                            type="number"
                                            id={`price-${colorIndex}`}
                                            name="price"
                                            value={colorObj.price}
                                            onChange={(e) => handlePriceStockChange(colorIndex, e)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor={`stock-${colorIndex}`} className="block text-sm font-medium text-gray-700">
                                            Stock
                                        </label>
                                        <input
                                            type="number"
                                            id={`stock-${colorIndex}`}
                                            name="stock"
                                            value={colorObj.stock}
                                            onChange={(e) => handlePriceStockChange(colorIndex, e)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-[45px] px-4"
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="pt-6">
                    <button
                        type="submit"
                        className="inline-flex justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        disabled={isLoading === 'pending'}
                    >
                        {productId ? 'Update Product' : 'Create Product'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/products')}
                        className="ml-3 inline-flex justify-center rounded-md bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-300"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductFormPage;