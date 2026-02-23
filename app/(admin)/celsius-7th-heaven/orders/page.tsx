'use client'

import axios from 'axios';
import { ChevronLeft, ChevronRight, Eye, Search, X, Package, Truck, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { useSearchParams } from 'next/navigation';

interface OrderUser {
  fullName: string;
  email: string;
  phone: string;
}

interface Order {
  id: string;
  user: OrderUser;
  items: any;
  subtotal: string;
  netAmountPaid?: string;
  discount?: string;
  couponCode?: string;
  paymentStatus: string;
  status: string;
  shippingAddress: any;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  refundPendingCount?: number; // Added optional
}

const StatusBadge: React.FC<{ status: string; type: 'payment' | 'order' }> = ({ status, type }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let icon = null;

  const s = status.toUpperCase();

  if (type === 'payment') {
    if (s === 'PAID') colorClass = 'bg-green-100 text-green-800';
    else if (s === 'FAILED') colorClass = 'bg-red-100 text-red-800';
    else if (s === 'REFUNDED') colorClass = 'bg-cyan-100 text-cyan-800 border border-cyan-200';
    else colorClass = 'bg-yellow-100 text-yellow-800';
  } else {
    // Order Status
    if (s === 'DELIVERED') { colorClass = 'bg-green-100 text-green-800'; icon = <CheckCircle className="w-3 h-3 mr-1" />; }
    else if (s === 'SHIPPED') { colorClass = 'bg-blue-100 text-blue-800'; icon = <Truck className="w-3 h-3 mr-1" />; }
    else if (s === 'PROCESSING') { colorClass = 'bg-purple-100 text-purple-800'; icon = <Package className="w-3 h-3 mr-1" />; }
    else if (s === 'CANCELLED') { colorClass = 'bg-red-100 text-red-800'; icon = <AlertCircle className="w-3 h-3 mr-1" />; }
    else { colorClass = 'bg-yellow-100 text-yellow-800'; icon = <Clock className="w-3 h-3 mr-1" />; }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {icon}
      {status}
    </span>
  );
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refundPendingCount, setRefundPendingCount] = useState(0);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const searchParams = useSearchParams();
  const customerFilter = searchParams.get('customer') || '';


  const itemsPerPage = 10;

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchTerm,
        status: statusFilter,
        customer: customerFilter,
      });
      const response = await axios.get(`/api/v1/admin/orders?${params.toString()}`);
      setOrders(response.data.data);
      setMeta(response.data.meta);
      if (response.data.meta.refundPendingCount !== undefined) {
          setRefundPendingCount(response.data.meta.refundPendingCount);
      }
      if (response.data.meta.newOrdersCount !== undefined) {
          setNewOrdersCount(response.data.meta.newOrdersCount);
      }
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, itemsPerPage, customerFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const openOrderDetails = (order: Order) => {
    setCurrentOrder(order);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setCurrentOrder(null);
  };

  // UPDATED: Handle Refund Status Update
  const handleStatusUpdate = async (newStatus: string, type: 'status' | 'paymentStatus' = 'status') => {
    if (!currentOrder) return;
    setIsUpdatingStatus(true);
    try {
      const payload = type === 'status' ? { status: newStatus } : { paymentStatus: newStatus };
      
      await axios.put(`/api/v1/admin/orders/${currentOrder.id}`, payload);
      
      const updatedFields = type === 'status' ? { status: newStatus } : { paymentStatus: newStatus };
      setCurrentOrder(prev => prev ? { ...prev, ...updatedFields } : null);
      
      // Refresh list to update counts if we just refunded something
      fetchOrders();
      
      if (newStatus === 'REFUNDED') {
          alert('Refund processed & User Notified!');
      } else {
          alert('Order updated successfully');
      }
    } catch (error) {
      alert('Failed to update');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const getOrderItems = (order: Order) => {
    if (Array.isArray(order.items)) return order.items;
    return [];
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
          
          {/* NEW: Quick Filter for Refund Pending */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => { setStatusFilter('NEW_ORDERS'); setCurrentPage(1); }}
              className={`relative flex! items-center px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'NEW_ORDERS' ? 'bg-[#ddb040] text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
            >
              <Package className="w-4 h-4 mr-2" />
              New Orders
              {newOrdersCount > 0 && (
                  <span className="ml-2 bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {newOrdersCount}
                  </span>
              )}
            </button>

            {/* Refunds Awaiting Button */}
            <button 
              onClick={() => { setStatusFilter('REFUND_PENDING'); setCurrentPage(1); }}
              className={`relative flex! items-center px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'REFUND_PENDING' ? 'bg-[#ddb040] text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Refunds Awaiting
              {refundPendingCount > 0 && (
                  <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                      {refundPendingCount}
                  </span>
              )}
            </button>
          </div>
        </div>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-3 py-2 border text-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
                placeholder="Search by Order ID, Customer Name, Email..."
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 border text-gray-600 cursor-pointer border-gray-300 rounded-lg shadow-sm focus:ring-gray-800 focus:border-gray-800 sm:text-sm"
            >
              <option value="">All Statuses</option>
              <option value="REFUND_PENDING">⚠ Refund Awaiting ({refundPendingCount})</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th className="px-6 py-3">Order ID</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Total</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8">Loading orders...</td></tr>
              ) : orders.length > 0 ? (
                orders.map(order => (
                  <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.user.fullName}</span>
                        <span className="text-xs text-gray-500">{order.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>₹{order.netAmountPaid || order.subtotal}</span>
                        {order.couponCode && (
                          <span className="text-xs text-green-600 font-medium">🎟️ {order.couponCode}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={order.paymentStatus} type="payment" /></td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} type="order" /></td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => openOrderDetails(order)} className="text-gray-500 hover:text-blue-600">
                        <Eye className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="text-center py-8">No orders found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2 py-3 border-t">
            <span className="text-sm text-gray-700">Page {meta.page} of {meta.totalPages}</span>
            <div className="flex space-x-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={meta.page === 1} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronLeft className="w-5 h-5" /></button>
              <button onClick={() => setCurrentPage(p => Math.min(meta.totalPages, p + 1))} disabled={meta.page === meta.totalPages} className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50"><ChevronRight className="w-5 h-5" /></button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Side Panel */}
      <div className={`fixed inset-0 z-40 bg-black/60 transition-opacity ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closePanel} />
      <div className={`fixed top-0 right-0 h-full w-full max-w-2xl bg-white shadow-xl z-50 transform transition-transform duration-300 ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {currentOrder && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">Order #{currentOrder.id.slice(-6).toUpperCase()}</h2>
                <p className="text-sm text-gray-500">{new Date(currentOrder.createdAt).toLocaleString()}</p>
              </div>
              <button onClick={closePanel} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Status Control */}
              <div className="bg-gray-50 p-4 rounded-lg border">
                {isUpdatingStatus && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-lg z-10">
                    <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">Update Order Status</label>
                <select
                  value={currentOrder.status}
                  onChange={(e) => handleStatusUpdate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:ring-gray-800 focus:border-gray-800"
                >
                  <option value="PENDING">Pending</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

               {/* REFUND ACTION BUTTON */}
              {currentOrder.status === 'CANCELLED' && currentOrder.paymentStatus === 'PAID' && (
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 mt-4">
                      <div className="flex justify-between items-center">
                          <div>
                              <h4 className="font-bold text-red-800 text-sm">Action Required</h4>
                              <p className="text-xs text-red-600 mt-1">User cancelled this paid order.</p>
                          </div>
                          <button 
                              onClick={() => {
                                  if(confirm("Confirm Refund? This will notify the user.")) {
                                      handleStatusUpdate('REFUNDED', 'paymentStatus');
                                  }
                              }}
                              className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors shadow-sm"
                          >
                              Process Refund
                          </button>
                      </div>
                  </div>
              )}

              {/* Customer Details */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Customer</h3>
                  <p className="font-medium">{currentOrder.user.fullName}</p>
                  <p className="text-sm text-gray-600">{currentOrder.user.email}</p>
                  <p className="text-sm text-gray-600">{currentOrder.user.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">Shipping Address</h3>
                  {currentOrder.shippingAddress ? (
                    <div className="text-sm text-gray-600">
                      <p>{currentOrder.shippingAddress.fullAddress}</p>
                      <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}</p>
                      <p>{currentOrder.shippingAddress.pincode}, {currentOrder.shippingAddress.country}</p>
                    </div>
                  ) : <p className="text-sm text-gray-400">No address provided</p>}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase mb-3">Items</h3>
                <div className="border rounded-lg divide-y overflow-hidden bg-white">
                  {getOrderItems(currentOrder).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-start justify-between hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-4">
                        {/* Product Image */}
                        <div className="h-16 w-16 shrink-0 rounded-md border border-gray-200 overflow-hidden bg-white">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name || 'Product'} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-100 text-gray-400">
                              <Package className="w-8 h-8" />
                            </div>
                          )}
                        </div>
                        
                        {/* Product Details */}
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">
                              {item.name || <span className="text-gray-400 italic">Unknown Product ({item.productId?.slice(-6)})</span>}
                          </p>
                          
                          <div className="mt-1 space-y-1">
                              {item.size && (
                                  <p className="text-xs text-gray-600 flex items-center">
                                      <span className="font-medium mr-1 text-gray-500">Size:</span> 
                                      <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-700">{item.size}ml</span>
                                  </p>
                              )}
                              <p className="text-xs text-gray-600 flex items-center">
                                  <span className="font-medium mr-1 text-gray-500">Qty:</span> {item.quantity}
                              </p>
                          </div>
                        </div>
                      </div>

                      {/* Price Column */}
                      <div className="text-right">
                          <p className="font-medium text-sm text-gray-900">₹{item.priceAtPurchase?.toLocaleString() || '0'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Total: <span className="font-medium">₹{((item.priceAtPurchase || 0) * (item.quantity || 1)).toLocaleString()}</span>
                          </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>₹{currentOrder.subtotal}</span>
                </div>
                {currentOrder.couponCode && (
                  <div className="flex justify-between mb-2 text-green-600">
                    <span className="flex items-center gap-1">
                      🎟️ Coupon Applied
                      <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded">
                        {currentOrder.couponCode}
                      </span>
                    </span>
                    <span>-₹{currentOrder.discount || 0}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total Paid</span>
                  <span className="text-green-700">₹{currentOrder.netAmountPaid || currentOrder.subtotal}</span>
                </div>
                <div className="mt-2 text-right">
                  <StatusBadge status={currentOrder.paymentStatus} type="payment" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}