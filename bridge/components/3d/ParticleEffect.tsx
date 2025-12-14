import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ParticleEffect = ({ position, type, active }) => {
    const particlesRef = useRef();
    const velocitiesRef = useRef([]);
    const lifetimesRef = useRef([]);
    const particleCount = 50;

    useEffect(() => {
        if (!active) return;

        // Initialize particles
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        velocitiesRef.current = [];
        lifetimesRef.current = [];

        for (let i = 0; i < particleCount; i++) {
            // Position
            positions[i * 3] = position[0] + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 1] = position[1] + (Math.random() - 0.5) * 0.5;
            positions[i * 3 + 2] = position[2] + (Math.random() - 0.5) * 0.5;

            // Color based on type
            if (type === 'success') {
                colors[i * 3] = 0; // R
                colors[i * 3 + 1] = Math.random() * 0.5 + 0.5; // G (0.5-1.0)
                colors[i * 3 + 2] = Math.random() * 0.5 + 0.5; // B (0.5-1.0) - Cyan
            } else {
                colors[i * 3] = Math.random() * 0.5 + 0.5; // R (0.5-1.0)
                colors[i * 3 + 1] = 0; // G
                colors[i * 3 + 2] = 0; // B - Red
            }

            // Size
            sizes[i] = Math.random() * 0.1 + 0.05;

            // Velocity
            velocitiesRef.current.push({
                x: (Math.random() - 0.5) * 0.1,
                y: Math.random() * 0.15 + 0.05,
                z: (Math.random() - 0.5) * 0.1
            });

            // Lifetime
            lifetimesRef.current.push(Math.random() * 1.5 + 0.5); // 0.5-2.0 seconds
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        if (particlesRef.current) {
            particlesRef.current.geometry = geometry;
        }
    }, [active, position, type]);

    useFrame((state, delta) => {
        if (!particlesRef.current || !active) return;

        const positions = particlesRef.current.geometry.attributes.position.array;
        const sizes = particlesRef.current.geometry.attributes.size.array;

        for (let i = 0; i < particleCount; i++) {
            // Update position
            positions[i * 3] += velocitiesRef.current[i].x * delta * 10;
            positions[i * 3 + 1] += velocitiesRef.current[i].y * delta * 10;
            positions[i * 3 + 2] += velocitiesRef.current[i].z * delta * 10;

            // Apply gravity
            velocitiesRef.current[i].y -= delta * 2;

            // Fade out
            lifetimesRef.current[i] -= delta;
            sizes[i] = Math.max(0, sizes[i] * 0.95);
        }

        particlesRef.current.geometry.attributes.position.needsUpdate = true;
        particlesRef.current.geometry.attributes.size.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={particlesRef}>
            <bufferGeometry />
            <pointsMaterial
                size={0.1}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
};

export default ParticleEffect;
