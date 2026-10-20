import React, { Component } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
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

const protectedPaths = ['/AddProd', '/DeleteProd', '/UpdateProd', '/CartDetails', '/UserProfile', '/PlaceOrder', '/PaymentScreen', '/NFTDetails'];
const adminPaths = ['/AddProd', '/UpdateProd'];
export default class App extends Component {
  state = { authenticated: Boolean(localStorage.getItem('access')) };
  authenticate = () => this.setState({ authenticated: Boolean(localStorage.getItem('access')) });
  logout = () => {
    ['access', 'refresh', 'user_id', 'username', 'email', 'role'].forEach(key => localStorage.removeItem(key));
    this.setState({ authenticated: false });
  };
  render() {
    const { authenticated } = this.state;
    return <>
      <Navbar authenticated={authenticated} role={localStorage.getItem('role')} onLogout={this.logout} />
      <Switch>
        <Route exact path="/login" render={() => authenticated ? <Redirect to="/"/> : <Auth onAuthenticated={this.authenticate}/>}/>
        <Route exact path="/register" render={() => authenticated ? <Redirect to="/"/> : <Auth register onAuthenticated={this.authenticate}/>}/>
        <Route exact path="/" component={ProductView}/>
        <Route path="/ProductView" component={ProductView}/>
        {protectedPaths.map(path => <Route key={path} path={path} render={props => authenticated ? (adminPaths.includes(path) && localStorage.getItem('role') !== 'admin' ? <Redirect to="/"/> : React.createElement(({ '/AddProd': AddProd, '/DeleteProd': DeleteProd, '/UpdateProd': UpdateProd, '/CartDetails': CartDetails, '/UserProfile': UserProfile, '/PlaceOrder': PlaceOrder, '/PaymentScreen': PaymentScreen, '/NFTDetails': NFTDetails })[path], props)) : <Redirect to={{ pathname: '/login', state: { from: props.location } }}/>}/>)}
        <Route component={Default}/>
      </Switch>
    </>;
  }
}
