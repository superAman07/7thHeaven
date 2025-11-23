'use client'

import axios from 'axios';
import { ChevronLeft, ChevronRight, Eye, Search, X, Package, Truck, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

interface OrderUser {
  fullName: string;
  email: string;
  phone: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
  // We might not have name/image in the JSON if not saved, 
  // but assuming your create order logic saves a snapshot or we fetch it.
  // For now, let's assume the JSON has basic details or we rely on IDs.
  // Ideally, your Order creation should save { name, image, price, qty } in 'items'.
}

interface Order {
  id: string;
  user: OrderUser;
  items: any; // JSON
  subtotal: string;
  paymentStatus: string;
  status: string;
  shippingAddress: any; // JSON
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const StatusBadge: React.FC<{ status: string; type: 'payment' | 'order' }> = ({ status, type }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  let icon = null;

  const s = status.toUpperCase();

  if (type === 'payment') {
    if (s === 'PAID') colorClass = 'bg-green-100 text-green-800';
    else if (s === 'FAILED') colorClass = 'bg-red-100 text-red-800';
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
  const itemsPerPage = 10;

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: debouncedSearchTerm,
        status: statusFilter,
      });
      const response = await axios.get(`/api/v1/admin/orders?${params.toString()}`);
      setOrders(response.data.data);
      setMeta(response.data.meta);
    } catch (err) {
      console.error('Failed to fetch orders', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearchTerm, statusFilter, itemsPerPage]);

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

  const handleStatusUpdate = async (newStatus: string) => {
    if (!currentOrder) return;
    try {
      await axios.put(`/api/v1/admin/orders/${currentOrder.id}`, { status: newStatus });
      // Update local state
      setCurrentOrder(prev => prev ? { ...prev, status: newStatus } : null);
      setOrders(prev => prev.map(o => o.id === currentOrder.id ? { ...o, status: newStatus } : o));
      alert('Order status updated successfully');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  // Helper to parse items safely
  const getOrderItems = (order: Order) => {
    if (Array.isArray(order.items)) return order.items;
    return [];
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
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
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
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
                    <td className="px-6 py-4">₹{order.subtotal}</td>
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
                <div className="border rounded-lg divide-y">
                  {getOrderItems(currentOrder).map((item: any, idx: number) => (
                    <div key={idx} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Placeholder for image if not saved in JSON */}
                        <div className="h-12 w-12 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Product ID: {item.productId.slice(-6)}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">₹{item.priceAtPurchase || 'N/A'}</p>
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
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total Paid</span>
                  <span>₹{currentOrder.subtotal}</span>
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