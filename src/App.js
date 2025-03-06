import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './components/pages/inicio';
import SobreMi from './components/pages/Sobre_mi';
import Experiencias from './components/pages/Experiencias';
import Sesion from './components/pages/Sesion';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
       <Route path="/" element={<Inicio />} />
       <Route path="/Experiencias" element={<Experiencias />} />
       <Route path="/Sobre_mi" element={<SobreMi />} />
       <Route path="/Sesion" element={<Sesion />} />
      </Routes>

    </Router>
  );
}

export default App;
