"use client"

import { useState, useRef, useEffect } from "react"
import { storage, database } from "../firebase"
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { ref as dbRef, update } from "firebase/database"
import "./ProfilePhotoUploader.css"
import ImageUploader from "../ImageUploader"
import { motion } from "framer-motion"

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

  // Función para subir la imagen directamente a Firebase
  const uploadImageToFirebase = async (file) => {
    if (!userId) {
      setError("Usuario no autenticado")
      addDebugInfo("Error: Usuario no autenticado")
      return null
    }

    setUploading(true)
    setError("")
    setUploadProgress(0)

    try {
      addDebugInfo(`Iniciando subida de imagen: ${file.name}`)

      // Crear una referencia única para el archivo
      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
      const filePath = `profile-photos/${userId}/${filename}`
      const fileRef = storageRef(storage, filePath)

      addDebugInfo(`Referencia creada: ${filePath}`)

      // Crear tarea de subida
      const uploadTask = uploadBytesResumable(fileRef, file)

      // Monitorear progreso
      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            setUploadProgress(progress)
            addDebugInfo(`Progreso: ${progress}%`)
          },
          (error) => {
            addDebugInfo(`Error en la subida: ${error.message}`)
            setError(`Error al subir: ${error.message}`)
            setUploading(false)
            reject(error)
          },
          async () => {
            try {
              // Obtener URL de descarga
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
              addDebugInfo(`Subida completada. URL: ${downloadURL}`)

              // Actualizar en la base de datos
              const userProfileRef = dbRef(database, `portfolios/${userId}/personalInfo`)
              await update(userProfileRef, { photoURL: downloadURL })
              addDebugInfo(`Base de datos actualizada`)

              setUploading(false)
              setSuccess(true)
              setTimeout(() => setSuccess(false), 3000)

              resolve(downloadURL)
            } catch (error) {
              addDebugInfo(`Error al finalizar: ${error.message}`)
              setError(`Error al finalizar: ${error.message}`)
              setUploading(false)
              reject(error)
            }
          },
        )
      })
    } catch (error) {
      addDebugInfo(`Error al iniciar la subida: ${error.message}`)
      setError(`Error al iniciar la subida: ${error.message}`)
      setUploading(false)
      return null
    }
  }

  // Manejador para cuando se selecciona un archivo
  const handleFileSelect = async (e) => {
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

    // Subir a Firebase
    try {
      const downloadURL = await uploadImageToFirebase(file)
      if (downloadURL) {
        onPhotoUpdate(downloadURL)
      }
    } catch (error) {
      console.error("Error al subir imagen:", error)
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="photo-uploader-container">
      <h2>Foto de Perfil</h2>
      <p className="form-description">
        Sube una foto de perfil para personalizar tu portafolio. Se recomienda una imagen cuadrada.
      </p>

      <div className="photo-preview-container">
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
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
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: "none" }}
          />

          <button className="select-photo-button" onClick={() => fileInputRef.current.click()} disabled={uploading}>
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i> Subiendo...
              </>
            ) : (
              <>
                <i className="fas fa-upload"></i> Seleccionar Imagen
              </>
            )}
          </button>

          <p className="photo-help-text">Formatos aceptados: JPEG, PNG, GIF, WebP. Tamaño máximo: 5MB.</p>

          {/* Alternativa usando ImageUploader */}
          <div style={{ marginTop: "20px" }}>
            <h4 style={{ marginBottom: "10px" }}>O usa el cargador avanzado:</h4>
            <ImageUploader
              onImageUpload={(imageData) => {
                if (imageData && imageData.url) {
                  onPhotoUpdate(imageData.url)

                  // También actualizar en la base de datos
                  if (userId) {
                    const userProfileRef = dbRef(database, `portfolios/${userId}/personalInfo`)
                    update(userProfileRef, { photoURL: imageData.url })
                      .then(() => {
                        addDebugInfo(`Base de datos actualizada con URL: ${imageData.url}`)
                        setSuccess(true)
                        setTimeout(() => setSuccess(false), 3000)
                      })
                      .catch((error) => {
                        addDebugInfo(`Error al actualizar base de datos: ${error.message}`)
                      })
                  }
                }
              }}
              userId={userId}
              path="profile-photos"
              allowMultiple={false}
              maxSize={5}
              acceptedTypes={["image/jpeg", "image/png", "image/webp", "image/gif"]}
              previewSize={{ width: 200, height: 200 }}
            />
          </div>
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
