"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { auth, provider, database } from "../firebase"
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { ref, set } from "firebase/database"
import "./Sesion.css"

export default function Login() {
  const [activeTab, setActiveTab] = useState("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuth = () => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        if (user) {
          // Si el usuario ya está autenticado, redirigir al portafolio
          console.log("Usuario ya autenticado:", user.uid)
          navigate("/SobreMi")
        }
      })

      return unsubscribe
    }

    const unsubscribe = checkAuth()
    return () => unsubscribe()
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      // Iniciar sesión con Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Actualizar la última fecha de inicio de sesión
      const userRef = ref(database, `users/${user.uid}`)
      await set(
        userRef,
        {
          email: user.email,
          lastLogin: new Date().toISOString(),
        },
        { merge: true },
      )

      setMessageType("success")
      setMessage(`Inicio de sesión exitoso ✅`)

      // Redirigir después de un breve retraso para que el usuario vea el mensaje
      setTimeout(() => {
        navigate("/SobreMi")
      }, 1500)
    } catch (error) {
      setMessageType("error")

      // Mensajes de error personalizados según el código de error
      switch (error.code) {
        case "auth/invalid-email":
          setMessage("Correo electrónico inválido ❌")
          break
        case "auth/user-not-found":
          setMessage("Usuario no encontrado ❌")
          break
        case "auth/wrong-password":
          setMessage("Contraseña incorrecta ❌")
          break
        case "auth/too-many-requests":
          setMessage("Demasiados intentos fallidos. Inténtalo más tarde ❌")
          break
        default:
          setMessage(`Error al iniciar sesión ❌: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setMessage("")

    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Guardar información adicional del usuario en la base de datos
      const userRef = ref(database, `users/${user.uid}`)
      await set(userRef, {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString(),
      })

      setMessageType("success")
      setMessage(`Bienvenido ${user.displayName} ✅`)

      // Redirigir después de un breve retraso
      setTimeout(() => {
        navigate("/SobreMi")
      }, 1500)
    } catch (error) {
      setMessageType("error")
      setMessage(`Error al iniciar sesión con Google ❌: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Modificar el handleCreateUser para manejar mejor el error de autenticación
  const handleCreateUser = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    // Validación de contraseñas
    if (newPassword !== confirmPassword) {
      setMessageType("error")
      setMessage("Las contraseñas no coinciden ❌")
      setLoading(false)
      return
    }

    // Validación de contraseña segura
    if (newPassword.length < 6) {
      setMessageType("error")
      setMessage("La contraseña debe tener al menos 6 caracteres ❌")
      setLoading(false)
      return
    }

    try {
      // Crear usuario con Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newEmail, newPassword)
      const user = userCredential.user

      // Guardar información adicional del usuario en la base de datos
      const userRef = ref(database, `users/${user.uid}`)
      await set(userRef, {
        email: newEmail,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      })

      // Inicializar estructura básica del portafolio
      const portfolioRef = ref(database, `portfolios/${user.uid}`)
      await set(portfolioRef, {
        personalInfo: {
          fullName: "",
          profession: "Desarrollador Web",
          email: newEmail,
          location: "Ciudad, País",
          bio: "Escribe aquí una breve descripción sobre ti y tus habilidades profesionales.",
          photoURL: "",
        },
        skills: ["HTML", "CSS", "JavaScript", "React"],
        projects: [
          { title: "Proyecto 1", description: "Descripción del proyecto 1" },
          { title: "Proyecto 2", description: "Descripción del proyecto 2" },
        ],
      })

      setMessageType("success")
      setMessage("Usuario creado exitosamente ✅")

      // Redirigir directamente al portafolio después de crear la cuenta
      setTimeout(() => {
        navigate("/SobreMi")
      }, 1500)
    } catch (error) {
      setMessageType("error")

      // Mensajes de error personalizados según el código de error
      switch (error.code) {
        case "auth/email-already-in-use":
          setMessage("Este correo electrónico ya está en uso ❌")
          break
        case "auth/invalid-email":
          setMessage("Correo electrónico inválido ❌")
          break
        case "auth/weak-password":
          setMessage("La contraseña es demasiado débil ❌")
          break
        case "auth/operation-not-allowed":
          setMessage(
            "El registro con email/contraseña no está habilitado. Debes habilitarlo en la consola de Firebase ❌",
          )
          break
        default:
          setMessage(`Error al crear el usuario ❌: ${error.message}`)
      }
    } finally {
      setLoading(false)
    }
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

        {message && <div className={`message ${messageType}`}>{message}</div>}

        {activeTab === "login" ? (
          <div className="login-form">
            <h2>Bienvenido de nuevo</h2>
            <p className="form-subtitle">Ingresa tus credenciales para continuar</p>

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Ingresa tu correo electrónico"
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
            </form>

            <div className="divider">
              <span>O</span>
            </div>

            <button onClick={handleGoogleLogin} className="google-btn" disabled={loading}>
              <i className="fab fa-google"></i>
              {loading ? "Procesando..." : "Continuar con Google"}
            </button>
          </div>
        ) : (
          <div className="register-form">
            <h2>Crear una cuenta</h2>
            <p className="form-subtitle">Completa el formulario para registrarte</p>

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label htmlFor="newEmail">Correo electrónico</label>
                <input
                  type="email"
                  id="newEmail"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  placeholder="Ingresa tu correo electrónico"
                  disabled={loading}
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
                  placeholder="Crea una contraseña segura (mínimo 6 caracteres)"
                  disabled={loading}
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
                  disabled={loading}
                />
              </div>

              <button type="submit" className="primary-btn" disabled={loading}>
                {loading ? "Creando cuenta..." : "Crear Cuenta"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
