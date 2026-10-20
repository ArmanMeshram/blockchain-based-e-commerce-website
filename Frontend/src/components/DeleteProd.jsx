import axios from 'axios';
import React, {useState, useEffect} from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { mediaUrl } from '../api';


const DeleteProd = () => {

  const [Products, setProducts] = useState([])
  const [confirmDelete, setConfirmDelete] = useState(false)
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state || {};

  const getSingleProducts = async () => {
    if (!routeState.id) return;
    const { data } = await axios.get(`/api/product/${routeState.id}/`)
    console.log(data);
    setProducts(data);
  }
  const deleteUser = async (id) => {
    await axios.delete(`/api/product/${id}/delete/`)
    navigate('/')
  }
  const addCart = async (id) => {
    await axios({
        method: 'post',
        url:`/api/cart/${localStorage.getItem('user_id')}/${id}/add/`,

      }).then(response=>{

        console.log(response.data);
        window.dispatchEvent(new Event('cartUpdated'));
      })
  }

  useEffect(() => { getSingleProducts(); }, [routeState.id]);
  return <main className="page-wrap"><div className="store-container">
    <nav className="detail-breadcrumb"><Link to="/">Shop</Link><span>/</span><span>{Products.name || 'Product details'}</span></nav>
    <section className="product-detail">
      <div><img className="product-detail-image" src={Products.image ? mediaUrl(Products.image) : undefined} alt={Products.name || 'Product'} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><rect width="600" height="600" fill="#f0f1f2"/><text x="300" y="310" text-anchor="middle" font-family="Arial" font-size="24" fill="#68717b">Image coming soon</text></svg>'); }} /></div>
      <div className="product-detail-info">
        <p className="eyebrow">TREND WAREHOUSE / PRODUCT</p>
        <h1>{Products.name}</h1>
        <p className="product-price">Rs. {Products.price}</p>
        <p className="detail-description">{Products.description}</p>
        <p className="detail-meta"><strong>Warranty:</strong> {Products.warranty_period} years</p>
        <div className="trust-row"><span><i className="fas fa-shield-alt"/> Secure checkout</span><span><i className="fas fa-link"/> Blockchain-backed warranty</span></div>
        <div className="detail-actions"><Button variant="primary" className="px-4" onClick={() => addCart(Products.id)}><i className="fas fa-shopping-bag mr-2"/>Add to cart</Button><Link className="btn btn-outline-primary px-4" to="/CartDetails">Go to cart</Link></div>
        {localStorage.getItem('role') === 'admin' && <div className="admin-product-actions"><span>Store management</span><Link to="/UpdateProd" state={{id: routeState.id, r_id: routeState.r_id}} className="btn btn-outline-primary btn-sm">Edit product</Link><Button variant="outline-danger" size="sm" onClick={() => setConfirmDelete(true)}>Delete</Button></div>}
      </div>
    </section>
    <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered><Modal.Header closeButton><Modal.Title>Delete this product?</Modal.Title></Modal.Header><Modal.Body>This removes “{Products.name}” from the store. This action cannot be undone.</Modal.Body><Modal.Footer><Button variant="light" onClick={() => setConfirmDelete(false)}>Keep product</Button><Button variant="danger" onClick={() => deleteUser(Products.id)}>Delete product</Button></Modal.Footer></Modal>
  </div></main>;
};

export default DeleteProd;
