import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
import './index.css';
import App from './App';
import {BrowserRouter as Router} from 'react-router-dom';

import { Web3ReactProvider } from '@web3-react/core'
import * as serviceWorker from './serviceWorker';
import { Web3Provider } from "@ethersproject/providers";

axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
axios.interceptors.request.use(config => {
    const token = localStorage.getItem('access');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
function getLibrary(provider) {
    return new Web3Provider(provider);
}
ReactDOM.render(
<Web3ReactProvider getLibrary={getLibrary}>
    
        <Router>
            <App />
        </Router>
    
</Web3ReactProvider>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
