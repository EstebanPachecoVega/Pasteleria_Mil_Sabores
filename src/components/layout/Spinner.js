import React from 'react';

const Spinner = () => {
  return (
    <div className="spinner-overlay">
      <div className="spinner-container">
        <div className="loading-spinner"></div>
        <p>Cargando...</p>
      </div>
    </div>
  );
};

export default Spinner;