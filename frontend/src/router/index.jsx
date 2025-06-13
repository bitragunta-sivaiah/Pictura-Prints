import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";

// Lazy-loaded components
const App = React.lazy(() => import("../App"));
const Home = React.lazy(() => import("../Page/Home"));
const LoginPage = React.lazy(() => import("../Page/LoginPage"));
const RegisterPage = React.lazy(() => import("../Page/RegisterPage"));
const ProductFilterListing = React.lazy(() => import("../Page/ProductFilterListing"));
const SearchProductPage = React.lazy(() => import("../Page/SearchPage"));

// User Dashboard components
const UserDashboard = React.lazy(() => import("../layout/UserDashboard"));
const Profile = React.lazy(() => import("../components/user/Profile"));
const ApplyForBranchManager = React.lazy(() => import("../components/user/ApplyForBranchManager"));
const ApplyDeliveryPartner = React.lazy(() => import("../components/user/ApplyDeliveryPartner"));
const UserOrders = React.lazy(() => import("../components/user/UserOrder"));
const CartPage = React.lazy(() => import("../components/CartPage"));
const ConfirmCustomizationPage = React.lazy(() => import("../components/ConfirmCustomization"));
const ProductCustomDesign = React.lazy(() => import("../components/CustomProductDesign"));
const ProductDetails = React.lazy(() => import("../components/ProductDetails"));
const PlaceOrder = React.lazy(() => import("../Page/PlaceOrder"));
const SuccessOrder = React.lazy(() => import("../components/SuccessOrder"));
const OrderSucessDetails = React.lazy(() => import("../components/user/OrderSucessDetails"));
const OrderDetails = React.lazy(() => import("../components/user/OrderDetails"));
const AddFeedbackPage = React.lazy(() => import("../components/AddFeedback"));

// Admin Dashboard components
const AdminDashboard = React.lazy(() => import("../layout/AdminDashboard"));
const WelcomeAdmin = React.lazy(() => import("../components/admin/WelcomeAdmin"));
const AdminAnalysisPage = React.lazy(() => import("../components/admin/AdminAnalysis"));
const AdminBranchManagerApplications = React.lazy(() => import("../components/admin/AdminBranchManagerApplications"));
const UserManagement = React.lazy(() => import("../components/admin/UserManagement"));
const BannerManager = React.lazy(() => import("../components/admin/BannerManager"));
const CategoryManager = React.lazy(() => import("../components/admin/CategoryManager"));
const CouponsManager = React.lazy(() => import("../components/admin/CouponsManager"));
const BranchStationManagerPage = React.lazy(() => import("../components/admin/BranchStationManager"));
const ProductManagerPage = React.lazy(() => import("../components/ProductManager"));
const ProductFormPage = React.lazy(() => import("../components/ProductForm"));
const OrderManager = React.lazy(() => import("../components/admin/OrderManager"));
const ReturnOrderManagerPage = React.lazy(() => import("../components/admin/ReturnOrderManagerPage"));
const AdminAssignOrderToBranch = React.lazy(() => import("../components/admin/AdminAssignOrderToBranch"));

// Branch Manager Dashboard components
const BranchManagerDashboard = React.lazy(() => import("../layout/BranchManagerDashboard"));
const BranchAnalysisPage = React.lazy(() => import("../components/branch/BranchAnalysisPage"));
const DeliveryPartnerApplicationsAdmin = React.lazy(() => import("../components/branch/DeliveryPartnerApplication"));
const BranchOrdersSummary = React.lazy(() => import("../components/branch/BranchOrdersSummary"));
const BranchManagerProfile = React.lazy(() => import("../components/branch/BranchManagerProfile"));
const BranchActiveOrders = React.lazy(() => import("../components/branch/BranchActiveOrders"));
const BranchManagerAssignOrder = React.lazy(() => import("../components/branch/BranchManagerAssignOrder"));
const BranchOrderManagement = React.lazy(() => import("../components/branch/BranchOrderManagement"));
const BranchDeliveryPartners = React.lazy(() => import("../components/branch/BranchDeliveryPartners"));


// Delivery Partner Dashboard components
const DeliveryPartnerDashboard = React.lazy(() => import("../layout/DeliveryPartnerDashboard"));
const UpdateLocation = React.lazy(() => import("../components/deliverypartner/UpdateLocation"));
const UpdateMyAvailability = React.lazy(() => import("../components/deliverypartner/UpdateMyAvailability"));
const DeliveryPartnerProfilePage = React.lazy(() => import("../components/deliverypartner/DeliveryPartnerProfile"));
const DeliveryPartnerActiveOrders = React.lazy(() => import("../components/deliverypartner/DeliveryPartnerActiveOrders"));
const DeliveryPartnerOrders = React.lazy(() => import("../components/deliverypartner/DeliveryPartnerAllOrders"));
const DeliveryPartnerEarning = React.lazy(() => import("../components/deliverypartner/Earnings"));


export const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <Suspense fallback={<div>Loading App...</div>}>
                <App />
            </Suspense>
        ),
        children: [
            { path: '', element: <Suspense fallback={<div>Loading...</div>}><Home /></Suspense> },
            { path: "/products/:productId/customize", element: <Suspense fallback={<div>Loading...</div>}><ProductCustomDesign /></Suspense> },
            { path: '/product/:productId', element: <Suspense fallback={<div>Loading...</div>}><ProductDetails /></Suspense> },
            { path: '/products/:productId/confirm-customization', element: <Suspense fallback={<div>Loading...</div>}><ConfirmCustomizationPage /></Suspense> },
            { path: '/cart', element: <Suspense fallback={<div>Loading...</div>}><CartPage /></Suspense> },
            { path: '/place-order', element: <Suspense fallback={<div>Loading...</div>}><PlaceOrder /></Suspense> },
            { path: '/paypal/success', element: <Suspense fallback={<div>Loading...</div>}><SuccessOrder /></Suspense> },
            { path: '/sucessorder/:id', element: <Suspense fallback={<div>Loading...</div>}><OrderSucessDetails /></Suspense> },
            { path: '/order/:id', element: <Suspense fallback={<div>Loading...</div>}><OrderDetails /></Suspense> },
            { path: '/productlist', element: <Suspense fallback={<div>Loading...</div>}><ProductFilterListing /></Suspense> },
            { path: '/order/:orderId/feedback', element: <Suspense fallback={<div>Loading...</div>}><AddFeedbackPage /></Suspense> },
            { path: '/search', element: <Suspense fallback={<div>Loading...</div>}><SearchProductPage /></Suspense> },

            {
                path: '/branch-manager',
                element: (
                    <Suspense fallback={<div>Loading Branch Manager Dashboard...</div>}>
                        <BranchManagerDashboard />
                    </Suspense>
                ),
                children: [
                    {
                        path: '',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchAnalysisPage /></Suspense>
                    },
                    {
                        path: 'applications',
                        element: <Suspense fallback={<div>Loading...</div>}><DeliveryPartnerApplicationsAdmin /></Suspense>
                    },
                    {
                        path: 'orders',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchOrdersSummary /></Suspense>
                    },
                    {
                        path: 'profile',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchManagerProfile /></Suspense>
                    },
                    {
                        path: 'active_orders',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchActiveOrders /></Suspense>
                    },
                    {
                        path: 'assignorder',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchManagerAssignOrder /></Suspense>
                    },
                    {
                        path: 'orders',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchOrderManagement /></Suspense>
                    },
                    {
                        path: 'delivery-partners',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchDeliveryPartners /></Suspense>
                    },
                ]
            },
            {
                path: '/admin',
                element: (
                    <Suspense fallback={<div>Loading Admin Dashboard...</div>}>
                        <AdminDashboard />
                    </Suspense>
                ),
                children: [
                    {
                        path: '',
                        element: <Suspense fallback={<div>Loading...</div>}><WelcomeAdmin /></Suspense>
                    },
                    {
                        path: 'analysis',
                        element: <Suspense fallback={<div>Loading...</div>}><AdminAnalysisPage /></Suspense>
                    },
                    {
                        path: 'requests',
                        element: <Suspense fallback={<div>Loading...</div>}><AdminBranchManagerApplications /></Suspense>
                    },
                    {
                        path: 'users',
                        element: <Suspense fallback={<div>Loading...</div>}><UserManagement /></Suspense>
                    },
                    {
                        path: 'banners',
                        element: <Suspense fallback={<div>Loading...</div>}><BannerManager /></Suspense>
                    },
                    {
                        path: 'categories',
                        element: <Suspense fallback={<div>Loading...</div>}><CategoryManager /></Suspense>
                    },
                    {
                        path: 'coupon',
                        element: <Suspense fallback={<div>Loading...</div>}><CouponsManager /></Suspense>
                    },
                    {
                        path: 'branch-stations',
                        element: <Suspense fallback={<div>Loading...</div>}><BranchStationManagerPage /></Suspense>
                    },
                    {
                        path: 'products',
                        element: <Suspense fallback={<div>Loading...</div>}><ProductManagerPage /></Suspense>
                    },
                    {
                        path: 'products/new',
                        element: <Suspense fallback={<div>Loading...</div>}><ProductFormPage /></Suspense>
                    },
                    {
                        path: 'products/:id',
                        element: <Suspense fallback={<div>Loading...</div>}><ProductFormPage /></Suspense>
                    },
                    {
                        path: 'orders',
                        element: <Suspense fallback={<div>Loading...</div>}><OrderManager /></Suspense>
                    },
                    {
                        path: 'returnorders',
                        element: <Suspense fallback={<div>Loading...</div>}><ReturnOrderManagerPage /></Suspense>
                    },
                    {
                        path: 'Branch',
                        element: <Suspense fallback={<div>Loading...</div>}><AdminAssignOrderToBranch /></Suspense>
                    },
                ]
            },
        ]
    },
    {
        path: '/login',
        element: <Suspense fallback={<div>Loading Login Page...</div>}><LoginPage /></Suspense>
    },
    {
        path: '/register',
        element: <Suspense fallback={<div>Loading Register Page...</div>}><RegisterPage /></Suspense>
    },
    // -----------------------------User Dashboard --------------------------------------------------------
    {
        path: '/user',
        element: (
            <Suspense fallback={<div>Loading User Dashboard...</div>}>
                <UserDashboard />
            </Suspense>
        ),
        children: [
            {
                path: 'profile',
                element: <Suspense fallback={<div>Loading...</div>}><Profile /></Suspense>
            },
            {
                path: 'apply/branch-manager',
                element: <Suspense fallback={<div>Loading...</div>}><ApplyForBranchManager /></Suspense>
            },
            {
                path: 'apply/delivery-partner',
                element: <Suspense fallback={<div>Loading...</div>}><ApplyDeliveryPartner /></Suspense>
            },
            {
                path: 'orders',
                element: <Suspense fallback={<div>Loading...</div>}><UserOrders /></Suspense>
            }
        ]
    },
    // ---------------------------------DELIVERY PARTNER -------------------------------------
    {
        path: '/delivery',
        element: (
            <Suspense fallback={<div>Loading Delivery Partner Dashboard...</div>}>
                <DeliveryPartnerDashboard />
            </Suspense>
        ),
        children: [
            { path: 'update-location', element: <Suspense fallback={<div>Loading...</div>}><UpdateLocation /></Suspense> },
            { path: 'update-availability', element: <Suspense fallback={<div>Loading...</div>}><UpdateMyAvailability /></Suspense> },
            { path: 'profile', element: <Suspense fallback={<div>Loading...</div>}><DeliveryPartnerProfilePage /></Suspense> },
            { path: 'active-orders', element: <Suspense fallback={<div>Loading...</div>}><DeliveryPartnerActiveOrders /></Suspense> },
            { path: 'orders', element: <Suspense fallback={<div>Loading...</div>}><DeliveryPartnerOrders /></Suspense> },
            { path: '', element: <Suspense fallback={<div>Loading...</div>}><DeliveryPartnerEarning /></Suspense> },
        ]
    },
]);
