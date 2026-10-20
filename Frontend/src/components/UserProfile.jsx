import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { mediaUrl } from '../api';

const UserProfile = () => {
  const [User, setUser] = useState({});
  const [NFTd, setNft] = useState([]);
  const [Orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('profile');
  const userId = localStorage.getItem('user_id');

  const fetchUserDetails = async () => { const result = await axios.get(`/api/user/${userId}/`); setUser(result.data); };
  const fetchNFTDetails = async () => { const result = await axios.get(`/api/nft/${userId}/`); setNft(result.data); };
  const fetchOrders = async () => { try { const result = await axios.get(`/api/order/${userId}/`); setOrders(Array.isArray(result.data) ? result.data : []); } catch (error) { setOrders([]); } };
  // Load the signed-in account overview once when this screen mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUserDetails(); fetchNFTDetails(); fetchOrders(); }, []);

  const firstLetter = (User.first_name || User.username || 'U').charAt(0).toUpperCase();
  return <main className="page-wrap"><div className="store-container profile-layout">
    <div className="section-heading"><div><p className="eyebrow">YOUR ACCOUNT</p><h2>Account overview</h2></div></div>
    <section className="profile-card profile-identity"><div className="profile-avatar">{firstLetter}</div><div><h3>{User.first_name} {User.last_name}</h3><p>{User.email}</p><span>{User.mobile_no || 'Phone not added'}</span></div><span className="profile-member">Customer account</span></section>
    <div className="profile-tabs" role="tablist" aria-label="Account sections">
      <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')} role="tab">Profile</button>
      <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')} role="tab">Orders</button>
      <button className={activeTab === 'wallet' ? 'active' : ''} onClick={() => setActiveTab('wallet')} role="tab">Wallet & collection</button>
    </div>
    {activeTab === 'profile' && <section className="profile-card profile-content"><h3>Personal information</h3><div className="profile-fields"><div><span>Name</span><strong>{User.first_name} {User.last_name}</strong></div><div><span>Username</span><strong>{User.username}</strong></div><div><span>Email address</span><strong>{User.email}</strong></div><div><span>Mobile number</span><strong>{User.mobile_no || 'Not provided'}</strong></div></div></section>}
    {activeTab === 'orders' && <section className="profile-card profile-content"><h3>Recent order</h3>{Orders.length ? <div className="table-responsive"><table className="table orders-table"><thead><tr><th>Product</th><th>Quantity</th><th>Unit price</th><th>Status</th></tr></thead><tbody>{Orders.map((order, index) => <tr key={order.product_id || index}><td>{order.name}</td><td>{order.quantity}</td><td>Rs. {order.price}</td><td><span className="status-badge">In progress</span></td></tr>)}</tbody></table></div> : <div className="empty-state compact-empty">No current order found. <Link to="/">Explore the store</Link></div>}</section>}
    {activeTab === 'wallet' && <section className="profile-card profile-content"><div className="section-heading"><div><h3>Digital collection</h3><p>NFTs and warranty records associated with your account.</p></div><span>{NFTd.length} items</span></div>{NFTd.length ? <div className="collection-grid">{NFTd.map(nft => <Link key={nft.id} className="collection-item" to="/NFTDetails" state={{ token_id: nft.token_id, product_id: nft.product_id, acc_address: nft.acc_address, expiry_date: nft.expiry_date, diff: nft.diff, redeem: nft.redeem }}><img src={mediaUrl(nft.image)} alt={nft.name} onError={e => {e.currentTarget.style.visibility = 'hidden';}}/><div><strong>{nft.name}</strong><span>Token #{nft.token_id}</span><small>{nft.acc_address ? `${nft.acc_address.slice(0,7)}…${nft.acc_address.slice(-5)}` : 'Wallet details'}</small></div></Link>)}</div> : <div className="empty-state compact-empty">Your digital collection will appear here after a purchase.</div>}</section>}
  </div></main>;
};

export default UserProfile;
