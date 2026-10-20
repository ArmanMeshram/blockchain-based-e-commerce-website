import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { connectWallet } from '../wallet';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isSave, setSave] = useState(false);
  const [acc, setacc] = useState('');
  const [response, setResponse] = useState([]);
  const [trans, settrans] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paymentError, setPaymentError] = useState('');

  async function connect() {
    setPaymentStatus('pending');
    setPaymentError('');
    try {
      const account = await connectWallet();
      setacc(account);
      await transaction(account);
    } catch (error) {
      setPaymentStatus('failed');
      setPaymentError(error.response?.data?.detail || error.message || 'The wallet transaction failed.');
      console.error('Wallet transaction failed.', error);
    }
  }

  const transaction = async account => {
    try {
      const { data } = await axios({ method: 'post', url: `/api/token/${localStorage.getItem('user_id')}/${account}/` });
      settrans(true);
      setResponse(data);
      setPaymentStatus('confirmed');
    } catch (error) {
      setPaymentStatus('failed');
      throw error;
    }
  };

  const addShippingAddress = async () => {
    const formField = new FormData();
    formField.append('address', address); formField.append('city', city); formField.append('state', state); formField.append('postalCode', postalCode);
    await axios({ method: 'post', url: `/api/order/${localStorage.getItem('user_id')}/ship/`, data: { address, city, state, postal_code: postalCode } }).then(() => setSave(true));
  };

  return <main className="page-wrap"><div className="store-container checkout-container">
    <ol className="checkout-steps"><li className="complete" onClick={() => navigate('/CartDetails')}>Cart</li><li className="complete" onClick={() => navigate('/PlaceOrder')}>Address</li><li className="active">Payment</li><li className={trans ? 'complete' : ''}>Confirmation</li></ol>
    <div className="section-heading"><div><p className="eyebrow">SAFE AND SECURE CHECKOUT</p><h2>Delivery & payment</h2></div></div>
    <div className="checkout-layout"><section className="checkout-form-panel">
      <div className="checkout-form-section"><h3>Delivery address</h3><p>Where should we send your order?</p>
        <div className="form-group"><label htmlFor="ship-address">Street address</label><input id="ship-address" className="form-control" type="text" autoComplete="street-address" value={address} onChange={e => setAddress(e.target.value)} placeholder="Street and house number" /></div>
        <div className="form-row"><div className="form-group col-md-6"><label htmlFor="ship-city">City</label><input id="ship-city" className="form-control" type="text" autoComplete="address-level2" value={city} onChange={e => setCity(e.target.value)} placeholder="City" /></div><div className="form-group col-md-6"><label htmlFor="ship-state">State</label><input id="ship-state" className="form-control" type="text" autoComplete="address-level1" value={state} onChange={e => setState(e.target.value)} placeholder="State" /></div></div>
        <div className="form-group"><label htmlFor="ship-postal">Postal code</label><input id="ship-postal" className="form-control" type="text" autoComplete="postal-code" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="Postal code" /></div>
        <button className="btn btn-outline-primary" disabled={isSave} onClick={addShippingAddress}>{isSave ? 'Address saved' : 'Save delivery address'}</button>
      </div>
      <div className="checkout-form-section payment-method"><h3>Payment with MetaMask</h3><p>Approve the blockchain transaction in your wallet to complete payment and create the digital warranty record.</p><a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">Need MetaMask? Get the wallet</a>
        {acc && <div className="wallet-address-row"><span>Connected wallet</span><strong>{acc.slice(0, 8)}…{acc.slice(-6)}</strong></div>}
        <button className="btn btn-primary btn-block mt-3" onClick={connect} disabled={paymentStatus === 'pending'}>{paymentStatus === 'pending' ? 'Waiting for wallet…' : 'Connect wallet & pay'}</button>
        {paymentStatus !== 'idle' && <div className={`transaction-status status-${paymentStatus}`} role="status"><span className="status-dot"/><strong>{paymentStatus === 'pending' ? 'Transaction pending' : paymentStatus === 'confirmed' ? 'Payment confirmed' : 'Transaction failed'}</strong><p>{paymentStatus === 'pending' ? 'Confirm the request in MetaMask. Keep this page open.' : paymentStatus === 'confirmed' ? 'Your order and digital warranty have been recorded.' : paymentError || 'The payment did not complete. Check your wallet and try again.'}</p></div>}
        {trans && <div className="transaction-results"><h4>Token transaction details</h4>{response.map((item, index) => { const value = String(Object.values(item)[0] || ''); const explorer = import.meta.env.VITE_EXPLORER_URL || 'https://amoy.polygonscan.com'; return <div className="transaction-result" key={index}><span>{Object.keys(item)[0]}</span>{value.startsWith('0x') ? <a href={`${explorer}/tx/${value}`} target="_blank" rel="noopener noreferrer">{value.slice(0, 10)}…{value.slice(-8)} ↗</a> : <strong>{value}</strong>}</div>; })}<a href={import.meta.env.VITE_EXPLORER_URL || 'https://amoy.polygonscan.com'} target="_blank" rel="noopener noreferrer">View on PolygonScan</a></div>}
      </div>
    </section><aside className="cart-summary"><h3>Checkout securely</h3><div className="summary-line"><span>Delivery</span><strong>Address required</strong></div><div className="summary-line"><span>Payment method</span><strong>MetaMask</strong></div><div className="secure-note"><i className="fas fa-lock"/> Wallet transactions are approved by you in MetaMask.</div><button className="btn btn-link btn-block" onClick={() => navigate('/CartDetails')}>Back to cart</button></aside></div>
  </div></main>;
};

export default PaymentScreen;
