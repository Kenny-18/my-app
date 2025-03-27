"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { auth, provider, database } from "../firebase"
import { signInWithPopup } from "firebase/auth"
import { ref, set } from "firebase/database"
import "./Sesion.css"

export default function Login() {
  const [activeTab, setActiveTab] = useState("login")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [newUser, setNewUser] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate()

  const handleLogin = (e) => {
    e.preventDefault()
    if (username === "admin" && password === "1234") {
      setMessage("Inicio de sesión exitoso ✅")
      navigate("/SobreMi")
    } else {
      setMessage("Usuario o contraseña incorrectos ❌")
    }
  }

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        setMessage(`Bienvenido ${result.user.displayName} ✅`)
        navigate("/SobreMi")
      })
      .catch((error) => {
        setMessage(`Error al iniciar sesión con Google ❌: ${error.message}`)
      })
  }

  const handleCreateUser = (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden ❌")
      return
    }

    const userRef = ref(database, "users/" + newUser)
    set(userRef, {
      username: newUser,
      password: newPassword,
    })
      .then(() => {
        setMessage("Usuario creado exitosamente ✅")
        setActiveTab("login")
        setUsername(newUser)
        setPassword("")
      })
      .catch((error) => {
        setMessage(`Error al crear el usuario ❌: ${error.message}`)
      })
  }

  return (
    <div className="session-container">
      <div className="session-card">
        <div className="session-tabs">
          <button className={`tab-btn ${activeTab === "login" ? "active" : ""}`} onClick={() => setActiveTab("login")}>
            Iniciar Sesión
          </button>
          <button
            className={`tab-btn ${activeTab === "register" ? "active" : ""}`}
            onClick={() => setActiveTab("register")}
          >
            Registrarse
          </button>
        </div>

        {message && <div className={`message ${message.includes("✅") ? "success" : "error"}`}>{message}</div>}

        {activeTab === "login" ? (
          <div className="login-form">
            <h2>Bienvenido de nuevo</h2>
            <p className="form-subtitle">Ingresa tus credenciales para continuar</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="username">Usuario</label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Ingresa tu nombre de usuario"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Ingresa tu contraseña"
                />
              </div>

              <button type="submit" className="primary-btn">
                Iniciar Sesión
              </button>
            </form>

            <div className="divider">
              <span>O</span>
            </div>

            <button onClick={handleGoogleLogin} className="google-btn">
              <i className="fab fa-google"></i>
              Continuar con Google
            </button>
          </div>
        ) : (
          <div className="register-form">
            <h2>Crear una cuenta</h2>
            <p className="form-subtitle">Completa el formulario para registrarte</p>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="newUser">Nombre de usuario</label>
                <input
                  type="text"
                  id="newUser"
                  value={newUser}
                  onChange={(e) => setNewUser(e.target.value)}
                  required
                  placeholder="Elige un nombre de usuario"
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">Contraseña</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Crea una contraseña segura"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repite tu contraseña"
                />
              </div>

              <button type="submit" className="primary-btn">
                Crear Cuenta
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

