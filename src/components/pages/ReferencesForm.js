"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./ReferencesForm.css"
import { auth, database } from "../firebase"
import { ref, set } from "firebase/database"

export default function ReferencesForm({ onSave, initialData = [] }) {
  const [referencesList, setReferencesList] = useState(initialData)
  const [editIndex, setEditIndex] = useState(-1)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      relation: "",
      testimonial: "",
    },
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setReferencesList(initialData)
    }
  }, [initialData])

  // Guardar en Firebase cuando cambia la lista
  useEffect(() => {
    const saveData = async () => {
      if (referencesList.length > 0) {
        try {
          const user = auth.currentUser
          if (!user) {
            throw new Error("Usuario no autenticado")
          }

          // Guardar en Firebase
          const referencesRef = ref(database, `portfolios/${user.uid}/references`)
          await set(referencesRef, referencesList)

          // Guardar en localStorage como respaldo
          localStorage.setItem("referencesData", JSON.stringify(referencesList))

          if (onSave) {
            onSave(referencesList)
          }
        } catch (error) {
          console.error("Error al guardar referencias:", error)
          setSaveError("No se pudieron guardar los cambios en la base de datos")
        }
      }
    }

    // Solo guardar si hay cambios (no en la carga inicial)
    if (referencesList !== initialData && referencesList.length > 0) {
      saveData()
    }
  }, [referencesList, onSave, initialData])

  const onSubmit = async (data) => {
    setSaveError("")

    try {
      // Si estamos editando, actualizar el elemento existente
      if (editIndex >= 0) {
        const updatedList = [...referencesList]
        updatedList[editIndex] = data
        setReferencesList(updatedList)
        setEditIndex(-1)
      } else {
        // Si no, añadir nuevo elemento
        setReferencesList([...referencesList, data])
      }

      // Mostrar mensaje de éxito
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      // Limpiar formulario
      reset({
        name: "",
        relation: "",
        testimonial: "",
      })
    } catch (error) {
      console.error("Error al guardar referencia:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (index) => {
    const itemToEdit = referencesList[index]

    // Establecer los valores del formulario con los datos del elemento a editar
    Object.keys(itemToEdit).forEach((key) => {
      setValue(key, itemToEdit[key])
    })

    setEditIndex(index)
  }

  const handleDelete = async (index) => {
    setSaveError("")

    try {
      const updatedList = [...referencesList]
      updatedList.splice(index, 1)
      setReferencesList(updatedList)

      // Si estábamos editando el elemento que se eliminó, resetear el formulario
      if (editIndex === index) {
        reset()
        setEditIndex(-1)
      } else if (editIndex > index) {
        // Ajustar el índice de edición si eliminamos un elemento anterior
        setEditIndex(editIndex - 1)
      }

      // Guardar en Firebase
      const user = auth.currentUser
      if (user) {
        const referencesRef = ref(database, `portfolios/${user.uid}/references`)
        await set(referencesRef, updatedList)
      }

      // Actualizar localStorage
      localStorage.setItem("referencesData", JSON.stringify(updatedList))

      if (onSave) {
        onSave(updatedList)
      }
    } catch (error) {
      console.error("Error al eliminar referencia:", error)
      setSaveError("No se pudo eliminar la entrada. Inténtalo de nuevo.")
    }
  }

  const handleCancel = () => {
    reset()
    setEditIndex(-1)
  }

  // Funciones para el carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === referencesList.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? referencesList.length - 1 : prev - 1))
  }

  const goToSlide = (index) => {
    setCurrentSlide(index)
  }

  // Obtener iniciales para el avatar
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="references-form-container">
      <h2>Referencias y Testimonios</h2>
      <p className="form-description">
        Añade referencias o testimonios de colegas, clientes o supervisores para reforzar tu credibilidad profesional.
      </p>

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {saveError}
        </div>
      )}

      {referencesList.length > 0 && (
        <div className="references-list">
          <h3>Referencias guardadas</h3>

          {referencesList.length > 1 ? (
            <div className="references-carousel">
              <button className="carousel-arrow carousel-prev" onClick={prevSlide}>
                <i className="fas fa-chevron-left"></i>
              </button>

              <div className="carousel-container" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {referencesList.map((reference, index) => (
                  <div key={index} className="carousel-slide">
                    <div className="reference-item">
                      <div className="reference-quote">
                        <i className="fas fa-quote-left"></i>
                      </div>
                      <div className="reference-content">
                        <p className="reference-testimonial">{reference.testimonial}</p>
                        <div className="reference-author">
                          <div className="reference-avatar">{getInitials(reference.name)}</div>
                          <div className="reference-info">
                            <span className="reference-name">{reference.name}</span>
                            <span className="reference-relation">{reference.relation}</span>
                          </div>
                        </div>
                      </div>
                      <div className="reference-actions">
                        <button
                          type="button"
                          onClick={() => handleEdit(index)}
                          className="edit-button"
                          aria-label="Editar"
                        >
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
                  </div>
                ))}
              </div>

              <button className="carousel-arrow carousel-next" onClick={nextSlide}>
                <i className="fas fa-chevron-right"></i>
              </button>

              <div className="carousel-controls">
                {referencesList.map((_, index) => (
                  <div
                    key={index}
                    className={`carousel-dot ${currentSlide === index ? "active" : ""}`}
                    onClick={() => goToSlide(index)}
                  ></div>
                ))}
              </div>
            </div>
          ) : (
            // Si solo hay una referencia, mostrarla sin carrusel
            <div className="reference-item">
              <div className="reference-quote">
                <i className="fas fa-quote-left"></i>
              </div>
              <div className="reference-content">
                <p className="reference-testimonial">{referencesList[0].testimonial}</p>
                <div className="reference-author">
                  <div className="reference-avatar">{getInitials(referencesList[0].name)}</div>
                  <div className="reference-info">
                    <span className="reference-name">{referencesList[0].name}</span>
                    <span className="reference-relation">{referencesList[0].relation}</span>
                  </div>
                </div>
              </div>
              <div className="reference-actions">
                <button type="button" onClick={() => handleEdit(0)} className="edit-button" aria-label="Editar">
                  <i className="fas fa-edit"></i>
                </button>
                <button type="button" onClick={() => handleDelete(0)} className="delete-button" aria-label="Eliminar">
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="references-form">
        <h3>{editIndex >= 0 ? "Editar referencia" : "Añadir nueva referencia"}</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Nombre de la persona *</label>
            <input
              id="name"
              type="text"
              className={errors.name ? "error" : ""}
              {...register("name", {
                required: "El nombre es obligatorio",
              })}
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="relation">Relación o cargo *</label>
            <input
              id="relation"
              type="text"
              className={errors.relation ? "error" : ""}
              {...register("relation", {
                required: "La relación es obligatoria",
              })}
              placeholder="Ej: Supervisor, Cliente, Colega..."
            />
            {errors.relation && <span className="error-message">{errors.relation.message}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="testimonial">Testimonio *</label>
            <textarea
              id="testimonial"
              className={errors.testimonial ? "error" : ""}
              {...register("testimonial", {
                required: "El testimonio es obligatorio",
                minLength: {
                  value: 20,
                  message: "El testimonio debe tener al menos 20 caracteres",
                },
                maxLength: {
                  value: 500,
                  message: "El testimonio no debe exceder los 500 caracteres",
                },
              })}
              rows={5}
              placeholder="Escribe aquí el testimonio o referencia..."
            ></textarea>
            {errors.testimonial && <span className="error-message">{errors.testimonial.message}</span>}
            <div className="char-counter">
              <span>{watch("testimonial")?.length || 0}</span>/500
            </div>
          </div>
        </div>

        <div className="form-actions">
          {editIndex >= 0 && (
            <button type="button" className="cancel-button" onClick={handleCancel}>
              Cancelar
            </button>
          )}
          <button type="submit" className="save-button">
            {editIndex >= 0 ? "Actualizar" : "Añadir"}
          </button>
        </div>

        {saveSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> Referencia guardada correctamente
          </div>
        )}
      </form>
    </div>
  )
}
