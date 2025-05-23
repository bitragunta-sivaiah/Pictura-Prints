import React from 'react';

// Assuming you have a 3D image (rendered as a static PNG) in your public folder
import DeliveryPartner3D from '../assets/deliverypartner.png';
import DeliveryIcon from '../assets/orderbold.png'; // A generic delivery icon
import FlexibleIcon from '../assets/deal.png';
import EarningsIcon from '../assets/competitive.png';
import { Link } from 'react-router-dom';

const DeliveryPartnerHeroProfessional = () => {
    // Using Blinkit's primary for the main CTA and Meesho's primary as a secondary accent
    const primaryColorBlinkit = '#00B8D4';
    const primaryColorMeesho = '#F37021';
    const secondaryColorBlinkit = '#FFC107';
    const textColorPrimary = '#212121';
    const textColorSecondary = '#757575';
    const backgroundColor = '#F9F9F9'; // A slightly warmer light gray

    return (
        <div className={`bg-[${backgroundColor}] max-sm:mt-20 py-20 relative overflow-hidden`}>
            {/* Subtle Background Pattern (Optional - using Tailwind's background patterns) */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,184,212,0.05),transparent)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(243,112,33,0.05),transparent)]"></div>

            <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="text-center md:text-left">
                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[${textColorPrimary}] mb-6`}>
                            Drive Your Future: Partner with Us for Flexible Earnings
                        </h1>
                        <p className={`text-lg md:text-xl text-[${textColorSecondary}] mb-8`}>
                            Join a leading platform trusted by millions. Enjoy the freedom to choose your hours,
                            maximize your income, and be a vital part of our fast-growing delivery network.
                        </p>
                        <div className=" gap-3 text-sm flex items-center w-full">
                            <Link to={'/delivery/active-orders'}
                                className={`bg-[${primaryColorBlinkit}] hover:bg-cyan-600 text-black w-fit h-fit hover:text-white font-semibold py-3 px-4 lg:px-6 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 transition duration-300`}
                            >
                               View Your Assign Orders
                            </Link>
                            <Link to={'/delivery'}
                                className={`bg-white hover:bg-gray-100 text-[${primaryColorMeesho}] font-semibold py-3 px-6 rounded-md shadow-md border border-[${primaryColorMeesho}] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition duration-300`}
                            >
                               Check Your Earnings
                            </Link>
                        </div>
                        {/* Modern Benefit Highlights */}
                        <div className="mt-10 flex justify-center md:justify-start space-x-8">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-cyan-100 text-[${primaryColorBlinkit}]`}>
                                    <img src={DeliveryIcon} alt="Efficient Deliveries" className="h-6 w-6" />
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Efficient Deliveries</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-yellow-100 text-[${secondaryColorBlinkit}]`}>
                                    <img src={FlexibleIcon} alt="Flexible Schedule" className="h-6 w-6" />
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Flexible Schedule</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-orange-100 text-[${primaryColorMeesho}]`}>
                                    <img src={EarningsIcon} alt="Competitive Earnings" className="h-6 w-6" />
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Competitive Earnings</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: 3D Delivery Partner Image */}
                    <div className="relative">
                        <div className="relative rounded-lg overflow-hidden">
                            <img
                                src={DeliveryPartner3D}
                                alt="Delivery Partner"
                                className="w-full mx-auto md:mx-0 object-cover"
                            />
                            {/* Subtle gradient overlay on the image for depth */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>
                        {/* Optional: Floating effect (requires animation library or custom CSS) */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeliveryPartnerHeroProfessional;