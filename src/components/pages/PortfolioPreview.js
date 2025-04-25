"use client"

import { useState } from "react"
import "./PortfolioPreview.css"
import { exportToPdf } from "../SimplePdfExport" // Cambiado a la versión simplificada

export default function PortfolioPreview({ portfolioData, onEditSection }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState("")

  // Función para editar una sección específica
  const handleEditSection = (section) => {
    if (onEditSection) {
      onEditSection(section)
    }
  }

  // Obtener texto descriptivo para el nivel de idioma
  const getLevelText = (level) => {
    switch (level) {
      case "basic":
        return "Básico"
      case "intermediate":
        return "Intermedio"
      case "advanced":
        return "Avanzado"
      case "native":
        return "Nativo"
      default:
        return "Intermedio"
    }
  }

  // Obtener emoji de bandera para el idioma (simplificado)
  const getLanguageFlag = (language) => {
    const flags = {
      español: "🇪🇸",
      inglés: "🇬🇧",
      francés: "🇫🇷",
      alemán: "🇩🇪",
      italiano: "🇮🇹",
      portugués: "🇵🇹",
      chino: "🇨🇳",
      japonés: "🇯🇵",
      ruso: "🇷🇺",
      árabe: "🇸🇦",
      hindi: "🇮🇳",
      bengalí: "🇧🇩",
      coreano: "🇰🇷",
    }

    const normalizedLanguage = language.toLowerCase()
    return flags[normalizedLanguage] || "🌐"
  }

  // Obtener ícono para cada red social
  const getSocialIcon = (network) => {
    const icons = {
      email: "fas fa-envelope",
      phone: "fas fa-phone",
      website: "fas fa-globe",
      linkedin: "fab fa-linkedin-in",
      github: "fab fa-github",
      twitter: "fab fa-twitter",
      instagram: "fab fa-instagram",
      facebook: "fab fa-facebook-f",
      youtube: "fab fa-youtube",
      whatsapp: "fab fa-whatsapp",
      telegram: "fab fa-telegram-plane",
      discord: "fab fa-discord",
      other: "fas fa-link",
    }
    return icons[network] || "fas fa-link"
  }

  // Formatear URL para asegurar que tenga el protocolo
  const formatUrl = (url, network) => {
    if (!url) return null

    // Para email y teléfono, usar los protocolos correspondientes
    if (network === "email") {
      return url.startsWith("mailto:") ? url : `mailto:${url}`
    }
    if (network === "phone") {
      return url.startsWith("tel:") ? url : `tel:${url}`
    }
    if (network === "whatsapp") {
      // Eliminar cualquier caracter no numérico
      const cleanNumber = url.replace(/\D/g, "")
      return `https://wa.me/${cleanNumber}`
    }

    // Para sitios web y redes sociales, asegurar que tengan http/https
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return `https://${url}`
    }
    return url
  }

  // Agrupar habilidades por categoría
  const groupedSkills = portfolioData.skills?.reduce((acc, skill) => {
    const category = skill.category || "other"
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(skill)
    return acc
  }, {})

  // Obtener nombre legible para la categoría
  const getCategoryName = (category) => {
    const categories = {
      frontend: "Frontend",
      backend: "Backend",
      database: "Bases de datos",
      devops: "DevOps",
      mobile: "Desarrollo móvil",
      design: "Diseño",
      softskills: "Habilidades blandas",
      other: "Otras",
    }
    return categories[category] || category
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

  // Función para abrir lightbox
  const openLightbox = (imageUrl) => {
    setCurrentImage(imageUrl)
    setLightboxOpen(true)
  }

  // Función para cerrar lightbox
  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  return (
    <div className="portfolio-preview-container" id="portfolio-preview-container">
      <div className="preview-header">
        <div className="preview-header-left">
          <img
            src={portfolioData.personalInfo?.photoURL || "/placeholder.svg?height=120&width=120"}
            alt="Foto de perfil"
            className="preview-avatar"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/120"
              e.target.onerror = null
            }}
          />
          <div className="preview-header-info">
            <h1>{portfolioData.personalInfo?.fullName || "Nombre Completo"}</h1>
            <h2>{portfolioData.personalInfo?.profession || "Profesional"}</h2>
          </div>
        </div>
        <div className="preview-actions">
          <button
            className="preview-action-button primary"
            onClick={() => exportToPdf(portfolioData, "portfolio-preview-container")}
          >
            <i className="fas fa-download"></i> Descargar Portfolio PDF
          </button>
        </div>
      </div>

      {/* Sección Sobre Mí */}
      <section className="preview-section">
        <div className="preview-section-header">
          <h3 className="preview-section-title">Sobre Mí</h3>
          <button className="edit-section-button" onClick={() => handleEditSection("personal")}>
            <i className="fas fa-edit"></i> Editar
          </button>
        </div>
        <div className="preview-about">
          <p>{portfolioData.personalInfo?.bio || "No hay información disponible."}</p>
        </div>

        <div className="preview-contact-info">
          {portfolioData.personalInfo?.email && (
            <div className="preview-contact-item">
              <i className="fas fa-envelope"></i>
              <span>{portfolioData.personalInfo.email}</span>
            </div>
          )}

          {portfolioData.personalInfo?.phone && (
            <div className="preview-contact-item">
              <i className="fas fa-phone"></i>
              <span>{portfolioData.personalInfo.phone}</span>
            </div>
          )}

          {portfolioData.personalInfo?.location && (
            <div className="preview-contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <span>{portfolioData.personalInfo.location}</span>
            </div>
          )}

          {portfolioData.personalInfo?.website && (
            <div className="preview-contact-item">
              <i className="fas fa-globe"></i>
              <a href={portfolioData.personalInfo.website} target="_blank" rel="noopener noreferrer">
                Sitio Web
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Sección Experiencia Laboral */}
      {sortedExperiences.length > 0 && (
        <section className="preview-section">
          <div className="preview-section-header">
            <h3 className="preview-section-title">Experiencia Laboral</h3>
            <button className="edit-section-button" onClick={() => handleEditSection("experience")}>
              <i className="fas fa-edit"></i> Editar
            </button>
          </div>
          <div className="preview-experience-list">
            {sortedExperiences.map((exp, index) => (
              <div key={index} className="preview-experience-item">
                <div className="preview-item-header">
                  <h4>{exp.position}</h4>
                  <span className="preview-item-dates">
                    {exp.startDate} - {exp.current ? "Actual" : exp.endDate}
                  </span>
                </div>
                <p className="preview-company">
                  <i className="fas fa-building"></i> {exp.company}
                </p>
                {exp.description && <p className="preview-description">{exp.description}</p>}
                {exp.achievements && (
                  <div className="preview-achievements">
                    <strong>Logros:</strong>
                    <p>{exp.achievements}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sección Formación Académica */}
      {portfolioData.education && portfolioData.education.length > 0 && (
        <section className="preview-section">
          <div className="preview-section-header">
            <h3 className="preview-section-title">Formación Académica</h3>
            <button className="edit-section-button" onClick={() => handleEditSection("education")}>
              <i className="fas fa-edit"></i> Editar
            </button>
          </div>
          <div className="preview-education-list">
            {portfolioData.education.map((edu, index) => (
              <div key={index} className="preview-education-item">
                <div className="preview-item-header">
                  <h4>{edu.institution}</h4>
                  <span className="preview-item-dates">
                    {edu.startDate} - {edu.current ? "Actual" : edu.endDate}
                  </span>
                </div>
                <p className="preview-degree">
                  <strong>{edu.degree}</strong>
                  {edu.fieldOfStudy && <span> en {edu.fieldOfStudy}</span>}
                </p>
                {edu.description && <p className="preview-description">{edu.description}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sección Habilidades */}
      {portfolioData.skills && portfolioData.skills.length > 0 && (
        <section className="preview-section">
          <div className="preview-section-header">
            <h3 className="preview-section-title">Habilidades</h3>
            <button className="edit-section-button" onClick={() => handleEditSection("skills")}>
              <i className="fas fa-edit"></i> Editar
            </button>
          </div>
          <div className="preview-skills-container">
            {Object.keys(groupedSkills || {}).length > 0 ? (
              Object.entries(groupedSkills).map(([category, skills]) => (
                <div key={category} className="preview-skills-category">
                  <h4>{getCategoryName(category)}</h4>
                  <div className="preview-skills-list">
                    {skills.map((skill, index) => (
                      <div key={index} className="preview-skill-tag">
                        {skill.name}
                        <div className="preview-skill-progress" style={{ width: `${(skill.level / 5) * 100}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="preview-skills-list">
                {portfolioData.skills.map((skill, index) => (
                  <span key={index} className="preview-skill-tag">
                    {typeof skill === "string" ? skill : skill.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Sección Idiomas */}
      {portfolioData.languages && portfolioData.languages.length > 0 && (
        <section className="preview-section">
          <div className="preview-section-header">
            <h3 className="preview-section-title">Idiomas</h3>
            <button className="edit-section-button" onClick={() => handleEditSection("languages")}>
              <i className="fas fa-edit"></i> Editar
            </button>
          </div>
          <div className="preview-languages-list">
            {portfolioData.languages.map((language, index) => (
              <div key={index} className="preview-language-item">
                <span className="preview-language-flag">{getLanguageFlag(language.name)}</span>
                <span className="preview-language-name">{language.name}</span>
                <span className={`preview-language-level ${language.level}`}>{getLevelText(language.level)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sección Proyectos */}
      {portfolioData.projects && portfolioData.projects.length > 0 && (
        <section className="preview-section">
          <div className="preview-section-header">
            <h3 className="preview-section-title">Proyectos</h3>
            <button className="edit-section-button" onClick={() => handleEditSection("projects")}>
              <i className="fas fa-edit"></i> Editar
            </button>
          </div>
          <div className="preview-projects-grid">
            {portfolioData.projects.map((project, index) => (
              <div key={index} className="preview-project-card">
                <h4>{project.title}</h4>
                <p>{project.description}</p>

                {project.technologies && (
                  <div className="preview-project-tech-tags">
                    {Array.isArray(project.technologies)
                      ? project.technologies.map((tech, techIndex) => (
                          <span key={techIndex} className="preview-tech-tag">
                            {tech}
                          </span>
                        ))
                      : typeof project.technologies === "string"
                        ? project.technologies.split(",").map((tech, techIndex) => (
                            <span key={techIndex} className="preview-tech-tag">
                              {tech.trim()}
                            </span>
                          ))
                        : null}
                  </div>
                )}

                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="preview-project-link">
                    <i className="fas fa-external-link-alt"></i> Ver proyecto
                  </a>
                )}

                {project.screenshots && project.screenshots.length > 0 && (
                  <div className="preview-project-screenshots">
                    {project.screenshots.map((screenshot, screenshotIndex) => (
                      <img
                        key={screenshotIndex}
                        src={screenshot.url || "/placeholder.svg"}
                        alt={`Captura de ${project.title}`}
                        className="preview-screenshot"
                        onClick={() => openLightbox(screenshot.url)}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/80x50?text=Error"
                          e.target.onerror = null
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sección Referencias */}
      {portfolioData.references && portfolioData.references.length > 0 && (
        <section className="preview-section">
          <div className="preview-section-header">
            <h3 className="preview-section-title">Referencias y Testimonios</h3>
            <button className="edit-section-button" onClick={() => handleEditSection("references")}>
              <i className="fas fa-edit"></i> Editar
            </button>
          </div>
          <div className="preview-references-grid">
            {portfolioData.references.map((reference, index) => (
              <div key={index} className="preview-reference-item">
                <div className="preview-reference-quote">
                  <i className="fas fa-quote-left"></i>
                </div>
                <div className="preview-reference-content">
                  <p className="preview-reference-testimonial">{reference.testimonial}</p>
                  <div className="preview-reference-author">
                    <div className="preview-reference-avatar">
                      {reference.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()
                        .substring(0, 2)}
                    </div>
                    <div className="preview-reference-info">
                      <span className="preview-reference-name">{reference.name}</span>
                      <span className="preview-reference-relation">{reference.relation}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Sección Contacto */}
      {portfolioData.contact && Object.values(portfolioData.contact).some((value) => value) && (
        <section className="preview-section">
          <div className="preview-section-header">
            <h3 className="preview-section-title">Contacto</h3>
            <button className="edit-section-button" onClick={() => handleEditSection("contact")}>
              <i className="fas fa-edit"></i> Editar
            </button>
          </div>
          <div className="preview-social-icons">
            {Object.entries(portfolioData.contact).map(([network, url]) => {
              if (!url) return null
              return (
                <a
                  key={network}
                  href={formatUrl(url, network)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`preview-social-icon ${network}`}
                  title={network.charAt(0).toUpperCase() + network.slice(1)}
                >
                  <i className={getSocialIcon(network)}></i>
                </a>
              )
            })}
          </div>
        </section>
      )}

      {/* Lightbox para imágenes */}
      {lightboxOpen && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={currentImage || "/placeholder.svg"}
              alt="Captura de pantalla"
              className="lightbox-image"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x600?text=Error al cargar la imagen"
                e.target.onerror = null
              }}
            />
            <button className="lightbox-close" onClick={closeLightbox}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
