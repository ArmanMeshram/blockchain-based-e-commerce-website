import React from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import './index.css';
import App from './App';
import { BrowserRouter as Router } from 'react-router-dom';
import { API_URL } from './api';

axios.defaults.baseURL = API_URL;
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('access');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

createRoot(document.getElementById('root')).render(
  <React.StrictMode><Router><App /></Router></React.StrictMode>
);
