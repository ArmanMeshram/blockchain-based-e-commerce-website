import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Navbar from './components/Navbar';
import Default from './components/Default';
import ProductView from './components/ProductView';
import AddProd from './components/AddProd';
import DeleteProd from './components/DeleteProd';
import UpdateProd from './components/UpdateProd';
import CartDetails from './components/CartDetails';
import UserProfile from './components/UserProfile';
import PlaceOrder from './components/PlaceOrder';
import PaymentScreen from './components/PaymentScreen';
import NFTDetails from './components/NFTDetails';
import Auth from './components/Auth';
import Footer from './components/Footer';

function ProtectedRoute({ authenticated, admin = false, children }) {
  const location = useLocation();
  if (!authenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  if (admin && localStorage.getItem('role') !== 'admin') return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(localStorage.getItem('access')));
  const logout = () => {
    ['access', 'refresh', 'user_id', 'username', 'email', 'role'].forEach(key => localStorage.removeItem(key));
    setAuthenticated(false);
  };
  return <>
    <Navbar authenticated={authenticated} role={localStorage.getItem('role')} onLogout={logout} />
    <Routes>
      <Route path="/login" element={authenticated ? <Navigate to="/" replace /> : <Auth onAuthenticated={() => setAuthenticated(true)} />} />
      <Route path="/register" element={authenticated ? <Navigate to="/" replace /> : <Auth register onAuthenticated={() => setAuthenticated(true)} />} />
      <Route path="/" element={<ProductView />} />
      <Route path="/ProductView" element={<ProductView />} />
      <Route path="/AddProd" element={<ProtectedRoute authenticated={authenticated} admin><AddProd /></ProtectedRoute>} />
      <Route path="/UpdateProd" element={<ProtectedRoute authenticated={authenticated} admin><UpdateProd /></ProtectedRoute>} />
      <Route path="/DeleteProd" element={<DeleteProd />} />
      <Route path="/CartDetails" element={<ProtectedRoute authenticated={authenticated}><CartDetails /></ProtectedRoute>} />
      <Route path="/UserProfile" element={<ProtectedRoute authenticated={authenticated}><UserProfile /></ProtectedRoute>} />
      <Route path="/PlaceOrder" element={<ProtectedRoute authenticated={authenticated}><PlaceOrder /></ProtectedRoute>} />
      <Route path="/PaymentScreen" element={<ProtectedRoute authenticated={authenticated}><PaymentScreen /></ProtectedRoute>} />
      <Route path="/NFTDetails" element={<ProtectedRoute authenticated={authenticated}><NFTDetails /></ProtectedRoute>} />
      <Route path="*" element={<Default />} />
    </Routes>
    <Footer />
  </>;
}
