import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="store-footer">
    <div className="store-container">
      <div className="footer-grid">
        <div><h4>Shop</h4><Link to="/">All products</Link><a href="/#featured">Featured</a><a href="/#new-arrivals">New arrivals</a></div>
        <div><h4>Account</h4><Link to="/login">Sign in</Link><Link to="/register">Create account</Link><Link to="/UserProfile">Your profile</Link></div>
        <div><h4>Help</h4><span className="footer-static-link">Contact support</span><span className="footer-static-link">Secure payments</span><span className="footer-static-link">Warranty information</span></div>
        <div><h4>About</h4><p>Thoughtful products with clear provenance and blockchain-backed ownership details.</p></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Trend Warehouse</span><span><i className="fas fa-lock" aria-hidden="true"/> Protected checkout · Wallet transactions require your approval</span></div>
    </div>
  </footer>;
}
