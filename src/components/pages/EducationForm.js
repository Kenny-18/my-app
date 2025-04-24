"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./EducationForm.css"
import { auth, database } from "../firebase"
import { ref, set } from "firebase/database"

export default function EducationForm({ onSave, initialData = [] }) {
  const [educationList, setEducationList] = useState(initialData)
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
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setEducationList(initialData)
    }
  }, [initialData])

  // Guardar en Firebase cuando cambia la lista
  useEffect(() => {
    const saveData = async () => {
      if (educationList.length > 0) {
        try {
          const user = auth.currentUser
          if (!user) {
            throw new Error("Usuario no autenticado")
          }

          // Guardar en Firebase
          const educationRef = ref(database, `portfolios/${user.uid}/education`)
          await set(educationRef, educationList)

          // Guardar en localStorage como respaldo
          localStorage.setItem("educationData", JSON.stringify(educationList))

          if (onSave) {
            onSave(educationList)
          }
        } catch (error) {
          console.error("Error al guardar educación:", error)
          setSaveError("No se pudieron guardar los cambios en la base de datos")
        }
      }
    }

    // Solo guardar si hay cambios (no en la carga inicial)
    if (educationList !== initialData && educationList.length > 0) {
      saveData()
    }
  }, [educationList, onSave, initialData])

  const onSubmit = async (data) => {
    setSaveError("")

    try {
      // Si estamos editando, actualizar el elemento existente
      if (editIndex >= 0) {
        const updatedList = [...educationList]
        updatedList[editIndex] = data
        setEducationList(updatedList)
        setEditIndex(-1)
      } else {
        // Si no, añadir nuevo elemento
        setEducationList([...educationList, data])
      }

      // Mostrar mensaje de éxito
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      // Limpiar formulario
      reset({
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
        current: false,
      })
    } catch (error) {
      console.error("Error al guardar educación:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (index) => {
    const itemToEdit = educationList[index]

    // Establecer los valores del formulario con los datos del elemento a editar
    Object.keys(itemToEdit).forEach((key) => {
      setValue(key, itemToEdit[key])
    })

    setEditIndex(index)
  }

  const handleDelete = async (index) => {
    setSaveError("")

    try {
      const updatedList = [...educationList]
      updatedList.splice(index, 1)
      setEducationList(updatedList)

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
        const educationRef = ref(database, `portfolios/${user.uid}/education`)
        await set(educationRef, updatedList)
      }

      // Actualizar localStorage
      localStorage.setItem("educationData", JSON.stringify(updatedList))

      if (onSave) {
        onSave(updatedList)
      }
    } catch (error) {
      console.error("Error al eliminar educación:", error)
      setSaveError("No se pudo eliminar la entrada. Inténtalo de nuevo.")
    }
  }

  const handleCancel = () => {
    reset()
    setEditIndex(-1)
  }

  const handleCurrentChange = (e) => {
    const isCurrent = e.target.checked
    if (isCurrent) {
      setValue("endDate", "")
    }
  }

  return (
    <div className="education-form-container">
      <h2>Formación Académica</h2>
      <p className="form-description">
        Añade tu formación académica para mostrar tu trayectoria educativa. Puedes añadir múltiples entradas.
      </p>

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {saveError}
        </div>
      )}

      {educationList.length > 0 && (
        <div className="education-list">
          <h3>Entradas guardadas</h3>
          {educationList.map((item, index) => (
            <div key={index} className="education-item">
              <div className="education-item-content">
                <h4>{item.institution}</h4>
                <p>
                  <strong>{item.degree}</strong>
                  {item.fieldOfStudy && <span> en {item.fieldOfStudy}</span>}
                </p>
                <p className="education-dates">
                  {item.startDate} - {item.current ? "Actual" : item.endDate}
                </p>
                {item.description && <p className="education-description">{item.description}</p>}
              </div>
              <div className="education-item-actions">
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

      <form onSubmit={handleSubmit(onSubmit)} className="education-form">
        <h3>{editIndex >= 0 ? "Editar formación" : "Añadir nueva formación"}</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="institution">Institución *</label>
            <input
              id="institution"
              type="text"
              className={errors.institution ? "error" : ""}
              {...register("institution", {
                required: "La institución es obligatoria",
              })}
            />
            {errors.institution && <span className="error-message">{errors.institution.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="degree">Título/Grado *</label>
            <input
              id="degree"
              type="text"
              className={errors.degree ? "error" : ""}
              {...register("degree", {
                required: "El título es obligatorio",
              })}
            />
            {errors.degree && <span className="error-message">{errors.degree.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="fieldOfStudy">Área de estudio</label>
            <input
              id="fieldOfStudy"
              type="text"
              className={errors.fieldOfStudy ? "error" : ""}
              {...register("fieldOfStudy")}
            />
            {errors.fieldOfStudy && <span className="error-message">{errors.fieldOfStudy.message}</span>}
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
              <input type="checkbox" {...register("current")} onChange={handleCurrentChange} />
              <span>Cursando actualmente</span>
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
                  value: !watch("current"),
                  message: "La fecha de finalización es obligatoria si no es actual",
                },
              })}
              disabled={watch("current")}
            />
            {errors.endDate && <span className="error-message">{errors.endDate.message}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            className={errors.description ? "error" : ""}
            {...register("description", {
              maxLength: {
                value: 300,
                message: "La descripción no debe exceder los 300 caracteres",
              },
            })}
            rows={3}
            placeholder="Describe brevemente tus logros, actividades o responsabilidades"
          ></textarea>
          {errors.description && <span className="error-message">{errors.description.message}</span>}
          <div className="char-counter">
            <span>{watch("description")?.length || 0}</span>/300
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
