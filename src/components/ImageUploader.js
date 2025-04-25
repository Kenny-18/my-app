"use client"

import { useState, useRef, useEffect } from "react"
import { storage } from "./firebase"
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { motion, AnimatePresence } from "framer-motion"

const ImageUploader = ({
  onImageUpload,
  userId,
  path = "images",
  allowMultiple = false,
  maxSize = 5, // en MB
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  aspectRatio = null, // ejemplo: 16/9, 1, 4/3, etc.
  previewSize = { width: 200, height: 200 },
  className = "",
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const fileInputRef = useRef(null)
  const [debugInfo, setDebugInfo] = useState([])

  // Función para añadir información de depuración
  const addDebugInfo = (message) => {
    console.log(message)
    setDebugInfo((prev) => [...prev, { time: new Date().toISOString(), message }])
  }

  // Limpiar URLs de objetos al desmontar
  useEffect(() => {
    return () => {
      previewImages.forEach((image) => {
        if (image.previewUrl) {
          URL.revokeObjectURL(image.previewUrl)
        }
      })
    }
  }, [previewImages])

  const validateFile = (file) => {
    // Validar tipo de archivo
    if (!acceptedTypes.includes(file.type)) {
      return `Tipo de archivo no válido. Formatos aceptados: ${acceptedTypes.map((type) => type.split("/")[1]).join(", ")}`
    }

    // Validar tamaño de archivo
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo es demasiado grande. Tamaño máximo: ${maxSize}MB`
    }

    return null
  }

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    setError("")
    setSuccess(false)
    addDebugInfo(`Archivos seleccionados: ${files.length}`)

    // Si no se permiten múltiples archivos, tomar solo el primero
    const filesToProcess = allowMultiple ? files : [files[0]]

    // Validar archivos
    for (const file of filesToProcess) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        addDebugInfo(`Error de validación: ${validationError}`)
        return
      }
    }

    // Crear previsualizaciones
    const newPreviews = filesToProcess.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: false,
      progress: 0,
      url: null,
      path: null,
    }))

    setPreviewImages((prev) => [...prev, ...newPreviews])
    addDebugInfo(`Previsualizaciones creadas: ${newPreviews.length}`)

    // Si se desea subir automáticamente
    if (userId) {
      await uploadFiles(newPreviews)
    } else {
      addDebugInfo("No hay userId, no se puede subir automáticamente")
    }

    // Limpiar input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadFiles = async (filesToUpload) => {
    if (!userId) {
      setError("Usuario no autenticado")
      addDebugInfo("Error: Usuario no autenticado")
      return
    }

    setUploading(true)
    addDebugInfo(`Iniciando carga de ${filesToUpload.length} archivos`)

    try {
      const uploadPromises = filesToUpload.map(async (fileObj, index) => {
        const file = fileObj.file
        const timestamp = Date.now()
        const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`
        const uploadPath = `${path}/${userId}/${filename}`

        addDebugInfo(`Preparando archivo ${index + 1}: ${filename}, ruta: ${uploadPath}`)

        // Crear referencia para el archivo en Firebase Storage
        const fileRef = storageRef(storage, uploadPath)

        // Crear la tarea de carga
        const uploadTask = uploadBytesResumable(fileRef, file)
        addDebugInfo(`Tarea de carga creada para ${filename}`)

        // Actualizar estado de previsualización con progreso
        return new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
              addDebugInfo(`Progreso de ${filename}: ${progress}%`)

              // Actualizar progreso en el array de previsualizaciones
              setPreviewImages((prev) =>
                prev.map((item, i) =>
                  item.previewUrl === fileObj.previewUrl ? { ...item, progress, uploading: true } : item,
                ),
              )

              // Actualizar progreso general (promedio de todos los archivos)
              const totalProgress =
                filesToUpload.reduce((acc, item, i) => {
                  if (i === index) return acc + progress
                  return acc + (item.progress || 0)
                }, 0) / filesToUpload.length

              setProgress(totalProgress)
            },
            (error) => {
              console.error("Error durante la carga:", error)
              addDebugInfo(`Error durante la carga de ${filename}: ${error.message}`)
              reject(error)
            },
            async () => {
              // Carga completada exitosamente
              try {
                // Obtener URL de descarga
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
                addDebugInfo(`Carga completada para ${filename}. URL: ${downloadURL}`)

                // Actualizar previsualización con URL final
                setPreviewImages((prev) =>
                  prev.map((item, i) =>
                    item.previewUrl === fileObj.previewUrl
                      ? {
                          ...item,
                          url: downloadURL,
                          path: uploadPath,
                          uploading: false,
                          progress: 100,
                        }
                      : item,
                  ),
                )

                // Resolver con los datos de la imagen
                resolve({
                  url: downloadURL,
                  path: uploadPath,
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  timestamp,
                })
              } catch (error) {
                console.error("Error al obtener URL:", error)
                addDebugInfo(`Error al obtener URL para ${filename}: ${error.message}`)
                reject(error)
              }
            },
          )
        })
      })

      // Esperar a que todas las cargas se completen
      const uploadedImages = await Promise.all(uploadPromises)
      addDebugInfo(`Todas las cargas completadas. Total: ${uploadedImages.length}`)

      // Llamar al callback con las imágenes subidas
      if (onImageUpload) {
        onImageUpload(allowMultiple ? uploadedImages : uploadedImages[0])
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Error en la subida:", error)
      addDebugInfo(`Error general en la subida: ${error.message}`)
      setError(`Error al subir: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const handleRemovePreview = (previewUrl, index) => {
    // Liberar URL de objeto
    URL.revokeObjectURL(previewUrl)
    addDebugInfo(`Eliminando previsualización ${index + 1}`)

    // Eliminar de la lista de previsualizaciones
    setPreviewImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSelectFiles = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div className={`image-uploader-container ${className}`}>
      <div className="image-uploader-dropzone">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept={acceptedTypes.join(",")}
          multiple={allowMultiple}
          className="image-uploader-input"
          disabled={uploading}
        />

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSelectFiles}
          className="image-uploader-button"
          disabled={uploading}
        >
          <i className="fas fa-cloud-upload-alt"></i>
          {uploading ? "Subiendo..." : "Seleccionar imagen"}
        </motion.button>

        <p className="image-uploader-help">
          {`Formatos aceptados: ${acceptedTypes.map((type) => type.split("/")[1]).join(", ")}. Tamaño máximo: ${maxSize}MB`}
        </p>
      </div>

      {/* Previsualizaciones */}
      {previewImages.length > 0 && (
        <div className="image-uploader-previews">
          <AnimatePresence>
            {previewImages.map((image, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="image-preview-item"
                style={{
                  width: previewSize.width,
                  height: previewSize.height,
                }}
              >
                <img
                  src={image.previewUrl || "/placeholder.svg"}
                  alt={`Vista previa ${index + 1}`}
                  className="image-preview"
                />

                {image.uploading && (
                  <div className="image-upload-progress">
                    <div className="image-upload-progress-bar" style={{ width: `${image.progress}%` }}></div>
                    <span className="image-upload-progress-text">{image.progress}%</span>
                  </div>
                )}

                <button
                  type="button"
                  className="image-preview-remove"
                  onClick={() => handleRemovePreview(image.previewUrl, index)}
                  disabled={image.uploading}
                >
                  <i className="fas fa-times"></i>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Mensajes de error y éxito */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="image-uploader-error"
          >
            <i className="fas fa-exclamation-circle"></i> {error}
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="image-uploader-success"
          >
            <i className="fas fa-check-circle"></i> Imagen subida correctamente
          </motion.div>
        )}
      </AnimatePresence>

      {/* Información de depuración */}
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

      {/* Estilos inline para el componente */}
      <style jsx>{`
        .image-uploader-container {
          margin-bottom: 20px;
        }
        
        .image-uploader-dropzone {
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          transition: all 0.3s ease;
        }
        
        .image-uploader-dropzone:hover {
          border-color: #13f0c4;
        }
        
        .image-uploader-input {
          display: none;
        }
        
        .image-uploader-button {
          background-color: #f0f0f0;
          color: #333;
          border: none;
          padding: 12px 20px;
          border-radius: 6px;
          font-size: 1rem;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .image-uploader-button:hover {
          background-color: #e0e0e0;
        }
        
        .image-uploader-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .image-uploader-help {
          font-size: 0.85rem;
          color: #777;
          margin-top: 10px;
        }
        
        .image-uploader-previews {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 15px;
        }
        
        .image-preview-item {
          position: relative;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .image-preview {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .image-preview-remove {
          position: absolute;
          top: 5px;
          right: 5px;
          background-color: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.3s ease;
        }
        
        .image-preview-remove:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }
        
        .image-upload-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 24px;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
        }
        
        .image-upload-progress-bar {
          height: 100%;
          background-color: #13f0c4;
          transition: width 0.3s ease;
        }
        
        .image-upload-progress-text {
          position: absolute;
          width: 100%;
          text-align: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        
        .image-uploader-error {
          background-color: #fdeded;
          color: #d32f2f;
          padding: 10px 15px;
          border-radius: 6px;
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .image-uploader-success {
          background-color: #e6f7ef;
          color: #2e7d32;
          padding: 10px 15px;
          border-radius: 6px;
          margin-top: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
      `}</style>
    </div>
  )
}

export default ImageUploader
