import React from 'react';

const Logo = ({ size = 64 }) => {
  return (
    <div className="flex-center" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <img 
        src="/logo-ignisalud.jpg" 
        alt="IgniSalud Logo" 
        style={{ 
          width: size, 
          height: 'auto',
          borderRadius: size * 0.2, // Bordes redondeados proporcionales
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'block'
        }} 
      />
    </div>
  );
};

export default Logo;
