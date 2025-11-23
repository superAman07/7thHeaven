'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const router = useRouter();

    const handleLogout = (e: React.MouseEvent) => {
        e.preventDefault();
        // We will implement the actual logout logic later
        console.log('Logout clicked');
        router.push('/login');
    };

    return (
        <div id="main-wrapper">
            {/* Page Banner Section Start */}
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
            {/* Page Banner Section End */}

            {/* My Account section start */}
            <div className="my-account-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-100 pb-lg-80 pb-md-70 pb-sm-60 pb-xs-50">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="row">
                                {/* My Account Tab Menu Start */}
                                <div className="col-lg-3 col-12">
                                    <div className="myaccount-tab-menu nav" role="tablist">
                                        <a
                                            href="#dashboard"
                                            className={activeTab === 'dashboard' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('dashboard'); }}
                                        >
                                            <i className="fa fa-dashboard"></i> Dashboard
                                        </a>

                                        <a
                                            href="#orders"
                                            className={activeTab === 'orders' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }}
                                        >
                                            <i className="fa fa-cart-arrow-down"></i> Orders
                                        </a>

                                        <a
                                            href="#address"
                                            className={activeTab === 'address' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('address'); }}
                                        >
                                            <i className="fa fa-map-marker"></i> Address
                                        </a>

                                        <a
                                            href="#account-info"
                                            className={activeTab === 'account-info' ? 'active' : ''}
                                            onClick={(e) => { e.preventDefault(); setActiveTab('account-info'); }}
                                        >
                                            <i className="fa fa-user"></i> Account Details
                                        </a>

                                        <a href="#logout" onClick={handleLogout}>
                                            <i className="fa fa-sign-out"></i> Logout
                                        </a>
                                    </div>
                                </div>
                                {/* My Account Tab Menu End */}

                                {/* My Account Tab Content Start */}
                                <div className="col-lg-9 col-12">
                                    <div className="tab-content" id="myaccountContent">

                                        {/* Dashboard Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'dashboard' ? 'show active' : ''}`} id="dashboard" role="tabpanel">
                                            <div className="myaccount-content">
                                                <h3>Dashboard</h3>
                                                <div className="welcome mb-20">
                                                    <p>Hello, <strong>User</strong> (If Not <strong>User !</strong><a href="#" onClick={handleLogout} className="logout"> Logout</a>)</p>
                                                </div>
                                                <p className="mb-0">From your account dashboard. you can easily check & view your recent orders, manage your shipping and billing addresses and edit your password and account details.</p>
                                            </div>
                                        </div>

                                        {/* Orders Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'orders' ? 'show active' : ''}`} id="orders" role="tabpanel">
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
                                                                <th>Action</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {/* Static Data for UI Preview */}
                                                            <tr>
                                                                <td>1</td>
                                                                <td>Aug 22, 2022</td>
                                                                <td>Pending</td>
                                                                <td>Rs.45</td>
                                                                <td><Link href="#" className="btn">View</Link></td>
                                                            </tr>
                                                            <tr>
                                                                <td>2</td>
                                                                <td>July 22, 2022</td>
                                                                <td>Approved</td>
                                                                <td>Rs.100</td>
                                                                <td><Link href="#" className="btn">View</Link></td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Address Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'address' ? 'show active' : ''}`} id="address" role="tabpanel">
                                            <div className="myaccount-content">
                                                <h3>Billing Address</h3>
                                                <address>
                                                    <p><strong>User Name</strong></p>
                                                    <p>123 Street Name <br /> City, State, Zip</p>
                                                    <p>Mobile: (123) 456-7890</p>
                                                </address>
                                                <a href="#" className="btn d-inline-block edit-address-btn"><i className="fa fa-edit"></i>Edit Address</a>
                                            </div>
                                        </div>

                                        {/* Account Details Tab */}
                                        <div className={`tab-pane fade ${activeTab === 'account-info' ? 'show active' : ''}`} id="account-info" role="tabpanel">
                                            <div className="myaccount-content">
                                                <h3>Account Details</h3>
                                                <div className="account-details-form">
                                                    <form action="#">
                                                        <div className="row">
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <input id="first-name" placeholder="First Name" type="text" />
                                                            </div>
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <input id="last-name" placeholder="Last Name" type="text" />
                                                            </div>
                                                            <div className="col-12 mb-30">
                                                                <input id="display-name" placeholder="Display Name" type="text" />
                                                            </div>
                                                            <div className="col-12 mb-30">
                                                                <input id="email" placeholder="Email Address" type="email" />
                                                            </div>
                                                            <div className="col-12 mb-30"><h4>Password change</h4></div>
                                                            <div className="col-12 mb-30">
                                                                <input id="current-pwd" placeholder="Current Password" type="password" />
                                                            </div>
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <input id="new-pwd" placeholder="New Password" type="password" />
                                                            </div>
                                                            <div className="col-lg-6 col-12 mb-30">
                                                                <input id="confirm-pwd" placeholder="Confirm Password" type="password" />
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
                                {/* My Account Tab Content End */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}