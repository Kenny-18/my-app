"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "../../App.css"
import "./Sobre_mi.css"

export default function SobreMi() {
  const location = useLocation()
  const navigate = useNavigate()
  const user = location.state?.user || { displayName: "Usuario", email: "usuario@ejemplo.com" }
  const [portfolioData, setPortfolioData] = useState({
    name: user.displayName || "",
    title: "Desarrollador Web",
    about: "Escribe aquí una breve descripción sobre ti y tus habilidades profesionales.",
    skills: ["HTML", "CSS", "JavaScript", "React"],
    projects: [
      { title: "Proyecto 1", description: "Descripción del proyecto 1" },
      { title: "Proyecto 2", description: "Descripción del proyecto 2" },
    ],
  })

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({ ...portfolioData })

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({ ...portfolioData })
  }

  const handleSave = () => {
    setPortfolioData({ ...editData })
    setIsEditing(false)
  }

  const handleLogout = () => {
    navigate("/Sesion") // Redirige a la página de inicio de sesión
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <div className="user-info">
          {user.photoURL && <img src={user.photoURL || "/placeholder.svg"} alt="User Avatar" className="user-avatar" />}
          <div>
            <h1>{portfolioData.name}</h1>
            <h2>{portfolioData.title}</h2>
          </div>
        </div>
        {!isEditing ? (
          <button className="edit-button" onClick={handleEdit}>
            Editar Portafolio
          </button>
        ) : (
          <button className="save-button" onClick={handleSave}>
            Guardar Cambios
          </button>
        )}
        <button className="logout-button" onClick={handleLogout}>Cerrar Sesión</button>
      </div>
    </div>
  )
}
