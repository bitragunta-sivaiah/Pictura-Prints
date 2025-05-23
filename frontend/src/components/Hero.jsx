import React from 'react';
import { ArrowRight, Shirt, Palette, Brush, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const primaryColor = '#2c3e50'; // A dark blue-gray
  const secondaryColor = '#3498db'; // A bright blue
  const accentColor = '#27ae60'; // A vibrant green

  return (
    <div className="relative bg-gradient-to-br from-gray-100 via-white to-gray-100 py-16 sm:py-24 lg:py-32 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1
            className={`text-3xl sm:text-5xl heading md:text-6xl  font-extrabold tracking-tight mb-6`}
         
          >
            Design Your Unique Style with Custom Prints
          </h1>
          <p className="mt-3 text-lg text-gray-700 sm:mt-5 sm:text-xl lg:text-2xl leading-relaxed">
            Express your brand, team spirit, or personal flair on high-quality apparel.
            Effortless customization, exceptional results.
          </p>
          <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-4 sm:gap-6">
          <Link to={'/productlist'}
              className={`bg-gradient-to-r from-[#3498db] to-[#27ae60] hover:from-[#27ae60] hover:to-[#3498db] text-white font-semibold py-3.5 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3498db]-400 focus:ring-offset-2 transition duration-300 ease-in-out md:text-lg`}
            >
              Start Designing Now <ArrowRight className="inline-block ml-2 -mr-1 h-5 w-5" />
            </Link>
            <Link  to={'/productlist'}
              className={`bg-white hover:bg-gray-100 border-1 text-${primaryColor} font-semibold py-3.5 px-8 rounded-full focus:outline-none focus:ring-2 focus:ring-${accentColor}-400 focus:ring-offset-2 transition duration-300 ease-in-out md:text-lg`}
            >
              Explore Our Apparel <Shirt className="inline-block ml-2 -mr-1 h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="bg-white rounded-xl overflow-hidden transition duration-300 ease-in-out shadow">
            <div className="p-6 text-center">
              <Shirt className={`mx-auto h-12 w-12 text-${secondaryColor}-500 mb-4`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Wide Apparel Selection</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                From classic tees to cozy hoodies and more. Find the perfect canvas for your design.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden transition duration-300 ease-in-out shadow">
            <div className="p-6 text-center">
              <Palette className={`mx-auto h-12 w-12 text-${accentColor}-500 mb-4`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unleash Your Creativity</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Effortlessly upload your artwork or create designs with our intuitive tools.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden transition duration-300 ease-in-out shadow">
            <div className="p-6 text-center">
              <Brush className={`mx-auto h-12 w-12 text-purple-500 mb-4`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Exceptional Print Quality</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Experience vibrant, durable prints that bring your vision to life and last.
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl overflow-hidden transition duration-300 ease-in-out shadow">
            <div className="p-6 text-center">
              <Tag className={`mx-auto h-12 w-12 text-orange-500 mb-4`} />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Minimum Quantities</h3>
              <p className="text-sm font-medium text-gray-600 leading-relaxed">
                Order exactly what you need, whether it's one unique item or a large batch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;