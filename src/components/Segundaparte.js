import "./Segundaparte.css"
import { Link } from "react-router-dom"

function Segundaparte() {
  return (
    <div className="cards">
      <h1 className="presentacion">¿Por qué crear tu portafolio?</h1>
      <div className="cards__container">
        <div className="cards__wrapper">
          <ul className="cards__items">
            <div className="feature-card">
              <i className="fas fa-laptop-code feature-icon"></i>
              <h2>Muestra tu trabajo</h2>
              <p>Exhibe tus proyectos y habilidades de forma profesional</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-user-tie feature-icon"></i>
              <h2>Destaca profesionalmente</h2>
              <p>Aumenta tus oportunidades laborales con un portafolio atractivo</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-rocket feature-icon"></i>
              <h2>Fácil de crear</h2>
              <p>Interfaz intuitiva para diseñar tu portafolio sin conocimientos técnicos</p>
            </div>
          </ul>
          <div className="cta-container">
            <h3>¿Listo para comenzar?</h3>
            <Link to="/Sesion" className="cta-button">
              Crear mi portafolio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Segundaparte
