import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import useGameStore from '@/store/gameStore'

const JOINT_PAIRS = [
    [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
    [0, 5], [5, 6], [6, 7], [7, 8], // Index
    [9, 10], [10, 11], [11, 12], // Middle (0-9 connection shared with ring/pinky base usually, but 0 is wrist)
    [13, 14], [14, 15], [15, 16], // Ring
    [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
    [5, 9], [9, 13], [13, 17] // Palm connections across knuckles
]

// Add wrist to these roots if needed, but 0 is wrist.
// 0->5, 0->17 already covered. 0->9, 0->13 often implied or explicit. Let's add them for a solid palm.
const PALM_PAIRS = [[0, 9], [0, 13]]

const ALL_CONNECTIONS = [...JOINT_PAIRS, ...PALM_PAIRS]

function HandVisual({ landmarks }) {
    // Map normalized landmarks to World Space
    // Scene scale approx: X [-8, 8], Y [-5, 5]
    const mappedLandmarks = useMemo(() => {
        return landmarks.map(lm => {
            return new THREE.Vector3(
                (1 - lm.x) * 10 - 5, // Scale reduced to 10 (range -5 to 5)
                -(lm.y) * 6 + 3,    // Scale reduced to 6 (range -3 to 3)
                0
            )
        })
    }, [landmarks])

    return (
        <group>
            {/* Joints */}
            {mappedLandmarks.map((pos, i) => (
                <mesh key={`joint-${i}`} position={pos}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial color="#00ffcc" emissive="#00ffcc" emissiveIntensity={0.5} />
                </mesh>
            ))}

            {/* Bones */}
            {ALL_CONNECTIONS.map((pair, i) => {
                const start = mappedLandmarks[pair[0]]
                const end = mappedLandmarks[pair[1]]

                const dist = start.distanceTo(end)
                const mid = start.clone().add(end).multiplyScalar(0.5)

                // Rotation to align cylinder with vector
                const direction = end.clone().sub(start).normalize()
                const quaternion = new THREE.Quaternion()
                quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)

                return (
                    <mesh key={`bone-${i}`} position={mid} quaternion={quaternion}>
                        <cylinderGeometry args={[0.08, 0.08, dist, 8]} />
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.6} />
                    </mesh>
                )
            })}
        </group>
    )
}

export default function HandSkeleton() {
    const hands = useGameStore(state => state.hands)

    // Safety check if hands is undefined
    if (!hands) return null

    return (
        <>
            {hands.map((hand) => (
                <HandVisual key={hand.id} landmarks={hand.landmarks} />
            ))}
        </>
    )
}
