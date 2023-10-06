import React, { useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from 'react-three-fiber';

import './App.css';

import Scene from './DistortionTransition';

import DistortionTransition from './DistortionTransition';
import photo1 from './assets/car1.jpg';
import photo2 from './assets/car2.jpg';
import displacment from './assets/road.jpg';
import displacment2 from './assets/displacment5.jpg';
import green from './assets/plant1.jpg'

function App() {



  return (
    <div style={{ display: "flex", justifyContent: "center" }}>

      <DistortionTransition photo1={photo1} photo2={displacment} displacment={displacment} angle1={0} angle2={0} />
      <DistortionTransition photo1={photo2} photo2={green} displacment={displacment2} angle1={0} angle2={0} />
    </div>
  );
}

export default App;
