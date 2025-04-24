"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./LanguagesForm.css"
import { auth, database } from "../firebase"
import { ref, set } from "firebase/database"

export default function LanguagesForm({ onSave, initialData = [] }) {
  const [languagesList, setLanguagesList] = useState(initialData)
  const [editIndex, setEditIndex] = useState(-1)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      level: "intermediate",
    },
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setLanguagesList(initialData)
    }
  }, [initialData])

  // Guardar en Firebase cuando cambia la lista
  useEffect(() => {
    const saveData = async () => {
      if (languagesList.length > 0) {
        try {
          const user = auth.currentUser
          if (!user) {
            throw new Error("Usuario no autenticado")
          }

          // Guardar en Firebase
          const languagesRef = ref(database, `portfolios/${user.uid}/languages`)
          await set(languagesRef, languagesList)

          // Guardar en localStorage como respaldo
          localStorage.setItem("languagesData", JSON.stringify(languagesList))

          if (onSave) {
            onSave(languagesList)
          }
        } catch (error) {
          console.error("Error al guardar idiomas:", error)
          setSaveError("No se pudieron guardar los cambios en la base de datos")
        }
      }
    }

    // Solo guardar si hay cambios (no en la carga inicial)
    if (languagesList !== initialData && languagesList.length > 0) {
      saveData()
    }
  }, [languagesList, onSave, initialData])

  const onSubmit = async (data) => {
    setSaveError("")

    try {
      // Verificar si ya existe un idioma con el mismo nombre
      const existingLanguageIndex = languagesList.findIndex(
        (language) =>
          language.name.toLowerCase() === data.name.toLowerCase() && editIndex !== languagesList.indexOf(language),
      )

      if (existingLanguageIndex !== -1) {
        setSaveError("Ya existe un idioma con este nombre")
        return
      }

      // Si estamos editando, actualizar el elemento existente
      if (editIndex >= 0) {
        const updatedList = [...languagesList]
        updatedList[editIndex] = data
        setLanguagesList(updatedList)
        setEditIndex(-1)
      } else {
        // Si no, añadir nuevo elemento
        setLanguagesList([...languagesList, data])
      }

      // Mostrar mensaje de éxito
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      // Limpiar formulario
      setValue("name", "")
      setValue("level", "intermediate")
    } catch (error) {
      console.error("Error al guardar idioma:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (index) => {
    const itemToEdit = languagesList[index]

    // Establecer los valores del formulario con los datos del elemento a editar
    Object.keys(itemToEdit).forEach((key) => {
      setValue(key, itemToEdit[key])
    })

    setEditIndex(index)
  }

  const handleDelete = async (index) => {
    setSaveError("")

    try {
      const updatedList = [...languagesList]
      updatedList.splice(index, 1)
      setLanguagesList(updatedList)

      // Si estábamos editando el elemento que se eliminó, resetear el formulario
      if (editIndex === index) {
        setValue("name", "")
        setValue("level", "intermediate")
        setEditIndex(-1)
      } else if (editIndex > index) {
        // Ajustar el índice de edición si eliminamos un elemento anterior
        setEditIndex(editIndex - 1)
      }

      // Guardar en Firebase
      const user = auth.currentUser
      if (user) {
        const languagesRef = ref(database, `portfolios/${user.uid}/languages`)
        await set(languagesRef, updatedList)
      }

      // Actualizar localStorage
      localStorage.setItem("languagesData", JSON.stringify(updatedList))

      if (onSave) {
        onSave(updatedList)
      }
    } catch (error) {
      console.error("Error al eliminar idioma:", error)
      setSaveError("No se pudo eliminar la entrada. Inténtalo de nuevo.")
    }
  }

  const handleCancel = () => {
    setValue("name", "")
    setValue("level", "intermediate")
    setEditIndex(-1)
  }

  // Obtener texto descriptivo para el nivel
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

  return (
    <div className="languages-form-container">
      <h2>Idiomas</h2>
      <p className="form-description">
        Añade los idiomas que dominas y tu nivel de competencia para mostrar tus habilidades lingüísticas.
      </p>

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {saveError}
        </div>
      )}

      {languagesList.length > 0 && (
        <div className="languages-list">
          <h3>Idiomas guardados</h3>
          {languagesList.map((language, index) => (
            <div key={index} className="language-item">
              <div className="language-item-content">
                <span className="language-flag">{getLanguageFlag(language.name)}</span>
                <span className="language-name">{language.name}</span>
                <span className={`language-level ${language.level}`}>{getLevelText(language.level)}</span>
              </div>
              <div className="language-item-actions">
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

      <form onSubmit={handleSubmit(onSubmit)} className="languages-form">
        <h3>{editIndex >= 0 ? "Editar idioma" : "Añadir nuevo idioma"}</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Idioma *</label>
            <input
              id="name"
              type="text"
              className={errors.name ? "error" : ""}
              {...register("name", {
                required: "El nombre del idioma es obligatorio",
              })}
              placeholder="Ej: Español, Inglés, Francés..."
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="level">Nivel *</label>
            <select
              id="level"
              className={errors.level ? "error" : ""}
              {...register("level", {
                required: "El nivel es obligatorio",
              })}
            >
              <option value="basic">Básico</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="native">Nativo</option>
            </select>
            {errors.level && <span className="error-message">{errors.level.message}</span>}
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
            <i className="fas fa-check-circle"></i> Idioma guardado correctamente
          </div>
        )}
      </form>
    </div>
  )
}
