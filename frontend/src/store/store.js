// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import bannerReducer from './bannerSlice';  
import cloundaryReducer from './cloundarySlice'; 
import categoryReducer from './categorySlice'; 
import productReducer from './productSlice';
import couponReducer from './couponSlice';
import branchStationReducer from './branchStationSlice';
import addressReducer from './addressSlice';
import cartReducer from './cartSlice';
import deliveryPartnerReducer from './deliveryPartnerSlice';
import customizationReducer from './customizationslice';
import notificationReducer from './notificationSlice';
import orderReducer from './orderSlice';
import adminBranchReducer from './adminBranchSlice'
 import feedbackReducer from './feedbackSlice'
import returnOrderReducer from './returnOrderSlice'


export const store = configureStore({
  reducer: {
    auth: userReducer,  
    banners: bannerReducer,  
    cloudinary:cloundaryReducer,
    category:categoryReducer,
    products: productReducer, 
    coupons: couponReducer,
    branchStation: branchStationReducer,
    address: addressReducer,
    cart:cartReducer,
    deliveryPartners:deliveryPartnerReducer,
    customization: customizationReducer,  
    notifications: notificationReducer,
   
    order: orderReducer,
    adminBranch : adminBranchReducer,
    feedback:feedbackReducer,
    returnOrder:returnOrderReducer
  },
});

export default store;