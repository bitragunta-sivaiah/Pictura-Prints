import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories, selectAllCategories, selectCategoriesLoading, selectCategoriesError } from '../store/categorySlice';
import { Link } from 'react-router-dom';  
const Loader = ({ message }) => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
    {message && <p className="ml-2 text-gray-600">{message}</p>}
  </div>
);

const CategoryList = () => {
  const dispatch = useDispatch();
  const categories = useSelector(selectAllCategories);
  const loading = useSelector(selectCategoriesLoading);
  const error = useSelector(selectCategoriesError);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  if (loading) {
    return <Loader message="Fetching categories..." />;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold text-gray-800  heading text-center mb-10 md:text-5xl"> Explore Our Popular Categories</h2>
      {categories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map(category => (
            <div key={category._id} className="bg-white  overflow-hidden">
              {category.imageUrl && (
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className="w-full h-[300px] object-cover rounded-lg  shadow"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">{category.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                {/* If you want to link to a category details page */}
                {/* <Link to={`/categories/${category.slug}`} className="text-blue-500 hover:underline">
                  View Products
                </Link> */}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No categories available.</p>
      )}
    </div>
  );
};

export default CategoryList;