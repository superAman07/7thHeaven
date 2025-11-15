import React from 'react';
import Link from 'next/link';

export default function NavBar() {
    return (
        <>
            <header className="header header-transparent header-sticky">
                <div className="header-top bg-dark">
                    <div
                        className="container-fluid pl-75 pr-75 pl-lg-15 pr-lg-15 pl-md-15 pr-md-15 pl-sm-15 pr-sm-15 pl-xs-15 pr-xs-15">
                        <div className="row align-items-center">

                            <div
                                className="col-xl-6 col-lg-4 d-flex flex-wrap justify-content-lg-start justify-content-center align-items-center">
                                <div className="header-top-links color-white">
                                    <div className="logo">
                                        <a href="index.html"><img src="assets/images/logo.png" alt="" style={{height: "46px"}} /></a>
                                    </div>
                                </div>
                            </div>

                            <div className="col-xl-6 col-lg-8">
                                <div
                                    className="ht-right d-flex justify-content-lg-end justify-content-center align-items-center">
                                    <ul className="ht-us-menu color-white d-flex">
                                        <li><a href="#"><i className="fa fa-user-circle-o"></i></a>
                                            <ul className="ht-dropdown right">
                                                <li><a href="compare.html">Compare Products</a></li>
                                                <li><a href="my-account.html">My Account</a></li>
                                                <li><a href="wishlist.html">My Wish List</a></li>
                                                <li><a href="login-register.html">Sign In</a></li>
                                            </ul>
                                        </li>
                                    </ul>

                                    <div className="header-search">
                                        <button className="header-search-toggle color-white">
                                            <i className="fa fa-search"></i>
                                        </button>
                                        <div className="header-search-form">
                                            <form action="#">
                                                <input type="text" placeholder="Type and hit enter" />
                                                <button>
                                                    <i className="fa fa-search"></i>
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                    <div className="header-cart color-white">
                                        <a href="cart.html"><i className="fa fa-shopping-cart"></i><span>3</span></a>
                                       
                                        <div className="header-cart-dropdown">
                                            <ul className="cart-items">
                                                <li className="single-cart-item">
                                                    <div className="cart-img">
                                                        <a href="cart.html">
                                                            <img src="assets/images/cart/cart-1.jpg" alt="" />
                                                        </a>
                                                    </div>
                                                    <div className="cart-content">
                                                        <h5 className="product-name"><a href="#">Dell Inspiron
                                                            24</a></h5>
                                                        <span className="product-quantity">1 ×</span>
                                                        <span className="product-price">$278.00</span>
                                                    </div>
                                                    <div className="cart-item-remove">
                                                        <a title="Remove" href="#"><i className="fa fa-trash"></i></a>
                                                    </div>
                                                </li>
                                                <li className="single-cart-item">
                                                    <div className="cart-img">
                                                        <a href="cart.html">
                                                            <img src="assets/images/cart/cart-2.jpg" alt="" />
                                                        </a>
                                                    </div>
                                                    <div className="cart-content">
                                                        <h5 className="product-name"><a href="#">Lenovo
                                                            Ideacentre
                                                            300</a></h5>
                                                        <span className="product-quantity">1 ×</span>
                                                        <span className="product-price">$23.39</span>
                                                    </div>
                                                    <div className="cart-item-remove">
                                                        <a title="Remove" href="#"><i className="fa fa-trash"></i></a>
                                                    </div>
                                                </li>
                                            </ul>
                                            <div className="cart-total">
                                                <h5>Subtotal :<span className="float-right">$39.79</span></h5>
                                                <h5>Eco Tax (-2.00) :<span className="float-right">$7.00</span></h5>
                                                <h5>VAT (20%) : <span className="float-right">$0.00</span></h5>
                                                <h5>Total : <span className="float-right">$46.79</span></h5>
                                            </div>
                                            <div className="cart-btn">
                                                <a href="cart.html">View Cart</a>
                                                <a href="checkout.html">checkout</a>
                                            </div>
                                        </div> 
                                    </div>

                                    {/* <div className="header-search mt-1">
                                        <button className="header-search-toggle color-white"><i className="fa fa-search"></i></button>
                                    </div>

                                    <div className="header-cart color-white mt-1">
                                        <a href="cart.html"><i className="fa fa-shopping-cart"></i><span>3</span></a>
                                    </div> */}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="header-bottom menu-right bg-light">
                    <div
                        className="container-fluid pl-75 pr-75 pl-lg-15 pr-lg-15 pl-md-15 pr-md-15 pl-sm-15 pr-sm-15 pl-xs-15 pr-xs-15">
                        <div className="row align-items-center">
                            <div
                                className="col-lg-12 col-md-12 col-12 order-lg-2 order-md-2 order-3 d-flex justify-content-center">
                                <nav className="main-menu color-black">
                                    <ul>
                                        <li><a href="index.html">Home</a></li>
                                        <li><a href="about.html">About Us</a></li>
                                        <li><a href="#">ACCESSORIES</a></li>
                                        <li><a href="#">Women</a></li>
                                        <li><a href="#">Men</a></li>
                                        <li><a href="#">BRANDS</a></li>
                                        <li><a href="#">NEW ARRIVALS</a></li>
                                        <li><a href="#">Partials</a></li>
                                        <li><a href="#">Bath & Body</a></li>
                                        <li><a href="contact.html">Contact Us</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-12 d-flex d-lg-none ">
                                <div className="mobile-menu"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        </>
    )
}