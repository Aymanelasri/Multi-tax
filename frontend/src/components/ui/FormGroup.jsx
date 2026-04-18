import React from 'react';

const FormGroup = ({ 
  label, 
  children, 
  help, 
  required = false,
  full = false 
}) => {
  return (
    <div className={`form-group ${full ? 'full' : ''}`}>
      {label && (
        <label>
          {label}
          {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {help && <span className="help">{help}</span>}
    </div>
  );
};

export default FormGroup;
