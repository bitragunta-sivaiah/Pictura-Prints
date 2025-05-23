import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getMyOrders, selectMyOrders, selectOrderLoading, selectOrderError } from '../../store/orderSlice';
import { Loader2, Package, Calendar, Clock, XCircle, CheckCircle, CreditCard, DollarSign, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays, subMonths } from 'date-fns';

const UserOrders = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const allOrders = useSelector(selectMyOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);

  const [timeFilter, setTimeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

  const applyFilters = useCallback(() => {
    if (!allOrders) return;

    let filtered = [...allOrders];

    if (timeFilter) {
      const now = new Date();
      let startDate;
      switch (timeFilter) {
        case 'last7Days':
          startDate = subDays(now, 7);
          break;
        case 'last30Days':
          startDate = subMonths(now, 1);
          break;
        case 'older':
          startDate = new Date(0);
          break;
        default:
          startDate = null;
      }
      if (startDate) {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.orderDate || order.createdAt);
          return (
            orderDate.getFullYear() >= startDate.getFullYear() &&
            orderDate.getMonth() >= startDate.getMonth() &&
            orderDate.getDate() >= startDate.getDate()
          );
        });
      }
    }

    if (statusFilter) {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  }, [allOrders, timeFilter, statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleViewOrder = (orderId) => {
    navigate(`/order/${orderId}`);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM, hh:mm a');
    } catch (error) {
      return 'N/A';
    }
  };

  const renderOrderStatus = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center text-xs font-medium text-yellow-800"><Clock className="h-4 w-4 mr-1" /> Pending</span>;
      case 'processing':
        return <span className="inline-flex items-center text-xs font-medium text-blue-800"><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Processing</span>;
      case 'shipped':
        return <span className="inline-flex items-center font-medium text-indigo-800"><Package className="h-4 w-4 mr-1" /> Shipped</span>;
      case 'at_branch':
        return <span className="inline-flex items-center text-xs font-medium text-purple-800"><Package className="h-4 w-4 mr-1" /> At Branch</span>;
      case 'assigned':
        return <span className="inline-flex items-center text-xs font-medium text-orange-800"><Package className="h-4 w-4 mr-1" /> Assigned</span>;
      case 'picked_up':
        return <span className="inline-flex items-center text-xs font-medium text-lime-800"><Package className="h-4 w-4 mr-1" /> Picked Up</span>;
      case 'in_transit':
        return <span className="inline-flex items-center text-xs font-medium text-sky-800"><Package className="h-4 w-4 mr-1" /> In Transit</span>;
      case 'out_for_delivery':
        return <span className="inline-flex items-center text-xs font-medium text-teal-800"><Package className="h-4 w-4 mr-1" /> Out for Delivery</span>;
      case 'delivered':
        return <span className="inline-flex items-center text-xs font-medium text-green-800"><CheckCircle className="h-4 w-4 mr-1" /> Delivered</span>;
      case 'completed':
        return <span className="inline-flex items-center text-xs font-medium text-emerald-800"><CheckCircle className="h-4 w-4 mr-1" /> Completed</span>;
      case 'cancelled':
        return <span className="inline-flex items-center text-xs font-medium text-red-800"><XCircle className="h-4 w-4 mr-1" /> Cancelled</span>;
      case 'refunded':
        return <span className="inline-flex items-center text-xs font-medium text-gray-600"><DollarSign className="h-4 w-4 mr-1" /> Refunded</span>;
      case 'failed':
        return <span className="inline-flex items-center text-xs font-medium text-rose-800"><XCircle className="h-4 w-4 mr-1" /> Failed</span>;
      default:
        return <span className="inline-flex items-center text-xs font-medium text-gray-800">{status}</span>;
    }
  };

  const renderPaymentInfo = (paymentMethod, paymentStatus) => {
    const methodLabel = paymentMethod ? paymentMethod.toUpperCase() : 'N/A';
    const statusLabel = paymentStatus ? paymentStatus.toUpperCase() : 'N/A';
    let statusColorClass = 'bg-gray-100 text-gray-800';

    if (paymentStatus === 'completed') {
      statusColorClass = 'text-green-800';
    } else if (paymentStatus === 'pending') {
      statusColorClass = 'text-yellow-800';
    } else if (paymentStatus === 'failed') {
      statusColorClass = 'text-red-800';
    } else if (paymentStatus === 'refunded') {
      statusColorClass = 'text-gray-600';
    } else if (paymentStatus === 'awaiting_payment') {
      statusColorClass = 'text-orange-600';
    }

    return (
      <div className="flex flex-col text-xs text-gray-600 space-x-2">
        <p className="flex items-center gap-1"> <CreditCard className="h-4 w-4" />
          <p className="flex items-center text-xs">Method: <p className="text-xs ">{methodLabel}</p></p></p>
        <p className={`inline-flex items-center rounded-full text-xs `}>
          <p>Payment:</p>
          <p className={`${statusColorClass} ml-1 text-xs`}> {statusLabel}</p>
        </p>
      </div>
    );
  };

  const toggleTimeDropdown = () => setIsTimeDropdownOpen(!isTimeDropdownOpen);
  const toggleStatusDropdown = () => setIsStatusDropdownOpen(!isStatusDropdownOpen);

  const handleTimeSelect = (value) => {
    setTimeFilter(value);
    setIsTimeDropdownOpen(false);
  };

  const handleStatusSelect = (value) => {
    setStatusFilter(value);
    setIsStatusDropdownOpen(false);
  };

  const allPossibleStatuses = [
    'pending', 'processing', 'shipped', 'at_branch', 'assigned', 'picked_up',
    'in_transit', 'out_for_delivery', 'delivered', 'completed', 'cancelled',
    'refunded', 'failed'
  ];
  const uniqueStatuses = allPossibleStatuses.filter(status =>
    allOrders?.some(order => order.status === status)
  );

  return (
    <motion.div
      className="mt-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="max-w-7xl mx-auto px-2">
        <motion.h1
          className="text-3xl font-semibold text-gray-900 mb-8 md:mb-12"
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Package className="inline-block text-xl lg:text-2xl mr-2 text-indigo-600" /> Your Order History
        </motion.h1>

        <div className="mb-4 flex items-center space-x-2">
          {/* Time Filter Dropdown */}
          <div className="relative">
            <button onClick={toggleTimeDropdown} className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 inline-flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              Time <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            {isTimeDropdownOpen && (
              <div className="absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu-button">
                  <button onClick={() => handleTimeSelect('')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">All Time</button>
                  <button onClick={() => handleTimeSelect('last7Days')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Last 7 Days</button>
                  <button onClick={() => handleTimeSelect('last30Days')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Last 30 Days</button>
                  <button onClick={() => handleTimeSelect('older')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">Older</button>
                </div>
              </div>
            )}
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <button onClick={toggleStatusDropdown} className="bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 inline-flex items-center text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
              Status <ChevronDown className="ml-2 h-4 w-4" />
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute z-10 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu-button">
                  <button onClick={() => handleStatusSelect('')} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">All Statuses</button>
                  {uniqueStatuses.sort().map(status => (
                    <button key={status} onClick={() => handleStatusSelect(status)} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                      {status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-indigo-600 h-10 w-10" />
          </div>
        ) : error ? (
          <motion.div className="rounded-md bg-red-100 p-4 text-red-700" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <strong className="font-bold">Error:</strong> {error}
          </motion.div>
        ) : filteredOrders.length > 0 ? (
          <motion.ul className="space-y-6" layout>
            {filteredOrders.map((order) => (
              <motion.li
                key={order._id}
                className="bg-white rounded-lg shadow border p-2 cursor-pointer transition-shadow duration-300"
                onClick={() => handleViewOrder(order._id)}
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Top: Order Number */}
                  <div className="md:col-span-3 flex justify-between items-center">
                    <h6 className="font-semibold text-xs text-gray-800">Order Number: {order.orderNumber || order._id}</h6>
                    {renderOrderStatus(order.status)} {/* Display status here */}
                  </div>

                  {/* Bottom Left: Order Product Details */}
                  <div>
                    <ul className="">
                      {order.items.slice(0, 2).map((item) => (
                        <li key={item._id} className="flex items-center text-sm">
                          {item.product.availableColors.find(c => c.color === item.color)?.images?.front ? (
                            <img
                              src={item.product.availableColors.find(c => c.color === item.color)?.images?.front}
                              alt={item.product.name}
                              className="w-24 h-24 border shadow object-cover rounded mr-2"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded mr-2 flex items-center justify-center">
                              <Package className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          {/* product details */}
                          <div className="flex flex-col w-full gap-1 text-xs">
                            <p>{item.product.name}  (X {item.quantity})</p>
                            <p className="flex items-center ">{renderPaymentInfo(order.paymentMethod, order.paymentStatus)}</p>
                            <p className="text-gray-600 flex  "><Calendar className="h-4 w-4 inline-block mr-1" /> <p className="text-[10px]">Placed on: {formatDate(order.orderDate || order.createdAt)}</p></p>
                            <p className="text-gray-700 font-semibold ">Total: ₹{order.total.toFixed(2)}</p>
                          </div>
                        </li>
                      ))}
                      {order.items.length > 2 && (
                        <li className="text-gray-500 text-sm">+{order.items.length - 2} more items</li>
                      )}
                    </ul>
                  </div>

                  {/* Bottom Right: View Details Button */}
                  {/* <div className="flex items-end justify-end">
                    <motion.button
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors duration-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewOrder(order._id);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Details
                    </motion.button>
                  </div> */}
                </div>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <motion.div className="rounded-md bg-yellow-100 p-4 text-yellow-700" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
            <strong className="font-bold">Info:</strong> No orders match your current filters.
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default UserOrders;