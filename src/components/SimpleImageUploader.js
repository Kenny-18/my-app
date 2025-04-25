// Versión simplificada del cargador de imágenes sin dependencias externas

export default function SimpleImageUploader({
  onImageUpload,
  userId,
  path = "images",
  allowMultiple = false,
  maxSize = 5, // en MB
  acceptedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"],
  className = "",
}) {
  // Crear elementos del DOM
  const container = document.createElement("div")
  container.className = `simple-image-uploader ${className}`

  // Crear input de archivo
  const fileInput = document.createElement("input")
  fileInput.type = "file"
  fileInput.accept = acceptedTypes.join(",")
  fileInput.multiple = allowMultiple
  fileInput.style.display = "none"

  // Crear botón para seleccionar archivos
  const selectButton = document.createElement("button")
  selectButton.type = "button"
  selectButton.className = "image-uploader-button"
  selectButton.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> Seleccionar imagen'

  // Crear contenedor de previsualizaciones
  const previewsContainer = document.createElement("div")
  previewsContainer.className = "image-uploader-previews"

  // Crear mensaje de ayuda
  const helpText = document.createElement("p")
  helpText.className = "image-uploader-help"
  helpText.textContent = `Formatos aceptados: ${acceptedTypes.map((type) => type.split("/")[1]).join(", ")}. Tamaño máximo: ${maxSize}MB`

  // Crear contenedor para mensajes
  const messagesContainer = document.createElement("div")
  messagesContainer.className = "image-uploader-messages"

  // Añadir elementos al contenedor principal
  container.appendChild(fileInput)
  container.appendChild(selectButton)
  container.appendChild(helpText)
  container.appendChild(previewsContainer)
  container.appendChild(messagesContainer)

  // Función para validar archivos
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

  // Función para mostrar mensaje de error
  const showError = (message) => {
    const errorDiv = document.createElement("div")
    errorDiv.className = "image-uploader-error"
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`

    messagesContainer.innerHTML = ""
    messagesContainer.appendChild(errorDiv)

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv)
      }
    }, 3000)
  }

  // Función para mostrar mensaje de éxito
  const showSuccess = (message) => {
    const successDiv = document.createElement("div")
    successDiv.className = "image-uploader-success"
    successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`

    messagesContainer.innerHTML = ""
    messagesContainer.appendChild(successDiv)

    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv)
      }
    }, 3000)
  }

  // Función para crear previsualización
  const createPreview = (file) => {
    const previewItem = document.createElement("div")
    previewItem.className = "image-preview-item"

    const img = document.createElement("img")
    img.className = "image-preview"
    img.src = URL.createObjectURL(file)
    img.alt = "Vista previa"

    const removeButton = document.createElement("button")
    removeButton.type = "button"
    removeButton.className = "image-preview-remove"
    removeButton.innerHTML = '<i class="fas fa-times"></i>'

    previewItem.appendChild(img)
    previewItem.appendChild(removeButton)
    previewsContainer.appendChild(previewItem)

    // Evento para eliminar previsualización
    removeButton.addEventListener("click", () => {
      URL.revokeObjectURL(img.src)
      previewsContainer.removeChild(previewItem)
    })

    return {
      element: previewItem,
      file,
      url: img.src,
    }
  }

  // Evento para seleccionar archivos
  selectButton.addEventListener("click", () => {
    fileInput.click()
  })

  // Evento para procesar archivos seleccionados
  fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Si no se permiten múltiples archivos, tomar solo el primero
    const filesToProcess = allowMultiple ? files : [files[0]]

    // Validar archivos
    for (const file of filesToProcess) {
      const validationError = validateFile(file)
      if (validationError) {
        showError(validationError)
        return
      }
    }

    // Crear previsualizaciones
    const previews = filesToProcess.map((file) => createPreview(file))

    // Simular carga exitosa
    setTimeout(() => {
      showSuccess("Imágenes cargadas correctamente")

      // Llamar al callback con datos simulados
      if (onImageUpload) {
        const uploadedImages = previews.map((preview) => ({
          url: preview.url,
          path: `${path}/${userId}/${Date.now()}-${preview.file.name}`,
          name: preview.file.name,
          type: preview.file.type,
          size: preview.file.size,
          timestamp: Date.now(),
        }))

        onImageUpload(allowMultiple ? uploadedImages : uploadedImages[0])
      }
    }, 1000)

    // Limpiar input
    fileInput.value = ""
  })

  // Añadir estilos
  const style = document.createElement("style")
  style.innerHTML = `
    .simple-image-uploader {
      margin-bottom: 20px;
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
      transform: translateY(-2px);
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
      width: 100px;
      height: 100px;
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
  `

  document.head.appendChild(style)

  return container
}
