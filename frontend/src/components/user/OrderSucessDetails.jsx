import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getOrderDetails, resetOrder } from '../../store/orderSlice';
import {
    PackageIcon,
    MapPinIcon,
    CreditCardIcon,
    ReceiptIcon,
    CalendarIcon,
    TruckIcon,
    ArrowLeftIcon,
    DownloadIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import * as domtoimage from 'dom-to-image'; // Import dom-to-image

const OrderSucessDetails = () => {
    const { id: orderId } = useParams();
    const dispatch = useDispatch();
    const { order, loading, error } = useSelector((state) => state.order);
    const orderDetailsRef = useRef(null);

    useEffect(() => {
        dispatch(getOrderDetails(orderId));
        return () => {
            dispatch(resetOrder());
        };
    }, [dispatch, orderId]);

    const downloadInvoice = () => {
        if (orderDetailsRef.current) {
            domtoimage.toPng(orderDetailsRef.current, {
                bgcolor: 'white', // Force white background
                style: {
                    width: orderDetailsRef.current.offsetWidth + 'px', // Ensure container width is captured
                    height: orderDetailsRef.current.offsetHeight + 'px', // Ensure container height is captured
                },
                copyStyles: true // Important for preserving styles
            })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `invoice_order_${order?.orderNumber}.png`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            })
            .catch((error) => {
                console.error('Error capturing image:', error);
            });
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6 bg-white shadow-md rounded-md">
                <p className="text-center text-gray-600 py-4">Loading order details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6 bg-white shadow-md rounded-md">
                <p className="text-center text-red-500 py-4">Error loading order details: {error}</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="container mx-auto p-6 bg-white shadow-md rounded-md">
                <p className="text-center text-gray-600 py-4">Order not found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 mt-20 bg-white shadow-md rounded-md">
            <div className="flex justify-between items-center mb-4">
                <Link to="/my-orders" className="inline-flex items-center text-blue-500 hover:underline">
                    <ArrowLeftIcon className="mr-2 w-4 h-4" /> Back to My Orders
                </Link>
                <button
                    onClick={downloadInvoice}
                    className="inline-flex items-center bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    <DownloadIcon className="mr-2 w-4 h-4" /> Download Invoice
                </button>
            </div>
            <div ref={orderDetailsRef} className="p-4">
                <h1 className="text-2xl font-semibold mb-4">Order Details</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Order Information */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Information</h2>
                        <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                            <div className="flex items-center">
                                <ReceiptIcon className="mr-2 w-5 h-5 text-gray-500" />
                                <strong className="whitespace-nowrap">Order Number:</strong>
                            </div>
                            <div>{order.orderNumber}</div>
                        </div>
                        <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                            <div className="flex items-center">
                                <CalendarIcon className="mr-2 w-5 h-5 text-gray-500" />
                                <strong className="whitespace-nowrap">Order Date:</strong>
                            </div>
                            <div>{order.orderDate && format(new Date(order.orderDate), 'MMMM d,yyyy h:mm a')}</div>
                        </div>
                        <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                            <div className="flex items-center">
                                <PackageIcon className="mr-2 w-5 h-5 text-gray-500" />
                                <strong className="whitespace-nowrap">Status:</strong>
                            </div>
                            <div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                    order.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                    order.status === 'processing' ? 'bg-blue-200 text-blue-800' :
                                    order.status === 'shipped' ? 'bg-green-200 text-green-800' :
                                    order.status === 'delivered' ? 'bg-green-500 text-white' :
                                    order.status === 'cancelled' ? 'bg-red-200 text-red-800' :
                                    'bg-gray-200 text-gray-800'
                                }`}>{order.status.replace(/_/g, ' ')}</span>
                            </div>
                        </div>
                        {order.trackingNumber && (
                            <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                                <div className="flex items-center">
                                    <TruckIcon className="mr-2 w-5 h-5 text-gray-500" />
                                    <strong className="whitespace-nowrap">Tracking Number:</strong>
                                </div>
                                <div>{order.trackingNumber}</div>
                            </div>
                        )}
                        {order.deliveryPartner && (
                            <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                                <div className="flex items-center">
                                    <TruckIcon className="mr-2 w-5 h-5 text-gray-500" />
                                    <strong className="whitespace-nowrap">Delivery Partner:</strong>
                                </div>
                                <div>{order.deliveryPartner}</div>
                            </div>
                        )}
                        {order.deliveryPartnerStatus && (
                            <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                                <div className="flex items-center">
                                    <PackageIcon className="mr-2 w-5 h-5 text-gray-500" />
                                    <strong className="whitespace-nowrap">Delivery Status:</strong>
                                </div>
                                <div>{order.deliveryPartnerStatus}</div>
                            </div>
                        )}
                    </div>

                    {/* Shipping & Billing */}
                    <div>
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Shipping & Billing</h2>
                        <div className="mb-4">
                            <h3 className="font-semibold text-gray-600 mb-1 flex items-center"><MapPinIcon className="mr-2 w-4 h-4 text-gray-500" /> Shipping Address</h3>
                            <p>{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.streetAddress}, {order.shippingAddress.apartmentSuiteUnit}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                            <p>{order.shippingAddress.country}</p>
                            <p>Phone: {order.shippingAddress.phone}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-600 mb-1 flex items-center"><MapPinIcon className="mr-2 w-4 h-4 text-gray-500" /> Billing Address</h3>
                            {typeof order.billingAddress === 'string' ? (
                                <p className="text-sm text-gray-500 italic">Same as shipping address</p>
                            ) : (
                                <>
                                    <p>{order.billingAddress.fullName}</p>
                                    <p>{order.billingAddress.streetAddress}, {order.billingAddress.apartmentSuiteUnit}</p>
                                    <p>{order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.postalCode}</p>
                                    <p>{order.billingAddress.country}</p>
                                    <p>Phone: {order.billingAddress.phone}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Items</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal shadow-md rounded-md">
                            <thead>
                                <tr className="bg-gray-100 text-gray-700">
                                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Product</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Color</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold uppercase tracking-wider">Size</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider">Quantity</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider">Price</th>
                                    <th className="px-4 py-3 text-right text-sm font-semibold uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order.items.map((item) => (
                                    <tr key={item._id}>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.product && item.product.name}
                                            {item.customizations && item.customizations.length > 0 && (
                                                <div className="text-xs text-gray-500 italic">
                                                    Customizations: {item.customizations.join(', ')} {/* Adjust how you display customizations */}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.color}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{item.size}</td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">{item.quantity}</td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">${item.finalPrice.toFixed(2)}</td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">${(item.quantity * item.finalPrice).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="5" className="px-4 py-3 text-right font-semibold uppercase tracking-wider">Subtotal:</td>
                                    <td className="px-4 py-3 text-right">${order.subtotal.toFixed(2)}</td>
                                </tr>
                                {order.discountAmount > 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-3 text-right font-semibold uppercase tracking-wider">Discount:</td>
                                        <td className="px-4 py-3 text-right">-${order.discountAmount.toFixed(2)}</td>
                                    </tr>
                                )}
                                {order.shippingCost > 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-3 text-right font-semibold uppercase tracking-wider">Shipping Cost:</td>
                                        <td className="px-4 py-3 text-right">${order.shippingCost.toFixed(2)}</td>
                                    </tr>
                                )}
                                <tr>
                                    <td colSpan="5" className="px-4 py-3 text-right text-lg font-semibold uppercase tracking-wider">Total:</td>
                                    <td className="px-4 py-3 text-right text-lg">${order.total.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Payment Information */}
                <div className="mt-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-2">Payment Information</h2>
                    <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                        <div className="flex items-center">
                            <CreditCardIcon className="mr-2 w-5 h-5 text-gray-500" />
                            <strong className="whitespace-nowrap">Payment Method:</strong>
                        </div>
                        <div>{order.paymentMethod.toUpperCase()}</div>
                    </div>
                    <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                        <div className="flex items-center">
                            <ReceiptIcon className="mr-2 w-5 h-5 text-green-500" />
                            <strong className="whitespace-nowrap">Payment Status:</strong>
                        </div>
                        <div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                order.paymentStatus === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                                order.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' :
                                'bg-gray-200 text-gray-800'
                            }`}>{order.paymentStatus.replace(/_/g, ' ')}</span>
                        </div>
                    </div>
                    {order.transactionId && (
                        <div className="mb-2 grid grid-cols-2 gap-x-2 items-start">
                            <div className="flex items-center">
                                <span className="mr-2 w-5 h-5 text-gray-500">#</span>
                                <strong className="whitespace-nowrap">Transaction ID:</strong>
                            </div>
                            <div>{order.transactionId}</div>
                        </div>
                    )}
                </div>

                {/* Order Notes (If available) */}
                {order.orderNotes && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold text-gray-700 mb-2">Order Notes</h2>
                        <p className="text-gray-700">{order.orderNotes}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrderSucessDetails;