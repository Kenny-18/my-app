import { ref, set, get, onValue, update } from "firebase/database"
import { database, auth } from "./firebase"

// Función para guardar datos del portafolio en Firebase
export const savePortfolioData = async (section, data) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const portfolioRef = ref(database, `portfolios/${user.uid}/${section}`)
    await set(portfolioRef, data)
    return true
  } catch (error) {
    console.error(`Error al guardar datos de ${section}:`, error)
    return false
  }
}

// Función para obtener datos del portafolio desde Firebase
export const getPortfolioData = async (section) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const portfolioRef = ref(database, `portfolios/${user.uid}/${section}`)
    const snapshot = await get(portfolioRef)

    if (snapshot.exists()) {
      return snapshot.val()
    } else {
      return null
    }
  } catch (error) {
    console.error(`Error al obtener datos de ${section}:`, error)
    return null
  }
}

// Función para escuchar cambios en los datos del portafolio
export const listenToPortfolioData = (section, callback) => {
  const user = auth.currentUser
  if (!user) {
    return null
  }

  const portfolioRef = ref(database, `portfolios/${user.uid}/${section}`)
  const unsubscribe = onValue(portfolioRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val())
    } else {
      callback(null)
    }
  })

  return unsubscribe
}

// Función para actualizar parcialmente los datos del portafolio
export const updatePortfolioData = async (section, updates) => {
  try {
    const user = auth.currentUser
    if (!user) {
      throw new Error("Usuario no autenticado")
    }

    const portfolioRef = ref(database, `portfolios/${user.uid}/${section}`)
    await update(portfolioRef, updates)
    return true
  } catch (error) {
    console.error(`Error al actualizar datos de ${section}:`, error)
    return false
  }
}

// Función para cargar todos los datos del portafolio de un usuario
export const loadFullPortfolio = async () => {
  try {
    const user = auth.currentUser
    if (!user) {
      console.log("No hay usuario autenticado para cargar el portafolio")
      return null
    }

    console.log("Intentando cargar portafolio para:", user.uid)
    const portfolioRef = ref(database, `portfolios/${user.uid}`)
    const snapshot = await get(portfolioRef)

    if (snapshot.exists()) {
      console.log("Portafolio encontrado en Firebase")
      return snapshot.val()
    } else {
      console.log("No se encontró portafolio, creando estructura básica")
      // Retornar estructura básica si no existe
      return {
        personalInfo: {
          fullName: user.displayName || "",
          profession: "Desarrollador Web",
          email: user.email || "",
          phone: "",
          location: "Ciudad, País",
          bio: "Escribe aquí una breve descripción sobre ti y tus habilidades profesionales.",
          website: "",
          linkedin: "",
          github: "",
        },
        education: [],
        experience: [],
        skills: ["HTML", "CSS", "JavaScript", "React"],
        projects: [
          { title: "Proyecto 1", description: "Descripción del proyecto 1" },
          { title: "Proyecto 2", description: "Descripción del proyecto 2" },
        ],
      }
    }
  } catch (error) {
    console.error("Error al cargar el portafolio completo:", error)
    // Retornar estructura básica en caso de error
    return {
      personalInfo: {},
      education: [],
      experience: [],
      skills: [],
      projects: [],
    }
  }
}
