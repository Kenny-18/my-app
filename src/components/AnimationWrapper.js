"use client"
import { motion } from "framer-motion"

// Componente de envoltura para animaciones
const AnimationWrapper = ({ children, animation = "fade", duration = 0.5, delay = 0, className = "", ...props }) => {
  // Definir variantes de animación
  const variants = {
    // Animación de desvanecimiento
    fade: {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    // Animación de deslizamiento desde abajo
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 },
    },
    // Animación de deslizamiento desde la izquierda
    slideRight: {
      hidden: { opacity: 0, x: -20 },
      visible: { opacity: 1, x: 0 },
    },
    // Animación de deslizamiento desde la derecha
    slideLeft: {
      hidden: { opacity: 0, x: 20 },
      visible: { opacity: 1, x: 0 },
    },
    // Animación de escala
    scale: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: { opacity: 1, scale: 1 },
    },
    // Animación de rotación
    rotate: {
      hidden: { opacity: 0, rotate: -5 },
      visible: { opacity: 1, rotate: 0 },
    },
  }

  // Seleccionar la variante de animación
  const selectedVariant = variants[animation] || variants.fade

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={selectedVariant}
      transition={{
        duration,
        delay,
        ease: "easeOut",
      }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  )
}

export default AnimationWrapper
