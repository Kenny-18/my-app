import React from 'react';
import './Segundaparte.css';
import CardItem from './CardItem';

function Segundaparte() {
  return (
    <div className='cards'>
      <h1 className='presentacion'>Presentacion</h1>
      <div className='cards__container'>
        <div className='cards__wrapper'>
          <ul className='cards__items'>
            <CardItem
              src='../images/img-1.jpg'
               alt='kenny'
               text='Mi nombre es Kenny y estoy en mi segundo año de universidad'
            />
            <CardItem
              src='../images/img-2.jpg'
              text='¡Hola! Soy Gelsin Maradiaga, estudiante de Informática Administrativa.
               Me dedico a aprender y mejorar en el uso de la tecnología para optimizar procesos.'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Segundaparte;