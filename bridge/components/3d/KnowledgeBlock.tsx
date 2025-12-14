import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox, Cylinder } from '@react-three/drei';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { useGameStore } from '../../store/gameStore';

const KnowledgeBlock = ({ data, handPos, leftHandPos, gestureRight, gestureLeft, grabbedBlockId, setGrabbedBlockId, onDrop }) => {
    const meshRef = useRef();
    const [isHovered, setIsHovered] = useState(false);
    const [isGrabbed, setIsGrabbed] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    // Phase 2: Dual Hand Logic
    const [isDualHovered, setIsDualHovered] = useState(false);
    const [balanceWarning, setBalanceWarning] = useState(false);

    const { id, text, type, position: startPos } = data;
    const isHeavy = type === 'ROOF';

    const [position, setPosition] = useState(new Vector3(...startPos));

    // Color mapping
    const getColor = () => {
        if (balanceWarning) return '#ff0000'; // Red if unbalanced
        switch (type) {
            case 'FOUNDATION': return '#8B4513';
            case 'PILLARS': return '#A0522D';
            case 'WALLS': return '#CD853F';
            case 'ROOF': return '#DAA520';
            default: return '#666';
        }
    };

    // Idle animation
    useEffect(() => {
        if (meshRef.current && !isGrabbed) {
            gsap.to(meshRef.current.scale, {
                x: 1.05, y: 1.05, z: 1.05,
                duration: 2, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
            gsap.to(meshRef.current.position, {
                y: startPos[1] + 0.2,
                duration: 3, repeat: -1, yoyo: true, ease: 'sine.inOut'
            });
        }
        return () => {
            if (meshRef.current) {
                gsap.killTweensOf(meshRef.current.scale);
                gsap.killTweensOf(meshRef.current.position);
            }
        };
    }, [isGrabbed, startPos]);

    const triggerShake = () => {
        if (!meshRef.current) return;
        setIsShaking(true);
        const tl = gsap.timeline({ onComplete: () => setIsShaking(false) });
        tl.to(meshRef.current.position, { x: '+=0.1', duration: 0.05, repeat: 5, yoyo: true })
            .to(meshRef.current.rotation, { z: '+=0.1', duration: 0.05, repeat: 5, yoyo: true }, 0);
    };

    useFrame(() => {
        if (!meshRef.current || isShaking) return;

        const rightDist = handPos ? handPos.distanceTo(position) : 999;
        const leftDist = leftHandPos ? leftHandPos.distanceTo(position) : 999;
        const anyHandClose = rightDist < 1.5 || leftDist < 1.5;

        // Hover status
        setIsHovered(anyHandClose);
        setIsDualHovered(rightDist < 2.0 && leftDist < 2.0);

        // GRAB LOGIC
        if (!isGrabbed) {
            // Check if ANY block is currently grabbed by the scene (global lock)
            const canGrab = grabbedBlockId === null;

            if (canGrab) {
                if (isHeavy) {
                    // Requires BOTH hands to PINCH
                    if (isDualHovered && gestureRight === 'PINCH' && gestureLeft === 'PINCH') {
                        setIsGrabbed(true);
                        setGrabbedBlockId(id); // Lock
                        gsap.killTweensOf(meshRef.current.scale);
                        gsap.killTweensOf(meshRef.current.position);
                    }
                } else {
                    // Standard Logic
                    if (rightDist < 1.5 && gestureRight === 'PINCH') {
                        setIsGrabbed(true);
                        setGrabbedBlockId(id); // Lock
                        gsap.killTweensOf(meshRef.current.scale);
                        gsap.killTweensOf(meshRef.current.position);
                    }
                }
            }
        }

        if (isGrabbed) {
            let stillGrabbing = false;
            if (isHeavy) {
                // Must maintain both pinches
                stillGrabbing = (gestureRight === 'PINCH' && gestureLeft === 'PINCH');

                if (stillGrabbing) {
                    // Midpoint
                    const midX = (handPos.x + leftHandPos.x) / 2;
                    const midY = (handPos.y + leftHandPos.y) / 2;
                    const midZ = (handPos.z + leftHandPos.z) / 2; // Roughly

                    position.lerp(new Vector3(midX, midY, 0), 0.2); // Force Z=0 for gameplay plane

                    // BALANCE CHECK
                    const yDiff = Math.abs(handPos.y - leftHandPos.y);
                    if (yDiff > 2.0) {
                        setBalanceWarning(true);
                        // Maybe make it slip? For now just visual warning.
                    } else {
                        setBalanceWarning(false);
                    }
                }
            } else {
                stillGrabbing = (gestureRight === 'PINCH');
                if (stillGrabbing) {
                    position.lerp(handPos, 0.2);
                }
            }

            if (stillGrabbing) {
                meshRef.current.position.copy(position);
            } else {
                // Released
                setIsGrabbed(false);
                setBalanceWarning(false);

                // If heavy and unbalanced, maybe fail? 
                // For now standard drop logic
                const result = onDrop(id, position);

                if (!result || !result.success) {
                    setGrabbedBlockId(null);
                    triggerShake();
                    gsap.to(position, {
                        x: startPos[0], y: startPos[1], z: startPos[2],
                        duration: 0.5, ease: 'back.out(1.7)',
                        onUpdate: () => meshRef.current && meshRef.current.position.copy(position)
                    });
                }

                // Reset scale
                gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
            }
        } else if (!isShaking) {
            // Idle return
            const target = new Vector3(...startPos);
            position.lerp(target, 0.05);
            if (!isGrabbed) {
                meshRef.current.position.x = position.x;
                meshRef.current.position.z = position.z;
            }
        }
    });

    return (
        <group ref={meshRef} position={startPos}>
            <RoundedBox args={[2.5, 1, 0.2]} radius={0.1} smoothness={4}>
                <meshStandardMaterial
                    color={isHovered ? '#00f3ff' : getColor()}
                    emissive={isHovered ? '#00f3ff' : '#000000'}
                    emissiveIntensity={isHovered ? 0.3 : 0} // Reduced glare for readability
                    metalness={0.3}
                    roughness={0.7}
                />
            </RoundedBox>


            <Text
                position={[0, 0, 0.11]}
                fontSize={0.15}
                color={isHovered ? "black" : "white"} // Change text color on hover
                maxWidth={2.0} // Prevent overflow (box width is 2.5)
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                outlineWidth={isHovered ? 0 : 0.01}
                outlineColor="#000"
            >
                {text} {isHeavy && "(Nặng!)"}
            </Text>

            {/* Visual connector for heavy blocks when grabbed */}
            {isGrabbed && isHeavy && (
                <mesh position={[0, -1, 0]}>
                    <cylinderGeometry args={[0.05, 0.05, 4]} />
                    <meshBasicMaterial color={balanceWarning ? "red" : "green"} transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    );
};

export default KnowledgeBlock;
