"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "./Button"
import { Link } from "react-router-dom"
import "./Navbar.css"
import video from "../videos/Fondo.mp4"

function Navbar() {
  const [click, setClick] = useState(false)
  const [button, setButton] = useState(true)
  const navRef = useRef(null)

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
  }, [click, showButton])  // Agregar showButton como dependencia

  window.addEventListener("resize", showButton)

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
            <li className="nav-item mobile-only">
              <Link to="/Sesion" className="nav-links" onClick={closeMobileMenu}>
                Iniciar Sesión
              </Link>
            </li>
          </ul>
          {button && (
            <Link to="/Sesion" className="btn-link" onClick={closeMobileMenu}>
              <Button buttonStyle="btn--outline">Iniciar Sesión</Button>
            </Link>
          )}
        </div>
      </nav>
      {/* Overlay para cuando el menú móvil está abierto */}
      {click && <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>}
    </>
  )
}

export default Navbar
