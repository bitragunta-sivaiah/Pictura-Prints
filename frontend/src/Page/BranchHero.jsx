import React from 'react';
import { Link } from 'react-router-dom';
// Import specific Lucide React icons for branch features
import { MapPin, TrendingUp, Handshake, Box, CalendarCheck, Clock } from 'lucide-react';

// Assuming you have a relevant 3D image for a branch,
// or a general image representing a local business/community hub
import BranchStation3D from '../assets/branch.png'; // Placeholder for a branch-specific image

const BranchHero = () => {
    // Define a professional color palette, perhaps leaning into corporate/stable colors
    const primaryColorBrand = '#00695C'; // A deep teal/green for stability and growth
    const secondaryAccentColor = '#FFB300'; // A warm amber for warmth and partnership
    const textColorPrimary = '#212121';
    const textColorSecondary = '#546E7A'; // Slightly muted gray for secondary text
    const backgroundColor = '#F5F5F5'; // A very light gray

    return (
        <div className={`bg-[${backgroundColor}] max-sm:mt-20 py-20 relative overflow-hidden`}>
            {/* Subtle Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,105,92,0.05),transparent)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,179,0,0.05),transparent)]"></div>

            <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-20 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    {/* Left Column: Text Content */}
                    <div className="text-center md:text-left">
                        <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold text-[${textColorPrimary}] mb-6`}>
                            Empower Your Locality: Become a Branch Partner
                        </h1>
                        <p className={`text-lg md:text-xl text-[${textColorSecondary}] mb-8`}>
                            Join our expanding network as a local branch station. Facilitate seamless operations,
                            strengthen community ties, and unlock new opportunities for growth in your area.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                            <Link to={'/branch/onboarding'}
                                className={`bg-[${primaryColorBrand}] hover:bg-teal-700 hover:text-white font-semibold py-3 px-6 rounded-md shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition duration-300`}
                            >
                                Get Started as a Branch
                            </Link>
                            <Link to={'/branch/benefits'}
                                className={`bg-white hover:bg-gray-100 text-[${primaryColorBrand}] font-semibold py-3 px-6 rounded-md shadow-md border border-[${primaryColorBrand}] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 transition duration-300`}
                            >
                                Explore Benefits
                            </Link>
                        </div>
                        {/* Modern Benefit Highlights for Branches */}
                        <div className="mt-10 flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-teal-100 text-[${primaryColorBrand}]`}>
                                    <MapPin className="h-6 w-6" /> {/* Icon for Local Impact */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Local Presence</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-amber-100 text-[${secondaryAccentColor}]`}>
                                    <TrendingUp className="h-6 w-6" /> {/* Icon for Growth Opportunities */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Growth Opportunities</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-light-blue-100 text-[${primaryColorBrand}]`}>
                                    <Handshake className="h-6 w-6" /> {/* Icon for Strong Partnerships */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Strong Partnerships</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className={`p-2 rounded-full bg-indigo-100 text-[${primaryColorBrand}]`}>
                                    <Clock className="h-6 w-6" /> {/* Icon for Efficient Operations */}
                                </div>
                                <span className={`text-sm font-semibold text-[${textColorPrimary}]`}>Streamlined Workflow</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: 3D Branch Station Image */}
                    <div className="relative">
                        <div className="relative rounded-lg overflow-hidden">
                            <img
                                src={BranchStation3D}
                                alt="Branch Station"
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

export default BranchHero;