'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useSearchParams } from 'next/navigation';

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
    referralCode?: string;
    is7thHeaven?: boolean;
}

interface Order {
    id: string;
    createdAt: string;
    status: string;
    subtotal: string;
    paymentStatus: string;
    items: any[];
    genderTags: string[];
    shippingAddress: any;
}

interface Notification {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}

function ProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialTab = searchParams.get('tab') === 'notifications' ? 'notifications' : 'dashboard';
    const [activeTab, setActiveTab] = useState(initialTab);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

    const [user, setUser] = useState<UserProfile | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const indexOfLastOrder = currentPage * itemsPerPage;
    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const totalPages = Math.ceil(orders.length / itemsPerPage);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isCancelling, setIsCancelling] = useState(false);

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

    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState('');
    const [pendingUpdate, setPendingUpdate] = useState<any>(null);

    useEffect(() => {
        if (activeTab === 'notifications') {
            const hasUnread = notifications.some(n => !n.isRead);
            
            if (hasUnread) {
                axios.put('/api/v1/notifications/fetch').catch(console.error);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        }
    }, [activeTab, notifications]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [profileRes, ordersRes, notifRes] = await Promise.all([
                    axios.get('/api/v1/profile'),
                    axios.get('/api/v1/orders'),
                    axios.get('/api/v1/notifications/fetch') 
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

                if (notifRes.data.success) {
                    setNotifications(notifRes.data.notifications);
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

    const handleCancelOrder = async () => {
        if (!selectedOrder) return;
        if (!confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
        setIsCancelling(true);
        try {
            const res = await axios.post('/api/v1/orders/cancel', { orderId: selectedOrder.id });
            if (res.data.success) {
                toast.success(res.data.message);
                setOrders(prev => prev.map(o => o.id === selectedOrder.id ? { ...o, status: 'CANCELLED' } : o));
                setSelectedOrder(prev => prev ? { ...prev, status: 'CANCELLED' } : null);
                setShowOrderModal(false);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to cancel order");
        } finally {
            setIsCancelling(false);
        }
    };

    const handleLogout = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isLoggingOut) return;
        setIsLoggingOut(true);
        try {
            await axios.post('/api/v1/auth/logout');
            toast.success('Logged out successfully');
            router.push('/login');
            router.refresh();
        } catch (error) {
            toast.error('Logout failed');
            setIsLoggingOut(false);
        }
    };

    const handleAddressUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUpdatingAddress) return;
        setIsUpdatingAddress(true);
        try {
            const res = await axios.put('/api/v1/profile', addressData);
            if (res.data.success) {
                toast.success("Address updated successfully");
                setUser(res.data.user);
                setIsEditingAddress(false);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Failed to update address");
        } finally {
            setIsUpdatingAddress(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUpdatingProfile) return;
        setIsUpdatingProfile(true);

        const payload: any = {
            fullName: formData.fullName,
        };

        if (formData.newPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                toast.error("New passwords do not match");
                setIsUpdatingProfile(false);
                return;
            }
            if (!formData.currentPassword) {
                toast.error("Current password is required to set a new one");
                setIsUpdatingProfile(false);
                return;
            }
            payload.currentPassword = formData.currentPassword;
            payload.newPassword = formData.newPassword;
        }

        const phoneChanged = formData.phone !== user?.phone;
        const emailChanged = formData.email !== user?.email;

        if (phoneChanged || emailChanged) {
            const type = phoneChanged ? 'phone' : 'email';
            const value = phoneChanged ? formData.phone : formData.email;

            try {
                await axios.post('/api/v1/profile', { type, value });
                toast.success(`OTP sent to ${value}`);

                if (phoneChanged) payload.phone = formData.phone;
                if (emailChanged) payload.email = formData.email;

                setPendingUpdate(payload);
                setShowOtpModal(true);
            } catch (err: any) {
                toast.error(err.response?.data?.error || "Failed to send OTP");
            } finally {
                setIsUpdatingProfile(false);
            }
            return;
        }
        await submitUpdate(payload);
        setIsUpdatingProfile(false);
    };

    const submitUpdate = async (payload: any) => {
        try {
            const res = await axios.put('/api/v1/profile', payload);
            if (res.data.success) {
                toast.success("Profile updated successfully");
                setUser(res.data.user);
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                setShowOtpModal(false);
                setOtp('');
                setPendingUpdate(null);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || "Update failed");
        }
    };

    const verifyOtpAndUpdate = async () => {
        if (!otp || !pendingUpdate) return;
        if (isVerifyingOtp) return;
        setIsVerifyingOtp(true);
        await submitUpdate({ ...pendingUpdate, otp });
        setIsVerifyingOtp(false);
    };

    useEffect(() => {
        if (addressData.pincode && addressData.pincode.length === 6) {
            const fetchPincodeDetails = async () => {
                try {
                    const res = await axios.get(`https://api.postalpincode.in/pincode/${addressData.pincode}`);
                    if (res.data && res.data[0].Status === "Success") {
                        const details = res.data[0].PostOffice[0];
                        setAddressData(prev => ({
                            ...prev,
                            city: details.District,
                            state: details.State,
                            country: 'India'
                        }));
                        toast.success("Location details fetched!");
                    }
                } catch (error) {
                    console.error("Pincode fetch error:", error);
                }
            };
            fetchPincodeDetails();
        }
    }, [addressData.pincode]);

    const getStatusBadge = (status: string) => {
        const s = status.toUpperCase();
        let color = 'badge-secondary';
        if (s === 'DELIVERED' || s === 'PAID') color = 'badge-success';
        if (s === 'SHIPPED') color = 'badge-info';
        if (s === 'CANCELLED' || s === 'FAILED') color = 'badge-danger';
        if (s === 'PENDING') color = 'badge-warning';

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

    const handleOrderClick = (order: Order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    if(loading){
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#ddb040] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading your Account...</p>
                </div>
            </div>
        )
    }

    if (!user) {
        return (
            <div id="main-wrapper">
                <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
                    <div className="container">
                        <div className="row">
                            <div className="col">
                                <div className="page-banner text-center">
                                    <h1>My Account</h1>
                                    <ul className="page-breadcrumb">
                                        <li><Link href="/">Home</Link></li>
                                        <li>Login</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="section pt-20 pb-20 bg-gray-50">
                    <div className="container">
                        <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 bg-[#E6B422]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <i className="fa fa-lock text-3xl text-[#E6B422]"></i>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Account Access</h2>
                                <p className="text-gray-500 mb-8">
                                    Please sign in to manage your orders, view your 7th Heaven network, and update your profile.
                                </p>
                                <div className="space-y-4">
                                    <Link 
                                        href="/login" 
                                        className="block w-full py-3 px-4 bg-[#E6B422] text-white font-bold rounded-lg hover:bg-[#b8952b] transition-colors shadow-md shadow-[#E6B422]/20"
                                    >
                                        Sign In Now
                                    </Link>
                                    <p className="text-sm text-gray-400 mt-4">
                                        Don't have an account? <Link href="/login" className="text-[#E6B422] font-semibold hover:underline">Register here</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
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
                                            <a href="" className={activeTab === 'dashboard' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}>
                                                <i className="fa fa-dashboard"></i> Dashboard
                                            </a>
                                            <a href="" className={activeTab === 'orders' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}>
                                                <i className="fa fa-cart-arrow-down"></i> Orders
                                            </a>
                                            <a href="#notifications" className={activeTab === 'notifications' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('notifications'); }}>
                                                <i className="fa fa-bell"></i> Notifications 
                                                {notifications.some(n => !n.isRead) && <span className="badge badge-danger ml-2" style={{backgroundColor: 'red', color: 'white', padding: '2px 6px', borderRadius: '50%', fontSize: '10px'}}>!</span>}
                                            </a>
                                            <a href="" className={activeTab === 'address' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('address'); }}>
                                                <i className="fa fa-map-marker"></i> Address
                                            </a>
                                            <a href="" className={activeTab === 'account-info' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setActiveTab('account-info'); }}>
                                                <i className="fa fa-user"></i> Account Details
                                            </a>
                                            <button 
                                                onClick={handleLogout} 
                                                className="text-left w-full"
                                                style={{ 
                                                    border: '1px solid #eeeeee',
                                                    borderBottom: '1px solid #eeeeee',
                                                    color: '#333333',
                                                    fontWeight: 500,
                                                    fontSize: '18px',
                                                    display: 'block',
                                                    padding: '15px 15px 13px',
                                                    textTransform: 'uppercase',
                                                    background: 'white',
                                                    cursor: 'pointer',
                                                    textAlign: 'left',
                                                    opacity: isLoggingOut ? 0.6 : 1
                                                }}
                                                disabled={isLoggingOut}
                                            >
                                                <i className="fa fa-sign-out"></i> {isLoggingOut ? 'Logging out...' : 'Logout'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="col-lg-9 col-12">
                                        <div className="tab-content" id="myaccountContent">

                                            {/* Dashboard Tab */}
                                            <div className={`tab-pane fade ${activeTab === 'dashboard' ? 'show active' : ''}`}>
                                                <div className="myaccount-content">
                                                    <h3>Dashboard</h3>
                                                    <div className="welcome">
                                                        <p>Hello, <strong>{user?.fullName}</strong> (If Not <strong>{user?.fullName} !</strong> <a href="#" onClick={handleLogout} className="logout"> Logout</a>)</p>
                                                    </div>
                                                    <p className="mb-0">From your account dashboard. you can easily check & view your recent orders, manage your shipping and billing addresses and edit your password and account details.</p>
                                                    
                                                    {/* 7th Heaven Section */}
                                                    <div className="mt-4 p-4 rounded" style={{ backgroundColor: '#fdf8e4', border: '1px solid #faebcc' }}>
                                                        <h4 style={{ color: '#8a6d3b', fontSize: '18px', fontWeight: 'bold' }}>
                                                            <i className="fa fa-users mr-2"></i> 
                                                            7th Heaven Club
                                                        </h4>
                                                        {user?.is7thHeaven ? (
                                                            <>
                                                                <p className="mb-2">You are an active member! Share your referral code to grow your network.</p>
                                                                <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
                                                                    <div style={{ background: '#fff', padding: '8px 15px', border: '1px dashed #8a6d3b', borderRadius: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
                                                                        {user.referralCode}
                                                                    </div>
                                                                    <button 
                                                                        className="btn btn-sm btn-secondary"
                                                                        onClick={() => {
                                                                            navigator.clipboard.writeText(`${window.location.origin}/login?ref=${user.referralCode}`);
                                                                            toast.success("Referral link copied!");
                                                                        }}
                                                                    >
                                                                        Copy Link
                                                                    </button>
                                                                </div>
                                                                
                                                                <Link href="/7th-heaven" className="btn btn-primary" style={{ backgroundColor: '#ddb040', borderColor: '#ddb040', color: '#fff' }}>
                                                                    View My Network & Progress <i className="fa fa-arrow-right ml-2"></i>
                                                                </Link>
                                                            </>
                                                        ) : (
                                                            <p className="mb-0">
                                                                You are not a member of the 7th Heaven Club yet. 
                                                                <Link href="/collections/perfumes" className="ml-1 text-decoration-underline" style={{ color: '#ddb040' }}>
                                                                    Shop now
                                                                </Link> to unlock exclusive benefits!
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Orders Tab */}
                                            <div className={`tab-pane fade ${activeTab === 'orders' ? 'show active' : ''}`}>
                                                <div className="myaccount-content">
                                                    <h3>Orders</h3>
                                                    <div className="myaccount-table table-responsive text-center" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                                        <table className="table table-bordered table-hover">
                                                            <thead className="thead-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                                                <tr>
                                                                    <th>Order ID</th>
                                                                    <th>Date</th>
                                                                    <th>Status</th>
                                                                    <th>Total</th>
                                                                    <th>Payment</th>
                                                                    <th>Action</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {currentOrders.length > 0 ? currentOrders.map(order => (
                                                                    <tr key={order.id} onClick={() => handleOrderClick(order)} style={{ cursor: 'pointer' }} title="Click to view details">
                                                                        <td>#{order.id.slice(-6).toUpperCase()}</td>
                                                                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                                                        <td>{getStatusBadge(order.status)}</td>
                                                                        <td>Rs. {order.subtotal}</td>
                                                                        <td>{getStatusBadge(order.paymentStatus)}</td>
                                                                        <td><button className="btn btn-sm btn-primary" style={{ backgroundColor: '#ddb040', borderColor: '#ddb040' }}>View</button></td>
                                                                    </tr>
                                                                )) : (
                                                                    <tr><td colSpan={6}>No orders found.</td></tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                    {orders.length > itemsPerPage && (
                                                        <div className="d-flex justify-content-center mt-3 gap-2" style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                                                disabled={currentPage === 1}
                                                            >
                                                                Previous
                                                            </button>
                                                            <span className="align-self-center">Page {currentPage} of {totalPages}</span>
                                                            <button
                                                                className="btn btn-secondary btn-sm"
                                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                                                disabled={currentPage === totalPages}
                                                            >
                                                                Next
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className={`tab-pane fade ${activeTab === 'notifications' ? 'show active' : ''}`} id="notifications">
                                                <div className="myaccount-content">
                                                    <h3>Notifications</h3>
                                                    <div className="myaccount-table table-responsive">
                                                        {notifications.length > 0 ? (
                                                            <div className="text-left">
                                                                {notifications.map((notif) => (
                                                                    <div 
                                                                        key={notif.id} 
                                                                        className={`p-4 mb-3 rounded-lg border transition-all duration-200 ${notif.isRead ? 'bg-white border-gray-100' : 'bg-[#fff9e6] border-[#E6B422]/30'}`}
                                                                        style={{ position: 'relative' }}
                                                                    >
                                                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                                                            <h5 className="font-bold m-0" style={{color: '#333', fontSize: '16px'}}>
                                                                                {/* Add Icons based on context */}
                                                                                {notif.title.includes('Order') ? '📦 ' : notif.title.includes('Welcome') ? '✨ ' : '🔔 '}
                                                                                {notif.title}
                                                                            </h5>
                                                                            <small className="text-muted" style={{fontSize: '12px'}}>{new Date(notif.createdAt).toLocaleDateString()}</small>
                                                                        </div>
                                                                        <p className="mb-0 text-sm text-gray-600" style={{ lineHeight: '1.5' }}>{notif.body}</p>
                                                                        
                                                                        {/* Optional: Add "View" button if it's an order */}
                                                                        {notif.title.includes('Order') && (
                                                                            <button 
                                                                                className="btn btn-sm btn-link p-0 mt-2" 
                                                                                style={{ color: '#E6B422', textDecoration: 'none', fontSize: '13px', fontWeight: '600' }}
                                                                                onClick={() => setActiveTab('orders')}
                                                                            >
                                                                                View Order Details →
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-5">
                                                                <i className="fa fa-bell-slash-o text-muted mb-3" style={{ fontSize: '40px', opacity: 0.3 }}></i>
                                                                <p className="text-muted">No notifications yet.</p>
                                                            </div>
                                                        )}
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
                                                                <div className="col-12 gap-x-2" style={{ display: 'flex', gap: '10px' }}>
                                                                    <button className="save-change-btn mr-2" disabled={isUpdatingAddress} style={{ opacity: isUpdatingAddress ? 0.7 : 1 }}>
                                                                        {isUpdatingAddress ? 'Saving...' : 'Save Address'}
                                                                    </button>
                                                                    <button type="button" onClick={() => setIsEditingAddress(false)} className="btn btn-secondary rounded-[3px]" disabled={isUpdatingAddress}>Cancel</button>
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
                                                                    <button className="save-change-btn" disabled={isUpdatingProfile} style={{ opacity: isUpdatingProfile ? 0.7 : 1 }}>
                                                                        {isUpdatingProfile ? 'Saving...' : 'Save Changes'}
                                                                    </button>
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
                            <button onClick={() => setShowOtpModal(false)} className="btn btn-secondary" style={{ padding: '8px 16px' }} disabled={isVerifyingOtp}>Cancel</button>
                            <button onClick={verifyOtpAndUpdate} className="btn btn-primary" style={{ padding: '8px 16px', backgroundColor: '#ddb040', color: 'white', border: 'none', opacity: isVerifyingOtp ? 0.7 : 1 }} disabled={isVerifyingOtp}>
                                {isVerifyingOtp ? 'Verifying...' : 'Verify & Update'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showOrderModal && selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <div className="bg-white p-6 rounded-lg shadow-lg" style={{ backgroundColor: 'white', padding: '30px', borderRadius: '8px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h3 className="text-lg font-bold m-0">Order Details #{selectedOrder.id.slice(-6).toUpperCase()}</h3>
                            <button onClick={() => setShowOrderModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
                        </div>

                        <div className="row mb-4">
                            <div className="col-6">
                                <p><strong>Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                            </div>
                            <div className="col-6 text-right" style={{ textAlign: 'right' }}>
                                <p><strong>Total:</strong> Rs. {selectedOrder.subtotal}</p>
                                <p><strong>Payment:</strong> {selectedOrder.paymentStatus}</p>
                            </div>
                        </div>

                        <h4 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Items</h4>
                        <div className="table-responsive mb-4">
                            <table className="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th className='text-center'>Qty</th>
                                        <th className="text-center">Price</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedOrder.items && Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item: any, idx: number) => (
                                        <tr key={idx}>
                                            <td>
                                                <div className="d-flex align-items-center" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                                    {/* Product Image */}
                                                    <div style={{ width: '60px', height: '60px', flexShrink: 0, backgroundColor: '#f8f9fa', borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                                                        {item.product?.images?.[0] ? (
                                                            <img
                                                                src={item.product.images[0]}
                                                                alt={item.product.name}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>
                                                                <i className="fa fa-image"></i>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Product Details */}
                                                    <div>
                                                        <p className="mb-1 font-weight-bold" style={{ fontWeight: '600', margin: 0, color: '#333' }}>
                                                            {item.product?.name || 'Product Unavailable'}
                                                        </p>
                                                        <div className="text-muted small" style={{ fontSize: '0.85rem', color: '#666' }}>
                                                            {item.product?.genderTags && (
                                                                <span className="badge badge-light mr-1" style={{ backgroundColor: '#25252b', marginRight: '5px', fontWeight: 'normal' }}>
                                                                    {item.product.genderTags.join(', ')}
                                                                </span>
                                                            )}
                                                            {item.product?.category?.name && (
                                                                <span style={{ color: '#888' }}>
                                                                    {item.product.category.name}
                                                                </span>
                                                            )}
                                                            {!item.product && <span className="text-danger">Item details not found</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-center" style={{ verticalAlign: 'middle' }}>{item.quantity}</td>
                                            <td className="text-center" style={{ verticalAlign: 'middle' }}>Rs. {item.priceAtPurchase || 'N/A'}</td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3}>No items details available</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <h4 className="mb-3" style={{ fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Shipping Address</h4>
                        {selectedOrder.shippingAddress ? (
                            <div className="bg-light p-3 rounded" style={{ backgroundColor: '#f8f9fa', padding: '15px', borderRadius: '5px' }}>
                                <p className="mb-1"><strong>{selectedOrder.shippingAddress.fullName}</strong></p>
                                <p className="mb-1">{selectedOrder.shippingAddress.fullAddress}</p>
                                <p className="mb-1">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                                <p className="mb-0">{selectedOrder.shippingAddress.country}</p>
                                <p className="mb-0">Phone: {selectedOrder.shippingAddress.phone}</p>
                            </div>
                        ) : (
                            <p>No shipping address available.</p>
                        )}
                        <div className="mt-4 flex justify-between items-center" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                            <div>
                                {!['DELIVERED', 'CANCELLED', 'FAILED', 'REFUNDED', 'RETURNED'].includes(selectedOrder.status.toUpperCase()) && (
                                    <button 
                                        onClick={handleCancelOrder} 
                                        disabled={isCancelling}
                                        className="btn btn-outline-danger btn-sm"
                                        style={{ 
                                            borderColor: '#dc3545', 
                                            color: '#dc3545', 
                                            fontWeight: 'bold',
                                            padding: '8px 16px'
                                        }}
                                    >
                                        {isCancelling ? (
                                            <><i className="fa fa-spinner fa-spin mr-1"></i> Cancelling...</>
                                        ) : (
                                            <><i className="fa fa-times-circle mr-1"></i> Cancel Order</>
                                        )}
                                    </button>
                                )}
                            </div>
                            
                            <button onClick={() => setShowOrderModal(false)} className="btn btn-secondary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#ddb040] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading your Account...</p>
                </div>
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}