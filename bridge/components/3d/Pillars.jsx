import { useRef } from 'react'
import useGameStore from '@/store/gameStore'
import * as THREE from 'three'

function Pillar({ position, id }) {
    const pillarData = useGameStore(state => state.pillars[id])
    const isCompleted = pillarData?.completed

    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, 1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.6, 0.8, 2, 8]} />
                <meshStandardMaterial
                    color={isCompleted ? "#ffd700" : "#666"}
                    emissive={isCompleted ? "#554400" : "#000"}
                    roughness={0.9}
                />
            </mesh>

            {/* Cap/Table */}
            <mesh position={[0, 2.1, 0]} castShadow>
                <boxGeometry args={[1.8, 0.2, 1.2]} />
                <meshStandardMaterial color={isCompleted ? "#ffd700" : "#555"} />
            </mesh>

            {/* Slots Indicators */}
            {/* Traditional Slot (Left) */}
            <mesh position={[-0.5, 2.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.25, 32]} />
                <meshBasicMaterial color="cyan" side={2} opacity={pillarData?.traditional ? 0.8 : 0.2} transparent />
            </mesh>

            {/* Modern Slot (Right) */}
            <mesh position={[0.5, 2.21, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.2, 0.25, 32]} />
                <meshBasicMaterial color="magenta" side={2} opacity={pillarData?.modern ? 0.8 : 0.2} transparent />
            </mesh>

            {/* Completion Beam */}
            {isCompleted && (
                <mesh position={[0, 5, 0]}>
                    <cylinderGeometry args={[0.1, 0.1, 10, 8]} />
                    <meshBasicMaterial color="#ffd700" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
                </mesh>
            )}
        </group>
    )
}

export default function Pillars() {
    // 4 Pillars distributed along the bridge
    // Compressed X range to fit in camera view (approx [-5, 5])
    // Positions: -3.75, -1.25, 1.25, 3.75
    const positions = [-3.75, -1.25, 1.25, 3.75]

    return (
        <group>
            {positions.map((x, i) => (
                <Pillar key={i} id={i} position={[x, -0.5, 0]} />
            ))}
        </group>
    )
}
