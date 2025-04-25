import "./CompletionBar.css"

const CompletionBar = ({ portfolioData }) => {
  // Definir las secciones y sus pesos en el cálculo del porcentaje
  const sections = [
    { name: "Información Personal", weight: 20, key: "personalInfo" },
    { name: "Foto de Perfil", weight: 10, key: "photo" },
    { name: "Experiencia", weight: 15, key: "experience" },
    { name: "Educación", weight: 15, key: "education" },
    { name: "Habilidades", weight: 15, key: "skills" },
    { name: "Proyectos", weight: 15, key: "projects" },
    { name: "Idiomas", weight: 5, key: "languages" },
    { name: "Contacto", weight: 5, key: "contact" },
  ]

  // Función para verificar si una sección está completa
  const isSectionComplete = (section) => {
    switch (section.key) {
      case "personalInfo":
        return (
          portfolioData.personalInfo &&
          portfolioData.personalInfo.fullName &&
          portfolioData.personalInfo.profession &&
          portfolioData.personalInfo.bio &&
          portfolioData.personalInfo.bio.length >= 50
        )
      case "photo":
        return portfolioData.personalInfo && portfolioData.personalInfo.photoURL
      case "experience":
        return portfolioData.experience && portfolioData.experience.length > 0
      case "education":
        return portfolioData.education && portfolioData.education.length > 0
      case "skills":
        return portfolioData.skills && portfolioData.skills.length >= 3
      case "projects":
        return portfolioData.projects && portfolioData.projects.length > 0
      case "languages":
        return portfolioData.languages && portfolioData.languages.length > 0
      case "contact":
        return portfolioData.contact && Object.values(portfolioData.contact).some((value) => value)
      default:
        return false
    }
  }

  // Calcular el porcentaje de completitud
  const calculateCompletionPercentage = () => {
    let completedWeight = 0
    let totalWeight = 0

    sections.forEach((section) => {
      totalWeight += section.weight
      if (isSectionComplete(section)) {
        completedWeight += section.weight
      }
    })

    return Math.round((completedWeight / totalWeight) * 100)
  }

  const completionPercentage = calculateCompletionPercentage()

  // Determinar el color basado en el porcentaje
  const getColorByPercentage = (percentage) => {
    if (percentage < 30) return "#ff6b6b" // Rojo
    if (percentage < 70) return "#ffd166" // Amarillo
    return "#13f0c4" // Verde (color principal de la aplicación)
  }

  const color = getColorByPercentage(completionPercentage)

  return (
    <div className="completion-bar-container">
      <div className="completion-bar-header">
        <h3>Progreso del Portafolio</h3>
        <p>Completa todas las secciones para maximizar el impacto de tu portafolio</p>
      </div>

      <div className="completion-bar-content">
        <div className="completion-circular-progress">
          <div className="progress-circle-container">
            <div className="progress-circle-outer">
              <div
                className="progress-circle-inner"
                style={{
                  background: `conic-gradient(${color} ${completionPercentage}%, #f5f5f5 0)`,
                }}
              >
                <div className="progress-circle-text">
                  <span className="percentage">{completionPercentage}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="completion-sections-list">
          {sections.map((section) => {
            const isComplete = isSectionComplete(section)
            return (
              <div key={section.key} className={`completion-section-item ${isComplete ? "complete" : "incomplete"}`}>
                <span className="completion-section-icon">
                  {isComplete ? <i className="fas fa-check-circle"></i> : <i className="fas fa-circle"></i>}
                </span>
                <span className="completion-section-name">{section.name}</span>
                <span className="completion-section-status">{isComplete ? "Completo" : "Pendiente"}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default CompletionBar
