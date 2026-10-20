import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const PlaceOrder = () => {
  const navigate = useNavigate();
  const [Order, setOrder] = useState([]);
  const orderDetails = async () => {
    const result = await axios.get(`/api/order/${localStorage.getItem('user_id')}/`);
    setOrder(result.data);
  };
  const clearOrder = async () => {
    await axios.delete(`/api/order/${localStorage.getItem('user_id')}/cancel/`);
    navigate('/CartDetails');
  };
  useEffect(() => { orderDetails(); }, []);

  return <main className="page-wrap"><div className="store-container checkout-container">
    <ol className="checkout-steps"><li className="complete">Cart</li><li className="active">Address</li><li>Payment</li><li>Confirmation</li></ol>
    <div className="section-heading"><div><p className="eyebrow">REVIEW YOUR ORDER</p><h2>Order details</h2></div></div>
    <div className="checkout-layout"><section className="order-lines">
      <h3>Items in your order</h3>
      {Order.map((order, index) => <article className="order-line" key={order.product_id || index}><div className="cart-product-thumb"><span>{String(order.name || 'P').slice(0,1).toUpperCase()}</span></div><div><strong>{order.name}</strong><span>Quantity: {order.quantity}</span></div><strong>Rs. {order.price}</strong></article>)}
      {Order.length === 0 && <div className="empty-state">Your order is being prepared. If this takes a while, return to your cart and try again.</div>}
      <div className="order-actions"><Button variant="outline-danger" onClick={clearOrder}>Cancel order</Button><Link to="/PaymentScreen" className="btn btn-primary">Continue to payment</Link></div>
    </section><aside className="cart-summary"><h3>Next step</h3><p>Confirm your delivery details and complete payment with your connected wallet.</p><div className="summary-line"><span>Payment</span><strong>Wallet / MetaMask</strong></div><Link to="/PaymentScreen" className="btn btn-primary btn-block mt-3">Continue</Link></aside></div>
  </div></main>;
};

export default PlaceOrder;
