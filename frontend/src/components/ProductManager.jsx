import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
    fetchProducts,
    deleteProduct,
    selectAllProducts,
    selectProductsLoading,
    selectProductsError,
} from '../store/productSlice'; // Adjust path as needed
import { toast } from 'react-hot-toast';
import { Loader2, Plus, Pencil, Trash, ChevronLeft, ChevronRight } from 'lucide-react';

const ProductManager = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const products = useSelector(selectAllProducts);
    const loading = useSelector(selectProductsLoading);
    const error = useSelector(selectProductsError);

    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 7; // You can adjust this value

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleAddProduct = () => {
        navigate('/admin/products/new');
    };

    const handleEditProduct = (id) => {
        navigate(`/admin/products/${id}`);
    };

    const handleDeleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            dispatch(deleteProduct(id));
        }
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const totalPages = Math.ceil(products.length / productsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }

        // Modern UI for pagination with ellipsis
        const visiblePages = 5; // Number of visible page numbers
        let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
        let endPage = Math.min(totalPages, startPage + visiblePages - 1);

        if (endPage - startPage + 1 < visiblePages && endPage < totalPages) {
            endPage = Math.min(totalPages, startPage + visiblePages - 1);
        }
        if (endPage - startPage + 1 < visiblePages && startPage > 1) {
            startPage = Math.max(1, endPage - visiblePages + 1);
        }

        return (
            <>
                {startPage > 1 && (
                    <>
                        <button
                            onClick={() => setCurrentPage(1)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded focus:outline-none focus:shadow-outline"
                        >
                            1
                        </button>
                        {startPage > 2 && <span className="text-gray-500 mx-1">...</span>}
                    </>
                )}
                {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map((number) => (
                    <button
                        key={number}
                        onClick={() => setCurrentPage(number)}
                        className={`bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded focus:outline-none focus:shadow-outline ${
                            currentPage === number ? 'bg-indigo-500 text-white hover:bg-indigo-600' : ''
                        }`}
                    >
                        {number}
                    </button>
                ))}
                {endPage < totalPages && (
                    <>
                        {totalPages - endPage > 1 && <span className="text-gray-500 mx-1">...</span>}
                        <button
                            onClick={() => setCurrentPage(totalPages)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded focus:outline-none focus:shadow-outline"
                        >
                            {totalPages}
                        </button>
                    </>
                )}
            </>
        );
    };

    if (loading === 'pending') {
        return (
            <div className="container mx-auto p-8">
                <div className="flex items-center justify-center h-full">
                    <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
                    <span className="ml-2 text-gray-600">Loading products...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-8">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-semibold text-gray-800">Manage Products</h1>
                <button
                    onClick={handleAddProduct}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Product
                </button>
            </div>

            {products.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Info!</strong>
                    <span className="block sm:inline">No products available yet. Add one to get started.</span>
                </div>
            ) : (
                <>
                    <div className="overflow-x-auto mb-4">
                        <table className="min-w-full leading-normal shadow-md rounded-lg overflow-hidden">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Base Price
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Inventory
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white">
                                {currentProducts.map((product, index) => (
                                    <tr key={product._id}>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {indexOfFirstProduct + index + 1}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{product.name}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{product.category?.name}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">${product.basePrice}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">
                                                {product.availableColors.reduce((sum, color) => sum + color.stock, 0)}
                                            </p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 text-sm text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEditProduct(product._id)}
                                                    className="inline-flex items-center rounded-md bg-blue-500 px-2 py-2 text-xs font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                >
                                                    <Pencil className="w-4 h-4 mr-1" />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="inline-flex items-center rounded-md bg-red-500 px-2 py-2 text-xs font-semibold text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                                >
                                                    <Trash className="w-4 h-4 mr-1" />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-4 items-center mt-6">
                            <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-l focus:outline-none focus:shadow-outline disabled:opacity-50"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {renderPageNumbers()}
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-2 px-3 rounded-r focus:outline-none focus:shadow-outline disabled:opacity-50"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ProductManager;