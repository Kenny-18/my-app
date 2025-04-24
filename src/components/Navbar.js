"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "./Button"
import { Link } from "react-router-dom"
import "./Navbar.css"
import video from "../videos/Fondo.mp4"
import { auth } from "./firebase"

function Navbar() {
  const [click, setClick] = useState(false)
  const [button, setButton] = useState(true)
  const [user, setUser] = useState(null)
  const navRef = useRef(null)

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser)
    })

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe()
  }, [])

  // Add a console log to debug video loading
  useEffect(() => {
    const videoElement = document.querySelector("video")
    if (videoElement) {
      videoElement.addEventListener("error", (e) => {
        console.error("Error loading video:", e)
      })

      videoElement.addEventListener("loadeddata", () => {
        console.log("Video loaded successfully")
      })
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("error", () => {})
        videoElement.removeEventListener("loadeddata", () => {})
      }
    }
  }, [])

  const handleClick = () => setClick(!click)
  const closeMobileMenu = () => setClick(false)

  // Usar useCallback para evitar la redefinición de showButton en cada render
  const showButton = useCallback(() => {
    if (window.innerWidth <= 960) {
      setButton(false)
    } else {
      setButton(true)
      // Cerrar el menú móvil si está abierto y la pantalla se hace grande
      if (click) setClick(false)
    }
  }, [click]) // Dependencia de click

  // Cerrar el menú cuando se hace clic fuera de él
  useEffect(() => {
    function handleClickOutside(event) {
      if (navRef.current && !navRef.current.contains(event.target) && click) {
        setClick(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [click])

  useEffect(() => {
    showButton()

    // Prevenir scroll cuando el menú móvil está abierto
    if (click) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [click, showButton]) // Agregar showButton como dependencia

  window.addEventListener("resize", showButton)

  // Función para cerrar sesión
  const handleLogout = () => {
    auth
      .signOut()
      .then(() => {
        // Redirigir a la página de inicio después de cerrar sesión
        window.location.href = "/"
      })
      .catch((error) => {
        console.error("Error al cerrar sesión:", error)
      })
  }

  return (
    <>
      <video src={video} autoPlay loop muted />
      <nav className="navbar" ref={navRef}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            Lenguaje III
          </Link>
          <div className="menu-icon" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fas fa-bars"} />
          </div>
          <ul className={click ? "nav-menu active" : "nav-menu"}>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                Inicio
              </Link>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <Link to="/SobreMi" className="nav-links" onClick={closeMobileMenu}>
                    Mi Portafolio
                  </Link>
                </li>
                <li className="nav-item mobile-only">
                  <button className="nav-links logout-button" onClick={handleLogout}>
                    Cerrar Sesión
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item mobile-only">
                <Link to="/Sesion" className="nav-links" onClick={closeMobileMenu}>
                  Iniciar Sesión
                </Link>
              </li>
            )}
          </ul>
          {button &&
            (user ? (
              <div className="user-nav-info">
                <span className="user-greeting">Hola, {user.displayName || user.email.split("@")[0]}</span>
                <button onClick={handleLogout} className="btn-outline logout-btn">
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link to="/Sesion" className="btn-link" onClick={closeMobileMenu}>
                <Button buttonStyle="btn--outline">Iniciar Sesión</Button>
              </Link>
            ))}
        </div>
      </nav>
      {/* Overlay para cuando el menú móvil está abierto */}
      {click && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </>
  )
}

export default Navbar
