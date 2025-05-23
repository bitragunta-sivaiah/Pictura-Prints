import React from 'react';
import { MessageSquare, Phone, ArrowRight, MessageCircle, Mail, Search, Headset } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-black mt-20 text-white">
      {/* Yellow Banner */}
      <div className="relative bg-yellow-100 py-8 text-center">
        <div className="flex items-center justify-center md:justify-between fledelx-wrap gap-4 w-full max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-5xl  font-semibold heading mb-4">Ready to raise your t-shirt game?</h2>
          <button className="bg-[#383818] text-white font-bold py-3 px-6 rounded-full  focus:outline-none focus:ring-2 focus:ring-yellow-400">
            Begin your order <ArrowRight className="inline-block ml-2" size={16} />
          </button>
        </div>
        {/* Add a visual effect for the rough edge if needed, perhaps with a background image or SVG */}
      </div>

      {/* Search Bar */}
      <div className="bg-black/80 px-4 py-6">
        <div className="bg-[#10100f] relative w-full max-w-xl p-1 rounded-full mx-auto flex items-center justify-between">
          <input
            type="text"
            placeholder="Search for products, services, or resources..."
            className="bg-[#0a0a09] text-white  rounded-full py-3 px-6 w-full   focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <Search className="ml-4 absolute right-4 text-gray-400 mr-3" size={24} />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 py-12 px-4 sm:px-6 lg:px-8">
        {/* Contact Info */}
        <div>
          <h6 className="text-sm font-semibold text-gray-400 uppercase mb-4">Contact</h6>
          <ul className="text-gray-300 text-sm">
            <li className="flex items-center mb-2">
              <MessageSquare className="mr-2" size={16} /> Live Chat
            </li>
            <li className="flex items-center mb-2">
              <Phone className="mr-2" size={16} /> (407) 679-3885
            </li>
            <li className="flex items-center mb-2">
              <MessageCircle className="mr-2" size={16} /> Text Message
            </li>
            <li className="flex items-center mb-2">
              <Mail className="mr-2" size={16} /> Email Us
            </li>
          </ul>
        </div>

        {/* Services */}
        <div>
          <h6 className="text-sm font-semibold text-gray-400 uppercase mb-4">Services</h6>
          <ul className="text-gray-300 text-sm">
            <li className="mb-2">Screen Printing</li>
            <li className="mb-2">Embroidery</li>
            <li className="mb-2">Fulfillment</li>
            <li className="mb-2">Add Ons</li>
          </ul>
        </div>

        {/* Products */}
        <div>
          <h6 className="text-sm font-semibold text-gray-400 uppercase mb-4">Products</h6>
          <ul className="text-gray-300 text-sm">
            <li className="mb-2">T-Shirts</li>
            <li className="mb-2">Hoodies</li>
            <li className="mb-2">Sweatshirts</li>
            <li className="mb-2">Pants</li>
            <li className="mb-2">Hats</li>
            <li className="mb-2">All Products</li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h6 className="text-sm font-semibold text-gray-400 uppercase mb-4">Resources</h6>
          <ul className="text-gray-300 text-sm">
            <li className="mb-2">Blog</li>
            <li className="mb-2">Help Center</li>
            <li className="mb-2">Reviews</li>
            <li className="mb-2">Order Samples</li>
          </ul>
        </div>

        {/* About */}
        <div>
          <h6 className="text-sm font-semibold text-gray-400 uppercase mb-4">About</h6>
          <ul className="text-gray-300 text-sm">
            <li className="mb-2">Company</li>
            <li className="mb-2">Print Styles</li>
            <li className="mb-2">Sustainability</li>
            <li className="mb-2">Careers</li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="bg-darker-gray py-4 text-center text-gray-500 text-xs">
        © {new Date().getFullYear()} Your Company. All rights reserved.
      </div>

      {/* Chat Icon (Fixed Position) */}
      <div className="fixed bottom-6 right-6 bg-yellow-500 text-black rounded-full w-12 h-12 flex items-center justify-center shadow-lg hover:bg-yellow-600 cursor-pointer">
        <Headset className="w-6 h-6" />
      </div>
    </footer>
  );
};

export default Footer;