// Versión simplificada de animaciones sin dependencias externas

// Función para añadir animaciones a elementos
export const addAnimation = (element, animationType, duration = 500, delay = 0) => {
  if (!element) return

  // Definir estilos iniciales según el tipo de animación
  switch (animationType) {
    case "fade":
      element.style.opacity = "0"
      break
    case "slideUp":
      element.style.opacity = "0"
      element.style.transform = "translateY(20px)"
      break
    case "slideRight":
      element.style.opacity = "0"
      element.style.transform = "translateX(-20px)"
      break
    case "slideLeft":
      element.style.opacity = "0"
      element.style.transform = "translateX(20px)"
      break
    case "scale":
      element.style.opacity = "0"
      element.style.transform = "scale(0.8)"
      break
    default:
      element.style.opacity = "0"
  }

  // Añadir transición
  element.style.transition = `opacity ${duration}ms, transform ${duration}ms`
  element.style.transitionDelay = `${delay}ms`

  // Aplicar animación después de un pequeño retraso para asegurar que los estilos iniciales se apliquen
  setTimeout(() => {
    element.style.opacity = "1"
    element.style.transform = "translateY(0) translateX(0) scale(1)"
  }, 10)
}

// Función para animar elementos en secuencia
export const animateSequence = (elements, animationType, duration = 500, delayBetween = 100) => {
  if (!elements || !elements.length) return

  elements.forEach((element, index) => {
    addAnimation(element, animationType, duration, index * delayBetween)
  })
}

// Función para animar entrada/salida
export const animateTransition = (exitingElement, enteringElement, animationType = "fade", duration = 500) => {
  if (!exitingElement || !enteringElement) return

  // Ocultar elemento entrante inicialmente
  enteringElement.style.display = "none"

  // Animar salida
  switch (animationType) {
    case "fade":
      exitingElement.style.opacity = "0"
      break
    case "slideUp":
      exitingElement.style.opacity = "0"
      exitingElement.style.transform = "translateY(-20px)"
      break
    case "slideDown":
      exitingElement.style.opacity = "0"
      exitingElement.style.transform = "translateY(20px)"
      break
    default:
      exitingElement.style.opacity = "0"
  }

  exitingElement.style.transition = `opacity ${duration}ms, transform ${duration}ms`

  // Después de la animación de salida, mostrar y animar entrada
  setTimeout(() => {
    exitingElement.style.display = "none"
    enteringElement.style.display = ""

    // Configurar estado inicial para animación de entrada
    switch (animationType) {
      case "fade":
        enteringElement.style.opacity = "0"
        break
      case "slideUp":
        enteringElement.style.opacity = "0"
        enteringElement.style.transform = "translateY(20px)"
        break
      case "slideDown":
        enteringElement.style.opacity = "0"
        enteringElement.style.transform = "translateY(-20px)"
        break
      default:
        enteringElement.style.opacity = "0"
    }

    enteringElement.style.transition = `opacity ${duration}ms, transform ${duration}ms`

    // Aplicar animación de entrada
    setTimeout(() => {
      enteringElement.style.opacity = "1"
      enteringElement.style.transform = "translateY(0)"
    }, 10)
  }, duration)
}

// Clase CSS para animaciones
export const addAnimationStyles = () => {
  const style = document.createElement("style")
  style.innerHTML = `
    .animate-fade-in {
      animation: fadeIn 0.5s ease forwards;
    }
    
    .animate-slide-up {
      animation: slideUp 0.5s ease forwards;
    }
    
    .animate-slide-right {
      animation: slideRight 0.5s ease forwards;
    }
    
    .animate-scale {
      animation: scale 0.5s ease forwards;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideRight {
      from { opacity: 0; transform: translateX(-20px); }
      to { opacity: 1; transform: translateX(0); }
    }
    
    @keyframes scale {
      from { opacity: 0; transform: scale(0.8); }
      to { opacity: 1; transform: scale(1); }
    }
    
    .button-hover-effect {
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    
    .button-hover-effect:hover {
      transform: translateY(-3px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  `

  document.head.appendChild(style)
}
