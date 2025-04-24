"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import "./ContactForm.css"
import { auth, database } from "../firebase"
import { ref, set, get } from "firebase/database"

export default function ContactForm({ onSave, initialData = {} }) {
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState("")
  const [contactData, setContactData] = useState(initialData)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: initialData || {
      email: "",
      phone: "",
      website: "",
    },
  })

  // Cargar datos iniciales
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setContactData(initialData)

      // Establecer valores iniciales en el formulario
      Object.keys(initialData).forEach((key) => {
        setValue(key, initialData[key])
      })
    } else {
      // Si no hay datos iniciales, intentar cargar desde la información personal
      const loadPersonalInfo = async () => {
        try {
          const user = auth.currentUser
          if (!user) return

          const personalInfoRef = ref(database, `portfolios/${user.uid}/personalInfo`)
          const snapshot = await get(personalInfoRef)

          if (snapshot.exists()) {
            const data = snapshot.val()
            const contactFields = {
              email: data.email || "",
              phone: data.phone || "",
              website: data.website || "",
            }

            setContactData(contactFields)

            // Establecer valores en el formulario
            Object.keys(contactFields).forEach((key) => {
              setValue(key, contactFields[key])
            })
          }
        } catch (error) {
          console.error("Error al cargar información personal:", error)
        }
      }

      loadPersonalInfo()
    }
  }, [initialData, setValue])

  const onSubmit = async (data) => {
    setSaveError("")

    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("Usuario no autenticado")
      }

      // Guardar en Firebase
      const contactRef = ref(database, `portfolios/${user.uid}/contact`)
      await set(contactRef, data)

      // Guardar en localStorage como respaldo
      localStorage.setItem("contactData", JSON.stringify(data))

      // Actualizar estado local
      setContactData(data)

      // Llamar al callback si existe
      if (onSave) {
        onSave(data)
      }

      setSaveSuccess(true)
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Error al guardar información de contacto:", error)
      setSaveError("No se pudo guardar la información. Inténtalo de nuevo.")
    }
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

  return (
    <div className="contact-form-container">
      <h2>Información de Contacto</h2>
      <p className="form-description">
        Añade tus datos de contacto y redes sociales para que los visitantes de tu portafolio puedan comunicarse
        contigo.
      </p>

      {saveError && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="contact-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              className={errors.email ? "error" : ""}
              {...register("email", {
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Correo electrónico inválido",
                },
              })}
              placeholder="ejemplo@correo.com"
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
              placeholder="+1234567890"
            />
            {errors.phone && <span className="error-message">{errors.phone.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="website">Sitio Web</label>
            <input
              id="website"
              type="url"
              className={errors.website ? "error" : ""}
              {...register("website", {
                pattern: {
                  value: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\.[a-zA-Z]{2,})?([/\w-]*)*$/,
                  message: "URL inválida",
                },
              })}
              placeholder="www.ejemplo.com"
            />
            {errors.website && <span className="error-message">{errors.website.message}</span>}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="save-button">
            Guardar Información
          </button>
        </div>

        {saveSuccess && (
          <div className="success-message">
            <i className="fas fa-check-circle"></i> Información de contacto guardada correctamente
          </div>
        )}
      </form>

      {/* Vista previa de iconos de redes sociales */}
      <div className="social-preview">
        <h3>Vista previa de redes sociales</h3>
        <div className="social-icons">
          {Object.entries(contactData || {}).map(([network, url]) => {
            if (!url) return null
            return (
              <a
                key={network}
                href={formatUrl(url, network)}
                target="_blank"
                rel="noopener noreferrer"
                className={`social-icon ${network}`}
                title={network.charAt(0).toUpperCase() + network.slice(1)}
              >
                <i className={getSocialIcon(network)}></i>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
