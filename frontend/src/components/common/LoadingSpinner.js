import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ size = 'medium', text = 'Chargement...' }) => {
  const sizeClasses = {
    small: 'sm',
    medium: 'md',
    large: 'lg'
  };

  const spinnerSize = sizeClasses[size] || 'md';

  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <Spinner 
        animation="border" 
        role="status"
        size={spinnerSize}
        className="text-primary"
      />
      {text && (
        <p className="mt-3 text-muted small mb-0">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;