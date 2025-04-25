import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

// Función para exportar el portafolio a PDF
export const exportToPdf = async (portfolioData, elementId = "portfolio-preview") => {
  try {
    // Obtener el elemento que contiene el portafolio
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Elemento no encontrado")
    }

    // Mostrar mensaje de carga
    const loadingToast = showLoadingToast("Generando PDF...")

    // Configuración del PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // Título del documento
    const title = `Portafolio_${portfolioData.personalInfo?.fullName || "Usuario"}`

    // Capturar el elemento como imagen
    const canvas = await html2canvas(element, {
      scale: 2, // Mayor escala para mejor calidad
      useCORS: true, // Permitir imágenes de otros dominios
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    // Convertir canvas a imagen
    const imgData = canvas.toDataURL("image/jpeg", 1.0)

    // Dimensiones del PDF (A4)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calcular proporciones para mantener el aspecto
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const ratio = canvasWidth / canvasHeight

    const imgWidth = pdfWidth
    const imgHeight = imgWidth / ratio
    let currentPosition = 0

    // Si la imagen es más alta que una página, dividirla en múltiples páginas
    while (currentPosition < canvasHeight) {
      // Añadir página excepto en la primera iteración
      if (currentPosition > 0) {
        pdf.addPage()
      }

      // Calcular la porción de la imagen a mostrar en esta página
      const remainingHeight = canvasHeight - currentPosition
      const heightOnThisPage = Math.min(remainingHeight, canvasHeight * (pdfHeight / imgHeight))
      // eslint-disable-next-line no-unused-vars
      const heightRatio = heightOnThisPage / canvasHeight

      // Añadir la porción de la imagen al PDF
      pdf.addImage(
        imgData,
        "JPEG",
        0,
        -currentPosition * (pdfHeight / imgHeight),
        pdfWidth,
        canvasHeight * (pdfWidth / canvasWidth),
        null,
        "FAST",
      )

      // Actualizar la posición para la siguiente página
      currentPosition += heightOnThisPage
    }

    // Cerrar mensaje de carga
    hideLoadingToast(loadingToast)

    // Guardar el PDF
    pdf.save(`${title}.pdf`)

    // Mostrar mensaje de éxito
    showSuccessToast("PDF generado correctamente")

    return true
  } catch (error) {
    console.error("Error al exportar a PDF:", error)
    showErrorToast("Error al generar el PDF. Inténtalo de nuevo.")
    return false
  }
}

// Funciones auxiliares para mostrar mensajes
const showLoadingToast = (message) => {
  // Crear elemento de toast
  const toast = document.createElement("div")
  toast.className = "pdf-loading-toast"
  toast.innerHTML = `
    <div class="pdf-toast-content">
      <div class="pdf-toast-spinner"></div>
      <span>${message}</span>
    </div>
  `

  // Estilos para el toast
  toast.style.position = "fixed"
  toast.style.bottom = "20px"
  toast.style.right = "20px"
  toast.style.backgroundColor = "#333"
  toast.style.color = "#fff"
  toast.style.padding = "15px 20px"
  toast.style.borderRadius = "5px"
  toast.style.zIndex = "9999"
  toast.style.display = "flex"
  toast.style.alignItems = "center"
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"

  // Estilos para el spinner
  const style = document.createElement("style")
  style.innerHTML = `
    .pdf-toast-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .pdf-toast-spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #13f0c4;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(style)

  // Añadir al DOM
  document.body.appendChild(toast)

  return toast
}

const hideLoadingToast = (toast) => {
  if (toast && toast.parentNode) {
    toast.parentNode.removeChild(toast)
  }
}

const showSuccessToast = (message) => {
  // Crear elemento de toast
  const toast = document.createElement("div")
  toast.className = "pdf-success-toast"
  toast.innerHTML = `
    <div class="pdf-toast-content">
      <i class="fas fa-check-circle" style="color: #13f0c4;"></i>
      <span>${message}</span>
    </div>
  `

  // Estilos para el toast
  toast.style.position = "fixed"
  toast.style.bottom = "20px"
  toast.style.right = "20px"
  toast.style.backgroundColor = "#333"
  toast.style.color = "#fff"
  toast.style.padding = "15px 20px"
  toast.style.borderRadius = "5px"
  toast.style.zIndex = "9999"
  toast.style.display = "flex"
  toast.style.alignItems = "center"
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"

  // Añadir al DOM
  document.body.appendChild(toast)

  // Eliminar después de 3 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}

const showErrorToast = (message) => {
  // Crear elemento de toast
  const toast = document.createElement("div")
  toast.className = "pdf-error-toast"
  toast.innerHTML = `
    <div class="pdf-toast-content">
      <i class="fas fa-exclamation-circle" style="color: #ff6b6b;"></i>
      <span>${message}</span>
    </div>
  `

  // Estilos para el toast
  toast.style.position = "fixed"
  toast.style.bottom = "20px"
  toast.style.right = "20px"
  toast.style.backgroundColor = "#333"
  toast.style.color = "#fff"
  toast.style.padding = "15px 20px"
  toast.style.borderRadius = "5px"
  toast.style.zIndex = "9999"
  toast.style.display = "flex"
  toast.style.alignItems = "center"
  toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"

  // Añadir al DOM
  document.body.appendChild(toast)

  // Eliminar después de 3 segundos
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}
