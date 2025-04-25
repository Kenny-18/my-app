import "./Terceraparte.css"
import { Link } from "react-router-dom"
import video from "../videos/Fondo.mp4"

function Terceraparte() {
  return (
    <div className="footer-container">
      <video src={video} autoPlay loop muted />
      <section className="footer-subscription"></section>
      <div className="footer-links">
        <div className="footer-link-wrapper">
          <div className="footer-link-items">
            <h2>Recursos</h2>
            <Link to="/">Tutoriales</Link>
            <Link to="/">Plantillas</Link>
            <Link to="/">Ejemplos</Link>
            <Link to="/">FAQ</Link>
          </div>
          <div className="footer-link-items">
            <h2>Contacto</h2>
            <Link to="https://wa.me/+50431538299">WhatsApp</Link>
            <Link to="/">Soporte</Link>
            <Link to="/">Feedback</Link>
            <Link to="/">Colaboraciones</Link>
          </div>
        </div>
      </div>
      <section className="social-media">
        <div className="social-media-wrap">
          <div className="footer-logo"></div>
          <div className="social-icons">
            <a
              className="social-icon-link facebook"
              href="https://www.facebook.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <i className="fab fa-facebook-f" />
            </a>
            <a
              className="social-icon-link instagram"
              href="https://www.instagram.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram" />
            </a>
            <a
              className="social-icon-link youtube"
              href="https://www.youtube.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Youtube"
            >
              <i className="fab fa-youtube" />
            </a>
            <a
              className="social-icon-link twitter"
              href="https://twitter.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
            >
              <i className="fab fa-twitter" />
            </a>
            <a
              className="social-icon-link linkedin"
              href="https://www.linkedin.com/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="fab fa-linkedin" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Terceraparte
