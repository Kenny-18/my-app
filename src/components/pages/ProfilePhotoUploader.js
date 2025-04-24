"use client"

import { useState, useRef, useEffect } from "react"
import { storage, database } from "../firebase"
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { ref as dbRef, update } from "firebase/database"
import "./ProfilePhotoUploader.css"

export default function ProfilePhotoUploader({ currentPhotoURL, onPhotoUpdate, userId }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])
  const [previewImage, setPreviewImage] = useState(null)
  const fileInputRef = useRef(null)

  // Limpiar la URL del objeto al desmontar el componente
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage)
      }
    }
  }, [previewImage])

  // Función para añadir información de depuración
  const addDebugInfo = (message) => {
    console.log(message)
    setDebugInfo((prev) => [...prev, { time: new Date().toISOString(), message }])
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    addDebugInfo(`Archivo seleccionado: ${file.name}, tipo: ${file.type}, tamaño: ${file.size} bytes`)

    // Validar tipo de archivo
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setError("Por favor selecciona una imagen válida (JPEG, PNG, GIF o WebP)")
      return
    }

    // Validar tamaño de archivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen es demasiado grande. El tamaño máximo es 5MB.")
      return
    }

    // Crear una vista previa local
    const objectUrl = URL.createObjectURL(file)
    setPreviewImage(objectUrl)

    // Modo local temporal - actualizar solo la vista previa
    if (window.confirm("¿Deseas usar el modo local temporal? (La imagen no se subirá a Firebase)")) {
      addDebugInfo("Usando modo local temporal")
      setUploading(false)
      setSuccess(true)
      onPhotoUpdate(objectUrl) // Actualizar con URL local temporal
      setTimeout(() => setSuccess(false), 3000)
      return
    }

    setUploading(true)
    setError("")
    setSuccess(false)
    setUploadProgress(0)

    try {
      // Crear referencia para el archivo en Firebase Storage
      const fileRef = storageRef(storage, `profile-photos/${userId}/${Date.now()}-${file.name}`)
      addDebugInfo(`Referencia de almacenamiento creada: ${fileRef.fullPath}`)

      // Crear la tarea de carga
      addDebugInfo("Iniciando tarea de carga...")
      const uploadTask = uploadBytesResumable(fileRef, file)

      // Monitorear el progreso de la carga
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Actualizar el progreso basado en los bytes transferidos
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          addDebugInfo(`Progreso de carga: ${progress}%, estado: ${snapshot.state}`)
          setUploadProgress(progress)
        },
        (uploadError) => {
          // Manejar errores
          addDebugInfo(`Error durante la carga: ${uploadError.code} - ${uploadError.message}`)
          setError(`Error al subir la imagen: ${uploadError.message}`)
          setUploading(false)
          if (fileInputRef.current) {
            fileInputRef.current.value = ""
          }
        },
        () => {
          // Carga completada exitosamente
          addDebugInfo("Carga completada, obteniendo URL de descarga...")
          getDownloadURL(uploadTask.snapshot.ref)
            .then((downloadURL) => {
              addDebugInfo(`URL de descarga obtenida: ${downloadURL}`)

              // Actualizar URL en la base de datos
              const userProfileRef = dbRef(database, `portfolios/${userId}/personalInfo`)
              addDebugInfo(`Actualizando base de datos en: portfolios/${userId}/personalInfo`)
              return update(userProfileRef, { photoURL: downloadURL })
            })
            .then(() => {
              addDebugInfo("Base de datos actualizada correctamente")
              // Obtener la URL de descarga actualizada
              return getDownloadURL(fileRef)
            })
            .then((finalURL) => {
              addDebugInfo(`URL final obtenida: ${finalURL}`)
              // Actualizar estado local con la URL final
              onPhotoUpdate(finalURL)
              setSuccess(true)
              setTimeout(() => setSuccess(false), 3000)
              setUploading(false)

              // Limpiar el input de archivo
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            })
            .catch((finalError) => {
              addDebugInfo(`Error al finalizar la subida: ${finalError.message}`)
              setError(`Error al procesar la imagen subida: ${finalError.message}`)
              setUploading(false)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            })
        },
      )
    } catch (initError) {
      addDebugInfo(`Error al iniciar la carga: ${initError.message}`)
      setError(`Error al iniciar la carga: ${initError.message}`)
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSelectFile = () => {
    // Limpiar el input de archivo antes de abrirlo
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    fileInputRef.current.click()
  }

  const handleUseLocalImage = () => {
    if (previewImage) {
      onPhotoUpdate(previewImage)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <div className="photo-uploader-container">
      <h2>Foto de Perfil</h2>
      <p className="form-description">
        Sube una foto de perfil para personalizar tu portafolio. Se recomienda una imagen cuadrada.
      </p>

      <div className="photo-preview-container">
        <img
          src={previewImage || currentPhotoURL || "/placeholder.svg"}
          alt="Foto de perfil"
          className="photo-preview"
          onError={(e) => {
            e.target.src = "/placeholder.svg?height=200&width=200"
          }}
        />

        <div className="photo-actions">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg, image/png, image/gif, image/webp"
            className="file-input"
            disabled={uploading}
          />

          <button onClick={handleSelectFile} className="select-photo-button" disabled={uploading}>
            {uploading ? "Subiendo..." : "Seleccionar nueva foto"}
          </button>

          {previewImage && !uploading && (
            <button
              onClick={handleUseLocalImage}
              className="select-photo-button"
              style={{ marginTop: "10px", backgroundColor: "#4a90e2" }}
            >
              Usar esta imagen (local)
            </button>
          )}

          <p className="photo-help-text">Formatos aceptados: JPEG, PNG, GIF, WebP. Tamaño máximo: 5MB.</p>
        </div>
      </div>

      {uploading && (
        <div className="upload-progress-container">
          <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }}></div>
          <span className="upload-progress-text">{uploadProgress}%</span>
        </div>
      )}

      {error && (
        <div className="error-message-banner">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i> Foto actualizada correctamente
        </div>
      )}

      {/* Sección de depuración */}
      <div
        style={{
          marginTop: "20px",
          padding: "15px",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          maxHeight: "200px",
          overflowY: "auto",
        }}
      >
        <h3 style={{ fontSize: "1rem", marginBottom: "10px" }}>Información de depuración:</h3>
        {debugInfo.length === 0 ? (
          <p>No hay información de depuración disponible.</p>
        ) : (
          <ul style={{ fontSize: "0.85rem", listStyleType: "none", padding: 0 }}>
            {debugInfo.map((info, index) => (
              <li key={index} style={{ marginBottom: "5px", borderBottom: "1px solid #eee", paddingBottom: "5px" }}>
                <span style={{ color: "#666", marginRight: "10px" }}>{info.time.split("T")[1].split(".")[0]}</span>
                <span>{info.message}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
