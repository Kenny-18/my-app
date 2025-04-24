"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../App.css"
import "./Sobre_mi.css"
import PersonalInfoForm from "./PersonalInfoForm"
import EducationForm from "./EducationForm"
import ExperienceForm from "./ExperienceForm"
import ProfilePhotoUploader from "./ProfilePhotoUploader"
import { auth, database } from "../firebase"
import { ref, get } from "firebase/database"

export default function SobreMi() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  // Estado para controlar las pestañas
  const [activeTab, setActiveTab] = useState("preview")
  const [activeEditSection, setActiveEditSection] = useState("personal")

  // Estado para almacenar los datos del portafolio
  const [portfolioData, setPortfolioData] = useState({
    personalInfo: {
      fullName: "",
      profession: "Desarrollador Web",
      email: "",
      phone: "",
      location: "Ciudad, País",
      bio: "Escribe aquí una breve descripción sobre ti y tus habilidades profesionales.",
      website: "",
      linkedin: "",
      github: "",
      photoURL: "",
    },
    education: [],
    experience: [],
    skills: ["HTML", "CSS", "JavaScript", "React"],
    projects: [
      { title: "Proyecto 1", description: "Descripción del proyecto 1" },
      { title: "Proyecto 2", description: "Descripción del proyecto 2" },
    ],
  })

  // Verificar autenticación y cargar datos
  useEffect(() => {
    console.log("Iniciando verificación de autenticación")
    let authTimeout
    let loadTimeout

    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      console.log("Estado de autenticación cambiado:", currentUser ? "Usuario autenticado" : "No autenticado")

      if (currentUser) {
        setUser(currentUser)

        // Establecer un tiempo límite para la carga
        loadTimeout = setTimeout(() => {
          console.log("Tiempo de carga excedido, usando datos predeterminados")
          setLoading(false)
          setLoadError("Tiempo de carga excedido. Usando datos predeterminados.")
          loadFromLocalStorage()
        }, 10000) // 10 segundos de tiempo límite

        // Intentar cargar datos
        fetchPortfolioData(currentUser.uid)
      } else {
        console.log("No hay usuario autenticado, redirigiendo a login")
        clearTimeout(authTimeout)
        navigate("/Sesion")
      }
    })

    // Establecer un tiempo límite para la autenticación
    authTimeout = setTimeout(() => {
      console.log("Tiempo de autenticación excedido, redirigiendo a login")
      setLoading(false)
      navigate("/Sesion")
    }, 5000) // 5 segundos de tiempo límite

    // Función para cargar datos del portafolio
    const fetchPortfolioData = async (userId) => {
      console.log("Intentando cargar portafolio para usuario:", userId)

      try {
        // Intentar cargar directamente desde Firebase
        const portfolioRef = ref(database, `portfolios/${userId}`)
        const snapshot = await get(portfolioRef)

        clearTimeout(loadTimeout) // Limpiar el timeout ya que obtuvimos respuesta

        if (snapshot.exists()) {
          console.log("Datos encontrados en Firebase:", snapshot.val())
          const data = snapshot.val()

          setPortfolioData((prevData) => ({
            ...prevData,
            personalInfo: data.personalInfo || prevData.personalInfo,
            education: data.education || [],
            experience: data.experience || [],
            skills: data.skills || prevData.skills,
            projects: data.projects || prevData.projects,
          }))
        } else {
          console.log("No se encontraron datos en Firebase, usando predeterminados")
          // Intentar cargar desde localStorage
          loadFromLocalStorage()
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
        setLoadError(`Error al cargar datos: ${error.message}. Usando datos predeterminados.`)
        // Intentar cargar desde localStorage
        loadFromLocalStorage()
      } finally {
        clearTimeout(authTimeout) // Limpiar el timeout de autenticación
        setLoading(false)
      }
    }

    // Función para cargar desde localStorage como respaldo
    const loadFromLocalStorage = () => {
      console.log("Cargando datos desde localStorage")
      try {
        const savedPersonalInfo = localStorage.getItem("personalInfo")
        const savedEducation = localStorage.getItem("educationData")
        const savedExperience = localStorage.getItem("experienceData")

        if (savedPersonalInfo) {
          console.log("Información personal encontrada en localStorage")
          setPortfolioData((prevData) => ({
            ...prevData,
            personalInfo: JSON.parse(savedPersonalInfo),
          }))
        }

        if (savedEducation) {
          console.log("Datos de educación encontrados en localStorage")
          setPortfolioData((prevData) => ({
            ...prevData,
            education: JSON.parse(savedEducation),
          }))
        }

        if (savedExperience) {
          console.log("Datos de experiencia encontrados en localStorage")
          setPortfolioData((prevData) => ({
            ...prevData,
            experience: JSON.parse(savedExperience),
          }))
        }
      } catch (error) {
        console.error("Error al cargar desde localStorage:", error)
      }
    }

    return () => {
      unsubscribe()
      clearTimeout(authTimeout)
      clearTimeout(loadTimeout)
    }
  }, [navigate])

  // Manejar el guardado de información personal
  const handleSavePersonalInfo = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      personalInfo: data,
    }))
  }

  // Manejar el guardado de información educativa
  const handleSaveEducation = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      education: data,
    }))
  }

  // Manejar el guardado de experiencia laboral
  const handleSaveExperience = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      experience: data,
    }))
  }

  // Manejar la actualización de la foto de perfil
  const handlePhotoUpdate = (photoURL) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      personalInfo: {
        ...prevData.personalInfo,
        photoURL,
      },
    }))
  }

  // Ordenar experiencias por fecha (más reciente primero)
  const sortedExperiences = [...(portfolioData.experience || [])].sort((a, b) => {
    // Si alguno es trabajo actual, va primero
    if (a.current && !b.current) return -1
    if (!a.current && b.current) return 1

    // Si ambos son actuales o ambos no son actuales, comparar por fecha de inicio
    const dateA = a.current ? new Date() : new Date(a.endDate)
    const dateB = b.current ? new Date() : new Date(b.endDate)
    return dateB - dateA
  })

  // Función para forzar la carga
  const handleForceLoad = () => {
    setLoading(false)
  }

  // Determinar la URL de la foto de perfil
  const profilePhotoURL =
    portfolioData.personalInfo?.photoURL || user?.photoURL || "/placeholder.svg?height=100&width=100"

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando tu portafolio...</p>
        <button onClick={handleForceLoad} className="force-load-button">
          Continuar sin cargar datos
        </button>
      </div>
    )
  }

  return (
    <div className="portfolio-container">
      {loadError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {loadError}
        </div>
      )}

      <div className="portfolio-header">
        <div className="user-info">
          <img src={profilePhotoURL || "/placeholder.svg"} alt="Foto de perfil" className="user-avatar" />
          <div>
            <h1>{portfolioData.personalInfo?.fullName || user?.displayName || user?.email?.split("@")[0]}</h1>
            <h2>{portfolioData.personalInfo?.profession || "Profesional"}</h2>
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
            <p>{portfolioData.personalInfo?.bio}</p>

            <div className="contact-info">
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>{portfolioData.personalInfo?.email || user?.email}</span>
              </div>

              {portfolioData.personalInfo?.phone && (
                <div className="contact-item">
                  <i className="fas fa-phone"></i>
                  <span>{portfolioData.personalInfo.phone}</span>
                </div>
              )}

              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{portfolioData.personalInfo?.location || "No especificada"}</span>
              </div>

              {portfolioData.personalInfo?.website && (
                <div className="contact-item">
                  <i className="fas fa-globe"></i>
                  <a href={portfolioData.personalInfo.website} target="_blank" rel="noopener noreferrer">
                    Sitio Web
                  </a>
                </div>
              )}

              {portfolioData.personalInfo?.linkedin && (
                <div className="contact-item">
                  <i className="fab fa-linkedin"></i>
                  <a href={portfolioData.personalInfo.linkedin} target="_blank" rel="noopener noreferrer">
                    LinkedIn
                  </a>
                </div>
              )}

              {portfolioData.personalInfo?.github && (
                <div className="contact-item">
                  <i className="fab fa-github"></i>
                  <a href={portfolioData.personalInfo.github} target="_blank" rel="noopener noreferrer">
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </section>

          {sortedExperiences.length > 0 && (
            <section className="experience-section">
              <h3>Experiencia Laboral</h3>
              <div className="experience-preview-list">
                {sortedExperiences.map((exp, index) => (
                  <div key={index} className="experience-preview-item">
                    <div className="experience-preview-header">
                      <h4>{exp.position}</h4>
                      <span className="experience-preview-dates">
                        {exp.startDate} - {exp.current ? "Actual" : exp.endDate}
                      </span>
                    </div>
                    <p className="experience-preview-company">
                      <i className="fas fa-building"></i> {exp.company}
                    </p>
                    {exp.description && <p className="experience-preview-description">{exp.description}</p>}
                    {exp.achievements && (
                      <div className="experience-preview-achievements">
                        <strong>Logros:</strong>
                        <p>{exp.achievements}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {portfolioData.education && portfolioData.education.length > 0 && (
            <section className="education-section">
              <h3>Formación Académica</h3>
              <div className="education-preview-list">
                {portfolioData.education.map((edu, index) => (
                  <div key={index} className="education-preview-item">
                    <div className="education-preview-header">
                      <h4>{edu.institution}</h4>
                      <span className="education-preview-dates">
                        {edu.startDate} - {edu.current ? "Actual" : edu.endDate}
                      </span>
                    </div>
                    <p className="education-preview-degree">
                      <strong>{edu.degree}</strong>
                      {edu.fieldOfStudy && <span> en {edu.fieldOfStudy}</span>}
                    </p>
                    {edu.description && <p className="education-preview-description">{edu.description}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

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
          <div className="edit-sections-tabs">
            <button
              className={`edit-section-tab ${activeEditSection === "photo" ? "active" : ""}`}
              onClick={() => setActiveEditSection("photo")}
            >
              Foto de Perfil
            </button>
            <button
              className={`edit-section-tab ${activeEditSection === "personal" ? "active" : ""}`}
              onClick={() => setActiveEditSection("personal")}
            >
              Información Personal
            </button>
            <button
              className={`edit-section-tab ${activeEditSection === "experience" ? "active" : ""}`}
              onClick={() => setActiveEditSection("experience")}
            >
              Experiencia Laboral
            </button>
            <button
              className={`edit-section-tab ${activeEditSection === "education" ? "active" : ""}`}
              onClick={() => setActiveEditSection("education")}
            >
              Formación Académica
            </button>
          </div>

          {activeEditSection === "photo" && (
            <ProfilePhotoUploader
              currentPhotoURL={profilePhotoURL}
              onPhotoUpdate={handlePhotoUpdate}
              userId={user?.uid}
            />
          )}

          {activeEditSection === "personal" && (
            <PersonalInfoForm initialData={portfolioData.personalInfo} onSave={handleSavePersonalInfo} />
          )}

          {activeEditSection === "experience" && (
            <ExperienceForm initialData={portfolioData.experience} onSave={handleSaveExperience} />
          )}

          {activeEditSection === "education" && (
            <EducationForm initialData={portfolioData.education} onSave={handleSaveEducation} />
          )}
        </div>
      )}
    </div>
  )
}
