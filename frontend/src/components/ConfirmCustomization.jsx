import React, { useEffect, useState } from 'react';
 import { useParams, Link } from 'react-router-dom';
 import { fetchProductById, selectProductById, selectProductsLoading, selectProductsError } from '../store/productSlice';
 import { fetchCustomization, selectCustomization, selectCustomizationLoading, selectCustomizationError } from '../store/customizationslice';
 import { selectAuthUser } from '../store/userSlice';  
 import { Loader2, AlertCircle, ArrowLeft, ShoppingBag } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';

 const ConfirmCustomizationPage = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const product = useSelector(selectProductById);
  const productLoading = useSelector(selectProductsLoading);
  const productError = useSelector(selectProductsError);
  const customization = useSelector(selectCustomization);
  const customizationLoading = useSelector(selectCustomizationLoading);
  const customizationError = useSelector(selectCustomizationError);
  const user = useSelector(selectAuthUser); // Get user info from Redux
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
  dispatch(fetchProductById(productId));
  // Fetch customization only if user is available
  if (user && user.id) {
  dispatch(fetchCustomization({ productId, userId: user.id }));
  } else {
  console.warn("User ID not found, customization cannot be fetched.");
  // Optionally: Dispatch an action to handle the error or loading state
  }
  }, [dispatch, productId, user]);

  useEffect(() => {
  if (product && customization) {
  let calculatedPrice = product.basePrice || 0;

  // Find the selected color's base price
  const selectedColor = product.availableColors?.find(c => c.color === customization?.color);
  if (selectedColor?.price !== undefined) {
  calculatedPrice = selectedColor.price;
  }

  // Add customization prices based on customizationOptions from the product
  const areas = ['front', 'back', 'leftSleeve', 'rightSleeve'];
  areas.forEach(area => {
  customization?.[area]?.forEach(item => {
  const customizationOption = product.customizationOptions?.find(
  opt => opt.area === area && opt.type === (item.url ? 'image' : 'text')
  );
  if (customizationOption?.price) {
  calculatedPrice += customizationOption.price;
  }
  });
  });

  setTotalPrice(calculatedPrice);
  }
  }, [product, customization]);

  if (productLoading || customizationLoading) {
  return (
  <div className="flex justify-center items-center h-screen">
  <Loader2 className="animate-spin w-10 h-10 text-indigo-600" />
  </div>
  );
  }

  if (productError || customizationError) {
  return (
  <div className="flex justify-center items-center h-screen">
  <div className="text-red-500">
  <AlertCircle className="inline-block mr-2 w-6 h-6" />
  Error loading details. {productError || customizationError}
  </div>
  </div>
  );
  }

  if (!product || !customization) {
  return (
  <div className="flex justify-center items-center h-screen">
  <div className="text-gray-500">Details not found.</div>
  </div>
  );
  }

  return (
  <div className="container mx-auto mt-10 p-6 bg-white shadow-md rounded-lg">
  <Link to={`/products/${productId}`} className="inline-flex items-center mb-4 text-indigo-600 hover:underline">
  <ArrowLeft className="mr-2 w-5 h-5" /> Back to Product
  </Link>

  <h1 className="text-2xl font-bold text-gray-800 mb-4">Confirm Your Customization</h1>

  <div className="md:flex border rounded-md overflow-hidden">
  <div className="md:w-1/2 p-4">
  <h2 className="text-xl font-semibold text-gray-700 mb-2">{product.name}</h2>
  {product.availableColors && customization.color && (
  <p className="text-gray-600 mb-2">Color: {customization.color}</p>
  )}
  {product.availableSizes && customization.size && (
  <p className="text-gray-600 mb-2">Size: {customization.size}</p>
  )}

  <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Your Design:</h3>
  <div className="grid grid-cols-2 gap-4">
  {['front', 'back', 'leftSleeve', 'rightSleeve'].map(area => (
  customization[area]?.map((item, index) => (
  <div key={`<span class="math-inline">\{area\}\-</span>{index}`} className="border rounded-md p-2">
  <h4 className="text-md font-semibold text-gray-600 capitalize">{area}</h4>
  {item.url && (
  <img src={item.url} alt={`${area} customization`} className="w-full h-auto rounded-md" style={{ maxHeight: '100px', objectFit: 'contain' }} />
  )}
  {item.text && (
  <p className="text-center text-gray-700">{item.text}</p>
  )}
  </div>
  ))
  ))}
  </div>
  </div>

  <div className="md:w-1/2 p-4 border-l">
  <h2 className="text-xl font-semibold text-gray-700 mb-4">Order Summary</h2>
  <div className="flex justify-between mb-2">
  <span className="text-gray-600">Base Price:</span>
  <span className="text-gray-800">₹{product.basePrice}</span>
  </div>
  {product.availableColors && customization.color && product.availableColors.find(c => c.color === customization.color)?.price !== product.basePrice && (
  <div className="flex justify-between mb-2">
  <span className="text-gray-600">Color Price:</span>
  <span className="text-gray-800">₹{product.availableColors.find(c => c.color === customization.color)?.price}</span>
  </div>
  )}
  {['front', 'back', 'leftSleeve', 'rightSleeve'].map(area => (
  customization[area]?.map((item, index) => {
  const customizationOption = product.customizationOptions?.find(
  opt => opt.area === area && opt.type === (item.url ? 'image' : 'text')
  );
  if (customizationOption?.price) {
  return (
  <div key={`<span class="math-inline">\{area\}\-price\-</span>{index}`} className="flex justify-between mb-2">
  <span className="text-gray-600 capitalize">{area} Customization:</span>
  <span className="text-gray-800">+₹{customizationOption.price}</span>
  </div>
  );
  }
  return null;
  })
  ))}
  <div className="border-t pt-4 mt-4">
  <div className="flex justify-between font-semibold text-lg text-gray-800">
  <span>Total Price:</span>
  <span>₹{totalPrice}</span>
  </div>
  </div>

  <button
  className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-md focus:outline-none focus:shadow-outline"
  onClick={() => {
  // Implement your add to cart logic with customization details
  console.log('Adding to cart with customization:', { product, customization, totalPrice });
  // You would likely dispatch an action to add this customized item to the cart
  }}
  >
  <ShoppingBag className="inline-block mr-2 w-5 h-5" /> Add Customized Item to Cart
  </button>
  </div>
  </div>
  </div>
  );
 };

 export default ConfirmCustomizationPage;