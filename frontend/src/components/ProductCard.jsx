import React from 'react';
import { Link } from 'react-router-dom';

const ProductCard = ({ product }) => {
    const imageUrl = product.availableColors?.[0]?.images?.front || product.generatedImage?.front?.url || null;

    return (
        <div className="group relative bg-white rounded-xl shadow overflow-hidden transition-shadow ">
            <Link to={`/product/${product._id}`} className="block">
                <div className="relative aspect-w-4 aspect-h-3">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform transform group-hover:scale-105 duration-300 ease-in-out"
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex justify-center items-center text-gray-500">
                            No Image Available
                        </div>
                    )}
                    {product.discountPercentage > 0 && (
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold rounded-full px-2 py-1 z-10">
                            -{product.discountPercentage}%
                        </div>
                    )}
                    {product.tags && product.tags.length > 0 && (
                        <div className="absolute top-2 left-2 bg-indigo-600 text-white text-xs font-semibold rounded-full px-2 py-1 z-10">
                            {product.tags[0]}
                        </div>
                    )}
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">{product.name}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                
                </div>
            </Link>
            
        </div>
    );
};

export default ProductCard;