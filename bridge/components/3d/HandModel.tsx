import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';
import type { Group, Mesh } from 'three';
import type { HandsResultsRef, Landmark } from '../../hooks/useHandTracking';

const CONNECTIONS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [0, 9], [9, 10], [10, 11], [11, 12], // Middle
    [0, 13], [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17] // Palm
];

type HandModelProps = {
    handsResultsRef: HandsResultsRef;
    hand: 'left' | 'right';
    isRight: boolean;
};

const project3D = (target: Vector3, landmark: Landmark | undefined, viewport: { width: number; height: number }) => {
    if (!landmark) {
        target.set(0, 0, 0);
        return target;
    }

    target.set(
        (1 - landmark.x) * viewport.width - viewport.width / 2,
        (1 - landmark.y) * viewport.height - viewport.height / 2,
        -((landmark.z ?? 0) * viewport.width)
    );

    return target;
};

const HandModel = ({ handsResultsRef, hand, isRight }: HandModelProps) => {
    const groupRef = useRef<Group>(null);
    const jointsRef = useRef<(Mesh | null)[]>([]);
    const bonesRef = useRef<(Mesh | null)[]>([]);
    const projectedPointRef = useRef(new Vector3());
    const midpointRef = useRef(new Vector3());

    useFrame(({ viewport }) => {
        const landmarks = hand === 'right' ? handsResultsRef.current.rightHand : handsResultsRef.current.leftHand;

        if (!groupRef.current) return;
        if (!landmarks) {
            groupRef.current.visible = false;
            return;
        }
        groupRef.current.visible = true;

        // Update Joints
        landmarks.forEach((lm, i) => {
            if (jointsRef.current[i]) {
                jointsRef.current[i]!.position.copy(project3D(projectedPointRef.current, lm, viewport));
            }
        });

        // Update Bones
        CONNECTIONS.forEach((pair, i) => {
            if (bonesRef.current[i] && jointsRef.current[pair[0]] && jointsRef.current[pair[1]]) {
                const bone = bonesRef.current[i]!;
                const start = jointsRef.current[pair[0]]!.position;
                const end = jointsRef.current[pair[1]]!.position;

                // Position is midpoint
                bone.position.copy(midpointRef.current.copy(start).lerp(end, 0.5));

                // Orientation
                bone.lookAt(end);
                bone.rotateX(Math.PI / 2); // Align cylinder Y with direction

                // Length
                const dist = start.distanceTo(end);
                bone.scale.set(1, dist, 1);
            }
        });
    });

    return (
        <group ref={groupRef} visible={false}>
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
