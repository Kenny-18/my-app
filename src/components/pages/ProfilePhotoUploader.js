"use client"

import { useState, useRef } from "react"
import { storage, database } from "../firebase"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { ref as dbRef, update } from "firebase/database"
import "./ProfilePhotoUploader.css"

export default function ProfilePhotoUploader({ currentPhotoURL, onPhotoUpdate, userId }) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const fileInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

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

    setUploading(true)
    setError("")
    setSuccess(false)
    setUploadProgress(0)

    try {
      // Crear referencia para el archivo en Firebase Storage
      const fileRef = storageRef(storage, `profile-photos/${userId}/${Date.now()}-${file.name}`)

      // Subir archivo
      await uploadBytes(fileRef, file)

      // Simular progreso de carga
      const simulateProgress = () => {
        setUploadProgress((prev) => {
          if (prev < 90) {
            return prev + 10
          }
          return prev
        })
      }

      const progressInterval = setInterval(simulateProgress, 200)

      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(fileRef)

      clearInterval(progressInterval)
      setUploadProgress(100)

      // Actualizar URL en la base de datos
      const userProfileRef = dbRef(database, `portfolios/${userId}/personalInfo`)
      await update(userProfileRef, { photoURL: downloadURL })

      // Actualizar estado local
      onPhotoUpdate(downloadURL)

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error al subir la imagen:", error)
      setError("Error al subir la imagen. Inténtalo de nuevo.")
    } finally {
      setUploading(false)
      // Limpiar el input de archivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSelectFile = () => {
    fileInputRef.current.click()
  }

  return (
    <div className="photo-uploader-container">
      <h2>Foto de Perfil</h2>
      <p className="form-description">
        Sube una foto de perfil para personalizar tu portafolio. Se recomienda una imagen cuadrada.
      </p>

      <div className="photo-preview-container">
        <img
          src={currentPhotoURL || "/placeholder.svg"}
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
    </div>
  )
}
