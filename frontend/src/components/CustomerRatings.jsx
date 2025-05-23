import React from 'react';
import { Star } from 'lucide-react';

const CustomerRatingCard = ({ name, location, rating, review }) => {
  const stars = Array.from({ length: 5 }, (_, index) => (
    <Star key={index} fill={index < rating ? '#ffc107' : 'none'} color="#ffc107" size={20} />
  ));

  return (
    <div className="bg-white rounded-md shadow-md p-6 w-full md:w-80">
      <h4 className="text-lg font-semibold text-gray-800 mb-1">{name}</h4>
      <p className="text-sm text-gray-500 mb-2">{location}</p>
      <div className="flex items-center mb-2">{stars}</div>
      <p className="text-gray-700 text-sm italic">"{review}"</p>
    </div>
  );
};

const CustomerRatingsPage = () => {
  const customerData = [
    {
      name: 'Priya Sharma',
      location: 'Mumbai, Maharashtra',
      rating: 5,
      review: 'Excellent product! The quality is top-notch and the delivery was prompt. Highly recommend!',
    },
    {
      name: 'Rahul Verma',
      location: 'Delhi, NCR',
      rating: 4,
      review: 'Good service overall. The item met my expectations, and the customer support was helpful.',
    },
    {
      name: 'Sneha Patel',
      location: 'Ahmedabad, Gujarat',
      rating: 5,
      review: 'I am very happy with my purchase. The product is exactly as described, and the price was reasonable.',
    },
    {
      name: 'Karthik Reddy',
      location: 'Bangalore, Karnataka',
      rating: 4,
      review: 'The product is good, but there was a slight delay in shipping. However, the communication was good.',
    },
    {
      name: 'Deepika Nair',
      location: 'Chennai, Tamil Nadu',
      rating: 5,
      review: 'Fantastic quality and great value for money. Will definitely be a returning customer.',
    },
    {
      name: 'Amit Singh',
      location: 'Kolkata, West Bengal',
      rating: 3,
      review: 'The product was okay. Not the best I have used, but it serves its purpose.',
    },
    {
      name: 'Shweta Gupta',
      location: 'Hyderabad, Telangana',
      rating: 5,
      review: 'Amazing! The product exceeded my expectations. Fast shipping and excellent packaging.',
    },
    {
      name: 'Vikram Joshi',
      location: 'Pune, Maharashtra',
      rating: 4,
      review: 'Satisfied with the purchase. The product is well-made and seems durable.',
    },
    {
      name: 'Anjali Menon',
      location: 'Kochi, Kerala',
      rating: 5,
      review: 'Love this product! It has made my life so much easier. Highly recommended to everyone.',
    },
    {
      name: 'Suresh Kumar',
      location: 'Jaipur, Rajasthan',
      rating: 4,
      review: 'Good product for the price. Had a minor issue, but customer service resolved it quickly.',
    },
    {
      name: 'Nandini Das',
      location: 'Guwahati, Assam',
      rating: 5,
      review: 'The best quality I have seen so far. Worth every penny. Thank you!',
    },
    {
      name: 'Rohan Mehra',
      location: 'Chandigarh, Punjab',
      rating: 3,
      review: 'Its an average product. Not bad, but not exceptionally good either.',
    },
  ];

  return (
    <div className="bg-gray-100 py-12 px-3">
      <div className="container mx-auto text-center mb-8">
        <h2 className="text-3xl font-semibold   mb-2 heading">What our   customers have to say</h2>
        <p className="text-gray-600">Read what our valued customers across India are saying about their experience.</p>
      </div>
      <div className=" mx-auto flex items-center  flex-wrap justify-center gap-6">
        {customerData.map((customer, index) => (
          <CustomerRatingCard key={index} {...customer} />
        ))}
      </div>
    </div>
  );
};

export default CustomerRatingsPage;