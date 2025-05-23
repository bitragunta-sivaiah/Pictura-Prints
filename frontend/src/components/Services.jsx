import React from 'react';
import { Cpu, Layers, Package, Rocket, ShieldCheck, Settings } from 'lucide-react';

const ServiceCard = ({ icon, title, description }) => (
  <div className="bg-white rounded-md shadow-md p-6 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-full bg-blue-100 text-[#313115] flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
    <button className="mt-4 text-[#313115] font-medium">Learn more →</button>
  </div>
);

const ServicesPage = () => {
  const servicesData = [
    {
      icon: <Cpu size={24} />,
      title: 'Water-Based Screen Printing',
      description: 'Experience vibrant and soft prints with our eco-friendly water-based screen printing techniques. Perfect for a premium feel and detailed designs.',
    },
    {
      icon: <Layers size={24} />,
      title: 'Embroidery Services',
      description: 'Add a touch of elegance and durability with our high-quality embroidery. Ideal for logos, names, and intricate designs on various apparel.',
    },
    {
      icon: <Package size={24} />,
      title: 'Custom Add-ons & Specialty Printing',
      description: 'Go beyond the basics with custom labels, tags, unique printing effects, and more to make your apparel truly stand out.',
    },
    {
      icon: <Rocket size={24} />,
      title: 'Fast Turnaround Times',
      description: 'Need your order quickly? We offer efficient production and delivery to meet your deadlines without compromising quality.',
    },
    {
      icon: <ShieldCheck size={24} />,
      title: 'Quality Assurance',
      description: 'We are committed to providing top-notch quality in every order. Our rigorous quality checks ensure your satisfaction.',
    },
    {
      icon: <Settings size={24} />,
      title: 'Expert Design Assistance',
      description: 'Our experienced design team is here to help bring your vision to life, offering guidance and support throughout the process.',
    },
  ];

  return (
    <div className="bg-gray-100 mx-3 lg:mx-10 px-4 py-12">
      <div className="container mx-auto text-center mb-8">
        <h2 className="text-3xl lg:text-5xl  font-semibold  heading mb-2">Our Services</h2>
        <p className="text-gray-600">
          We offer water-based screen printing, embroidery, and custom add-on solutions to create retail-quality apparel
          at an unmatched value.
        </p>
        <div className="mt-4 flex items-center flex-wrap gap-2 justify-center">
          <button className="bg-[#313115] text-white font-semibold rounded-full px-6 py-2 mr-2 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-400">
            Add-ons & specialty printing
          </button>
          <button className="text-[#313115] font-semibold px-6 py-2  focus:outline-none focus:ring-2 rounded-full border-1 focus:ring-blue-400">
            Our printing styles
          </button>
        </div>
      </div>
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {servicesData.map((service, index) => (
          <ServiceCard key={index} {...service} />
        ))}
      </div>
    </div>
  );
};

export default ServicesPage;