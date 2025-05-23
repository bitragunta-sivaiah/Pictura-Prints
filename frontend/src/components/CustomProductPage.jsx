import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    fetchProductById,
    resetProduct,
    selectProductById,
    selectProductsLoading,
    selectProductsError,
    updateGeneratedImage,
} from '../store/productSlice';
import {
    uploadImageToCloudinary,
    selectImageUrl as selectCloudinaryImageUrl,
    selectLoading as selectCloudinaryLoading,
    selectError as selectCloudinaryError,
    clearImageUrl as clearCloudinaryImageUrl,
} from '../store/cloundarySlice';
import { Loader2, AlertCircle, Upload, Type, Palette, Save, LetterText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const ItemTypes = {
    IMAGE: 'image',
    TEXT: 'text',
};

const initialTextConfig = {
    text: '',
    fontFamily: 'Arial',
    fontSize: 24,
    fontWeight: 'normal',
    fontCase: 'normal',
    color: '#000000',
};

// DraggableImage component
const DraggableImage = ({ src, position, onPositionChange, isDragging }) => {
    const imageRef = useRef(null);
    const [{ drag }, dragRef] = useDrag({
        type: ItemTypes.IMAGE,
        item: { type: ItemTypes.IMAGE },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (monitor.didDrop() && imageRef.current) {
                const dropResult = monitor.getDropResult();
                onPositionChange({
                    x: dropResult.x - imageRef.current.offsetWidth / 2,
                    y: dropResult.y - imageRef.current.offsetHeight / 2,
                });
            }
        },
    });

    return (
        <img
            ref={(node) => {
                dragRef(node);
                imageRef.current = node;
            }}
            src={src}
            alt="Uploaded"
            className="max-w-full max-h-full object-contain absolute cursor-grab shadow-md"
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                opacity: isDragging ? 0.7 : 1,
                transform: 'translate(0, 0)',
            }}
        />
    );
};

// DraggableText component
const DraggableText = ({ textConfig, position, onPositionChange, isDragging }) => {
    const textRef = useRef(null);
    const [{ drag }, dragRef] = useDrag({
        type: ItemTypes.TEXT,
        item: { type: ItemTypes.TEXT },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
        end: (item, monitor) => {
            if (monitor.didDrop() && textRef.current) {
                const dropResult = monitor.getDropResult();
                const rect = textRef.current.getBoundingClientRect();
                onPositionChange({
                    x: dropResult.x - rect.width / 2,
                    y: dropResult.y - rect.height / 2,
                });
            }
        },
    });

    return (
        <div
            ref={(node) => {
                dragRef(node);
                textRef.current = node;
            }}
            className="absolute text-center cursor-grab shadow-md"
            style={{
                fontFamily: textConfig.fontFamily,
                fontSize: `${textConfig.fontSize}px`,
                fontWeight: textConfig.fontWeight,
                textTransform: textConfig.fontCase,
                color: textConfig.color,
                top: `${position.y}px`,
                left: `${position.x}px`,
                opacity: isDragging ? 0.7 : 1,
                transform: 'translate(0, 0)',
                pointerEvents: 'auto',
            }}
        >
            {textConfig.fontCase === 'uppercase' ? textConfig.text.toUpperCase() : textConfig.text}
        </div>
    );
};

const CustomProductDesignPage = () => {
    const { productId } = useParams();
    const dispatch = useDispatch();
    const product = useSelector(selectProductById);
    const productLoading = useSelector(selectProductsLoading);
    const productError = useSelector(selectProductsError);
    const cloudinaryImageUrl = useSelector(selectCloudinaryImageUrl);
    const cloudinaryLoading = useSelector(selectCloudinaryLoading);
    const cloudinaryError = useSelector(selectCloudinaryError);
    const { user } = useSelector(state => state.auth);
    const [selectedColor, setSelectedColor] = useState(null);
    const [productView, setProductView] = useState('front');
    const [customizations, setCustomizations] = useState({
        front: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
        back: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
        leftSleeve: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
        rightSleeve: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
    });
    const productCanvasRef = useRef(null);
    const dropAreaRef = useRef(null);
    const [isOverDrop, setIsOverDrop] = useState(false);
    const [overlayStyle, setOverlayStyle] = useState({
        width: 'w-20 md:w-[160px]',
        height: 'h-24 md:h-48',
        top: 'top-[50%]',
        left: 'left-[50%]',
    });
    const [uploadTextSize, setUploadTextSize] = useState('text-xs md:text-sm');
    const [uploadIconSize, setUploadIconSize] = useState('w-6 h-6 md:w-8 md:h-8');

    useEffect(() => {
        // Added check for productId
        if (productId && user?._id) {
            dispatch(fetchProductById({ productId, userId: user._id }));
        }
        return () => {
            dispatch(resetProduct());
            dispatch(clearCloudinaryImageUrl());
        };
    }, [dispatch, productId, user?._id]);

    useEffect(() => {
        if (product && product.availableColors && product.availableColors.length > 0) {
            setSelectedColor(product.availableColors[0]);
        }
    }, [product]);

    useEffect(() => {
        if (cloudinaryImageUrl) {
            setCustomizations(prev => ({
                ...prev,
                [productView]: {
                    ...prev[productView],
                    image: cloudinaryImageUrl,
                    imagePosition: { x: 50, y: 50 },
                },
            }));
        }
    }, [cloudinaryImageUrl, productView]);

    useEffect(() => {
        if (product && product.generatedImage && user?._id) {
            const userData = product.generatedImage[user._id];
            if (userData) {
                setCustomizations(prev => ({
                    ...prev,
                    front: userData.front ? {
                        image: userData.front.url || null,
                        imagePosition: userData.front.position || { x: 50, y: 50 },
                        textConfig: userData.front.text ? { ...initialTextConfig, ...userData.front.text } : initialTextConfig,
                        textPosition: userData.front.text?.position || { x: 50, y: 50 },
                    } : { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                    back: userData.back ? {
                        image: userData.back.url || null,
                        imagePosition: userData.back.position || { x: 50, y: 50 },
                        textConfig: userData.back.text ? { ...initialTextConfig, ...userData.back.text } : initialTextConfig,
                        textPosition: userData.back.text?.position || { x: 50, y: 50 },
                    } : { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                    leftSleeve: userData.leftSleeve ? {
                        image: userData.leftSleeve.url || null,
                        imagePosition: userData.leftSleeve.position || { x: 50, y: 50 },
                        textConfig: userData.leftSleeve.text ? { ...initialTextConfig, ...userData.leftSleeve.text } : initialTextConfig,
                        textPosition: userData.leftSleeve.text?.position || { x: 50, y: 50 },
                    } : { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                    rightSleeve: userData.rightSleeve ? {
                        image: userData.rightSleeve.url || null,
                        imagePosition: userData.rightSleeve.position || { x: 50, y: 50 },
                        textConfig: userData.rightSleeve.text ? { ...initialTextConfig, ...userData.rightSleeve.text } : initialTextConfig,
                        textPosition: userData.rightSleeve.text?.position || { x: 50, y: 50 },
                    } : { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                }));
            } else {
                // Reset to initial if no user data
                setCustomizations({
                    front: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                    back: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                    leftSleeve: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                    rightSleeve: { image: null, imagePosition: { x: 50, y: 50 }, textConfig: initialTextConfig, textPosition: { x: 50, y: 50 } },
                });
            }
        }
        switch (productView) {
            case 'front':
            case 'back':
                setOverlayStyle({ width: 'w-20  lg:w-[160px]', height: 'h-24 lg:h-48', top: 'top-[50%]', left: 'left-[50%]' });
                setUploadTextSize('text-xs md:text-sm');
                setUploadIconSize('w-6 h-6 md:w-8 md:h-8');
                break;
            case 'leftSleeve':
                setOverlayStyle({ width: 'w-16 lg:w-20', height: 'h-16 lg:h-20', top: 'top-[30%]', left: 'left-[55%]' });
                setUploadTextSize('text-[0.5rem] md:text-xs');
                setUploadIconSize('w-4 h-4 md:w-6 md:h-6');
                break;
            case 'rightSleeve':
                setOverlayStyle({ width: 'w-16 lg:w-20', height: 'h-16 lg:h-20', top: 'top-[30%]', left: 'left-[48%]' });
                setUploadTextSize('text-[0.5rem] md:text-xs');
                setUploadIconSize('w-4 h-4 md:w-6 md:h-6');
                break;
            default:
                setOverlayStyle({ width: 'w-20 lg:w-40', height: 'h-24 lg:h-48', top: 'top-[20%] md:top-[25%]', left: 'left-[30%] md:left-[40%]' });
        }
    }, [product, productView, user?._id]);

    const handleColorSelect = (color) => {
        setSelectedColor(color);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleFile = (file) => {
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomizations(prev => ({
                    ...prev,
                    [productView]: { ...prev[productView], image: reader.result },
                }));
            };
            reader.readAsDataURL(file);
            dispatch(uploadImageToCloudinary(file));
        }
    };

    const handleTextChange = (e) => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: { ...prev[productView], textConfig: { ...prev[productView].textConfig, text: e.target.value } },
        }));
    };

    const handleFontChange = (e) => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: { ...prev[productView], textConfig: { ...prev[productView].textConfig, fontFamily: e.target.value } },
        }));
    };

    const handleFontSizeChange = (e) => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: { ...prev[productView], textConfig: { ...prev[productView].textConfig, fontSize: parseInt(e.target.value, 10) } },
        }));
    };

    const handleFontWeightChange = () => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: {
                ...prev[productView],
                textConfig: { ...prev[productView].textConfig, fontWeight: prev[productView].textConfig.fontWeight === 'normal' ? 'bold' : 'normal' },
            },
        }));
    };

    const handleFontCaseChange = () => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: {
                ...prev[productView],
                textConfig: { ...prev[productView].textConfig, fontCase: prev[productView].textConfig.fontCase === 'normal' ? 'uppercase' : 'normal' },
            },
        }));
    };

    const handleTextColorChange = (e) => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: { ...prev[productView], textConfig: { ...prev[productView].textConfig, color: e.target.value } },
        }));
    };

    const handleImagePositionChange = useCallback((newPosition) => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: { ...prev[productView], imagePosition: newPosition },
        }));
    }, [productView]);

    const handleTextPositionChange = useCallback((newPosition) => {
        setCustomizations(prev => ({
            ...prev,
            [productView]: { ...prev[productView], textPosition: newPosition },
        }));
    }, [productView]);

    const [{ canDrop, isOver }, drop] = useDrop({
        accept: [ItemTypes.IMAGE, ItemTypes.TEXT],
        drop: (item, monitor) => {
            if (dropAreaRef.current) {
                const rect = dropAreaRef.current.getBoundingClientRect();
                const clientOffset = monitor.getClientOffset();
                if (clientOffset) { // check if clientOffset is not null
                    return { x: clientOffset.x - rect.left, y: clientOffset.y - rect.top };
                }
            }
            return undefined;
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
            canDrop: monitor.canDrop(),
        }),
    });

    useEffect(() => {
        setIsOverDrop(isOver);
    }, [isOver]);

    const handleSaveCustomization = async () => {
        if (!product) {
            toast.error('Product details not loaded.');
            return;
        }

        const generatedImageData = {};

        ['front', 'back', 'leftSleeve', 'rightSleeve'].forEach(view => {
            generatedImageData[view] = {
                url: customizations[view]?.image || null,
                position: customizations[view]?.imagePosition || { x: 50, y: 50 }, // Provide a default
                text: customizations[view]?.textConfig?.text
                    ? {
                        ...customizations[view].textConfig,
                        position: customizations[view].textPosition || { x: 50, y: 50 }, //default
                    }
                    : null,
            };
        });

        try {
            await dispatch(
                updateGeneratedImage({
                    productId: product._id, // Ensure product._id is correct
                    imageData: generatedImageData,
                    userId: user._id,
                })
            ).unwrap(); // Use unwrap to handle async errors
            toast.success('Customization saved!');
        } catch (error) {
            toast.error(`Failed to save: ${error.message || 'Unknown error'}`);
        }
    };

    if (productLoading || cloudinaryLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
            </div>
        );
    }

    if (productError || cloudinaryError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">
                    <AlertCircle className="inline-block mr-2 w-6 h-6" />
                    Error loading product details or image upload:
                    {productError?.message || cloudinaryError?.message || 'Unknown error occurred.'}
                </div>
            </div>
        );
    }

    if (!product || !selectedColor) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-500">Product details not loaded.</div>
            </div>
        );
    }

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="container mx-auto px-4 py-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Customize Your {product.name}</h2>
                <div className="md:flex w-full gap-8">
                    {/* Product View Area */}
                    <div className="md:w-1/2 w-full bg-gray-100 rounded-lg shadow-md p-4">
                        <div className="relative aspect-w-1 aspect-h-1 rounded-md overflow-hidden ">
                            <img
                                ref={productCanvasRef}
                                src={selectedColor.images[productView]}
                                alt={`${product.name} - ${productView}`}
                                className="object-contain w-full h-full"
                            />
                            {/* Drop Area */}
                            <label
                                ref={dropAreaRef}
                                htmlFor="image-upload"
                                className={`absolute border-2 border-dashed border-black/30 rounded-lg bg-white/50 flex justify-center flex-col items-center cursor-grab ${
                                    isOverDrop && canDrop ? 'bg-indigo-100 border-indigo-500' : ''
                                } ${overlayStyle.width} ${overlayStyle.height} ${overlayStyle.top} ${overlayStyle.left} -translate-x-1/2 -translate-y-1/2`}
                            >
                                {customizations[productView]?.image && (
                                    <DraggableImage
                                        src={customizations[productView].image}
                                        position={customizations[productView].imagePosition}
                                        onPositionChange={handleImagePositionChange}
                                    />
                                )}
                                {customizations[productView]?.textConfig?.text && (
                                    <DraggableText
                                        textConfig={customizations[productView].textConfig}
                                        position={customizations[productView].textPosition}
                                        onPositionChange={handleTextPositionChange}
                                    />
                                )}
                                {!customizations[productView]?.image && !customizations[productView]?.textConfig?.text && (
                                    <div className={`text-center flex items-center justify-center flex-wrap text-black/50 ${uploadTextSize}`}>
                                        <Upload className={`mx-auto mb-1 ${uploadIconSize}`} />
                                        <span>Drag & Drop image or text here</span>
                                    </div>
                                )}
                            </label>
                        </div>
                        {/* Product View Navigation */}
                        <div className="flex justify-around mt-4">
                            {['front', 'back', 'leftSleeve', 'rightSleeve'].map((view) => (
                                <button
                                    key={view}
                                    className={`px-3 py-1 rounded-full text-sm ${
                                        productView === view ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                                    onClick={() => setProductView(view)}
                                >
                                    {view.charAt(0).toUpperCase() + view.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Customization Controls */}
                    <div className="md:w-1/2 w-full p-4">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Customize</h3>

                        {/* Color Selection */}
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-1">Fabric Color</h4>
                            <div className="flex items-center">
                                {product.availableColors.map((color) => (
                                    <div
                                        key={color._id}
                                        className={`relative w-8 h-8 rounded-full mr-2 shadow-md cursor-pointer ${
                                            selectedColor?._id === color._id ? 'ring-2 ring-indigo-500' : ''
                                        }`}
                                        style={{ backgroundColor: color.color }}
                                        title={color.color}
                                        onClick={() => handleColorSelect(color)}
                                    ></div>
                                ))}
                            </div>
                        </div>

                        {/* Image Upload */}
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-1">Upload Image</h4>
                            <label
                                htmlFor="image-upload"
                                className="relative border-2 border-dashed border-gray-400 rounded-md p-4 w-full flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500"
                            >
                                <Upload className="w-6 h-6 text-gray-500 mb-1" />
                                <span className="text-sm text-gray-500">Click to browse</span>
                                <input
                                    id="image-upload"
                                    type="file"
                                    className="absolute top-0 left-0 w-full h-full opacity-0"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                            </label>
                            {cloudinaryLoading && <p className="text-sm text-gray-500 mt-1">Uploading image...</p>}
                            {cloudinaryError && <p className="text-sm text-red-500 mt-1">Error uploading image: {cloudinaryError}</p>}
                            {customizations[productView]?.image && !cloudinaryLoading && !cloudinaryError && (
                                <div className="mt-2">
                                    <img src={customizations[productView].image} alt="Uploaded Preview" className="max-h-20 rounded-md" />
                                </div>
                            )}
                            {/* Advanced Image Editing Features would go here */}
                        </div>

                        {/* Text Input */}
                        <div className="mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-1">Add Text</h4>
                            <input
                                type="text"
                                className="w-full border rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Enter text"
                                value={customizations[productView]?.textConfig?.text || ''}
                                onChange={handleTextChange}
                            />
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <LetterText className="w-4 h-4text-gray-500" />
                                <select
                                    className="border rounded-md shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={customizations[productView]?.textConfig?.fontFamily || 'Arial'}
                                    onChange={handleFontChange}
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Helvetica">Helvetica</option>
                                    <option value="Times New Roman">Times New Roman</option>
                                    {/* Add more fonts */}
                                </select>
                                <Type className="w-4 h-4 text-gray-500" />
                                <button
                                    className={`px-2 py-1 rounded-md text-sm ${
                                        customizations[productView]?.textConfig?.fontWeight === 'bold' ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={handleFontWeightChange}
                                >
                                    Bold
                                </button>
                                <button
                                    className={`px-2 py-1 rounded-md text-sm ${
                                        customizations[productView]?.textConfig?.fontCase === 'uppercase' ? 'bg-indigo-200 text-indigo-700' : 'bg-gray-200 text-gray-700'
                                    }`}
                                    onClick={handleFontCaseChange}
                                >
                                    Aa
                                </button>
                                <input
                                    type="number"
                                    className="w-16 border rounded-md shadow-sm text-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    value={customizations[productView]?.textConfig?.fontSize || 24}
                                    onChange={handleFontSizeChange}
                                />
                                <Palette className="w-6 h-6 text-gray-500" />
                                <input
                                    type="color"
                                    value={customizations[productView]?.textConfig?.color || '#000000'}
                                    onChange={handleTextColorChange}
                                    className="w-10 h-10 rounded-4xl overflow-hidden cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Save Customization */}
                        <button
                            className="inline-flex items-center bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            onClick={handleSaveCustomization}
                            disabled={cloudinaryLoading}
                        >
                            <Save className="w-5 h-5 mr-2" />
                            Save Customization
                            {cloudinaryLoading && <Loader2 className="animate-spin w-4 h-4 ml-2" />}
                        </button>
                    </div>
                </div>
            </div>
        </DndProvider>
    );
};

export default CustomProductDesignPage;
