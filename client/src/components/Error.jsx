import React from 'react';

function Error({ message }) {
  return (
    <div className="alert alert-danger" role="alert">
      {message || 'An unexpected error occurred. Please try again later.'}
    </div>
  );
}

export default Error;
