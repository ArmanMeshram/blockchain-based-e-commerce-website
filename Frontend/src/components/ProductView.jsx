import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { mediaUrl } from '../api';

const FALLBACK_IMAGE = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#f0f1f2"/><path d="M180 390l88-96 62 65 45-48 78 79H180z" fill="#c7cdd3"/><circle cx="375" cy="220" r="34" fill="#c7cdd3"/><text x="300" y="470" text-anchor="middle" font-family="Arial" font-size="22" fill="#68717b">Image coming soon</text></svg>');

function ProductCard({ product, onAdd }) {
  return <article className="product-card">
    <Link className="product-image-link" to="/DeleteProd" state={{ id: product.id, r_id: product.user_id }} aria-label={`View ${product.name}`}>
      <img src={product.image ? mediaUrl(product.image) : FALLBACK_IMAGE} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMAGE; }} alt={product.name || 'Product'} />
      <span className="product-image-hint">View details</span>
    </Link>
    <div className="product-card-info">
      <Link to="/DeleteProd" state={{ id: product.id, r_id: product.user_id }} className="product-title">{product.name}</Link>
      <div className="product-price">Rs. {product.price}</div>
      <button className="btn btn-primary product-add" onClick={() => onAdd(product.id)}><i className="fas fa-plus" aria-hidden="true"/> Add to cart</button>
    </div>
  </article>;
}

function ProductView() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('search') || '';

  const fetchProducts = async () => {
    try {
      const result = await axios.get('/api/product/');
      setProducts(Array.isArray(result.data) ? result.data : []);
      setLoadError('');
    } catch (error) {
      setLoadError(`We could not load products just now (${error.response ? `HTTP ${error.response.status}` : error.message}). Please retry.`);
    } finally { setLoading(false); }
  };

  const addCart = async id => {
    if (!localStorage.getItem('access')) { navigate('/login'); return; }
    await axios({ method: 'post', url: `/api/cart/${localStorage.getItem('user_id')}/${id}/add/` });
    window.dispatchEvent(new Event('cartUpdated'));
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter(product => !query || (product.name || '').toLowerCase().includes(query.toLowerCase()) || (product.description || '').toLowerCase().includes(query.toLowerCase()));
  const featured = filtered.slice(0, 4);
  return <main className="store-home">
    <section className="store-container">
      <div className="home-hero">
        <div className="hero-copy"><span className="eyebrow">THE EVERYDAY EDIT</span><h1>Good finds.<br/>Made to last.</h1><p>Shop considered essentials and discover products with ownership backed by the blockchain.</p><a className="btn btn-primary hero-cta" href="#featured">Explore the collection <i className="fas fa-arrow-right" aria-hidden="true"/></a></div>
        <div className="hero-product" aria-hidden="true"><div className="hero-product-card"><span className="hero-product-label">TREND WAREHOUSE</span><div className="hero-art"><span className="hero-art-shape shape-one"/><span className="hero-art-shape shape-two"/><span className="hero-art-shape shape-three"/></div><span className="hero-product-caption">A better kind of everyday</span></div></div>
        <div className="hero-index">01 <span/> 03</div>
      </div>
      <div className="store-benefits"><div><i className="fas fa-box"/> Carefully selected products</div><div><i className="fas fa-shield-alt"/> Secure checkout</div><div><i className="fas fa-link"/> Verified digital ownership</div></div>

      {query && <div className="search-results-note">Search results for <strong>“{query}”</strong><Link to="/">Clear search</Link></div>}
      <section id="featured" className="product-section">
        <div className="section-heading"><div><p className="eyebrow">CURATED FOR YOU</p><h2>{query ? 'Search results' : 'Featured products'}</h2></div><span>{filtered.length} items</span></div>
        {loading ? <div className="product-grid">{[1,2,3,4].map(item => <div key={item} className="product-skeleton"><div/><span/><span/></div>)}</div> : loadError ? <div className="empty-state"><p>{loadError}</p><button className="btn btn-outline-primary" onClick={fetchProducts}>Try again</button></div> : filtered.length ? <div className="product-grid">{featured.map(product => <ProductCard key={product.id} product={product} onAdd={addCart}/>)}</div> : <div className="empty-state">{query ? 'No products matched your search. Try another term.' : 'Products will appear here once they are available.'}</div>}
      </section>
      {!query && <section id="new-arrivals" className="product-section">
        <div className="section-heading"><div><p className="eyebrow">JUST LANDED</p><h2>New arrivals</h2></div><span>Fresh additions to the store</span></div>
        {loading ? <div className="product-grid">{[1,2,3,4].map(item => <div key={item} className="product-skeleton"><div/><span/><span/></div>)}</div> : products.length > 4 ? <div className="product-grid">{products.slice(4, 8).map(product => <ProductCard key={product.id} product={product} onAdd={addCart}/>)}</div> : <div className="new-arrivals-note">Every item is selected for quality and backed by clear product and warranty details.</div>}
      </section>}
    </section>
  </main>;
}

export default ProductView;
