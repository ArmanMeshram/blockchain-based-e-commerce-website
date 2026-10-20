import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Default extends Component {
  render() {
    return <main className="page-wrap"><div className="store-container"><section className="not-found-card">
      <p className="eyebrow">PAGE NOT FOUND</p><h1>We can't find that page.</h1><p>The address may have changed or the page may no longer be available.</p><Link className="btn btn-primary" to="/">Return to the store</Link>
    </section></div></main>;
  }
}
