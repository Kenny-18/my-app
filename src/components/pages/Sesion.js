import React, { useState } from 'react';
import '../../App.css';
import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      setMessage('Inicio de sesión exitoso ✅');
    } else {
      setMessage('Usuario o contraseña incorrectos ❌');
    }
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setMessage(`Bienvenido ${result.user.displayName} ✅`);
      })
      .catch((error) => {
        setMessage(`Error al iniciar sesión con Google ❌: ${error.message}`);
      });
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Usuario:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Iniciar Sesión</button>
      </form>
      <button onClick={handleGoogleLogin}>Iniciar sesión con Google</button>
      {message && <p>{message}</p>}
    </div>
  );
}
