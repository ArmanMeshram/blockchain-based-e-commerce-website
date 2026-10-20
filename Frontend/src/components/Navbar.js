import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { ButtonContainer } from './Button';
export default class Navbar extends Component {
  render() {
    const { authenticated, role, onLogout } = this.props;
    return <NavWrapper className="navbar navbar-expand-sm navbar-dark px-sm-5">
      <Link to="/" aria-label="Trend-Warehouse home"><i className="fas fa-shopping-bag fa-2x" aria-hidden="true"/></Link>
      <Link to="/" className="nav-link"><h1 style={{fontSize:30,fontFamily:'Georgia, serif'}}>Trend-Warehouse</h1></Link>
      <div className="ml-auto d-flex align-items-center flex-wrap">
        {authenticated ? <>
          <Link to="/CartDetails"><ButtonContainer><span className="nav-action"><i className="fas fa-cart-plus"/> My cart</span></ButtonContainer></Link>
          <Link to="/UserProfile"><ButtonContainer><span className="nav-action"><i className="fas fa-user"/> Profile</span></ButtonContainer></Link>
          {role === 'admin' && <Link to="/AddProd"><ButtonContainer><span className="nav-action"><i className="fas fa-plus"/> Manage products</span></ButtonContainer></Link>}
          <button className="nav-auth-button" onClick={onLogout}>Sign out</button>
        </> : <>
          <Link to="/login"><ButtonContainer><span className="nav-action">Sign in</span></ButtonContainer></Link>
          <Link to="/register"><span className="nav-register">Create account</span></Link>
        </>}
      </div>
    </NavWrapper>;
  }
}
const NavWrapper = styled.nav`
  background: var(--mainBlue);
  .nav-link { color: var(--mainWhite) !important; font-size: 1.3rem; text-transform: capitalize; }
  .nav-action { color: white; font-family: Georgia,serif; font-size: 17px; display: inline-flex; gap: 9px; align-items: center; }
  .nav-register { display: inline-block; color: white; font-weight: 600; border: 1px solid rgba(255,255,255,.65); border-radius: 7px; padding: 8px 12px; }
  .nav-auth-button { border: 0; background: transparent; color: white; font: 17px Georgia,serif; padding: 10px; }
`;
