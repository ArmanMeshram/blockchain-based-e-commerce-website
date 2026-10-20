import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function Auth({ register = false, onAuthenticated }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', username: '', password: '', first_name: '', last_name: '', mobile_no: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const { data } = await axios.post(`${API.replace(/\/+$/, '')}/${register ? 'register' : 'login'}/`, register ? form : { email: form.email, password: form.password });
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user_id', String(data.user_id));
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role || 'customer');
      onAuthenticated(); window.dispatchEvent(new Event('cartUpdated')); navigate('/', { replace: true });
    } catch (err) {
      const payload = err.response && err.response.data;
      if (typeof payload === 'string') {
        setError(/<\s*!doctype|<\s*html/i.test(payload)
          ? `The server returned an HTML error page (HTTP ${err.response.status}). Check the API route and try again.`
          : payload);
      } else if (payload && typeof payload === 'object') {
        setError(Object.entries(payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : typeof value === 'object' ? JSON.stringify(value) : value}`).join(' · '));
      } else {
        setError('Could not connect to the server. Please try again.');
      }
    } finally { setBusy(false); }
  };
  return <main className="auth-page"><section className="auth-card">
    <Link to="/" className="auth-brand">Trend-Warehouse</Link>
    <h1>{register ? 'Create your account' : 'Welcome back'}</h1>
    <p className="auth-subtitle">{register ? 'Join the marketplace to shop and manage your collection.' : 'Sign in to continue to your account.'}</p>
    <form onSubmit={submit}>
      {register && <div className="auth-row"><label>First name<input required name="first_name" autoComplete="given-name" value={form.first_name} onChange={update}/></label><label>Last name<input required name="last_name" autoComplete="family-name" value={form.last_name} onChange={update}/></label></div>}
      {register && <label>Username<input required name="username" autoComplete="username" value={form.username} onChange={update}/></label>}
      <label>Email address<input required type="email" name="email" autoComplete="email" value={form.email} onChange={update}/></label>
      {register && <label>Mobile number<input required type="tel" name="mobile_no" autoComplete="tel" value={form.mobile_no} onChange={update}/></label>}
      <label>Password<div className="password-field"><input required type={showPassword ? 'text' : 'password'} name="password" minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={update}/><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'Hide' : 'Show'}</button></div></label>
      {error && <div role="alert" className="auth-error">{error}</div>}
      <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    </form>
    <p className="auth-switch">{register ? 'Already have an account?' : 'New to Trend-Warehouse?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
  </section></main>;
}
