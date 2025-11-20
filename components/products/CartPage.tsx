'use client'
import React, { useState, useMemo } from 'react';

// Mock data matching the user's screenshot items
const INITIAL_ITEMS: any[] = [
  {
    id: 1,
    name: 'Black Cable Restorer',
    price: 25.00,
    quantity: 1,
    image: 'assets/images/product/shop.webp',
  },
  {
    id: 2,
    name: 'Black Die Grinder',
    price: 25.00,
    quantity: 1,
    image: 'assets/images/product/shop.webp',
  },
  {
    id: 3,
    name: 'Orange Decker drill',
    price: 25.00,
    quantity: 1,
    image: 'assets/images/product/shop.webp',
  },
];

export const CartPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<any[]>(INITIAL_ITEMS);
  
  // Form states for payload
  const [shippingCountry, setShippingCountry] = useState('Bangladesh');
  const [shippingCity, setShippingCity] = useState('Dhaka');
  const [zipCode, setZipCode] = useState('');
  const [couponCode, setCouponCode] = useState('');

  // Calculations
  const subTotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cartItems]);

  const shippingCost = 0; // This could be calculated dynamically
  const grandTotal = subTotal + shippingCost;

  // Handlers
  const handleIncrement = (id: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    ));
  };

  const handleDecrement = (id: number) => {
    setCartItems(prev => prev.map(item => 
      item.id === id && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
    ));
  };

  const handleRemove = (id: number) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleCheckout = () => {
    const payload: any = {
      items: cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity
      })),
      currency: 'Rs',
      summary: {
        subTotal,
        shippingCost,
        grandTotal
      },
      shippingDetails: {
        country: shippingCountry,
        city: shippingCity,
        zipCode
      },
      couponCode: couponCode || undefined
    };

    console.log('Checkout Payload:', payload);
    alert('Checkout Payload generated! Check console.');
  };

  return (
    <div id="main-wrapper">
        {/* Page Banner Section Start */}
        <div className="page-banner-section section" style={{ backgroundColor: '#ddb040' }}>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className="page-banner text-center">
                            <h1>Shopping Cart</h1>
                            <ul className="page-breadcrumb">
                                <li><a href="#">Home</a></li>
                                <li>Cart</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {/* Page Banner Section End */}

        {/* Cart section start */}
        <div className="cart-section section pt-100 pt-lg-80 pt-md-70 pt-sm-60 pt-xs-50 pb-70 pb-lg-50 pb-md-40 pb-sm-30 pb-xs-20">
            <div className="container">
                <div className="row">
                    
                    <div className="col-12">            
                        {/* Cart Table */}
                        <div className="cart-table table-responsive mb-30">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th className="pro-thumbnail">Image</th>
                                        <th className="pro-title">Product</th>
                                        <th className="pro-price">Price</th>
                                        <th className="pro-quantity">Quantity</th>
                                        <th className="pro-subtotal">Total</th>
                                        <th className="pro-remove">Remove</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cartItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="pro-thumbnail">
                                                <a href="#"><img src={item.image} alt={item.name} /></a>
                                            </td>
                                            <td className="pro-title">
                                                <a href="#">{item.name}</a>
                                            </td>
                                            <td className="pro-price">
                                                <span>Rs.{item.price.toFixed(2)}</span>
                                            </td>
                                            <td className="pro-quantity">
                                                <div className="pro-qty">
                                                    {/* Custom Quantity Buttons */}
                                                    <span className="dec qtybtn" onClick={() => handleDecrement(item.id)}>-</span>
                                                    <input type="text" value={item.quantity} readOnly />
                                                    <span className="inc qtybtn" onClick={() => handleIncrement(item.id)}>+</span>
                                                </div>
                                            </td>
                                            <td className="pro-subtotal">
                                                <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                                            </td>
                                            <td className="pro-remove">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleRemove(item.id); }}>
                                                    <i className="fa fa-trash-o"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    ))}
                                    {cartItems.length === 0 && (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>
                                                Your cart is empty.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="row">

                            <div className="col-lg-6 col-12 mb-5">
                                {/* Calculate Shipping */}
                                <div className="calculate-shipping">
                                    <h4>Calculate Shipping</h4>
                                    <form action="#">
                                        <div className="row">
                                            <div className="col-md-6 col-12 mb-25">
                                                <select className="nice-select" value={shippingCountry} onChange={(e) => setShippingCountry(e.target.value)}>
                                                    <option>Bangladesh</option>
                                                    <option>China</option>
                                                    <option>country</option>
                                                    <option>India</option>
                                                    <option>Japan</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 col-12 mb-25">
                                                <select className="nice-select" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)}>
                                                    <option>Dhaka</option>
                                                    <option>Barisal</option>
                                                    <option>Khulna</option>
                                                    <option>Comilla</option>
                                                    <option>Chittagong</option>
                                                </select>
                                            </div>
                                            <div className="col-md-6 col-12 mb-25">
                                                <input type="text" placeholder="Postcode / Zip" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
                                            </div>
                                            <div className="col-md-6 col-12 mb-25">
                                                <button className="btn">Estimate</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                                {/* Discount Coupon */}
                                <div className="discount-coupon">
                                    <h4>Discount Coupon Code</h4>
                                    <form action="#">
                                        <div className="row">
                                            <div className="col-md-6 col-12 mb-25">
                                                <input type="text" placeholder="Coupon Code" value={couponCode} onChange={(e) => setCouponCode(e.target.value)} />
                                            </div>
                                            <div className="col-md-6 col-12 mb-25">
                                                <button className="btn">Apply Code</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>

                            {/* Cart Summary */}
                            <div className="col-lg-6 col-12 mb-30 d-flex">
                                <div className="cart-summary">
                                    <div className="cart-summary-wrap">
                                        <h4>Cart Summary</h4>
                                        <p>Sub Total <span>Rs.{subTotal.toFixed(2)}</span></p>
                                        <p>Shipping Cost <span>Rs.{shippingCost.toFixed(2)}</span></p>
                                        <h2>Grand Total <span>Rs.{grandTotal.toFixed(2)}</span></h2>
                                    </div>
                                    <div className="cart-summary-button">
                                        <button className="btn" onClick={handleCheckout}>Checkout</button>
                                        <button className="btn">Update Cart</button>
                                    </div>
                                </div>
                            </div>

                        </div>
                        
                    </div>
                    
                </div>            
            </div>
        </div>
        {/* Cart section end */}
    </div>
  );
};
