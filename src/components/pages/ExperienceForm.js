"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./ExperienceForm.css"
import { auth, database } from "../firebase"
import { ref, set } from "firebase/database"

export default function ExperienceForm({ onSave, initialData = [] }) {
  const [experienceList, setExperienceList] = useState(initialData)
  const [editIndex, setEditIndex] = useState(-1)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
      achievements: "",
    },
  })

  const watchCurrent = watch("current")

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setExperienceList(initialData)
    }
  }, [initialData])

  // Guardar en Firebase cuando cambia la lista
  useEffect(() => {
    const saveData = async () => {
      if (experienceList.length > 0) {
        try {
          const user = auth.currentUser
          if (!user) {
            throw new Error("Usuario no autenticado")
          }

          // Guardar en Firebase
          const experienceRef = ref(database, `portfolios/${user.uid}/experience`)
          await set(experienceRef, experienceList)

          // Guardar en localStorage como respaldo
          localStorage.setItem("experienceData", JSON.stringify(experienceList))

          if (onSave) {
            onSave(experienceList)
          }
        } catch (error) {
          console.error("Error al guardar experiencia:", error)
          setSaveError("No se pudieron guardar los cambios en la base de datos")
        }
      }
    }

    // Solo guardar si hay cambios (no en la carga inicial)
    if (experienceList !== initialData && experienceList.length > 0) {
      saveData()
    }
  }, [experienceList, onSave, initialData])

  const onSubmit = async (data) => {
    setSaveError("")

    try {
      // Si estamos editando, actualizar el elemento existente
      if (editIndex >= 0) {
        const updatedList = [...experienceList]
        updatedList[editIndex] = data
        setExperienceList(updatedList)
        setEditIndex(-1)
      } else {
        // Si no, añadir nuevo elemento
        setExperienceList([...experienceList, data])
      }

      // Mostrar mensaje de éxito
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      // Limpiar formulario
      reset({
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false,
        achievements: "",
      })
    } catch (error) {
      console.error("Error al guardar experiencia:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (index) => {
    const itemToEdit = experienceList[index]

    // Establecer los valores del formulario con los datos del elemento a editar
    Object.keys(itemToEdit).forEach((key) => {
      setValue(key, itemToEdit[key])
    })

    setEditIndex(index)
  }

  const handleDelete = async (index) => {
    setSaveError("")

    try {
      const updatedList = [...experienceList]
      updatedList.splice(index, 1)
      setExperienceList(updatedList)

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
        const experienceRef = ref(database, `portfolios/${user.uid}/experience`)
        await set(experienceRef, updatedList)
      }

      // Actualizar localStorage
      localStorage.setItem("experienceData", JSON.stringify(updatedList))

      if (onSave) {
        onSave(updatedList)
      }
    } catch (error) {
      console.error("Error al eliminar experiencia:", error)
      setSaveError("No se pudo eliminar la entrada. Inténtalo de nuevo.")
    }
  }

  const handleCancel = () => {
    reset()
    setEditIndex(-1)
  }

  // Ordenar experiencias por fecha (más reciente primero)
  const sortedExperiences = [...experienceList].sort((a, b) => {
    // Si alguno es trabajo actual, va primero
    if (a.current && !b.current) return -1
    if (!a.current && b.current) return 1

    // Si ambos son actuales o ambos no son actuales, comparar por fecha de inicio
    const dateA = a.current ? new Date() : new Date(a.endDate)
    const dateB = b.current ? new Date() : new Date(b.endDate)
    return dateB - dateA
  })

  return (
    <div className="experience-form-container">
      <h2>Experiencia Laboral</h2>
      <p className="form-description">
        Añade tu experiencia laboral para mostrar tus roles previos y responsabilidades. Puedes añadir múltiples
        entradas.
      </p>

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {saveError}
        </div>
      )}

      {experienceList.length > 0 && (
        <div className="experience-list">
          <h3>Experiencias guardadas</h3>
          {sortedExperiences.map((item, index) => {
            // Encontrar el índice original para editar/eliminar correctamente
            const originalIndex = experienceList.findIndex(
              (exp) =>
                exp.company === item.company && exp.position === item.position && exp.startDate === item.startDate,
            )

            return (
              <div key={index} className="experience-item">
                <div className="experience-item-content">
                  <h4>{item.position}</h4>
                  <p className="experience-company">
                    <i className="fas fa-building"></i> {item.company}
                  </p>
                  <p className="experience-dates">
                    <i className="fas fa-calendar-alt"></i> {item.startDate} - {item.current ? "Actual" : item.endDate}
                  </p>
                  {item.description && <p className="experience-description">{item.description}</p>}
                  {item.achievements && (
                    <div className="experience-achievements">
                      <strong>Logros:</strong>
                      <p>{item.achievements}</p>
                    </div>
                  )}
                </div>
                <div className="experience-item-actions">
                  <button
                    type="button"
                    onClick={() => handleEdit(originalIndex)}
                    className="edit-button"
                    aria-label="Editar"
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(originalIndex)}
                    className="delete-button"
                    aria-label="Eliminar"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="experience-form">
        <h3>{editIndex >= 0 ? "Editar experiencia" : "Añadir nueva experiencia"}</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="company">Empresa *</label>
            <input
              id="company"
              type="text"
              className={errors.company ? "error" : ""}
              {...register("company", {
                required: "La empresa es obligatoria",
              })}
            />
            {errors.company && <span className="error-message">{errors.company.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="position">Cargo *</label>
            <input
              id="position"
              type="text"
              className={errors.position ? "error" : ""}
              {...register("position", {
                required: "El cargo es obligatorio",
              })}
            />
            {errors.position && <span className="error-message">{errors.position.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Fecha de inicio *</label>
            <input
              id="startDate"
              type="month"
              className={errors.startDate ? "error" : ""}
              {...register("startDate", {
                required: "La fecha de inicio es obligatoria",
              })}
            />
            {errors.startDate && <span className="error-message">{errors.startDate.message}</span>}
          </div>

          <div className="form-group current-checkbox">
            <label className="checkbox-label">
              <input type="checkbox" {...register("current")} />
              <span>Trabajo actual</span>
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="endDate">
              Fecha de finalización {!errors.current && <span className="optional">(si no es actual)</span>}
            </label>
            <input
              id="endDate"
              type="month"
              className={errors.endDate ? "error" : ""}
              {...register("endDate", {
                required: {
                  value: !watchCurrent,
                  message: "La fecha de finalización es obligatoria si no es trabajo actual",
                },
                validate: (value) => {
                  if (!watchCurrent && !value) {
                    return "La fecha de finalización es obligatoria si no es trabajo actual"
                  }
                  return true
                },
              })}
              disabled={watchCurrent}
            />
            {errors.endDate && <span className="error-message">{errors.endDate.message}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Descripción de responsabilidades *</label>
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
            placeholder="Describe tus principales responsabilidades y funciones"
          ></textarea>
          {errors.description && <span className="error-message">{errors.description.message}</span>}
          <div className="char-counter">
            <span>{watch("description")?.length || 0}</span>/500
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="achievements">Logros destacados</label>
          <textarea
            id="achievements"
            className={errors.achievements ? "error" : ""}
            {...register("achievements", {
              maxLength: {
                value: 300,
                message: "Los logros no deben exceder los 300 caracteres",
              },
            })}
            rows={3}
            placeholder="Describe tus principales logros y contribuciones (opcional)"
          ></textarea>
          {errors.achievements && <span className="error-message">{errors.achievements.message}</span>}
          <div className="char-counter">
            <span>{watch("achievements")?.length || 0}</span>/300
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
            <i className="fas fa-check-circle"></i> Información guardada correctamente
          </div>
        )}
      </form>
    </div>
  )
}
