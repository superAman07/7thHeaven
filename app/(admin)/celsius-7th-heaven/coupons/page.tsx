'use client'

import axios from 'axios';
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2, X, Ticket, Copy, Check } from 'lucide-react';
import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useDebounce } from 'use-debounce';

interface Coupon {
  id: string;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  expiresAt: string | null;
  usageLimit: number | null;
  usedCount: number;
  minOrderAmount: number;
  isActive: boolean;
  influencerName: string | null;
  influencerEmail: string | null;
  influencerPhone: string | null;
  createdAt: string;
  _count?: { usageHistory: number };
}

const StatusBadge: React.FC<{ isActive: boolean }> = ({ isActive }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`relative inline-flex items-center h-7 w-12 rounded-full cursor-pointer transition-colors duration-200 ease-in-out border-2
      ${checked ? 'bg-green-500 border-green-500' : 'bg-gray-200 border-gray-200'}`}
  >
    <span className={`inline-block w-5 h-5 transform bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out
        ${checked ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} 
    />
  </div>
);

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [selectedCouponCode, setSelectedCouponCode] = useState('');

  // Form states
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const [value, setValue] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [influencerName, setInfluencerName] = useState('');
  const [influencerEmail, setInfluencerEmail] = useState('');
  const [influencerPhone, setInfluencerPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/v1/admin/coupons', { withCredentials: true });
      setCoupons(response.data.coupons || []);
    } catch (err) {
      setError('Failed to fetch coupons. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  useEffect(() => {
    document.body.style.overflow = isPanelOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isPanelOpen]);

  const resetForm = () => {
    setCode('');
    setType('PERCENT');
    setValue('');
    setExpiresAt('');
    setUsageLimit('');
    setMinOrderAmount('');
    setIsActive(true);
    setInfluencerName('');
    setInfluencerEmail('');
    setInfluencerPhone('');
  };

  const openPanelForNew = () => {
    setCurrentCoupon(null);
    resetForm();
    setIsPanelOpen(true);
  };

  const openPanelForEdit = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setCode(coupon.code);
    setType(coupon.type);
    setValue(coupon.value.toString());
    setExpiresAt(coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().slice(0, 16) : '');
    setUsageLimit(coupon.usageLimit?.toString() || '');
    setMinOrderAmount(coupon.minOrderAmount?.toString() || '0');
    setIsActive(coupon.isActive);
    setInfluencerName(coupon.influencerName || '');
    setInfluencerEmail(coupon.influencerEmail || '');
    setInfluencerPhone(coupon.influencerPhone || '');
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
    setCurrentCoupon(null);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const isEditing = !!currentCoupon;
    const url = isEditing ? `/api/v1/admin/coupons/${currentCoupon.id}` : '/api/v1/admin/coupons';
    const method = isEditing ? 'put' : 'post';

    const payload = {
      code,
      type,
      value: parseFloat(value),
      expiresAt: expiresAt || null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      isActive,
      influencerName: influencerName || null,
      influencerEmail: influencerEmail || null,
      influencerPhone: influencerPhone || null,
    };

    try {
      const response = await axios[method](url, payload, { withCredentials: true });
      if (response.data.success) {
        await fetchCoupons();
        closePanel();
      }
    } catch (err: any) {
      const message = err.response?.data?.error || 'An unknown error occurred.';
      alert(`Error: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await axios.delete(`/api/v1/admin/coupons/${id}`, { withCredentials: true });
        await fetchCoupons();
      } catch (err) {
        alert('Failed to delete coupon.');
      }
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const fetchUsageHistory = async (couponId: string, couponCode: string) => {
    setUsageLoading(true);
    setSelectedCouponCode(couponCode);
    setUsageModalOpen(true);
    try {
      const response = await axios.get(`/api/v1/admin/coupons/${couponId}/usage`, { withCredentials: true });
      setUsageData(response.data.usageHistory || []);
    } catch (err) {
      console.error('Failed to fetch usage history', err);
      setUsageData([]);
    } finally {
      setUsageLoading(false);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    c.influencerName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <button onClick={openPanelForNew} className="flex! items-center justify-center bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 cursor-pointer">
            <Plus className="w-4 h-4 mr-2" /> Create Coupon
          </button>
        </div>

        {/* Search */}
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
            <input 
              type="text" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-10 pr-3 py-2 border text-gray-600 border-gray-300 rounded-lg shadow-sm focus:ring-gray-800 focus:border-gray-800 sm:text-sm" 
              placeholder="Search by code or influencer name..." 
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-lg border border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-600">Total Coupons</p>
            <p className="text-2xl font-bold text-gray-900">{coupons.length}</p>
          </div>
          <div className="p-4 rounded-lg border border-green-200 bg-green-50">
            <p className="text-sm font-medium text-green-600">Active</p>
            <p className="text-2xl font-bold text-green-900">{coupons.filter(c => c.isActive).length}</p>
          </div>
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
            <p className="text-sm font-medium text-blue-600">Total Uses</p>
            <p className="text-2xl font-bold text-blue-900">{coupons.reduce((sum, c) => sum + c.usedCount, 0)}</p>
          </div>
          <div className="p-4 rounded-lg border border-purple-200 bg-purple-50">
            <p className="text-sm font-medium text-purple-600">Influencer Codes</p>
            <p className="text-2xl font-bold text-purple-900">{coupons.filter(c => c.influencerName).length}</p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3">Code</th>
                <th scope="col" className="px-6 py-3">Discount</th>
                <th scope="col" className="px-6 py-3">Usage</th>
                <th scope="col" className="px-6 py-3">Influencer</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3">Expires</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" /><span>Loading coupons...</span>
                  </div>
                </td></tr>
              ) : error ? (
                <tr><td colSpan={7} className="text-center py-8 text-red-500">{error}</td></tr>
              ) : filteredCoupons.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No coupons found.</td></tr>
              ) : (
                filteredCoupons.map(coupon => (
                  <tr key={coupon.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-gray-400" />
                        <span className="font-mono bg-gray-100 px-2 py-1 rounded">{coupon.code}</span>
                        <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-gray-200 rounded" title="Copy code">
                          {copiedCode === coupon.code ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-green-600">
                        {coupon.type === 'PERCENT' ? `${coupon.value}%` : `₹${coupon.value}`}
                      </span>
                      {coupon.minOrderAmount > 0 && (
                        <span className="text-xs text-gray-400 block">Min: ₹{coupon.minOrderAmount}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => fetchUsageHistory(coupon.id, coupon.code)}
                        className="hover:bg-blue-50 px-2 py-1 rounded transition-colors cursor-pointer"
                        title="Click to view users"
                      >
                        <span className="font-medium text-blue-600 underline">{coupon.usedCount}</span>
                        <span className="text-gray-400">/{coupon.usageLimit || '∞'}</span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {coupon.influencerName ? (
                        <div>
                          <span className="font-medium text-gray-900">{coupon.influencerName}</span>
                          {coupon.influencerEmail && <span className="text-xs text-gray-400 block">{coupon.influencerEmail}</span>}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4"><StatusBadge isActive={coupon.isActive} /></td>
                    <td className="px-6 py-4">
                      {coupon.expiresAt ? (
                        <span className={new Date(coupon.expiresAt) < new Date() ? 'text-red-500' : ''}>
                          {new Date(coupon.expiresAt).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="text-gray-400">Never</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openPanelForEdit(coupon)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-blue-600"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-gray-500 rounded-lg hover:bg-gray-100 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Overlay */}
      <div className={`fixed inset-0 z-999 bg-black/50 transition-opacity duration-300 ease-in-out ${isPanelOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`} onClick={closePanel}></div>

      {/* Side Panel */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-xl bg-white shadow-xl z-1000 transform transition-transform duration-300 ease-in-out ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <form className="flex flex-col h-full" onSubmit={handleFormSubmit}>
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-800">{currentCoupon ? 'Edit Coupon' : 'Create New Coupon'}</h2>
            <button type="button" onClick={closePanel} className="p-2 text-gray-400 rounded-full hover:bg-gray-100 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coupon Code*</label>
              <input type="text" value={code} onChange={e => setCode(e.target.value.toUpperCase())} required placeholder="e.g., SUMMER20" className="w-full px-4 py-2.5 bg-white text-gray-900 uppercase border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-800 text-sm" />
            </div>

            {/* Type and Value */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type*</label>
                <select value={type} onChange={e => setType(e.target.value as 'PERCENT' | 'FIXED')} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg cursor-pointer text-sm">
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (₹)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value*</label>
                <input type="number" value={value} onChange={e => setValue(e.target.value)} required min="0" max={type === 'PERCENT' ? 100 : undefined} placeholder={type === 'PERCENT' ? 'e.g., 20' : 'e.g., 500'} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            {/* Limits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Usage Limit</label>
                <input type="number" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} min="1" placeholder="Unlimited" className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Order Amount (₹)</label>
                <input type="number" value={minOrderAmount} onChange={e => setMinOrderAmount(e.target.value)} min="0" placeholder="0" className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm" />
              </div>
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expires At</label>
              <input type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm" />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <span className="block text-sm font-bold text-gray-700">Active Status</span>
                <span className="text-xs text-gray-500">{isActive ? 'Coupon can be used' : 'Coupon is disabled'}</span>
              </div>
              <ToggleSwitch checked={isActive} onChange={setIsActive} />
            </div>

            {/* Influencer Section */}
            <div className="border-t pt-5">
              <h3 className="text-md font-medium text-gray-800 mb-3">Influencer Details (Optional)</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Influencer Name</label>
                  <input type="text" value={influencerName} onChange={e => setInfluencerName(e.target.value)} placeholder="e.g., John Doe" className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={influencerEmail} onChange={e => setInfluencerEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input type="text" value={influencerPhone} onChange={e => setInfluencerPhone(e.target.value)} placeholder="+91 9876543210" className="w-full px-4 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex! justify-end! p-4! border-t! bg-gray-50! space-x-2!">
            <button type="button" onClick={closePanel} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer disabled:opacity-50 flex! items-center gap-2">
              {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Saving...</> : 'Save Coupon'}
            </button>
          </div>
        </form>
      </div>
      {usageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setUsageModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden z-50">
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Coupon Usage History</h3>
                <p className="text-sm text-gray-500">Users who used <span className="font-mono bg-gray-200 px-2 py-0.5 rounded">{selectedCouponCode}</span></p>
              </div>
              <button onClick={() => setUsageModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[60vh] p-4">
              {usageLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                </div>
              ) : usageData.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No usage history found</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                    <tr>
                      <th className="px-4 py-3 text-left">User</th>
                      <th className="px-4 py-3 text-left">Order Total</th>
                      <th className="px-4 py-3 text-left">Discount</th>
                      <th className="px-4 py-3 text-left">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {usageData.map((usage: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-gray-900">{usage.userName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{usage.userEmail || '-'}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium">₹{usage.orderTotal}</td>
                        <td className="px-4 py-3 text-green-600">-₹{usage.discountAmount}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(usage.usedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}