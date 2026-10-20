import React from 'react';

export function ButtonContainer({ cart, className = '', children, ...props }) {
  return <button className={`store-outline-button ${cart ? 'is-cart' : ''} ${className}`.trim()} {...props}>{children}</button>;
}
