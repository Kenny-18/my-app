"use client"

import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import "../../App.css"
import "./Sobre_mi.css"
import PersonalInfoForm from "./PersonalInfoForm"

export default function SobreMi() {
  const location = useLocation()
  const user = location.state?.user || { displayName: "Usuario", email: "usuario@ejemplo.com" }

  // Estado para controlar las pestañas
  const [activeTab, setActiveTab] = useState("preview")

  // Estado para almacenar los datos del portafolio
  const [portfolioData, setPortfolioData] = useState({
    personalInfo: {
      fullName: user.displayName || "",
      profession: "Desarrollador Web",
      email: user.email || "",
      phone: "",
      location: "Ciudad, País",
      bio: "Escribe aquí una breve descripción sobre ti y tus habilidades profesionales.",
      website: "",
      linkedin: "",
      github: "",
    },
    skills: ["HTML", "CSS", "JavaScript", "React"],
    projects: [
      { title: "Proyecto 1", description: "Descripción del proyecto 1" },
      { title: "Proyecto 2", description: "Descripción del proyecto 2" },
    ],
  })

  // Cargar datos del localStorage al iniciar
  useEffect(() => {
    const savedPersonalInfo = localStorage.getItem("personalInfo")
    if (savedPersonalInfo) {
      setPortfolioData((prevData) => ({
        ...prevData,
        personalInfo: JSON.parse(savedPersonalInfo),
      }))
    }
  }, [])

  // Manejar el guardado de información personal
  const handleSavePersonalInfo = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      personalInfo: data,
    }))
  }

  return (
    <div className="portfolio-container">
      <div className="portfolio-header">
        <div className="user-info">
          {user.photoURL && <img src={user.photoURL || "/placeholder.svg"} alt="User Avatar" className="user-avatar" />}
          <div>
            <h1>{portfolioData.personalInfo.fullName || user.displayName}</h1>
            <h2>{portfolioData.personalInfo.profession}</h2>
          </div>
        </div>
        <div className="portfolio-tabs">
          <button
            className={`tab-button ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => setActiveTab("preview")}
          >
            Vista Previa
          </button>
          <button className={`tab-button ${activeTab === "edit" ? "active" : ""}`} onClick={() => setActiveTab("edit")}>
            Editar Perfil
          </button>
        </div>
      </div>

      {activeTab === "preview" ? (
        <div className="portfolio-content">
          <section className="about-section">
            <h3>Sobre Mí</h3>
            <p>{portfolioData.personalInfo.bio}</p>

            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>{portfolioData.personalInfo.email}</span>
              </div>

              {portfolioData.personalInfo.phone && (
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>{portfolioData.personalInfo.phone}</span>
                </div>
              )}

              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{portfolioData.personalInfo.location}</span>
              </div>

              {portfolioData.personalInfo.website && (
                <div className="contact-item">
                  <i className="fas fa-globe"></i>
                  <a href={portfolioData.personalInfo.website} target="_blank" rel="noopener noreferrer">
                    Sitio Web
                  </a>
                </div>
              )}

              {portfolioData.personalInfo.linkedin && (
                <div className="contact-item">
                  <i className="fab fa-linkedin"></i>
                  <a href={portfolioData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
              )}

              {portfolioData.personalInfo.github && (
                <div className="contact-item">
                  <i className="fab fa-github"></i>
                  <a href={portfolioData.personalInfo.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </section>

          <section className="skills-section">
            <h3>Habilidades</h3>
            <div className="skills-list">
              {portfolioData.skills.map((skill, index) => (
                <span key={index} className="skill-tag">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section className="projects-section">
            <h3>Proyectos</h3>
            <div className="projects-list">
              {portfolioData.projects.map((project, index) => (
                <div key={index} className="project-card">
                  <h4>{project.title}</h4>
                  <p>{project.description}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        <div className="portfolio-edit-content">
          <PersonalInfoForm initialData={portfolioData.personalInfo} onSave={handleSavePersonalInfo} />

          {/* Aquí se pueden agregar más formularios para editar otras secciones */}
        </div>
      )}
    </div>
  )
}

