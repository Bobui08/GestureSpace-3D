import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleProps {
    position: THREE.Vector3;
    color: string;
    count?: number;
    onComplete: () => void;
}

export const HitEffect = ({ position, color, count = 20, onComplete }: ParticleProps) => {
    const pointsRef = useRef<THREE.Points>(null);
    const geometryRef = useRef<THREE.BufferGeometry>(null);
    const timeRef = useRef(0);

    const { positions, velocities } = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const vels = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Origin
            pos[i * 3] = position.x;
            pos[i * 3 + 1] = position.y;
            pos[i * 3 + 2] = position.z;

            // Explosion velocity
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const speed = Math.random() * 5 + 2;

            vels[i * 3] = speed * Math.sin(phi) * Math.cos(theta);
            vels[i * 3 + 1] = speed * Math.sin(phi) * Math.sin(theta);
            vels[i * 3 + 2] = speed * Math.cos(phi);
        }

        return { positions: pos, velocities: vels };
    }, [position, count]);

    useFrame((state, delta) => {
        if (!geometryRef.current) return;

        timeRef.current += delta;

        // End effect after 0.5s
        if (timeRef.current > 0.5) {
            onComplete();
            return;
        }

        const posAttr = geometryRef.current.getAttribute('position') as THREE.BufferAttribute;

        for (let i = 0; i < count; i++) {
            posAttr.setXYZ(
                i,
                posAttr.getX(i) + velocities[i * 3] * delta,
                posAttr.getY(i) + velocities[i * 3 + 1] * delta,
                posAttr.getZ(i) + velocities[i * 3 + 2] * delta
            );
        }

        posAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry ref={geometryRef}>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color={color}
                transparent
                opacity={1 - timeRef.current * 2} // Fade out
                sizeAttenuation
                depthWrite={false}
            />
        </points>
    );
};
