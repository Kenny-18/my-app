// Replace the entire file with this improved version that directly downloads a PDF
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

export const exportToPdf = async (portfolioData, elementId = "portfolio-preview-container") => {
  try {
    // Show loading toast
    const loadingToast = showLoadingToast("Generando PDF...")

    // Get the element containing the portfolio
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error("Elemento no encontrado")
    }

    // Capture the element as an image
    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true, // Allow images from other domains
      logging: false,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    // Convert canvas to image
    const imgData = canvas.toDataURL("image/jpeg", 1.0)

    // Create PDF document (A4 size)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    // PDF dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()

    // Calculate proportions to maintain aspect ratio
    const canvasWidth = canvas.width
    const canvasHeight = canvas.height
    const ratio = canvasWidth / canvasHeight

    const imgWidth = pdfWidth
    const imgHeight = imgWidth / ratio
    let currentPosition = 0

    // If the image is taller than one page, split it into multiple pages
    while (currentPosition < canvasHeight) {
      // Add page except on first iteration
      if (currentPosition > 0) {
        pdf.addPage()
      }

      // Calculate the portion of the image to show on this page
      const remainingHeight = canvasHeight - currentPosition
      const heightOnThisPage = Math.min(remainingHeight, canvasHeight * (pdfHeight / imgHeight))

      // Add the portion of the image to the PDF
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

      // Update position for next page
      currentPosition += heightOnThisPage
    }

    // Hide loading toast
    hideLoadingToast(loadingToast)

    // Generate filename
    const fileName = `Portafolio_${portfolioData.personalInfo?.fullName || "Usuario"}.pdf`

    // Save the PDF (triggers download)
    pdf.save(fileName)

    // Show success message
    showSuccessToast("PDF descargado correctamente")

    return true
  } catch (error) {
    console.error("Error al exportar a PDF:", error)
    showErrorToast("Error al generar el PDF. Inténtalo de nuevo.")
    return false
  }
}

// Helper functions for showing messages
const showLoadingToast = (message) => {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = "pdf-loading-toast"
  toast.innerHTML = `
    <div class="pdf-toast-content">
      <div class="pdf-toast-spinner"></div>
      <span>${message}</span>
    </div>
  `

  // Styles for toast
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

  // Styles for spinner
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

  // Add to DOM
  document.body.appendChild(toast)

  return toast
}

const hideLoadingToast = (toast) => {
  if (toast && toast.parentNode) {
    toast.parentNode.removeChild(toast)
  }
}

const showSuccessToast = (message) => {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = "pdf-success-toast"
  toast.innerHTML = `
    <div class="pdf-toast-content">
      <i class="fas fa-check-circle" style="color: #13f0c4;"></i>
      <span>${message}</span>
    </div>
  `

  // Styles for toast
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

  // Add to DOM
  document.body.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}

const showErrorToast = (message) => {
  // Create toast element
  const toast = document.createElement("div")
  toast.className = "pdf-error-toast"
  toast.innerHTML = `
    <div class="pdf-toast-content">
      <i class="fas fa-exclamation-circle" style="color: #ff6b6b;"></i>
      <span>${message}</span>
    </div>
  `

  // Styles for toast
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

  // Add to DOM
  document.body.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast)
    }
  }, 3000)
}
