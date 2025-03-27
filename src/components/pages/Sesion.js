import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Para redirección
import { auth, provider, database } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { ref, set } from 'firebase/database';

export default function Sesion() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [newUser, setNewUser] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();  // Para redirección

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === '1234') {
      setMessage('Inicio de sesión exitoso ✅');
      navigate('/SobreMi');  // Redirigir a la página 'Sobre_mi'
    } else {
      setMessage('Usuario o contraseña incorrectos ❌');
    }
  };

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setMessage(`Bienvenido ${result.user.displayName} ✅`);
        navigate('/SobreMi');  // Redirigir a la página 'Sobre_mi'
      })
      .catch((error) => {
        setMessage(`Error al iniciar sesión con Google ❌: ${error.message}`);
      });
  };

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        setMessage('Cierre de sesión exitoso ✅');
        navigate('/Sesion');  // Redirigir a la página de login
      })
      .catch((error) => {
        setMessage(`Error al cerrar sesión ❌: ${error.message}`);
      });
  };

  const handleCreateUser = (e) => {
    e.preventDefault();
    const userRef = ref(database, 'users/' + newUser);
    set(userRef, {
      username: newUser,
      password: newPassword,
    }).then(() => {
      setMessage('Usuario creado exitosamente ✅');
    }).catch((error) => {
      setMessage(`Error al crear el usuario ❌: ${error.message}`);
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
      <form onSubmit={handleCreateUser}>
        <h3>Crear nuevo usuario</h3>
        <div>
          <label>Nuevo Usuario:</label>
          <input
            type="text"
            value={newUser}
            onChange={(e) => setNewUser(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Crear Usuario</button>
      </form>
      {message && <p>{message}</p>}
      <button onClick={handleLogout}>Cerrar Sesión</button>
    </div>
  );
}
