import React, { useState } from 'react';
import axios from 'axios';
import { Link, useHistory } from 'react-router-dom';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export default function Auth({ register = false, onAuthenticated }) {
  const history = useHistory();
  const [form, setForm] = useState({ email: '', username: '', password: '', first_name: '', last_name: '', mobile_no: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const { data } = await axios.post(`${API}/${register ? 'register' : 'login'}/`, register ? form : { email: form.email, password: form.password });
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user_id', String(data.user_id));
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      localStorage.setItem('role', data.role || 'customer');
      onAuthenticated(); history.replace('/');
    } catch (err) {
      const payload = err.response && err.response.data;
      setError(payload ? Object.entries(payload).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`).join(' · ') : 'Could not connect to the server. Please try again.');
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
      <label>Password<input required type="password" name="password" minLength={register ? 8 : undefined} autoComplete={register ? 'new-password' : 'current-password'} value={form.password} onChange={update}/></label>
      {error && <div role="alert" className="auth-error">{error}</div>}
      <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
    </form>
    <p className="auth-switch">{register ? 'Already have an account?' : 'New to Trend-Warehouse?'} <Link to={register ? '/login' : '/register'}>{register ? 'Sign in' : 'Create an account'}</Link></p>
  </section></main>;
}
