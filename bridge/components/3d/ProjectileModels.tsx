import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Icosahedron, Octahedron, MeshDistortMaterial, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- Virus Model (Social Evils) ---
export const VirusModel = ({ color = '#2b2b2b' }) => {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.x += delta * 0.5;
            meshRef.current.rotation.y += delta * 0.8;
        }
    });

    return (
        <group ref={meshRef}>
            {/* Core Body */}
            <Icosahedron args={[0.3, 0]}>
                <MeshDistortMaterial
                    color={color}
                    speed={3}
                    distort={0.4}
                    radius={1}
                    roughness={0.8}
                />
            </Icosahedron>
            {/* Spikes */}
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={i} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
                    <cylinderGeometry args={[0.02, 0.05, 0.8]} />
                    <meshStandardMaterial color="#300000" />
                </mesh>
            ))}
            {/* Toxic Aura */}
            <pointLight distance={1.5} intensity={2} color="#ff0000" />
        </group>
    );
};

// --- Star Model (Good Values) ---
export const StarModel = ({ color = '#FFD700' }) => {
    const meshRef = useRef<THREE.Group>(null);

    useFrame((state, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.z -= delta * 1.5; // Spin nicely
            const scale = 1 + Math.sin(state.clock.getElapsedTime() * 4) * 0.1;
            meshRef.current.scale.setScalar(scale);
        }
    });

    return (
        <group ref={meshRef}>
            <Octahedron args={[0.4, 0]}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.8}
                    toneMapped={false}
                />
            </Octahedron>
            <Sparkles count={10} scale={1.2} size={2} speed={0.4} opacity={0.7} color="white" />
            <pointLight distance={2} intensity={3} color={color} />
        </group>
    );
};
