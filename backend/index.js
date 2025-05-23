import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
 
 
import compression from 'compression';
import { connectDB } from './config/DB.js';
import userRouter from './router/userRouter.js';
import bannerRouter from './router/bannerRouter.js';
import categoryRouter from './router/categoryRouter.js';
import productRouter from './router/productRouter.js';
import cloundaryRouter from './router/cloudinaryRouter.js';
import addressRouter from './router/addressRouter.js';
import couponRouter from './router/couponRouter.js';
import branchStationRouter from './router/branchRouter.js';
import adminbranchStationRouter from './router/adminBranchRouter.js';
import cartRouter from './router/cartRouter.js';
import deliveryPartnerRouter from './router/deliverypartnerRouter.js';
import orderRouter from './router/orderRouter.js';
import feedbackRouter from './router/feedbackRouter.js';
import customizationRouter from './router/customizationRouter.js';
import posterAdsRouter from './router/posterAdsRouter.js';
import notificationRouter from './router/notificationRouter.js';
import returnOrderRouter from './router/returnOrderRouter.js'
dotenv.config();

// Create an Express application
const app = express();
const port = process.env.PORT || 8000;

// Security Middleware
app.use(helmet());
app.use(compression()); // Enable gzip compression for response bodies
 


const corsOptions = {
    origin:  process.env.CLIENT,  
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, 
    optionsSuccessStatus: 204, // Some legacy browsers choke on 204
};


// Middleware
app.use(cors(corsOptions));
app.use(express.json());


 

 

// Routers
app.use('/api/users', userRouter);
app.use('/api/banners', bannerRouter);
app.use('/api', categoryRouter);
app.use('/api', productRouter);
app.use('/api/image', cloundaryRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/branch-stations', branchStationRouter);
app.use('/api/admin/branch-stations', adminbranchStationRouter);
app.use('/api', cartRouter);
app.use('/api/delivery-partners', deliveryPartnerRouter);
app.use('/api/orders', orderRouter);
app.use('/api/feedback', feedbackRouter);
app.use('/api', customizationRouter);
app.use('/api/poster-ads', posterAdsRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api',returnOrderRouter)

// Start the server
app.listen(port, () => {
    connectDB();
    console.log(`Server is running on http://localhost:${port}`);
});

app.use('/',(req,res)=>{
    res.send('running')
})