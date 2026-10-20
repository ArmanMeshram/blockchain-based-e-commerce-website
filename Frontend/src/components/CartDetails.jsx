import axios from 'axios';
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { mediaUrl } from '../api';

function CartDetails() {
  const navigate = useNavigate();
  const [Product, setProduct] = useState([]);
  const [Total, setTotal] = useState([]);
  const userId = localStorage.getItem('user_id');

  const addOrder = async () => {
    await axios({ method: 'post', url: `/api/order/${userId}/add/` }).then(() => navigate('/PlaceOrder'));
  };
  const fetchProduct = useCallback(async () => {
    const result = await axios.get(`/api/cart/${userId}/`);
    setProduct(result.data);
  }, [userId]);
  const totalProduct = useCallback(async () => {
    const result = await axios.get(`/api/cart/${userId}/total/`);
    setTotal(result.data);
  }, [userId]);
  const refreshCart = async () => { await Promise.all([fetchProduct(), totalProduct()]); window.dispatchEvent(new Event('cartUpdated')); };
  const deleteItem = async id => { await axios.delete(`/api/cart/${userId}/${id}/delete/`); await refreshCart(); };
  const clearCart = async () => { await axios.delete(`/api/cart/${userId}/clear/`); await refreshCart(); };
  const incCart = async id => { await axios({ method: 'PUT', url: `/api/cart/${userId}/${id}/` }); await refreshCart(); };
  const decCart = async id => { await axios({ method: 'PUT', url: `/api/cart/${userId}/${id}/dec/` }); await refreshCart(); };

  useEffect(() => { fetchProduct(); totalProduct(); }, [fetchProduct, totalProduct]);

  return <main className="page-wrap"><div className="store-container">
    <div className="section-heading cart-page-heading"><div><p className="eyebrow">YOUR SELECTION</p><h2>Shopping cart</h2></div><span>{Product.length} {Product.length === 1 ? 'item' : 'items'}</span></div>
    {Product.length === 0 ? <div className="empty-state"><h3>Your cart is empty</h3><p>Find something you love and it will be waiting here.</p><button className="btn btn-primary" onClick={() => navigate('/')}>Continue shopping</button></div> : <div className="cart-layout">
      <section className="cart-list" aria-label="Cart items">{Product.map((prods, index) => <article className="cart-item" key={prods.product_id || index}>
        <div className="cart-product-thumb">{prods.image ? <img src={mediaUrl(prods.image)} alt={prods.name} /> : <span>{String(prods.name || 'P').slice(0, 1).toUpperCase()}</span>}</div>
        <div className="cart-product-copy"><Link to="/DeleteProd" state={{ id: prods.product_id }}>{prods.name}</Link><span>Rs. {prods.price} each</span><button className="cart-remove" onClick={() => deleteItem(prods.product_id)}>Remove</button></div>
        <div className="quantity-stepper"><button aria-label="Decrease quantity" onClick={() => decCart(prods.product_id)}>−</button><span>{prods.quantity}</span><button aria-label="Increase quantity" onClick={() => incCart(prods.product_id)}>+</button></div>
        <strong className="cart-line-total">Rs. {prods.total_amount}</strong>
      </article>)}</section>
      <aside className="cart-summary"><h3>Order summary</h3>
        {Total.map((tol, index) => <React.Fragment key={index}><div className="summary-line"><span>Subtotal</span><span>Rs. {tol.total}</span></div><div className="summary-line"><span>Shipping</span><span>Calculated at checkout</span></div><div className="summary-line summary-total"><span>Total</span><span>Rs. {tol.total}</span></div></React.Fragment>)}
        <button className="btn btn-primary btn-block mt-3" type="button" onClick={addOrder}>Proceed to checkout</button><button className="btn btn-link btn-block text-muted" type="button" onClick={clearCart}>Clear cart</button><p className="secure-note"><i className="fas fa-lock"/> Secure checkout · Wallet payment supported</p>
      </aside>
    </div>}
  </div></main>;
}

export default CartDetails;
