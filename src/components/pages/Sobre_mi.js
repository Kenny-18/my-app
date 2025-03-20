import React from 'react';
import { useLocation } from 'react-router-dom';
import '../../App.css';

export default function SobreMi() {
  const location = useLocation();
  const user = location.state?.user;  // Accedemos a la información del usuario desde el estado

  return (
    <div className="sobre-mi-container">

      {user ? (
        <div>
          <p>Bienvenido, {user.displayName}!</p>
          <p>Email: {user.email}</p>
          <img src={user.photoURL} alt="User Avatar" />
        </div>
      ) : (
        <p>No has iniciado sesión.</p>
      )}
    </div>
  );
}
