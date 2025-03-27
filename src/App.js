import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './components/pages/inicio'; 
import Sesion from './components/pages/Sesion';
import SobreMi from './components/pages/Sobre_mi';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/Sesion" element={<Sesion />} />
        <Route path="/SobreMi" element={<SobreMi />} />
      </Routes>
    </Router>
  );
}

export default App;
