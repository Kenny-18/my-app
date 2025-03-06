import React from 'react';
import '../App.css';
import './Primerparte.css';
import video from '../videos/Fondo.mp4';

function Primerparte() {
  return (
    <div className='hero-container'>
      <video src={video} autoPlay loop muted /> 
      <h1>Nuestra pagina web</h1>
      <p>este es el portafolio para nuestro proyecto para la clase de lenguaje III</p>
    </div>
  );
}

export default Primerparte;