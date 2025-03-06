import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Link } from 'react-router-dom';
import './Navbar.css';
import video from '../videos/Fondo.mp4';

function Navbar() {
  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true);

  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false);

  const showButton = () => {
    if (window.innerWidth <= 960) {
      setButton(false);
    } else {
      setButton(true);
    }
  };
  useEffect(() => {
    showButton();
  }, []);
  window.addEventListener('resize', showButton);
  return (
    <>
    <video src={video} autoPlay loop muted /> 
      <nav className='navbar'>
        <div className='navbar-container'>
          <Link to='/' className='navbar-logo' onClick={closeMobileMenu}>
            Leng. Programacion III
          </Link>
          <div className='menu-icon' onClick={handleClick}>
            <i className={click ? 'fas fa-times' : 'fas fa-bars'} />
          </div>
          <ul className={click ? 'nav-menu active' : 'nav-menu'}>
            <li className='nav-item'>
              <Link to='/' className='nav-links' onClick={closeMobileMenu}>
                inicio
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/Experiencias'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                experiencias
              </Link>
            </li>
            <li className='nav-item'>
              <Link
                to='/Sobre_mi'
                className='nav-links'
                onClick={closeMobileMenu}
              >
                sobre mi
              </Link>
            </li>
          </ul>
          {button && (
  <Link to="/Sesion">
    <Button buttonStyle="btn--outline">Iniciar Sesión</Button>
  </Link>
)}

        </div>
      </nav>
    </>
  );
}

export default Navbar;