import React from 'react';
import '../../App.css';
import Terceraparte from '../Terceraparte';
import Primerparte from '../Primerparte';
import Segundaparte from '../Segundaparte';

function inicio() {
  return (
    <>
      <Primerparte />
      <Segundaparte />
      <Terceraparte />
    </>
  );
}

export default inicio;