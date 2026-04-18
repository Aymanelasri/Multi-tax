import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button',
  disabled = false,
  className = ''
}) => {
  const variantClass = `btn-${variant}`;
  const classes = `btn ${variantClass} ${className}`;
  
  return (
    <button 
      className={classes} 
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
