import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3, CylinderGeometry, MeshStandardMaterial } from 'three';

const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17] // Palm
];

const HandModel = ({ landmarks, isRight }) => {
    const jointsRef = useRef([]);
    const bonesRef = useRef([]);

    // Helper: Project 2D normalized landmarks to 3D Plane (similar to Scene.js logic)
    const project3D = (landmark, viewport) => {
        // 0,0 is center of screen in Three.js
        // Hand tracking: x: 0-1, y: 0-1
        if (!landmark) return new Vector3(0, 0, 0);

        // Scale factor to make it visible in expected scene scale
        // Screen width approx 16-20 units at z=0 with current camera
        // Let's use viewport width/height
        const x = (1 - landmark.x) * viewport.width - viewport.width / 2;
        const y = (1 - landmark.y) * viewport.height - viewport.height / 2;
        // Z is tricky. MediaPipe gives 'z' roughly relative to wrist, but scaled.
        // We can use a fixed Z plane, or try to use the raw Z if available.
        // For "Hand Visualization", depth matters. 
        // landmarks[i].z is relative to the image plane, with the same scale as x.
        const z = -landmark.z * (viewport.width); // Scale z roughly to match x scale?

        return new Vector3(x, y, z || 0);
    };

    useFrame(({ viewport }) => {
        if (!landmarks) return;

        // Update Joints
        landmarks.forEach((lm, i) => {
            if (jointsRef.current[i]) {
                const pos = project3D(lm, viewport);
                jointsRef.current[i].position.copy(pos);
            }
        });

        // Update Bones
        CONNECTIONS.forEach((pair, i) => {
            if (bonesRef.current[i] && jointsRef.current[pair[0]] && jointsRef.current[pair[1]]) {
                const start = jointsRef.current[pair[0]].position;
                const end = jointsRef.current[pair[1]].position;

                // Position is midpoint
                bonesRef.current[i].position.copy(start).lerp(end, 0.5);

                // Orientation
                bonesRef.current[i].lookAt(end);
                bonesRef.current[i].rotateX(Math.PI / 2); // Align cylinder Y with direction

                // Length
                const dist = start.distanceTo(end);
                bonesRef.current[i].scale.set(1, dist, 1);
            }
        });
    });

    if (!landmarks) return null;

    return (
        <group>
            {/* Joints */}
            {Array.from({ length: 21 }).map((_, i) => (
                <mesh
                    key={`joint-${i}`}
                    ref={el => jointsRef.current[i] = el}
                    scale={[0.15, 0.15, 0.15]}
                >
                    <sphereGeometry args={[1, 16, 16]} />
                    <meshStandardMaterial color={isRight ? "#4CAF50" : "#2196F3"} emissive={0.2} />
                </mesh>
            ))}

            {/* Bones */}
            {CONNECTIONS.map((_, i) => (
                <mesh
                    key={`bone-${i}`}
                    ref={el => bonesRef.current[i] = el}
                >
                    {/* Unit cylinder, scaled later */}
                    <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
                    <meshStandardMaterial color="white" transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    );
};

export default HandModel;
