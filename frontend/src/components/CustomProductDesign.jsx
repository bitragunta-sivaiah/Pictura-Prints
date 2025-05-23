import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { fabric } from 'fabric';
import {
    Upload,
    Trash2,
    Text as TextIcon,
    Image as ImageIcon,
    Eye,
    EyeOff,
    RotateCw,
    RotateCcw,
    FlipHorizontal,
    FlipVertical,
} from 'lucide-react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { ChromePicker } from 'react-color';
import {
    uploadImageToCloudinary,
    clearImageUrl,
    selectImageUrl,
    selectLoading as selectCloudinaryLoading,
    selectError as selectCloudinaryError,
} from '../store/cloundarySlice';
import {
    fetchProductById,
    selectProductById,
    selectProductsLoading as selectProductLoading,
    selectProductsError as selectProductError,
} from '../store/productSlice';
import {
    fetchCustomization,
    saveCustomization,
    selectCustomization,
    selectCustomizationLoading,
    selectCustomizationError,
} from '../store/customizationslice';

import { addCustomizedProduct } from '../store/cartSlice';
import { toast } from 'react-hot-toast';

const ProductCustomDesign = ({ productId }) => {
    const dispatch = useDispatch();
    const product = useSelector(selectProductById, shallowEqual);
    const productLoading = useSelector(selectProductLoading);
    const productError = useSelector(selectProductError);
    const imageUrl = useSelector(selectImageUrl);
    const uploadLoading = useSelector(selectCloudinaryLoading);
    const uploadError = useSelector(selectCloudinaryError);
    const customizationData = useSelector(selectCustomization, shallowEqual);
    const customizationLoading = useSelector(selectCustomizationLoading);
    const customizationError = useSelector(selectCustomizationError);
    const canvasRef = useRef(null);
    const [canvasInstance, setCanvasInstance] = useState(null);
    const [activeObject, setActiveObject] = useState(null);
    const [uploadedImageFile, setUploadedImageFile] = useState(null);
    const [selectedArea, setSelectedArea] = useState('front');
    const [productImages, setProductImages] = useState({
        front: null,
        back: null,
        leftSleeve: null,
        rightSleeve: null,
    });
    const { user } = useSelector((state) => state.auth);

    const [hasFetchedProduct, setHasFetchedProduct] = useState(false);
    const [showProductImages, setShowProductImages] = useState(false);
    const [currentTextColor, setCurrentTextColor] = useState('#000000');
    const [canvasTextObjects, setCanvasTextObjects] = useState([]);
    const [selectedTextColor, setSelectedTextColor] = useState('#000000');
    const [showTextColorPicker, setShowTextColorPicker] = useState(false);
    const [selectedFontFamily, setSelectedFontFamily] = useState('sans-serif');
    const [selectedFontWeight, setSelectedFontWeight] = useState('normal');
    const [selectedFontSize, setSelectedFontSize] = useState(24);
    const [inputText, setInputText] = useState('');
    const availableFonts = ['sans-serif', 'serif', 'monospace', 'Arial', 'Helvetica', 'Times New Roman', 'Courier New'];
    const fontWeights = ['normal', 'bold', 'italic', 'bold italic'];
    const fontSizes = [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 48, 60, 72];
    const [selectedProductColorIndex, setSelectedProductColorIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(''); // State for selected size
    const [currentCustomizationId, setCurrentCustomizationId] = useState(null); // State to hold the customization ID


    // State for price summary
    const [basePrice, setBasePrice] = useState(0);
    const [printingPrice, setPrintingPrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const updatePriceSummary = useCallback(() => {
        let currentAreaPrintingPrice = 0;

        const selectedColorData =
            product?.availableColors?.[selectedProductColorIndex];

        if (selectedColorData?.printingPrices) {
            switch (selectedArea) {
                case "front":
                    currentAreaPrintingPrice =
                        selectedColorData.printingPrices.front || 0;

                    break;

                case "back":
                    currentAreaPrintingPrice =
                        selectedColorData.printingPrices.back || 0;

                    break;

                case "leftSleeve":

                case "rightSleeve":
                    currentAreaPrintingPrice =
                        selectedColorData.printingPrices.sleeve || 0;

                    break;

                default:
                    currentAreaPrintingPrice = 0;
            }
        }

        const textCount =
            canvasInstance?.getObjects().filter((obj) => obj.type === "text")
                .length || 0;

        const imageCount =
            canvasInstance?.getObjects().filter((obj) => obj.type === "image")
                .length || 0;

        const numberOfElements = textCount + imageCount;

        const newBasePrice = product?.basePrice || 0;

        const newcolorPrice =
            selectedColorData?.price !== undefined
                ? selectedColorData.price
                : product?.basePrice || 0;

        const newTotalPrice =
            newBasePrice + newcolorPrice + currentAreaPrintingPrice;

        setBasePrice(newBasePrice);

        setTotalPrice(newTotalPrice);

        setPrintingPrice(currentAreaPrintingPrice);

        console.log("Price Summary Updated:", {
            basePrice: newBasePrice,

            totalPrice: newTotalPrice,

            printingPrice: currentAreaPrintingPrice,
        });
    }, [
        selectedArea,
        canvasInstance,
        product?.availableColors,
        selectedProductColorIndex,
        product?.basePrice,
    ]);


    useEffect(() => {
        console.log('ProductCustomDesign: Mounting with productId:', productId);
        if (productId && !product && !hasFetchedProduct) {
            console.log('ProductCustomDesign: Fetching product details...');
            dispatch(fetchProductById(productId))
                .unwrap()
                .then(() => {
                    console.log('ProductCustomDesign: Product fetched successfully.');
                    setHasFetchedProduct(true);
                })
                .catch((error) => {
                    console.error('ProductCustomDesign: Error fetching product:', error);
                    toast.error('Error loading product details for customization.');
                    setHasFetchedProduct(true);
                });
            dispatch(fetchCustomization({ productId, userId: user._id })); // Fetch existing customization
        } else if (product?.availableColors?.length > 0 && !productImages.front) {
            console.log('ProductCustomDesign: Setting initial product images.');
            setProductImages({
                front: product.availableColors[selectedProductColorIndex]?.images?.front || null,
                back: product.availableColors[selectedProductColorIndex]?.images?.back || null,
                leftSleeve: product.availableColors[selectedProductColorIndex]?.images?.leftSleeve || null,
                rightSleeve: product.availableColors[selectedProductColorIndex]?.images?.rightSleeve || null,
            });
            setBasePrice(product.basePrice || 0);
        }
    }, [dispatch, productId, product, hasFetchedProduct, productImages.front, selectedProductColorIndex, user._id]);

    useEffect(() => {
        if (customizationData) {
            setCurrentCustomizationId(customizationData._id || null);
        }
    }, [customizationData]);

    useEffect(() => {
        console.log('ProductCustomDesign: Creating canvas instance.');
        const newCanvas = new fabric.Canvas(canvasRef.current, {
            width: 400,
            height: 400,
            allowTouchScrolling: true,
        });
        setCanvasInstance(newCanvas);

        newCanvas.on('object:selected', handleObjectSelected);
        newCanvas.on('selection:cleared', handleSelectionCleared);
        newCanvas.on('object:modified', handleObjectModified);
        newCanvas.on('object:added', handleObjectAdded);
        newCanvas.on('object:removed', handleObjectRemoved);

        newCanvas.on('drop', handleCanvasDrop);
        newCanvas.on('dragover', handleCanvasDragOver);

        setBackgroundImage(newCanvas, productImages[selectedArea]);

        return () => {
            console.log('ProductCustomDesign: Unmounting...');
            if (canvasInstance) {
                console.log('ProductCustomDesign: Disposing canvas.');
                canvasInstance.dispose();
                setCanvasInstance(null);
            }
        };
    }, []); // Empty dependency array: runs only on mount and unmount

    useEffect(() => {
        if (canvasInstance) {
            canvasInstance.clear();
            setCanvasTextObjects([]); // Clear text objects when area changes

            if (customizationData && customizationData[selectedArea]) {
                fabric.util.enlivenObjects(customizationData[selectedArea], (enlivenedObjects) => {
                    enlivenedObjects.forEach(obj => {
                        canvasInstance.add(obj);
                        if (obj.type === 'text') {
                            setCanvasTextObjects(prev => [...prev, obj]);
                        }
                    });
                    canvasInstance.renderAll();
                    updatePriceSummary();
                });
            } else {
                updatePriceSummary(); // Update price on area change even without existing customization
            }
            setBackgroundImage(canvasInstance, productImages[selectedArea]);
            canvasInstance.__previousSelectedArea = selectedArea;
        }
    }, [canvasInstance, productImages, selectedArea, customizationData, updatePriceSummary]);

    const handleObjectSelected = useCallback((event) => {
        console.log('handleObjectSelected triggered:', event.target);
        setActiveObject(event.target);

        if (event.target && event.target.type === 'text') {
            setInputText(event.target.text);
            setSelectedFontFamily(event.target.fontFamily || 'sans-serif');
            setSelectedFontWeight(event.target.fontWeight || 'normal');
            setSelectedFontSize(event.target.fontSize || 24);
            setSelectedTextColor(event.target.fill || '#000000');
        } else {
            setInputText('');
            setSelectedFontFamily('sans-serif');
            setSelectedFontWeight('normal');
            setSelectedFontSize(24);
            setSelectedTextColor('#000000');
        }
    }, [setInputText, setSelectedFontFamily, setSelectedFontWeight, setSelectedTextColor, setActiveObject, setSelectedFontSize]);

    const handleSelectionCleared = useCallback(() => {
        setActiveObject(null);

        setInputText('');
        setSelectedFontFamily('sans-serif');
        setSelectedFontWeight('normal');
        setSelectedFontSize(24);
        setSelectedTextColor('#000000');
    }, [setInputText, setSelectedFontFamily, setSelectedFontWeight, setSelectedTextColor, setActiveObject, setSelectedFontSize]);

    const setBackgroundImage = (canvas, imageUrl) => {
        if (canvas && imageUrl) {
            fabric.Image.fromURL(imageUrl, (img) => {
                canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
                    scaleX: canvas.width / img.width,
                    scaleY: canvas.height / img.height,
                    originX: 'left',
                    originY: 'top',
                });
            });
        } else if (canvas) {
            canvas.setBackgroundImage(null, canvas.renderAll.bind(canvas));
        }
    };

    const handleCanvasDrop = useCallback((event) => {
        event.e.preventDefault();
        const pointer = canvasInstance?.getPointer(event.e);
        if (event.dragSource && event.dragSource.type === 'image' && canvasInstance && pointer) {
            fabric.Image.fromURL(event.dragSource.src, (img) => {
                img.set({ left: pointer.x - 50, top: pointer.y - 50, scaleX: 0.5, scaleY: 0.5, type: 'image' });
                canvasInstance.add(img);
                canvasInstance.setActiveObject(img);
                canvasInstance.renderAll();
                updatePriceSummary();
            });
        }
    }, [canvasInstance, updatePriceSummary]);

    const handleCanvasDragOver = useCallback((event) => {
        event.e.preventDefault();
    }, []);

    useEffect(() => {
        if (imageUrl && canvasInstance) {
            fabric.Image.fromURL(imageUrl, (img) => {
                const canvasWidth = canvasInstance.width;
                const canvasHeight = canvasInstance.height;
                const maxInitialWidth = canvasWidth * 0.8;
                const maxInitialHeight = canvasHeight * 0.8;
                const imgWidth = img.width;
                const imgHeight = img.height;
                let scale = 1;
                if (imgWidth > maxInitialWidth || imgHeight > maxInitialHeight) {
                    const scaleX = maxInitialWidth / imgWidth;
                    const scaleY = maxInitialHeight / imgHeight;
                    scale = Math.min(scaleX, scaleY);
                }
                img.set({
                    left: canvasWidth / 2,
                    top: canvasHeight / 2,
                    originX: 'center',
                    originY: 'center',
                    scaleX: scale,
                    scaleY: scale,
                    type: 'image',
                });
                canvasInstance.add(img);
                canvasInstance.setActiveObject(img);
                canvasInstance.renderAll();
                updatePriceSummary();
            }, (error) => {
                console.error('ProductCustomDesign: Error loading image from URL:', imageUrl, error);
                toast.error('Error loading image.');
            });
            dispatch(clearImageUrl());
            setUploadedImageFile(null);
        }
    }, [imageUrl, canvasInstance, dispatch, updatePriceSummary]);

    const handleImageUpload = useCallback(async (event) => {
        const file = event.target.files[0];
        if (file) {
            setUploadedImageFile(file);
            try {
                console.log('ProductCustomDesign: Dispatching uploadImageToCloudinary...');
                await dispatch(uploadImageToCloudinary(file));
                console.log('ProductCustomDesign: uploadImageToCloudinary dispatched.');
            } catch (error) {
                console.error('ProductCustomDesign: Error dispatching upload to Cloudinary:', error);
                toast.error('Error uploading image.');
            }
        }
    }, [dispatch]);

    const handleAddText = useCallback(() => {
        if (canvasInstance && inputText) {
            const newText = new fabric.Text(inputText, {
                left: 50,
                top: 50,
                fontFamily: selectedFontFamily,
                fontWeight: selectedFontWeight,
                fill: selectedTextColor,
                fontSize: selectedFontSize,
                type: 'text',
            });
            canvasInstance.add(newText);
            canvasInstance.setActiveObject(newText);
            setInputText('');
            setCanvasTextObjects(prev => [...prev, newText]);
            updatePriceSummary();
        }
    }, [canvasInstance, inputText, selectedFontFamily, selectedFontWeight, selectedTextColor, selectedFontSize, updatePriceSummary]);

    const handleRemoveSelected = useCallback(() => {
        if (canvasInstance && activeObject) {
            canvasInstance.remove(activeObject);
            canvasInstance.discardActiveObject().renderAll();
            setActiveObject(null);
            updatePriceSummary();
        }
    }, [canvasInstance, activeObject, updatePriceSummary]);

    const saveDesign = useCallback(async () => {
        if (canvasInstance && productId) {
            const customizationDataToSave = {};
            // Process canvas objects for the selected area.  Crucially, handle different object types.
            customizationDataToSave[selectedArea] = canvasInstance.getObjects().map(obj => {
                const objData = obj.toObject(); // Get the base object data

                // Handle image-specific properties.  Check if obj.getSrc() exists.
                if (obj.type === 'image' && obj.getSrc) {
                    objData.url = obj.getSrc(); // Store the image source URL
                }
                // Handle text-specific properties. Check if the properties exist.
                if (obj.type === 'text') {
                    objData.text = obj.text || '';
                    objData.fontFamily = obj.fontFamily || '';
                    objData.fontSize = obj.fontSize || 0;
                    objData.fontWeight = obj.fontWeight || '';
                    objData.fontCase = obj.fontCase || '';
                    objData.color = obj.fill || ''; // Use obj.fill for text color
                }

                // Store the object's position.  Ensure left/top are numbers.
                objData.position = {
                    x: typeof obj.left === 'number' ? obj.left : 0,
                    y: typeof obj.top === 'number' ? obj.top : 0,
                };
                return objData;
            });

            try {
                console.log('ProductCustomDesign: Dispatching saveCustomization...', customizationDataToSave);
                const resultAction = await dispatch(saveCustomization({ productId, customizationData: customizationDataToSave }));
                console.log('ProductCustomDesign: saveCustomization dispatched.', resultAction);

                if (saveCustomization.fulfilled.match(resultAction)) {
                    toast.success(`Design for ${selectedArea} saved!`);
                    setCurrentCustomizationId(resultAction.payload?.customizationId || resultAction.payload?._id || null); // Access payload correctly
                } else {
                    const errorMessage = resultAction.payload?.message || 'Error saving design.';
                    toast.error(errorMessage);
                    setCurrentCustomizationId(null);
                }
            } catch (error) {
                const errorMessage = error.message || 'An unexpected error occurred.';
                console.error('ProductCustomDesign: Error dispatching saveCustomization:', error);
                toast.error(errorMessage);
                setCurrentCustomizationId(null);
            }
        } else {
            toast.error('Canvas or product ID not available.');
            setCurrentCustomizationId(null);
        }
    }, [canvasInstance, productId, selectedArea, dispatch, saveCustomization]);


    const handleAreaChange = useCallback((area) => {
        console.log('ProductCustomDesign: Selected area changed to:', area);
        setSelectedArea(area);
    }, [setSelectedArea]);

    const handleDragStart = useCallback((e, imageUrl) => {
        e.dataTransfer.setData('text/plain', imageUrl);
        e.target.type = 'image';
        e.target.src = imageUrl;
        e.dataTransfer.effectAllowed = 'copy';
        e.dragSource = { type: 'image', src: imageUrl }; // Set dragSource
    }, []);

    const handleFontChange = useCallback((e) => {
        setSelectedFontFamily(e.target.value);
        if (activeObject && activeObject.type === 'text') {
            activeObject.set({ fontFamily: e.target.value });
            canvasInstance.renderAll();
        }
    }, [setSelectedFontFamily, activeObject, canvasInstance]);

    const handleFontWeightChange = useCallback((e) => {
        setSelectedFontWeight(e.target.value);
        if (activeObject && activeObject.type === 'text') {
            activeObject.set({ fontWeight: e.target.value });
            canvasInstance.renderAll();
        }
    }, [setSelectedFontWeight, activeObject, canvasInstance]);

    const handleFontSizeChange = useCallback((e) => {
        setSelectedFontSize(parseInt(e.target.value, 10));
        if (activeObject && activeObject.type === 'text') {
            activeObject.set({ fontSize: parseInt(e.target.value, 10) });
            canvasInstance.renderAll();
        }
    }, [setSelectedFontSize, activeObject, canvasInstance]);

    const handleTextColorChange = useCallback((color) => {
        setSelectedTextColor(color.hex);
        setShowTextColorPicker(false);
        if (activeObject && activeObject.type === 'text') {
            activeObject.set({ fill: color.hex });
            canvasInstance.renderAll();
        }
    }, [setSelectedTextColor, activeObject, canvasInstance, setShowTextColorPicker]);

    const toggleTextColorPicker = useCallback(() => {
        setShowTextColorPicker((prev) => !prev);
    }, [setShowTextColorPicker]);

    const handleInputChange = useCallback((e) => {
        setInputText(e.target.value);
        if (activeObject && activeObject.type === 'text') {
            activeObject.set({ text: e.target.value });
            canvasInstance.renderAll();
            const updatedTextObject = canvasInstance.getObjectById(activeObject?.id);
            setCanvasTextObjects(prev =>
                prev.map(textObj => (textObj.id === updatedTextObject?.id ? updatedTextObject : textObj))
            );
        }
    }, [setInputText, activeObject, canvasInstance, setCanvasTextObjects]);

    const handleObjectModified = useCallback((event) => {
        updatePriceSummary();
    }, [updatePriceSummary]);

    const handleObjectAdded = useCallback((event) => {
        updatePriceSummary();
        setActiveObject(event.target); // Set the newly added object as active
    }, [updatePriceSummary, setActiveObject]);

    const handleObjectRemoved = useCallback((event) => {
        updatePriceSummary();
        if (event.target && event.target.type === 'text') {
            setCanvasTextObjects(prev => prev.filter(obj => obj.id !== event.target.id));
        }
        setActiveObject(null); // Clear active object when something is removed
    }, [updatePriceSummary, setCanvasTextObjects, setActiveObject]);

    const toggleProductImages = useCallback(() => {
        setShowProductImages(prev => !prev);
    }, [setShowProductImages]);

    const handleTextColorSelect = useCallback((color) => {
        setSelectedTextColor(color);
        if (activeObject && activeObject.type === 'text') {
            activeObject.set({ fill: color });
            canvasInstance.renderAll();
        }
    }, [activeObject, canvasInstance, setSelectedTextColor]);

    const handleCanvasScroll = useCallback((event) => {
        event.preventDefault();
      
    }, []);

    const handleProductColorChange = useCallback((index) => {
        if (product?.availableColors?.[index]?.images) {
            setSelectedProductColorIndex(index);
            setProductImages({
                front: product.availableColors[index].images.front,
                back: product.availableColors[index].images.back,
                leftSleeve: product.availableColors[index].images.leftSleeve,
                rightSleeve: product.availableColors[index].images.rightSleeve,
            });
            setBasePrice(product.availableColors[index].basePrice || product.basePrice || 0);
            // The useEffect will handle updating the background image on canvas
        }
    }, [product?.availableColors, setProductImages, setSelectedProductColorIndex, setBasePrice, product?.basePrice]);

    const rotateObject = useCallback((direction) => {
        if (activeObject) {
            const currentAngle = activeObject.get('angle') || 0;
            const newAngle = direction === 'cw' ? currentAngle + 15 : currentAngle - 15;
            activeObject.set({ angle: newAngle }).setCoords();
            canvasInstance.requestRenderAll();
        }
    }, [canvasInstance, activeObject]);

    const flipObject = useCallback((axis) => {
        if (activeObject) {
            if (axis === 'horizontal') {
                activeObject.set({ flipX: !activeObject.flipX }).setCoords();
            } else if (axis === 'vertical') {
                activeObject.set({ flipY: !activeObject.flipY }).setCoords();
            }
            canvasInstance.requestRenderAll();
        }
    }, [canvasInstance, activeObject]);

const handleAddCusmizationProductToCart = useCallback(async () => {
  if (!user) {
    toast.error("Please log in to add to cart.");
    return;
  }

  if (!product) {
    toast.error("Product details are not loaded.");
    return;
  }

  if (!selectedSize) {
    toast.error("Please select a size.");
    return;
  }

  const customizedProductData = {
    productId: product._id,
    color: product.availableColors[selectedProductColorIndex]?.color,
    size: selectedSize,
    customizationId: currentCustomizationId, // Include the customization ID
    quantity: 1,
    totalPrice: totalPrice,
  };

  try {
    const resultAction = await dispatch(
      addCustomizedProduct(customizedProductData)
    ); // Check if the action was successful before showing success message
    if (addCustomizedProduct.fulfilled.match(resultAction)) {
      toast.success("Customized product added to cart!");
    } else {
      toast.error("Failed to add customized product to cart.");
      console.error(
        "Failed to add customized product to cart:",
        resultAction.payload
      );
    }
  } catch (error) {
    console.error("Error adding customized product to cart:", error);
    toast.error("Failed to add customized product to cart.");
  }
}, [
  dispatch,
  user,
  product,
  selectedProductColorIndex,
  selectedSize,
  totalPrice,
  currentCustomizationId,
]);

    const handleSizeChange = useCallback((event) => {
        setSelectedSize(event.target.value);
    }, [setSelectedSize]);

    // Memoize product details to prevent unnecessary re-renders
    const productDetails = useMemo(() => ({
        name: product?.name,
        brand: product?.brand,
        description: product?.description,
        availableColors: product?.availableColors,
        basePrice: product?.basePrice,
        sizes: product?.sizes || [], // Assuming product has a 'sizes' array
        dragableImages: product?.availableColors?.[selectedProductColorIndex]?.dragableImages || [],
    }), [product, selectedProductColorIndex]);

    if (productLoading && !product) {
        return (
            <div className="p-6 text-center">
                <svg
                    className="animate-spin h-6 w-6 text-blue-500 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                </svg>
                <p className="mt-2 text-gray-600">Loading customization options...</p>
            </div>
        );
    }

    if (productError) {
        return <div className="p-6 text-red-500 text-center">Error loading customization options: {productError}</div>;
    }

    if (!product) {
        return <div className="p-6 text-gray-600 text-center">Product details not available for customization.</div>;
    }
    return (
      <div className="min-h-screen w-full   mx-auto py-2">
        <div className="container mx-auto px-2">
          <h1 className="text-3xl font-semibold text-gray-900 mb-8">
            Design Your {productDetails.name}
          </h1>
          <div className="lg:flex flex-wrap gap-8 w-full ">
            {/* Left Menu */}
            <aside className="w-full lg:w-80 flex-shrink-0 mb-6 lg:mb-0">
              <div className="bg-white rounded-md shadow-md p-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Product Views
                </h3>
                <div className="flex flex-col gap-2">
                  {Object.entries(productImages).map(
                    ([area, imageUrl]) =>
                      imageUrl && (
                        <button
                          key={area}
                          className={`flex items-center w-full rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${
                            selectedArea === area
                              ? "bg-gray-100 p-2 text-blue-500 font-semibold"
                              : ""
                          }`}
                          onClick={() => handleAreaChange(area)}
                        >
                          <img
                            src={imageUrl}
                            alt={area.charAt(0).toUpperCase() + area.slice(1)}
                            className="w-10 h-10 object-contain bg-gray-100 mr-3 border-1 rounded-md"
                          />
                          {area.charAt(0).toUpperCase() + area.slice(1)} View
                        </button>
                      )
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Actions
                  </h3>
                  <div className="flex flex-col gap-2">
                    <button
                      className="flex items-center justify-start py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={() =>
                        document.getElementById("image-upload").click()
                      }
                    >
                      <ImageIcon className="w-5 h-5 mr-3" />
                      Add Image
                    </button>
                    <button
                      className="flex items-center justify-start py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={handleAddText}
                    >
                      <TextIcon className="w-5 h-5 mr-3" />
                      Add Text
                    </button>
                    <button
                      className="flex items-center justify-start py-2 px-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-200 font-semibold"
                      onClick={saveDesign}
                    >
                      Save Design
                    </button>
                    <button
                      className="flex items-center justify-start py-2 px-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 font-semibold"
                      onClick={handleAddCusmizationProductToCart}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="flex items-center justify-start py-2 px-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      onClick={handleRemoveSelected}
                    >
                      <Trash2 className="w-5 h-5 mr-3" />
                      Remove Selected
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-md shadow-md p-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Text Options
                  </h3>
                  <div className="mb-2">
                    <label
                      htmlFor="text-input"
                      className="block text-gray-700 text-sm font-bold mb-1"
                    >
                      Text:
                    </label>
                    <input
                      type="text"
                      id="text-input"
                      className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={inputText}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor="font-family"
                      className="block text-gray-700 text-sm font-bold mb-1"
                    >
                      Font:
                    </label>
                    <select
                      id="font-family"
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={selectedFontFamily}
                      onChange={handleFontChange}
                    >
                      {availableFonts.map((font) => (
                        <option key={font} value={font}>
                          {font}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor="font-weight"
                      className="block text-gray-700 text-sm font-bold mb-1"
                    >
                      Weight:
                    </label>
                    <select
                      id="font-weight"
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={selectedFontWeight}
                      onChange={handleFontWeightChange}
                    >
                      {fontWeights.map((weight) => (
                        <option key={weight} value={weight}>
                          {weight}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label
                      htmlFor="font-size"
                      className="block text-gray-700 text-sm font-bold mb-1"
                    >
                      Size:
                    </label>
                    <select
                      id="font-size"
                      className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      value={selectedFontSize}
                      onChange={handleFontSizeChange}
                    >
                      {fontSizes.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-bold mb-1">
                      Color:
                    </label>
                    <div className="flex items-center">
                      <div
                        className="w-8 h-8 rounded-full border shadow-sm cursor-pointer"
                        onClick={toggleTextColorPicker}
                        title="Select Text Color"
                        style={{ backgroundColor: selectedTextColor }}
                      />
                      {showTextColorPicker && (
                        <div className="absolute mt-2 z-10">
                          <ChromePicker
                            color={selectedTextColor}
                            onChange={handleTextColorChange}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/* <div className="bg-white rounded-md shadow-md p-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Image Options
                  </h3>
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded cursor-pointer"
                  >
                    Upload Image
                  </label>
                  {uploadLoading && (
                    <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-500">
                      Error uploading image.
                    </p>
                  )}
                  {uploadedImageFile && !uploadError && (
                    <p className="mt-2 text-sm text-green-600">
                      Image selected.
                    </p>
                  )}
                </div> */}
                {/* <div className="bg-white rounded-md shadow-md p-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Object Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => rotateObject("cw")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Rotate Clockwise"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => rotateObject("ccw")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Rotate Counter-Clockwise"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => flipObject("horizontal")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => flipObject("vertical")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div> */}
              </div>
            </aside>

            {/* Canvas Area */}
            <div className="flex-1 bg-gray-100   h-[400px] rounded-md object-cover shadow flex flex-col items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                id="design-canvas"
             
                onWheel={handleCanvasScroll}
                className="touch-pan-y object-cover"
              />
            </div>

            {/* Product Details Sidebar */}
            <aside className="w-full lg:w-[400px] flex-shrink-0 mt-6 lg:mt-0">
              <div className="bg-white rounded-md shadow-md p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Product Details
                </h3>
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Name:</span>{" "}
                  {productDetails.name}
                </p>
                {productDetails.brand && (
                  <p className="text-gray-700 mb-2">
                    <span className="font-semibold">Brand:</span>{" "}
                    {productDetails.brand}
                  </p>
                )}
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold">Description:</span>{" "}
                  {productDetails.description}
                </p>
                {productDetails.dragableImages &&
                  productDetails.dragableImages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-md font-semibold text-gray-800 mb-2">
                        Drag Images to Canvas
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {productDetails.dragableImages.map((imgUrl, index) => (
                          <img
                            key={index}
                            src={imgUrl}
                            alt={`Dragable Image ${index + 1}`}
                            className="w-full h-20 object-contain border rounded cursor-grab"
                            draggable
                            onDragStart={(e) => handleDragStart(e, imgUrl)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                {productDetails.availableColors &&
                  productDetails.availableColors.length > 1 && (
                    <div className="  mt-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Product Color
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {productDetails.availableColors.map(
                          (colorOption, index) => (
                            <div
                              key={index}
                              className={`w-8 h-8 rounded-full cursor-pointer shadow-sm ${
                                selectedProductColorIndex === index
                                  ? "border-2 border-blue-500"
                                  : ""
                              }`}
                              style={{ backgroundColor: colorOption.color }}
                              onClick={() => handleProductColorChange(index)}
                              title={colorOption.colorName}
                            />
                          )
                        )}
                      </div>
                    </div>
                  )}
                {productDetails.availableColors &&
                  productDetails.availableColors[selectedProductColorIndex]
                    ?.sizes?.length > 0 && (
                    <div className="mt-4 ">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">
                        Select Size
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {productDetails.availableColors[
                          selectedProductColorIndex
                        ].sizes.map((size) => (
                          <button
                            key={size}
                            className={`px-3 py-1 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200 ${
                              selectedSize === size
                                ? "bg-blue-500 text-white font-semibold"
                                : ""
                            }`}
                            onClick={() => setSelectedSize(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      {!selectedSize && (
                        <p className="mt-2 text-sm text-red-500">
                          Please select a size.
                        </p>
                      )}
                    </div>
                  )}
                    <div className="bg-white rounded-md shadow-md p-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Image Options
                  </h3>
                  <input
                    type="file"
                    id="image-upload"
                    className="hidden"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded cursor-pointer"
                  >
                    Upload Image
                  </label>
                  {uploadLoading && (
                    <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-500">
                      Error uploading image.
                    </p>
                  )}
                  {uploadedImageFile && !uploadError && (
                    <p className="mt-2 text-sm text-green-600">
                      Image selected.
                    </p>
                  )}
                </div>
                  {/* actions  */}
                  <div className="  mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Object Actions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => rotateObject("cw")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Rotate Clockwise"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => rotateObject("ccw")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Rotate Counter-Clockwise"
                    >
                      <RotateCcw className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => flipObject("horizontal")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Flip Horizontal"
                    >
                      <FlipHorizontal className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => flipObject("vertical")}
                      className="p-2 rounded-md border text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                      title="Flip Vertical"
                    >
                      <FlipVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className=" mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Price Summary
                  </h3>
                  <p>Base Price: ₹{basePrice.toFixed(2)}</p>
                  <p>Printing Price: ₹{printingPrice.toFixed(2)}</p>
                  <p className="font-semibold">
                    Total Price: ₹{totalPrice.toFixed(2)}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    );
};

export default ProductCustomDesign;