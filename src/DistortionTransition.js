import React, { useEffect, useRef, useState, } from 'react';
import { useFrame, useLoader, useThree, Canvas } from '@react-three/fiber';
import { Plane } from '@react-three/drei';

import { TextureLoader } from 'three';
import glsl from 'babel-plugin-glsl/macro';
import { TweenMax, Expo, gsap } from 'gsap';
import { OrthographicCamera } from '@react-three/drei';

function Scene({ photo1, photo2, displacment, intensity1, intensity2, angle1, angle2 }) {
    const meshRef = useRef(null);
    const [dispFactor, setDispFactor] = useState(0);

    const image1 = useLoader(TextureLoader, photo1);
    const image2 = useLoader(TextureLoader, photo2);
    const displacementTexture = useLoader(TextureLoader, displacment);


    const { gl, camera, viewport } = useThree();
    const planeWidth = viewport.width;
    const planeHeight = viewport.height;


    useEffect(() => {
        const handleResize = () => {
            gl.setSize(window.innerWidth, window.innerHeight);

            const aspect = window.innerWidth / window.innerHeight;
            const zoom = 5; // This can be adjusted to suit your needs
            camera.left = -zoom * aspect;
            camera.right = zoom * aspect;
            camera.top = zoom;
            camera.bottom = -zoom;
            camera.updateProjectionMatrix();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [gl, camera]);


    const vertexShader = glsl`
        varying vec2 vUv;
        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = glsl`
    varying vec2 vUv;

    uniform float dispFactor;
    uniform sampler2D displacementTexture;

    
    uniform sampler2D texture1;
    uniform sampler2D texture2;
    uniform float angle1;
    uniform float angle2;
    uniform float intensity1;
    uniform float intensity2;
    
    mat2 getRotM(float angle) {
      float s = sin(angle);
      float c = cos(angle);
      return mat2(c, -s, s, c);
    }
    
    void main() {
      vec4 displacementTexture = texture2D(displacementTexture, vUv);
      vec2 dispVec = vec2(displacementTexture.r, displacementTexture.g);
      vec2 distortedPosition1 = vUv + getRotM(angle1) * dispVec * intensity1 * dispFactor;
      vec2 distortedPosition2 = vUv + getRotM(angle2) * dispVec * intensity2 * (1.0 - dispFactor);
      vec4 _texture1 = texture2D(texture1, distortedPosition1);
      vec4 _texture2 = texture2D(texture2, distortedPosition2);
      gl_FragColor = mix(_texture1, _texture2, dispFactor);
    }
    `;




    function transitionIn() {
        gsap.killTweensOf(meshRef.current.material.uniforms.dispFactor);
        gsap.to(meshRef.current.material.uniforms.dispFactor, 1.4, {
            value: 1,
            ease: Expo.easeInOut,

        });
    }

    function transitionOut() {
        gsap.killTweensOf(meshRef.current.material.uniforms.dispFactor);

        gsap.to(meshRef.current.material.uniforms.dispFactor, 1.4, {
            value: 0,
            ease: Expo.easeInOut
        });
    }


    return (



        <Plane
            ref={meshRef}
            args={[planeWidth, planeHeight]}
            onPointerOver={transitionIn}
            onPointerOut={transitionOut}
        >
            <shaderMaterial
                attach="material"
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={{
                    texture1: { value: image1 },
                    texture2: { value: image2 },
                    displacementTexture: { value: displacementTexture },
                    dispFactor: { value: dispFactor },
                    angle1: { value: angle1 },
                    angle2: { value: angle2 },
                    intensity1: { value: intensity1 },
                    intensity2: { value: intensity2 }
                }}
                transparent={true}
            />
        </Plane>
    );
}

function DistortionTransition({
    photo1,
    photo2,
    displacment,
    intensity1 = 0.4,
    intensity2 = 0.4,
    angle1 = 0.4,
    angle2 = 0.4
}) {
    const [key, setKey] = useState(0);  // Step 1: Initialize the key state

    useEffect(() => {
        const handleResize = () => {
            setKey(prevKey => prevKey + 1);  // Step 2: Update the key on window resize
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Canvas
            key={key}  // Attach the key to the Canvas
            style={{ height: "100vh", width: "40%" }}
            className="App"
            camera={{ position: [0, 0, 5] }}
            colorManagement
        >
            <color attach="background" args={['#e0e0e0']} />
            <Scene
                photo1={photo1}
                photo2={photo2}
                displacment={displacment}
                intensity1={intensity1}
                intensity2={intensity2}
                angle1={angle1}
                angle2={angle2}
            />
            <OrthographicCamera />
        </Canvas>
    );
}



export default DistortionTransition;