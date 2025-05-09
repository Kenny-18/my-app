"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../App.css"
import "./Sobre_mi.css"
import PersonalInfoForm from "./PersonalInfoForm"
import EducationForm from "./EducationForm"
import ExperienceForm from "./ExperienceForm"
import ProfilePhotoUploader from "./ProfilePhotoUploader"
import ProjectForm from "./ProjectForm"
import SkillsForm from "./SkillsForm"
import LanguagesForm from "./LanguagesForm"
import ReferencesForm from "./ReferencesForm"
import ContactForm from "./ContactForm"
import CompletionBar from "../CompletionBar"
import { auth, database } from "../firebase"
import { ref, get } from "firebase/database"
import PortfolioPreview from "./PortfolioPreview"
import "../animations.css"

export default function SobreMi() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")

  // Estado para controlar las pestañas
  const [activeTab, setActiveTab] = useState("preview")
  const [activeEditSection, setActiveEditSection] = useState("personal")
  const [, setAnimating] = useState(false)

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
    skills: [],
    projects: [],
    languages: [],
    references: [],
    contact: {},
  })

  // Función para cargar desde localStorage
  const loadFromLocalStorage = () => {
    console.log("Cargando datos desde localStorage")
    try {
      const savedPersonalInfo = localStorage.getItem("personalInfo")
      const savedEducation = localStorage.getItem("educationData")
      const savedExperience = localStorage.getItem("experienceData")
      const savedSkills = localStorage.getItem("skillsData")
      const savedProjects = localStorage.getItem("projectsData")
      const savedLanguages = localStorage.getItem("languagesData")
      const savedReferences = localStorage.getItem("referencesData")
      const savedContact = localStorage.getItem("contactData")

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

      if (savedSkills) {
        console.log("Datos de habilidades encontrados en localStorage")
        setPortfolioData((prevData) => ({
          ...prevData,
          skills: JSON.parse(savedSkills),
        }))
      }

      if (savedProjects) {
        console.log("Datos de proyectos encontrados en localStorage")
        setPortfolioData((prevData) => ({
          ...prevData,
          projects: JSON.parse(savedProjects),
        }))
      }

      if (savedLanguages) {
        console.log("Datos de idiomas encontrados en localStorage")
        setPortfolioData((prevData) => ({
          ...prevData,
          languages: JSON.parse(savedLanguages),
        }))
      }

      if (savedReferences) {
        console.log("Datos de referencias encontrados en localStorage")
        setPortfolioData((prevData) => ({
          ...prevData,
          references: JSON.parse(savedReferences),
        }))
      }

      if (savedContact) {
        console.log("Datos de contacto encontrados en localStorage")
        setPortfolioData((prevData) => ({
          ...prevData,
          contact: JSON.parse(savedContact),
        }))
      }
    } catch (error) {
      console.error("Error al cargar desde localStorage:", error)
    }
  }

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
            languages: data.languages || [],
            references: data.references || [],
            contact: data.contact || {},
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

  // Manejar el guardado de habilidades
  const handleSaveSkills = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      skills: data,
    }))
  }

  // Manejar el guardado de proyectos
  const handleSaveProjects = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      projects: data,
    }))
  }

  // Manejar el guardado de idiomas
  const handleSaveLanguages = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      languages: data,
    }))
  }

  // Manejar el guardado de referencias
  const handleSaveReferences = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      references: data,
    }))
  }

  // Manejar el guardado de información de contacto
  const handleSaveContact = (data) => {
    setPortfolioData((prevData) => ({
      ...prevData,
      contact: data,
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

  // Determinar la URL de la foto de perfil
  const profilePhotoURL =
    portfolioData.personalInfo?.photoURL || user?.photoURL || "/placeholder.svg?height=100&width=100"

  // Manejar errores de carga de imágenes
  const handleImageError = (e) => {
    console.error("Error loading image:", e.target.src)
    e.target.src = "https://via.placeholder.com/100"
    e.target.onerror = null // Prevent infinite loop
  }

  // Función para forzar la carga de datos predeterminados
  const handleForceLoad = () => {
    setLoading(false)
    setLoadError("Carga forzada. Usando datos predeterminados.")
    loadFromLocalStorage()
  }

  // Función para cambiar de pestaña con animación
  const handleTabChange = (tab) => {
    if (tab === activeTab) return

    setAnimating(true)

    // Ocultar contenido actual
    const currentContent = document.querySelector(".portfolio-content > div")
    if (currentContent) {
      currentContent.style.opacity = "0"
      currentContent.style.transform = "translateY(10px)"
    }

    // Cambiar pestaña después de un breve retraso
    setTimeout(() => {
      setActiveTab(tab)

      // Mostrar nuevo contenido con animación
      setTimeout(() => {
        const newContent = document.querySelector(".portfolio-content > div")
        if (newContent) {
          newContent.style.transition = "opacity 0.3s, transform 0.3s"
          newContent.style.opacity = "1"
          newContent.style.transform = "translateY(0)"
        }
        setAnimating(false)
      }, 50)
    }, 300)
  }

  // Función para manejar la edición desde la vista previa
  const handleEditFromPreview = (section) => {
    handleTabChange("edit")
    setActiveEditSection(section)
  }

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
        <div className="error-message-banner animate-fade-in">
          <i className="fas fa-exclamation-circle"></i> {loadError}
        </div>
      )}

      <div className="portfolio-header">
        <div className="user-info">
          <img
            src={profilePhotoURL || "/placeholder.svg"}
            alt="Foto de perfil"
            className="user-avatar button-hover-effect"
            onError={handleImageError}
          />
          <div>
            <h1>{portfolioData.personalInfo?.fullName || user?.displayName || user?.email?.split("@")[0]}</h1>
            <h2>{portfolioData.personalInfo?.profession || "Profesional"}</h2>
          </div>
        </div>
        <div className="portfolio-tabs">
          <button
            className={`tab-button button-hover-effect ${activeTab === "preview" ? "active" : ""}`}
            onClick={() => handleTabChange("preview")}
          >
            Vista Previa
          </button>
          <button
            className={`tab-button button-hover-effect ${activeTab === "edit" ? "active" : ""}`}
            onClick={() => handleTabChange("edit")}
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Barra de progreso de completitud */}
      <CompletionBar portfolioData={portfolioData} />

      <div className="portfolio-content">
        {activeTab === "preview" ? (
          <div className="animate-fade-in">
            <PortfolioPreview portfolioData={portfolioData} onEditSection={handleEditFromPreview} />
          </div>
        ) : (
          <div className="portfolio-edit-content animate-fade-in">
            <div className="edit-sections-tabs">
              {[
                { id: "photo", label: "Foto de Perfil" },
                { id: "personal", label: "Información Personal" },
                { id: "experience", label: "Experiencia Laboral" },
                { id: "education", label: "Formación Académica" },
                { id: "skills", label: "Habilidades" },
                { id: "languages", label: "Idiomas" },
                { id: "projects", label: "Proyectos" },
                { id: "references", label: "Referencias" },
                { id: "contact", label: "Contacto" },
              ].map((section) => (
                <button
                  key={section.id}
                  className={`edit-section-tab button-hover-effect ${activeEditSection === section.id ? "active" : ""}`}
                  onClick={() => setActiveEditSection(section.id)}
                >
                  {section.label}
                </button>
              ))}
            </div>

            <div className="animate-fade-in">
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

              {activeEditSection === "skills" && (
                <SkillsForm initialData={portfolioData.skills} onSave={handleSaveSkills} />
              )}

              {activeEditSection === "languages" && (
                <LanguagesForm initialData={portfolioData.languages} onSave={handleSaveLanguages} />
              )}

              {activeEditSection === "projects" && (
                <ProjectForm initialData={portfolioData.projects} onSave={handleSaveProjects} />
              )}

              {activeEditSection === "references" && (
                <ReferencesForm initialData={portfolioData.references} onSave={handleSaveReferences} />
              )}

              {activeEditSection === "contact" && (
                <ContactForm initialData={portfolioData.contact} onSave={handleSaveContact} />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
