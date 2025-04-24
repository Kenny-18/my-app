"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./PersonalInfoForm.css"
import { auth, database } from "../firebase"
import { ref, set } from "firebase/database"

export default function PersonalInfoForm({ onSave, initialData }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: initialData || {
      fullName: "",
      profession: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      website: "",
      linkedin: "",
      github: "",
    },
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")

  const bioLength = watch("bio")?.length || 0

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData)
    }
  }, [initialData, reset])

  const onSubmit = async (data) => {
    setIsSaving(true)
    setSaveError("")

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Guardar en Firebase
      const portfolioRef = ref(database, `portfolios/${user.uid}/personalInfo`)
      await set(portfolioRef, data)

      // Guardar en localStorage como respaldo
      localStorage.setItem("personalInfo", JSON.stringify(data))

      // Call parent component's save handler
      if (onSave) {
        onSave(data)
      }

      setSaveSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error al guardar información personal:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="personal-info-form-container">
      <h2>Información Personal</h2>
      <p className="form-description">
        Completa tu información personal para mostrarla en tu portafolio. Los campos marcados con * son obligatorios.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="personal-info-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="fullName">Nombre Completo *</label>
            <input
              id="fullName"
              type="text"
              className={errors.fullName ? "error" : ""}
              {...register("fullName", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 caracteres",
                },
              })}
            />
            {errors.fullName && <span className="error-message">{errors.fullName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="profession">Profesión/Ocupación *</label>
            <input
              id="profession"
              type="text"
              className={errors.profession ? "error" : ""}
              {...register("profession", {
                required: "La profesión es obligatoria",
              })}
            />
            {errors.profession && <span className="error-message">{errors.profession.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              id="email"
              type="email"
              className={errors.email ? "error" : ""}
              {...register("email", {
                required: "El correo electrónico es obligatorio",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo electrónico inválido",
                },
              })}
            />
            {errors.email && <span className="error-message">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono</label>
            <input
              id="phone"
              type="tel"
              className={errors.phone ? "error" : ""}
              {...register("phone", {
                pattern: {
                  value: /^[0-9+-\s()]{7,15}$/,
                  message: "Formato de teléfono inválido",
                },
              })}
            />
            {errors.phone && <span className="error-message">{errors.phone.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Ubicación *</label>
            <input
              id="location"
              type="text"
              className={errors.location ? "error" : ""}
              {...register("location", {
                required: "La ubicación es obligatoria",
              })}
            />
            {errors.location && <span className="error-message">{errors.location.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="website">Sitio Web</label>
            <input
              id="website"
              type="url"
              placeholder="https://misitio.com"
              className={errors.website ? "error" : ""}
              {...register("website", {
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?([/\w-]*)*$/,
                  message: "URL inválida",
                },
              })}
            />
            {errors.website && <span className="error-message">{errors.website.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="linkedin">LinkedIn</label>
            <input
              id="linkedin"
              type="url"
              placeholder="https://linkedin.com/in/usuario"
              className={errors.linkedin ? "error" : ""}
              {...register("linkedin", {
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
                  message: "URL de LinkedIn inválida",
                },
              })}
            />
            {errors.linkedin && <span className="error-message">{errors.linkedin.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="github">GitHub</label>
            <input
              id="github"
              type="url"
              placeholder="https://github.com/usuario"
              className={errors.github ? "error" : ""}
              {...register("github", {
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/,
                  message: "URL de GitHub inválida",
                },
              })}
            />
            {errors.github && <span className="error-message">{errors.github.message}</span>}
          </div>
        </div>

        <div className="form-group full-width">
          <label htmlFor="bio">Biografía *</label>
          <textarea
            id="bio"
            className={errors.bio ? "error" : ""}
            {...register("bio", {
              required: "La biografía es obligatoria",
              minLength: {
                value: 50,
                message: "La biografía debe tener al menos 50 caracteres",
              },
              maxLength: {
                value: 500,
                message: "La biografía no debe exceder los 500 caracteres",
              },
            })}
            rows={5}
          ></textarea>
          {errors.bio && <span className="error-message">{errors.bio.message}</span>}
          <div className="char-counter">
            <span>{bioLength}</span>/500
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button" disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Información"}
          </button>
        </div>

        {saveSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> Información guardada correctamente
          </div>
        )}

        {saveError && (
          <div className="error-message-banner">
            <i className="fas fa-exclamation-circle"></i> {saveError}
          </div>
        )}
      </form>
    </div>
  )
}
