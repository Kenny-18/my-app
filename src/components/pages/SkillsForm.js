"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./SkillsForm.css"
import { auth, database } from "../firebase"
import { ref, set } from "firebase/database"

export default function SkillsForm({ onSave, initialData = [] }) {
  const [skillsList, setSkillsList] = useState(initialData)
  const [editIndex, setEditIndex] = useState(-1)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

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
      level: 3,
      category: "frontend",
    },
  })

  const watchLevel = watch("level")

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setSkillsList(initialData)
    }
  }, [initialData])

  // Guardar en Firebase cuando cambia la lista
  useEffect(() => {
    const saveData = async () => {
      if (skillsList.length > 0) {
        try {
          const user = auth.currentUser
          if (!user) {
            throw new Error("Usuario no autenticado")
          }

          // Guardar en Firebase
          const skillsRef = ref(database, `portfolios/${user.uid}/skills`)
          await set(skillsRef, skillsList)

          // Guardar en localStorage como respaldo
          localStorage.setItem("skillsData", JSON.stringify(skillsList))

          if (onSave) {
            onSave(skillsList)
          }
        } catch (error) {
          console.error("Error al guardar habilidades:", error)
          setSaveError("No se pudieron guardar los cambios en la base de datos")
        }
      }
    }

    // Solo guardar si hay cambios (no en la carga inicial)
    if (skillsList !== initialData && skillsList.length > 0) {
      saveData()
    }
  }, [skillsList, onSave, initialData])

  const onSubmit = async (data) => {
    setSaveError("")

    try {
      // Verificar si ya existe una habilidad con el mismo nombre
      const existingSkillIndex = skillsList.findIndex(
        (skill) => skill.name.toLowerCase() === data.name.toLowerCase() && editIndex !== skillsList.indexOf(skill),
      )

      if (existingSkillIndex !== -1) {
        setSaveError("Ya existe una habilidad con este nombre")
        return
      }

      // Si estamos editando, actualizar el elemento existente
      if (editIndex >= 0) {
        const updatedList = [...skillsList]
        updatedList[editIndex] = data
        setSkillsList(updatedList)
        setEditIndex(-1)
      } else {
        // Si no, añadir nuevo elemento
        setSkillsList([...skillsList, data])
      }

      // Mostrar mensaje de éxito
      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)

      // Limpiar formulario
      reset({
        name: "",
        level: 3,
        category: "frontend",
      })
    } catch (error) {
      console.error("Error al guardar habilidad:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    }
  }

  const handleEdit = (index) => {
    const itemToEdit = skillsList[index]

    // Establecer los valores del formulario con los datos del elemento a editar
    Object.keys(itemToEdit).forEach((key) => {
      setValue(key, itemToEdit[key])
    })

    setEditIndex(index)
  }

  const handleDelete = async (index) => {
    setSaveError("")

    try {
      const updatedList = [...skillsList]
      updatedList.splice(index, 1)
      setSkillsList(updatedList)

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
        const skillsRef = ref(database, `portfolios/${user.uid}/skills`)
        await set(skillsRef, updatedList)
      }

      // Actualizar localStorage
      localStorage.setItem("skillsData", JSON.stringify(updatedList))

      if (onSave) {
        onSave(updatedList)
      }
    } catch (error) {
      console.error("Error al eliminar habilidad:", error)
      setSaveError("No se pudo eliminar la entrada. Inténtalo de nuevo.")
    }
  }

  const handleCancel = () => {
    reset()
    setEditIndex(-1)
  }

  // Obtener categorías únicas para los filtros
  const categories = ["all", ...new Set(skillsList.map((skill) => skill.category))]

  // Filtrar habilidades por categoría
  const filteredSkills =
    activeCategory === "all" ? skillsList : skillsList.filter((skill) => skill.category === activeCategory)

  // Renderizar estrellas para el nivel
  const renderStars = (level) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(<i key={i} className={`fas fa-star skill-star ${i <= level ? "filled" : ""}`}></i>)
    }
    return stars
  }

  // Obtener texto descriptivo para el nivel
  const getLevelText = (level) => {
    switch (level) {
      case 1:
        return "Principiante"
      case 2:
        return "Básico"
      case 3:
        return "Intermedio"
      case 4:
        return "Avanzado"
      case 5:
        return "Experto"
      default:
        return "Intermedio"
    }
  }

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

  return (
    <div className="skills-form-container">
      <h2>Habilidades</h2>
      <p className="form-description">
        Añade tus habilidades técnicas y blandas para mostrar tus fortalezas. Puedes organizarlas por categorías.
      </p>

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {saveError}
        </div>
      )}

      {skillsList.length > 0 && (
        <div className="skills-list">
          <h3>Habilidades guardadas</h3>

          <div className="skills-categories">
            {categories.map((category) => (
              <button
                key={category}
                className={`category-filter ${activeCategory === category ? "active" : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category === "all" ? "Todas" : getCategoryName(category)}
              </button>
            ))}
          </div>

          <div className="skills-grid">
            {filteredSkills.map((skill, index) => {
              // Encontrar el índice original para editar/eliminar correctamente
              const originalIndex = skillsList.findIndex((s) => s.name === skill.name && s.category === skill.category)

              return (
                <div key={index} className="skill-item">
                  <div className="skill-header">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-category">{getCategoryName(skill.category)}</span>
                  </div>

                  <div className="skill-level">
                    <div className="skill-stars">{renderStars(skill.level)}</div>
                    <div className="skill-progress-container">
                      <div className="skill-progress-bar" style={{ width: `${(skill.level / 5) * 100}%` }}></div>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#666", marginTop: "3px" }}>
                      {getLevelText(skill.level)}
                    </div>
                  </div>

                  <div className="skill-actions">
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
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="skills-form">
        <h3>{editIndex >= 0 ? "Editar habilidad" : "Añadir nueva habilidad"}</h3>

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Nombre de la habilidad *</label>
            <input
              id="name"
              type="text"
              className={errors.name ? "error" : ""}
              {...register("name", {
                required: "El nombre de la habilidad es obligatorio",
              })}
            />
            {errors.name && <span className="error-message">{errors.name.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="category">Categoría *</label>
            <select
              id="category"
              className={errors.category ? "error" : ""}
              {...register("category", {
                required: "La categoría es obligatoria",
              })}
            >
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="database">Bases de datos</option>
              <option value="devops">DevOps</option>
              <option value="mobile">Desarrollo móvil</option>
              <option value="design">Diseño</option>
              <option value="softskills">Habilidades blandas</option>
              <option value="other">Otras</option>
            </select>
            {errors.category && <span className="error-message">{errors.category.message}</span>}
          </div>

          <div className="form-group full-width">
            <label htmlFor="level">
              Nivel de dominio: <strong>{getLevelText(watchLevel)}</strong>
            </label>
            <input
              id="level"
              type="range"
              min="1"
              max="5"
              step="1"
              className="range-slider"
              {...register("level", { valueAsNumber: true })}
            />
            <div className="level-display">
              <span>Principiante</span>
              <span>Experto</span>
            </div>
            <div className="skill-stars" style={{ marginTop: "10px" }}>
              {renderStars(watchLevel)}
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
            <i className="fas fa-check-circle"></i> Habilidad guardada correctamente
          </div>
        )}
      </form>
    </div>
  )
}
