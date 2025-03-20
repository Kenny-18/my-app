import React from 'react';
import Navbar from './components/Navbar';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inicio from './components/pages/inicio';
import Sesion from './components/pages/Sesion';
function App() {
<head>
	<meta charset="utf-8"/>
	<title>portafolios</title>
</head>
  return (
    <Router>
      <Navbar />
      <Routes>
       <Route path="/" element={<Inicio />} />
       <Route path="/Sesion" element={<Sesion />} />
      </Routes>
    </Router>
  );
}

export default App;
