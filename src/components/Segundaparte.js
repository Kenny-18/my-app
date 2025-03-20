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
          <h1 className='informacion'>para esta pagina puedes crear su respecivo portafolio con su informacion
            personal completamente segura
          </h1>
            <CardItem
              src='../images/portafolio.jpg'
            />
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Segundaparte;