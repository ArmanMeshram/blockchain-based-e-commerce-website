import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CHAIN_ID, connectWallet as connectPolygonWallet } from '../wallet';

export default function Navbar({ authenticated, role, onLogout }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [wallet, setWallet] = useState(window.ethereum && window.ethereum.selectedAddress || '');
  const [walletChainId, setWalletChainId] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    const userId = localStorage.getItem('user_id');
    if (!userId || !authenticated) { setCartCount(0); return; }
    try {
      const { data } = await axios.get(`/api/cart/${userId}/`);
      setCartCount(Array.isArray(data) ? data.reduce((sum, item) => sum + Number(item.quantity || 0), 0) : 0);
    } catch (error) { setCartCount(0); }
  }, [authenticated]);

  useEffect(() => {
    window.addEventListener('cartUpdated', loadCartCount);
    loadCartCount();
    const provider = window.ethereum;
    const onAccountsChanged = accounts => setWallet(accounts[0] || '');
    const onChainChanged = chainId => setWalletChainId(Number(chainId));
    if (provider) {
      provider.request({ method: 'eth_accounts' }).then(accounts => setWallet(accounts[0] || '')).catch(() => {});
      provider.request({ method: 'eth_chainId' }).then(chainId => setWalletChainId(Number(chainId))).catch(() => setWalletChainId(null));
      if (provider.on) {
        provider.on('accountsChanged', onAccountsChanged);
        provider.on('chainChanged', onChainChanged);
      }
    }
    return () => {
      window.removeEventListener('cartUpdated', loadCartCount);
      if (provider && provider.removeListener) {
        provider.removeListener('accountsChanged', onAccountsChanged);
        provider.removeListener('chainChanged', onChainChanged);
      }
    };
  }, [loadCartCount]);

  const connectWallet = async () => {
    try {
      setWallet(await connectPolygonWallet());
      setWalletChainId(CHAIN_ID);
    } catch (error) { window.alert(error.message || 'Wallet connection was not completed.'); }
  };

  const submitSearch = event => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/?search=${encodeURIComponent(query)}` : '/');
    setMenuOpen(false);
  };

  return <>
    <div className="utility-strip"><div className="store-container">Thoughtful finds, trusted checkout <span>Secure payments · Blockchain-backed ownership</span></div></div>
    <header className="store-header">
      <div className="store-container store-header-main">
        <button className="mobile-menu-toggle" aria-label="Toggle menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}><span></span><span></span><span></span></button>
        <Link to="/" className="store-wordmark" aria-label="Trend Warehouse home"><span className="wordmark-mark">T</span><span>Trend<span className="wordmark-light">Warehouse</span></span></Link>
        <form className="store-search" onSubmit={submitSearch} role="search">
          <input aria-label="Search products" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products, brands and more" />
          <button type="submit" aria-label="Search"><i className="fas fa-search" aria-hidden="true" /></button>
        </form>
        <div className={`header-actions ${menuOpen ? 'is-open' : ''}`}>
          {authenticated ? <>
            <Link className="header-action" to="/UserProfile"><i className="far fa-user" aria-hidden="true"/><span>Account</span></Link>
            <Link className="header-action cart-action" to="/CartDetails"><i className="fas fa-shopping-bag" aria-hidden="true"/><span>Cart</span><b className="cart-count">{cartCount}</b></Link>
            {role === 'admin' && <Link className="header-action admin-link" to="/AddProd">Manage store</Link>}
            <button className="header-text-button" onClick={onLogout}>Sign out</button>
          </> : <>
            <Link className="header-action" to="/login"><i className="far fa-user" aria-hidden="true"/><span>Sign in</span></Link>
            <Link className="header-action cart-action" to="/login"><i className="fas fa-shopping-bag" aria-hidden="true"/><span>Cart</span></Link>
            <Link className="header-register" to="/register">Create account</Link>
          </>}
          <div className="wallet-action">{wallet ? walletChainId === CHAIN_ID ? <span className="wallet-connected" title="Connected to Polygon Amoy"><i aria-hidden="true"/> {wallet.slice(0, 6)}…{wallet.slice(-4)} <small>Amoy</small></span> : <button onClick={connectWallet} className="wallet-connect wallet-wrong-network" title={`Switch MetaMask to Polygon Amoy (${CHAIN_ID})`}><i className="fas fa-exclamation-triangle" aria-hidden="true"/> Switch to Amoy</button> : <button onClick={connectWallet} className="wallet-connect"><i className="fas fa-wallet" aria-hidden="true"/> Connect wallet</button>}</div>
        </div>
      </div>
      <div className="store-nav-row"><nav className="store-container category-nav" aria-label="Main navigation"><Link to="/">Shop all</Link><a href="/#featured">Featured</a><a href="/#new-arrivals">New arrivals</a><Link to="/UserProfile">Digital collection</Link></nav></div>
    </header>
  </>;
}
