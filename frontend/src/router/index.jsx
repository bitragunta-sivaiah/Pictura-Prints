import { createBrowserRouter } from "react-router-dom";
import DeliveryPartnerDashboard from "../layout/DeliveryPartnerDashboard";
import UpdateLocation from "../components/deliverypartner/UpdateLocation";
import DeliveryPartnerProfilePage from "../components/deliverypartner/DeliveryPartnerProfile";
import DeliveryPartnerActiveOrders from "../components/deliverypartner/DeliveryPartnerActiveOrders";
import ProductFilterListing from "../Page/ProductFilterListing";
 
import ReturnOrderManagerPage from "../components/admin/ReturnOrderManagerPage";
 
 
import App from "../App";
import Home from "../Page/Home";
import LoginPage from "../Page/LoginPage";
import RegisterPage from "../Page/RegisterPage";
import UserDashboard from "../layout/UserDashboard";
import Profile from "../components/user/Profile";
import AdminDashboard from "../layout/AdminDashboard";
import UserManagement from "../components/admin/UserManagement";
import BannerManager from "../components/admin/BannerManager";
import CategoryManager from "../components/admin/CategoryManager";
import WelcomeAdmin from "../components/admin/WelcomeAdmin";
import ProductManagerPage from "../components/ProductManager";
import ProductDetails from "../components/ProductDetails";
import CouponsManager from "../components/admin/CouponsManager";
import BranchStationManagerPage from "../components/admin/BranchStationManager";
import CartPage from "../components/CartPage";
import ApplyForBranchManager from "../components/user/ApplyForBranchManager";
import AdminBranchManagerApplications from "../components/admin/AdminBranchManagerApplications";
import BranchManagerDashboard from "../layout/BranchManagerDashboard";
import DeliveryPartnerApplicationsAdmin from "../components/branch/DeliveryPartnerApplication";
import ApplyDeliveryPartner from "../components/user/ApplyDeliveryPartner";
import ConfirmCustomizationPage from "../components/ConfirmCustomization";
import ProductCustomDesign from "../components/CustomProductDesign";
 
 
import ProductFormPage from "../components/ProductForm";
import PlaceOrder from "../Page/PlaceOrder";
import UserOrders from "../components/user/UserOrder";
import SuccessOrder from "../components/SuccessOrder";
import OrderSucessDetails from "../components/user/OrderSucessDetails";
import OrderDetails from "../components/user/OrderDetails";
import OrderManager from "../components/admin/OrderManager";
import AdminAssignOrderToBranch from "../components/admin/AdminAssignOrderToBranch";
import BranchActiveOrders from "../components/branch/BranchActiveOrders";
import BranchManagerAssignOrder from "../components/branch/BranchManagerAssignOrder";
 
import DeliveryPartnerEarning from "../components/deliverypartner/Earnings";
import AdminAnalysisPage from "../components/admin/AdminAnalysis";
import BranchAnalysisPage from "../components/branch/BranchAnalysisPage";
import AddFeedbackPage from "../components/AddFeedback";
import BranchOrderManagement from "../components/branch/BranchOrderManagement";
import DeliveryPartnerOrders from "../components/deliverypartner/DeliveryPartnerAllOrders";
import UpdateMyAvailability from "../components/deliverypartner/UpdateMyAvailability";
import BranchDeliveryPartners from "../components/branch/BranchDeliveryPartners";


export const router = createBrowserRouter([
    {
        path:'/',
        element:<App/>,
        children:[
            {path:'',element:<Home/>},
            { path:"/products/:productId/customize" ,element:<ProductCustomDesign />},
            {path:'/product/:productId',element:<ProductDetails/>},
            {path:'/products/:productId/confirm-customization',element:<ConfirmCustomizationPage/>},
            {path:'/cart',element:<CartPage/>},
            {path:'/place-order',element:<PlaceOrder/>},
            { path: '/paypal/success', element: <SuccessOrder /> },
            { path: '/sucessorder/:id', element: <OrderSucessDetails /> },
            { path: '/order/:id', element: <OrderDetails /> },
            { path: '/productlist', element: <ProductFilterListing /> },
            { path: '/order/:orderId/feedback', element: <AddFeedbackPage /> },


            {path:'/branch-manager',element:<BranchManagerDashboard/>,
                children:[
                     {
                        path:'',
                        element:<BranchAnalysisPage/>
                     },
                    {
                        path:'applications',
                        element:<DeliveryPartnerApplicationsAdmin/>
                    },
                    {
                        path:'active_orders',
                        element:<BranchActiveOrders/>
                    },
                    {
                        path:'assignorder',
                        element:<BranchManagerAssignOrder/>
                    },
                    {
                        path:'orders',
                        element:<BranchOrderManagement/>
                    },
                    {
                        path:'delivery-partners',
                        element:<BranchDeliveryPartners/>
                    },
                   
                ]
            },
            {path:'/admin',element:<AdminDashboard/>,
                children:[
                    {
                        path:'',
                        element:<WelcomeAdmin/>
                    },
                    {
                        path:'analysis',
                        element:<AdminAnalysisPage/>
                    },
                    {
                        path:'requests',
                        element:<AdminBranchManagerApplications/>
                    },
                  
                    {
                        path:'users',
                        element:<UserManagement/>
                    },
                    {
                        path:'banners',
                        element:<BannerManager/>
                    },
                    {
                        path:'categories',
                        element:<CategoryManager/>
                    },
                    {
                        path:'coupon',
                        element:<CouponsManager/>
                    },
                    {
                        path:'branch-stations',
                        element:<BranchStationManagerPage/>
                    },
                    {
                        path:'products',
                        element:<ProductManagerPage/>
                    },
                    {
                        path:'products/new',
                        element:<ProductFormPage/>
                    },
                    {
                        path:'products/:id',
                        element:<ProductFormPage/>
                    },
                    {
                        path:'orders',
                        element:<OrderManager/>
                    },
                    {
                        path:'returnorders',
                        element:<ReturnOrderManagerPage/>
                    },
                    {
                        path:'Branch',
                        element:<AdminAssignOrderToBranch/>
                    },
                ]
            },
        ]
    },
    {
        path:'/login',
        element:<LoginPage/>
    },
    {
        path:'/register',
        element:<RegisterPage/>
    },
    //  -----------------------------User Dashboard --------------------------------------------------------
    {path:'/user',element:<UserDashboard/>,
        children:[
            {
                path:'profile',
                element:<Profile/>
            },
            {
                path:'apply/branch-manager',
                element:<ApplyForBranchManager/>
            },
            {
                path:'apply/delivery-partner',
                element:<ApplyDeliveryPartner/>
            },
            {
                path:'orders',
                element:<UserOrders/>
            }
        ]
    },
    // ---------------------------------DELVERY PARTNER -------------------------------------
    { path:'/delivery', element:<DeliveryPartnerDashboard/>,
        children:[
        
            {path:'update-location',element:<UpdateLocation/>},
            {path:'update-availability',element:<UpdateMyAvailability/>},
            {path:'profile',element:<DeliveryPartnerProfilePage/>},
            {path:'active-orders',element:<DeliveryPartnerActiveOrders/>},
            {path:'orders',element:<DeliveryPartnerOrders/>},
            {path:'',element:<DeliveryPartnerEarning/>},
        ]
    }
]);