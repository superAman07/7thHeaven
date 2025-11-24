'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';

// --- Types ---
interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

interface Order {
    id: string;
    createdAt: string;
    status: string;
    subtotal: string;
    paymentStatus: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('orders');
    const [loading, setLoading] = useState(true);

    // Data States
    const [user, setUser] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    // Form States
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [addressData, setAddressData] = useState({
        fullAddress: '',
        city: '',
        state: '',
        pincode: '',
        country: ''
    });
    const [isEditingAddress, setIsEditingAddress] = useState(false);

    // OTP States
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [pendingUpdate, setPendingUpdate] = useState<any>(null);

    // --- Fetch Data on Mount ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileRes, ordersRes] = await Promise.all([
                    axios.get('/api/v1/profile'),
                    axios.get('/api/v1/orders')
                ]);

                if (profileRes.data.success) {
                    const u = profileRes.data.user;
                    setUser(u);
                    setFormData(prev => ({
                        ...prev,
                        fullName: u.fullName || '',
                        email: u.email || '',
                        phone: u.phone || ''
                    }));
                    setAddressData({
                        fullAddress: u.fullAddress || '',
                        city: u.city || '',
                        state: u.state || '',
                        pincode: u.pincode || '',
                        country: u.country || ''
                    });
                }

                if (ordersRes.data.success) {
                    setOrders(ordersRes.data.orders);
                }
            } catch (error) {
                console.error("Error fetching data", error);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // --- Handlers ---

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        try {
            await axios.post('/api/v1/auth/logout');
            toast.success('Logged out successfully');
            router.push('/login');
            router.refresh();
        } catch (error) {
            toast.error('Logout failed');
        }
    };

    const handleAddressUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await axios.put('/api/v1/profile', addressData);
            if (res.data.success) {
                toast.success("Address updated successfully");
                setUser(res.data.user);
                setIsEditingAddress(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update address");
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload: any = {
            fullName: formData.fullName,
        };

        // Password Validation
        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error("New passwords do not match");
                return;
            }
            if (!formData.currentPassword) {
                toast.error("Current password is required to set a new one");
                return;
            }
            payload.currentPassword = formData.currentPassword;
            payload.newPassword = formData.newPassword;
        }

        // Check for sensitive changes (Phone/Email)
        const phoneChanged = formData.phone !== user?.phone;
        const emailChanged = formData.email !== user?.email;

        if (phoneChanged || emailChanged) {
            // Prioritize Phone OTP if both changed, or just the one that changed
            const type = phoneChanged ? 'phone' : 'email';
            const value = phoneChanged ? formData.phone : formData.email;

            try {
                await axios.post('/api/v1/profile', { type, value });
                toast.success(`OTP sent to ${value}`);

                // Add sensitive fields to payload
                if (phoneChanged) payload.phone = formData.phone;
                if (emailChanged) payload.email = formData.email;

                setPendingUpdate(payload);
                setShowOtpModal(true);
            } catch (err: any) {
                toast.error(err.response?.data?.error || "Failed to send OTP");
            }
            return;
        }

        // No sensitive changes, update directly
        submitUpdate(payload);
    };

    const submitUpdate = async (payload: any) => {
        try {
            const res = await axios.put('/api/v1/profile', payload);
            if (res.data.success) {
                toast.success("Profile updated successfully");
                setUser(res.data.user);
                // Reset password fields
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                setShowOtpModal(false);
                setOtp('');
                setPendingUpdate(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Update failed");
        }
    };

    const verifyOtpAndUpdate = () => {
        if (!otp || !pendingUpdate) return;
        submitUpdate({ ...pendingUpdate, otp });
    };

    // --- Render Helpers ---
    const getStatusBadge = (status: string) => {
        const s = status.toUpperCase();
        let color = 'badge-secondary';
        if (s === 'DELIVERED' || s === 'PAID') color = 'badge-success';
        if (s === 'SHIPPED') color = 'badge-info';
        if (s === 'CANCELLED' || s === 'FAILED') color = 'badge-danger';
        if (s === 'PENDING') color = 'badge-warning';

        // Using inline styles for simplicity if bootstrap classes aren't perfect
        const styleMap: any = {
            'DELIVERED': { backgroundColor: '#28a745', color: 'white' },
            'PAID': { backgroundColor: '#28a745', color: 'white' },
            'SHIPPED': { backgroundColor: '#17a2b8', color: 'white' },
            'CANCELLED': { backgroundColor: '#dc3545', color: 'white' },
            'FAILED': { backgroundColor: '#dc3545', color: 'white' },
            'PENDING': { backgroundColor: '#ffc107', color: 'black' },
            'PROCESSING': { backgroundColor: '#6f42c1', color: 'white' },
        };

        return (
            <span className="badge" style={{ padding: '5px 10px', borderRadius: '15px', ...styleMap[s] }}>
                {status}
            </span>
        );
    };

    if (loading) {
        return <div className="text-center pt-100 pb-100">Loading your profile...</div>;
    }

    return (
        <div id="main-wrapper">
            {/* Page Banner */}
            <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="page-banner text-center">
                                <h1>My Account</h1>
                                <ul className="page-breadcrumb">
                                    <li><Link href="/">Home</Link></li>
                                    <li>My Account</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* My Account Section */}
            <div className="my-account-section section pt-100 pb-100">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="row">
                                {/* Tab Menu */}
                                <div className="col-lg-3 col-12">
                                    <div className="myaccount-tab-menu nav" role="tablist">
                                        <a href="#orders" className={activeTab === 'orders' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>
                                            <i className="fa fa-cart-arrow-down"></i> Orders
                                        </a>
                                        <a href="#address" className={activeTab === 'address' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('address'); }}>
                                            <i className="fa fa-map-marker"></i> Address
                                        </a>
                                        <a href="#account-info" className={activeTab === 'account-info' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('account-info'); }}>
                                            <i className="fa fa-user"></i> Account Details
                                        </a>
                                        <a href="#logout" onClick={handleLogout}>
                                            <i className="fa fa-sign-out"></i> Logout
                                        </a>
                                    </div>
                                </div>

                                {/* Tab Content */}
                                <div className="col-lg-9 col-12">
                                    <div className="tab-content" id="myaccountContent">

                                        {/* Orders Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'orders' ? 'show active' : ''}`}>
                                            <div className="myaccount-content">
                                                <h3>Orders</h3>
                                                <div className="myaccount-table table-responsive text-center">
                                                    <table className="table table-bordered">
                                                        <thead className="thead-light">
                                                            <tr>
                                                                <th>Order ID</th>
                                                                <th>Date</th>
                                                                <th>Status</th>
                                                                <th>Total</th>
                                                                <th>Payment</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {orders.length > 0 ? orders.map(order => (
                                                                <tr key={order.id}>
                                                                    <td>#{order.id.slice(-6).toUpperCase()}</td>
                                                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                                    <td>{getStatusBadge(order.status)}</td>
                                                                    <td>Rs. {order.subtotal}</td>
                                                                    <td>{getStatusBadge(order.paymentStatus)}</td>
                                                                </tr>
                                                            )) : (
                                                                <tr><td colSpan={5}>No orders found.</td></tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'address' ? 'show active' : ''}`}>
                                            <div className="myaccount-content">
                                                <h3>Billing Address</h3>
                                                {!isEditingAddress ? (
                                                    <>
                                                        <address>
                                                            <p><strong>{user?.fullName}</strong></p>
                                                            <p>{user?.fullAddress || 'No address set'}</p>
                                                            <p>{user?.city} {user?.state} {user?.pincode}</p>
                                                            <p>{user?.country}</p>
                                                            <p>Mobile: {user?.phone}</p>
                                                        </address>
                                                        <button onClick={() => setIsEditingAddress(true)} className="btn d-inline-block edit-address-btn">
                                                            <i className="fa fa-edit"></i> Edit Address
                                                        </button>
                                                    </>
                                                ) : (
                                                    <form onSubmit={handleAddressUpdate}>
                                                        <div className="row">
                                                            <div className="col-12 mb-30"><input placeholder="Full Address" type="text" value={addressData.fullAddress} onChange={e => setAddressData({ ...addressData, fullAddress: e.target.value })} /></div>
                                                            <div className="col-lg-6 col-12 mb-30"><input placeholder="City" type="text" value={addressData.city} onChange={e => setAddressData({ ...addressData, city: e.target.value })} /></div>
                                                            <div className="col-lg-6 col-12 mb-30"><input placeholder="State" type="text" value={addressData.state} onChange={e => setAddressData({ ...addressData, state: e.target.value })} /></div>
                                                            <div className="col-lg-6 col-12 mb-30"><input placeholder="Pincode" type="text" value={addressData.pincode} onChange={e => setAddressData({ ...addressData, pincode: e.target.value })} /></div>
                                                            <div className="col-lg-6 col-12 mb-30"><input placeholder="Country" type="text" value={addressData.country} onChange={e => setAddressData({ ...addressData, country: e.target.value })} /></div>
                                                            <div className="col-12">
                                                                <button className="save-change-btn mr-2">Save Address</button>
                                                                <button type="button" onClick={() => setIsEditingAddress(false)} className="btn btn-secondary">Cancel</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                )}
                                            </div>
                                        </div>

                                        {/* Account Details Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'account-info' ? 'show active' : ''}`}>
                                            <div className="myaccount-content">
                                                <h3>Account Details</h3>
                                                <div className="account-details-form">
                                                    <form onSubmit={handleProfileUpdate}>
                                                        <div className="row">
                                                            <div className="col-12 mb-30">
                                                                <label>Full Name</label>
                                                                <input placeholder="Full Name" type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                                                            </div>
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <label>Email Address (Requires OTP)</label>
                                                                <input placeholder="Email Address" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                                            </div>
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <label>Phone Number (Requires OTP)</label>
                                                                <input placeholder="Phone Number" type="text" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                                            </div>

                                                            <div className="col-12 mb-30"><h4>Password Change</h4></div>
                                                            <div className="col-12 mb-30">
                                                                <input placeholder="Current Password" type="password" value={formData.currentPassword} onChange={e => setFormData({ ...formData, currentPassword: e.target.value })} />
                                                            </div>
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <input placeholder="New Password" type="password" value={formData.newPassword} onChange={e => setFormData({ ...formData, newPassword: e.target.value })} />
                                                            </div>
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <input placeholder="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} />
                                                            </div>
                                                            <div className="col-12">
                                                                <button className="save-change-btn">Save Changes</button>
                                                            </div>
                                                        </div>
                                                    </form>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* OTP Modal */}
            {showOtpModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="bg-white p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
                        <h3 className="text-lg font-bold mb-4">Verify OTP</h3>
                        <p className="mb-4 text-sm text-gray-600">Please enter the 6-digit code sent to your device.</p>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', marginBottom: '20px' }}
                            placeholder="Enter OTP"
                        />
                        <div className="flex justify-end gap-2" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setShowOtpModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }}>Cancel</button>
                            <button onClick={verifyOtpAndUpdate} className="btn btn-primary" style={{ padding: '8px 16px', backgroundColor: '#ddb040', color: 'white', border: 'none' }}>Verify & Update</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}