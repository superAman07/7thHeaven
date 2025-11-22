'use client'
import React from 'react';
import Link from 'next/link';

const CheckoutPageComponent: React.FC = () => {
    const [paymentMethod, setPaymentMethod] = React.useState('check');

    return (
        <div id="main-wrapper">
            {/* Page Banner Section Start */}
            <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
                <div className="container">
                    <div className="row">
                        <div className="col">
                            <div className="page-banner text-center">
                                <h1>Checkout</h1>
                                <ul className="page-breadcrumb">
                                    <li><Link href="/">Home</Link></li>
                                    <li>Checkout</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Page Banner Section End */}

            {/* Checkout section start */}
            <div className="checkout-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-70 pb-lg-50 pb-md-40 pb-sm-30 pb-xs-20">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {/* Checkout Form Start */}
                            <form action="#" className="checkout-form">
                                <div className="row row-40">
                                    <div className="col-lg-7">
                                        {/* Billing Address */}
                                        <div id="billing-form" className="mb-10">
                                            <h4 className="checkout-title">Billing Address</h4>
                                            <div className="row">
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>First Name*</label>
                                                    <input type="text" placeholder="First Name" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Last Name*</label>
                                                    <input type="text" placeholder="Last Name" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Email Address*</label>
                                                    <input type="email" placeholder="Email Address" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Phone no*</label>
                                                    <input type="text" placeholder="Phone number" />
                                                </div>
                                                <div className="col-12 mb-20">
                                                    <label>Company Name</label>
                                                    <input type="text" placeholder="Company Name" />
                                                </div>
                                                <div className="col-12 mb-20">
                                                    <label>Address*</label>
                                                    <input type="text" placeholder="Address line 1" />
                                                    <input type="text" placeholder="Address line 2" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Country*</label>
                                                    <select className="nice-select">
                                                        <option>Bangladesh</option>
                                                        <option>China</option>
                                                        <option>country</option>
                                                        <option>India</option>
                                                        <option>Japan</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Town/City*</label>
                                                    <input type="text" placeholder="Town/City" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>State*</label>
                                                    <input type="text" placeholder="State" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Zip Code*</label>
                                                    <input type="text" placeholder="Zip Code" />
                                                </div>
                                                <div className="col-12 mb-20">
                                                    <div className="check-box">
                                                        <input type="checkbox" id="create_account" />
                                                        <label htmlFor="create_account">Create an Acount?</label>
                                                    </div>
                                                    <div className="check-box">
                                                        <input type="checkbox" id="shiping_address" data-shipping="" />
                                                        <label htmlFor="shiping_address">Ship to Different Address</label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Shipping Address */}
                                        <div id="shipping-form">
                                            <h4 className="checkout-title">Shipping Address</h4>
                                            <div className="row">
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>First Name*</label>
                                                    <input type="text" placeholder="First Name" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Last Name*</label>
                                                    <input type="text" placeholder="Last Name" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Email Address*</label>
                                                    <input type="email" placeholder="Email Address" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Phone no*</label>
                                                    <input type="text" placeholder="Phone number" />
                                                </div>
                                                <div className="col-12 mb-20">
                                                    <label>Company Name</label>
                                                    <input type="text" placeholder="Company Name" />
                                                </div>
                                                <div className="col-12 mb-20">
                                                    <label>Address*</label>
                                                    <input type="text" placeholder="Address line 1" />
                                                    <input type="text" placeholder="Address line 2" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Country*</label>
                                                    <select className="nice-select">
                                                        <option>Bangladesh</option>
                                                        <option>China</option>
                                                        <option>country</option>
                                                        <option>India</option>
                                                        <option>Japan</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Town/City*</label>
                                                    <input type="text" placeholder="Town/City" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>State*</label>
                                                    <input type="text" placeholder="State" />
                                                </div>
                                                <div className="col-md-6 col-12 mb-20">
                                                    <label>Zip Code*</label>
                                                    <input type="text" placeholder="Zip Code" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-5">
                                        <div className="row">
                                            {/* Cart Total */}
                                            <div className="col-12 mb-60">
                                                <h4 className="checkout-title">Cart Total</h4>
                                                <div className="checkout-cart-total">
                                                    <h4>Product <span>Total</span></h4>
                                                    <ul>
                                                        {/* Dynamic Cart Items will go here */}
                                                        <li>Product Name X Qty <span>Rs.0.00</span></li>
                                                    </ul>
                                                    <p>Sub Total <span>Rs.0.00</span></p>
                                                    <p>Shipping Fee <span>Rs.0.00</span></p>
                                                    <h4>Grand Total <span>Rs.0.00</span></h4>
                                                </div>
                                            </div>

                                            {/* Payment Method */}
                                            <div className="col-12 mb-30">
                                                <h4 className="checkout-title">Payment Method</h4>
                                                <div className="checkout-payment-method">
                                                    
                                                    <div className="single-method">
                                                        <input 
                                                            type="radio" 
                                                            id="payment_check" 
                                                            name="payment-method" 
                                                            value="check" 
                                                            checked={paymentMethod === 'check'}
                                                            onChange={() => setPaymentMethod('check')}
                                                        />
                                                        <label htmlFor="payment_check">Check Payment</label>
                                                        <p data-method="check" style={{ display: paymentMethod === 'check' ? 'block' : 'none' }}>
                                                            Please send a Check to Store name with Store Street, Store Town, Store State, Store Postcode, Store Country.
                                                        </p>
                                                    </div>

                                                    <div className="single-method">
                                                        <input 
                                                            type="radio" 
                                                            id="payment_bank" 
                                                            name="payment-method" 
                                                            value="bank" 
                                                            checked={paymentMethod === 'bank'}
                                                            onChange={() => setPaymentMethod('bank')}
                                                        />
                                                        <label htmlFor="payment_bank">Direct Bank Transfer</label>
                                                        <p data-method="bank" style={{ display: paymentMethod === 'bank' ? 'block' : 'none' }}>
                                                            Please send a Check to Store name with Store Street, Store Town, Store State, Store Postcode, Store Country.
                                                        </p>
                                                    </div>

                                                    <div className="single-method">
                                                        <input 
                                                            type="radio" 
                                                            id="payment_cash" 
                                                            name="payment-method" 
                                                            value="cash" 
                                                            checked={paymentMethod === 'cash'}
                                                            onChange={() => setPaymentMethod('cash')}
                                                        />
                                                        <label htmlFor="payment_cash">Cash on Delivery</label>
                                                        <p data-method="cash" style={{ display: paymentMethod === 'cash' ? 'block' : 'none' }}>
                                                            Please send a Check to Store name with Store Street, Store Town, Store State, Store Postcode, Store Country.
                                                        </p>
                                                    </div>

                                                    <div className="single-method">
                                                        <input 
                                                            type="radio" 
                                                            id="payment_paypal" 
                                                            name="payment-method" 
                                                            value="paypal" 
                                                            checked={paymentMethod === 'paypal'}
                                                            onChange={() => setPaymentMethod('paypal')}
                                                        />
                                                        <label htmlFor="payment_paypal">Paypal</label>
                                                        <p data-method="paypal" style={{ display: paymentMethod === 'paypal' ? 'block' : 'none' }}>
                                                            Please send a Check to Store name with Store Street, Store Town, Store State, Store Postcode, Store Country.
                                                        </p>
                                                    </div>

                                                    <div className="single-method">
                                                        <input 
                                                            type="radio" 
                                                            id="payment_payoneer" 
                                                            name="payment-method" 
                                                            value="payoneer" 
                                                            checked={paymentMethod === 'payoneer'}
                                                            onChange={() => setPaymentMethod('payoneer')}
                                                        />
                                                        <label htmlFor="payment_payoneer">Payoneer</label>
                                                        <p data-method="payoneer" style={{ display: paymentMethod === 'payoneer' ? 'block' : 'none' }}>
                                                            Please send a Check to Store name with Store Street, Store Town, Store State, Store Postcode, Store Country.
                                                        </p>
                                                    </div>

                                                    <div className="single-method">
                                                        <input type="checkbox" id="accept_terms" />
                                                        <label htmlFor="accept_terms">I’ve read and accept the terms & conditions</label>
                                                    </div>
                                                </div>
                                                <button className="place-order btn btn-lg btn-round">Place order</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* Checkout section end */}
        </div>
    );
};

export default CheckoutPageComponent;