import "../App.css"
import "./Primerparte.css"
import video from "../videos/Fondo.mp4"
import { Link } from "react-router-dom"

function Primerparte() {
  return (
    <div className="hero-container">
      <video src={video} autoPlay loop muted />
      <h1>Tu Portafolio</h1>
      <p>Crea tu portafolio profesional en minutos</p>
      <div className="hero-btns">
        <Link to="/Sesion" className="btn-mobile">
          <button className="btn btn--outline btn--large">COMENZAR AHORA</button>
        </Link>
      </div>
    </div>
  )
}

export default Primerparte

