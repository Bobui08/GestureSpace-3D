import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { v4 as uuidv4 } from 'uuid'
import { StoneMaterial } from '@/shaders/stoneMaterial'
import useGameStore from '@/store/gameStore'
import * as THREE from 'three'

function Stone({ id, type, initialPos, label }) {
    const mesh = useRef()
    const placeStone = useGameStore(state => state.placeStone)
    const setHandBusy = useGameStore(state => state.setHandBusy)

    // Subscribe for render state
    const isPlaced = useGameStore(state => state.pillars.some(p => p.traditional === id || p.modern === id))

    const [isGrabbed, setIsGrabbed] = useState(false)
    const [isHovered, setIsHovered] = useState(false)

    const color = type === 'TRADITIONAL' ? new THREE.Color('#3366ff') : new THREE.Color('#ff3366')

    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.material.uniforms.time.value += delta
            mesh.current.material.uniforms.hover.value = THREE.MathUtils.lerp(
                mesh.current.material.uniforms.hover.value,
                isHovered ? 1 : 0,
                0.1
            )

            // Read latest state directly without triggering re-renders
            const gst = useGameStore.getState()
            const { hands, pillars, busyHands } = gst

            // Interaction Logic
            // Check if this stone is already placed (physics check)
            const currentPillarIndex = pillars.findIndex(p => p.traditional === id || p.modern === id)
            const isPlacedPhysics = currentPillarIndex !== -1

            if (isPlacedPhysics) {
                // Snap to slot position
                const p = pillars[currentPillarIndex]
                const isTrad = p.traditional === id
                // Pillar Positions: -3.75, -1.25, 1.25, 3.75
                const pillarX = [-3.75, -1.25, 1.25, 3.75][currentPillarIndex] || 0

                const targetX = pillarX + (isTrad ? -0.5 : 0.5)
                const targetY = 1.8

                mesh.current.position.lerp(new THREE.Vector3(targetX, targetY, 0), 0.1)
                mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, 0, 0.1)
                mesh.current.rotation.z = THREE.MathUtils.lerp(mesh.current.rotation.z, 0, 0.1)
                return
            }

            let isAnyHandClose = false
            let grabbingHand = null

            if (hands && hands.length > 0) {
                for (const hand of hands) {
                    if (!hand.isDetected) continue

                    // Use cursor pos
                    const handPosVec = new THREE.Vector3(
                        hand.cursor.x * 5,
                        hand.cursor.y * 3,
                        0
                    )
                    const dist = mesh.current.position.distanceTo(handPosVec)

                    if (dist < 0.8) {
                        isAnyHandClose = true

                        // Check gesture (PINCH/GRAB)
                        // GRAB LOGIC:
                        // 1. Must be PINCH gesture
                        // 2. If grabbing NEW stone: Hand must NOT be busy.
                        // 3. If holding THIS stone: Keep holding.

                        const isHandBusy = busyHands[hand.id]

                        if (hand.gesture === 'PINCH') {
                            if (!isGrabbed) {
                                // Attempting to grab
                                if (!isHandBusy) {
                                    setIsGrabbed(true)
                                    setHandBusy(hand.id, true)
                                    grabbingHand = { pos: handPosVec, gesture: hand.gesture }
                                    mesh.current.userData.grabbedBy = hand.id
                                }
                            } else if (mesh.current.userData.grabbedBy === hand.id) {
                                // Continuing to grab
                                grabbingHand = { pos: handPosVec, gesture: hand.gesture }
                            }
                        } else if (hand.gesture === 'OPEN' && isGrabbed && mesh.current.userData.grabbedBy === hand.id) {
                            // Release
                            setIsGrabbed(false)
                            setHandBusy(hand.id, false)
                            mesh.current.userData.grabbedBy = null

                            // Drop Logic - Check 4 Pillars
                            // Positions: -3.75, -1.25, 1.25, 3.75
                            const pillarsX = [-3.75, -1.25, 1.25, 3.75]
                            for (let i = 0; i < pillarsX.length; i++) {
                                const px = pillarsX[i]
                                // Trad Slot
                                const tSlot = new THREE.Vector3(px - 0.5, 1.8, 0)
                                if (mesh.current.position.distanceTo(tSlot) < 1.5) { // Increased from 1.0 to 1.5 for better magnetism
                                    if (type === 'TRADITIONAL') {
                                        placeStone(id, type, i, label)
                                    }
                                }

                                // Modern Slot
                                const mSlot = new THREE.Vector3(px + 0.5, 1.8, 0)
                                if (mesh.current.position.distanceTo(mSlot) < 1.5) { // Increased from 1.0 to 1.5
                                    if (type === 'MODERN') {
                                        placeStone(id, type, i, label)
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (isAnyHandClose && !isGrabbed) {
                setIsHovered(true)
            } else {
                setIsHovered(false)
            }

            if (isGrabbed && grabbingHand) {
                // Lerp faster for "smoother" snappy feel (less lag)
                mesh.current.position.lerp(grabbingHand.pos, 0.4)
            } else if (!isPlacedPhysics && !isGrabbed) {
                mesh.current.position.lerp(new THREE.Vector3(...initialPos), 0.1)
            }
        }
    })

    return (
        <mesh ref={mesh} position={initialPos}>
            <dodecahedronGeometry args={[0.3, 0]} />
            <stoneMaterial color={color} transparent />
            {isPlaced && (
                <Text
                    position={[0, 0.45, 0]}
                    fontSize={0.15}
                    maxWidth={3}
                    anchorX="center"
                    anchorY="middle"
                    color="white"
                    outlineWidth={0.02}
                    outlineColor="black"
                >
                    {label}
                </Text>
            )}
        </mesh>
    )
}

export default function Stones() {
    const traditionalValues = ['Tôn trọng người lớn', 'Hiếu thảo', 'Ổn định gia đình', 'Giữ gìn văn hóa']
    const modernValues = ['Giao tiếp hai chiều', 'Tự chủ cá nhân', 'Bình đẳng giới', 'Hôn nhân tự nguyện']

    const stones = useMemo(() => {
        const temp = []
        // Traditional Left Side
        // Compact positions: -1.0 down to -3.4
        // Raise Y from 2.5 to 3.5
        for (let i = 0; i < 4; i++) {
            temp.push({
                id: uuidv4(),
                type: 'TRADITIONAL',
                label: traditionalValues[i],
                pos: [-1.0 - (i * 0.8), 3, 0]
            })
        }
        // Modern Right Side
        // Compact positions: 1.0 up to 3.4
        for (let i = 0; i < 4; i++) {
            temp.push({
                id: uuidv4(),
                type: 'MODERN',
                label: modernValues[i],
                pos: [1.0 + (i * 0.8), 3, 0]
            })
        }
        return temp
    }, [])

    return (
        <group>
            {stones.map(s => <Stone key={s.id} {...s} initialPos={s.pos} label={s.label} />)}
        </group>
    )
}
