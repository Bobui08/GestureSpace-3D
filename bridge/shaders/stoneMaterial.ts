import { shaderMaterial } from '@react-three/drei'
import * as THREE from 'three'
import { extend } from '@react-three/fiber'

const StoneMaterial = shaderMaterial(
    {
        time: 0,
        color: new THREE.Color(0.2, 0.6, 1.0),
        hover: 0
    },
    // Vertex Shader
    `
    varying vec2 vUv;
    varying vec3 vNormal;
    uniform float time;
    uniform float hover;

    // Simplex Noise (simplified) function would go here
    // For brevity using sine waves displacement
    
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      
      vec3 pos = position;
      // Gentle floating/breathing pulse
      float noise = sin(pos.x * 5.0 + time) * sin(pos.y * 5.0 + time) * 0.02;
      
      // Hover expansion
      float scale = 1.0 + hover * 0.1;
      
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos * scale + normal * noise, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float time;
    uniform vec3 color;
    uniform float hover;
    varying vec2 vUv;
    varying vec3 vNormal;

    void main() {
      // Basic rim lighting and noise color variation
      vec3 viewDir = normalize(cameraPosition - vNormal); // Approximation
      // Actually vNormal is in view space if using normalMatrix? 
      // let's just do simple gradient
      
      float intensity = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)); // Cam dir approx
      vec3 glow = vec3(0.0, 1.0, 1.0) * pow(intensity, 2.0) * (0.5 + hover);
      
      gl_FragColor = vec4(color + glow, 1.0);
    }
  `
)

extend({ StoneMaterial })

export { StoneMaterial }
