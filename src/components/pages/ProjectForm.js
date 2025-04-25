"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./ProjectForm.css"
import { auth, database, storage } from "../firebase"
import { ref, set } from "firebase/database"
import { ref as storageRef, deleteObject } from "firebase/storage"
import ImageUploader from "../ImageUploader"
import { motion } from "framer-motion"

export default function ProjectForm({ onSave, initialData = [] }) {
  const [projectList, setProjectList] = useState(initialData)
  const [editIndex, setEditIndex] = useState(-1)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [screenshots, setScreenshots] = useState([])
  const [uploading] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImage, setCurrentImage] = useState(0)
  const [viewingProjectImages, setViewingProjectImages] = useState([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      technologies: "",
      link: "",
      screenshots: [],
    },
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setProjectList(initialData)
    }
  }, [initialData])

  // Guardar en Firebase cuando cambia la lista
  useEffect(() => {
    const saveData = async () => {
      if (projectList.length > 0) {
        try {
          const user = auth.currentUser
          if (!user) {
            throw new Error("Usuario no autenticado")
          }

          // Guardar en Firebase
          const projectsRef = ref(database, `portfolios/${user.uid}/projects`)
          await set(projectsRef, projectList)

          // Guardar en localStorage como respaldo
          localStorage.setItem("projectsData", JSON.stringify(projectList))

          if (onSave) {
            onSave(projectList)
          }
        } catch (error) {
          console.error("Error al guardar proyectos:", error)
          setSaveError("No se pudieron guardar los cambios en la base de datos")
        }
      }
    }

    // Solo guardar si hay cambios (no en la carga inicial)
    if (projectList !== initialData && projectList.length > 0) {
      saveData()
    }
  }, [projectList, onSave, initialData])

  const handleRemoveScreenshot = async (index) => {
    try {
      const screenshot = screenshots[index]
      const user = auth.currentUser

      // Si tiene una ruta de almacenamiento, intentar eliminar de Firebase
      if (screenshot.storagePath && user) {
        const imageRef = storageRef(storage, screenshot.storagePath)
        try {
          await deleteObject(imageRef)
        } catch (error) {
          console.error("Error al eliminar imagen de Storage:", error)
        }
      }

      // Actualizar estado
      const newScreenshots = [...screenshots]
      newScreenshots.splice(index, 1)
      setScreenshots(newScreenshots)
    } catch (error) {
      console.error("Error al eliminar captura:", error)
      setSaveError("Error al eliminar la captura de pantalla")
    }
  }

  const onSubmit = async (data) => {
    setSaveError("")

    try {
      // Preparar datos del proyecto
      const projectData = {
        ...data,
        technologies: data.technologies ? data.technologies.split(",").map((tech) => tech.trim()) : [],
        screenshots: screenshots.map((screenshot) => ({
          url: screenshot.url,
          storagePath: screenshot.storagePath,
        })),
      }

      // Si estamos editando, actualizar el elemento existente
      if (editIndex >= 0) {
        const updatedList = [...projectList]
        updatedList[editIndex] = projectData
        setProjectList(updatedList)
        setEditIndex(-1)
      } else {
        // Si no, añadir nuevo elemento
        setProjectList([...projectList, projectData])
      }

      // Mostrar mensaje de éxito
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      // Limpiar formulario y capturas
      reset({
        title: "",
        description: "",
        technologies: "",
        link: "",
      })
      setScreenshots([])
    } catch (error) {
      console.error("Error al guardar proyecto:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (index) => {
    const itemToEdit = projectList[index]

    // Establecer los valores del formulario con los datos del elemento a editar
    setValue("title", itemToEdit.title)
    setValue("description", itemToEdit.description)
    setValue(
      "technologies",
      Array.isArray(itemToEdit.technologies)
        ? itemToEdit.technologies.join(", ")
        : typeof itemToEdit.technologies === "string"
          ? itemToEdit.technologies
          : "",
    )
    setValue("link", itemToEdit.link || "")

    // Cargar capturas de pantalla si existen
    if (itemToEdit.screenshots && itemToEdit.screenshots.length > 0) {
      setScreenshots(
        itemToEdit.screenshots.map((screenshot) => ({
          url: screenshot.url,
          storagePath: screenshot.storagePath,
        })),
      )
    } else {
      setScreenshots([])
    }

    setEditIndex(index)
  }

  const handleDelete = async (index) => {
    setSaveError("")

    try {
      const projectToDelete = projectList[index]
      const user = auth.currentUser

      // Eliminar capturas de pantalla de Firebase Storage
      if (projectToDelete.screenshots && projectToDelete.screenshots.length > 0 && user) {
        for (const screenshot of projectToDelete.screenshots) {
          if (screenshot.storagePath) {
            try {
              const imageRef = storageRef(storage, screenshot.storagePath)
              await deleteObject(imageRef)
            } catch (error) {
              console.error("Error al eliminar imagen:", error)
            }
          }
        }
      }

      // Actualizar lista de proyectos
      const updatedList = [...projectList]
      updatedList.splice(index, 1)
      setProjectList(updatedList)

      // Si estábamos editando el elemento que se eliminó, resetear el formulario
      if (editIndex === index) {
        reset()
        setEditIndex(-1)
        setScreenshots([])
      } else if (editIndex > index) {
        // Ajustar el índice de edición si eliminamos un elemento anterior
        setEditIndex(editIndex - 1)
      }

      // Guardar en Firebase
      if (user) {
        const projectsRef = ref(database, `portfolios/${user.uid}/projects`)
        await set(projectsRef, updatedList)
      }

      // Actualizar localStorage
      localStorage.setItem("projectsData", JSON.stringify(updatedList))

      if (onSave) {
        onSave(updatedList)
      }
    } catch (error) {
      console.error("Error al eliminar proyecto:", error)
      setSaveError("No se pudo eliminar el proyecto. Inténtalo de nuevo.")
    }
  }

  const handleCancel = () => {
    reset()
    setEditIndex(-1)
    setScreenshots([])
  }

  const openLightbox = (project, index = 0) => {
    if (project.screenshots && project.screenshots.length > 0) {
      setViewingProjectImages(project.screenshots)
      setCurrentImage(index)
      setLightboxOpen(true)
    }
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
  }

  const goToPrevious = () => {
    setCurrentImage((prev) => (prev === 0 ? viewingProjectImages.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentImage((prev) => (prev === viewingProjectImages.length - 1 ? 0 : prev + 1))
  }

  const user = auth.currentUser

  return (
    <div className="project-form-container">
      <h2>Proyectos</h2>
      <p className="form-description">
        Añade tus proyectos más relevantes para mostrar tu trabajo. Puedes incluir capturas de pantalla y enlaces.
      </p>

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {saveError}
        </div>
      )}

      {projectList.length > 0 && (
        <div className="project-list">
          <h3>Proyectos guardados</h3>
          {projectList.map((project, index) => (
            <div key={index} className="project-item">
              <div className="project-item-content">
                <h4>{project.title}</h4>
                <p className="project-description">{project.description}</p>

                <div className="project-tech-tags">
                  {Array.isArray(project.technologies)
                    ? project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className="tech-tag">
                          {tech}
                        </span>
                      ))
                    : typeof project.technologies === "string"
                      ? project.technologies.split(",").map((tech, techIndex) => (
                          <span key={techIndex} className="tech-tag">
                            {tech.trim()}
                          </span>
                        ))
                      : null}
                </div>

                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer" className="project-link">
                    <i className="fas fa-external-link-alt"></i> Ver proyecto
                  </a>
                )}

                {project.screenshots && project.screenshots.length > 0 && (
                  <div className="project-screenshots">
                    {project.screenshots.map((screenshot, screenshotIndex) => (
                      <img
                        key={screenshotIndex}
                        src={screenshot.url || "/placeholder.svg"}
                        alt={`Captura de ${project.title}`}
                        className="screenshot-thumbnail"
                        onClick={() => openLightbox(project, screenshotIndex)}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/100x60?text=Error"
                          e.target.onerror = null
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="project-item-actions">
                <button type="button" onClick={() => handleEdit(index)} className="edit-button" aria-label="Editar">
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="delete-button"
                  aria-label="Eliminar"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="project-form">
        <h3>{editIndex >= 0 ? "Editar proyecto" : "Añadir nuevo proyecto"}</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="title">Nombre del proyecto *</label>
            <input
              id="title"
              type="text"
              className={errors.title ? "error" : ""}
              {...register("title", {
                required: "El nombre del proyecto es obligatorio",
              })}
            />
            {errors.title && <span className="error-message">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="link">Enlace al proyecto</label>
            <input
              id="link"
              type="url"
              placeholder="https://ejemplo.com"
              className={errors.link ? "error" : ""}
              {...register("link", {
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?([/\w-]*)*$/,
                  message: "URL inválida",
                },
              })}
            />
            {errors.link && <span className="error-message">{errors.link.message}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Descripción del proyecto *</label>
            <textarea
              id="description"
              className={errors.description ? "error" : ""}
              {...register("description", {
                required: "La descripción es obligatoria",
                maxLength: {
                  value: 500,
                  message: "La descripción no debe exceder los 500 caracteres",
                },
              })}
              rows={4}
              placeholder="Describe brevemente el proyecto, su propósito y tu rol en él"
            ></textarea>
            {errors.description && <span className="error-message">{errors.description.message}</span>}
            <div className="char-counter">
              <span>{watch("description")?.length || 0}</span>/500
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="technologies">Tecnologías utilizadas *</label>
            <input
              id="technologies"
              type="text"
              className={errors.technologies ? "error" : ""}
              {...register("technologies", {
                required: "Las tecnologías son obligatorias",
              })}
              placeholder="React, Node.js, MongoDB, etc. (separadas por comas)"
            />
            {errors.technologies && <span className="error-message">{errors.technologies.message}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Capturas de pantalla</label>
          <div className="screenshot-upload-container">
            <ImageUploader
              onImageUpload={(imageData) => {
                // Handle both single and multiple images
                const newScreenshots = Array.isArray(imageData) ? imageData : [imageData]

                // Add the new screenshots to the existing ones
                setScreenshots((prev) => [
                  ...prev,
                  ...newScreenshots.map((img) => ({
                    url: img.url,
                    storagePath: img.path,
                  })),
                ])
              }}
              userId={user?.uid}
              path="projects/screenshots"
              allowMultiple={true}
              maxSize={2}
              acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
              previewSize={{ width: 100, height: 100 }}
            />

            {screenshots.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="screenshot-preview">
                {screenshots.map((screenshot, index) => (
                  <motion.div
                    key={index}
                    className="screenshot-preview-item"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={screenshot.url || screenshot.previewUrl}
                      alt={`Captura ${index + 1}`}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100?text=Error"
                        e.target.onerror = null
                      }}
                    />
                    <button type="button" className="remove-screenshot" onClick={() => handleRemoveScreenshot(index)}>
                      ×
                    </button>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <div className="form-actions">
          {editIndex >= 0 && (
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="save-button" disabled={uploading}>
            {editIndex >= 0 ? "Actualizar" : "Añadir"}
          </button>
        </div>

        {saveSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> Proyecto guardado correctamente
          </div>
        )}
      </form>

      {/* Lightbox para ver imágenes */}
      {lightboxOpen && viewingProjectImages.length > 0 && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={viewingProjectImages[currentImage].url || "/placeholder.svg"}
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
            {viewingProjectImages.length > 1 && (
              <>
                <button
                  className="lightbox-nav lightbox-prev"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="lightbox-nav lightbox-next"
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
