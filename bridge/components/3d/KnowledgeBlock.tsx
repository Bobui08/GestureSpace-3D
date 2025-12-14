import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, RoundedBox } from '@react-three/drei';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { useGameStore } from '../../store/gameStore';

const KnowledgeBlock = ({ data, handPos, gestureRight, onDrop }) => {
    const meshRef = useRef();
    const [isHovered, setIsHovered] = useState(false);
    const [isGrabbed, setIsGrabbed] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const { id, text, type, position: startPos } = data;

    const [position, setPosition] = useState(new Vector3(...startPos));

    // Color mapping with neon theme
    const getColor = () => {
        switch (type) {
            case 'FOUNDATION': return '#8B4513';
            case 'PILLARS': return '#A0522D';
            case 'WALLS': return '#CD853F';
            case 'ROOF': return '#DAA520';
            default: return '#666';
        }
    };

    // Idle breathing animation with GSAP
    useEffect(() => {
        if (meshRef.current && !isGrabbed) {
            gsap.to(meshRef.current.scale, {
                x: 1.05,
                y: 1.05,
                z: 1.05,
                duration: 2,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });

            // Floating animation
            gsap.to(meshRef.current.position, {
                y: startPos[1] + 0.2,
                duration: 3,
                repeat: -1,
                yoyo: true,
                ease: 'sine.inOut'
            });
        }

        return () => {
            if (meshRef.current) {
                gsap.killTweensOf(meshRef.current.scale);
                gsap.killTweensOf(meshRef.current.position);
            }
        };
    }, [isGrabbed, startPos]);

    // Shake animation for wrong placement
    const triggerShake = () => {
        if (!meshRef.current) return;
        setIsShaking(true);

        const tl = gsap.timeline({
            onComplete: () => setIsShaking(false)
        });

        tl.to(meshRef.current.position, {
            x: '+=0.1',
            duration: 0.05,
            repeat: 5,
            yoyo: true,
            ease: 'power2.inOut'
        })
            .to(meshRef.current.rotation, {
                z: '+=0.1',
                duration: 0.05,
                repeat: 5,
                yoyo: true,
                ease: 'power2.inOut'
            }, 0);
    };

    useFrame(() => {
        if (!meshRef.current || isShaking) return;

        const distance = handPos.distanceTo(position);

        // Hover Logic
        setIsHovered(distance < 1.5);

        // Grab Logic
        if (isHovered && gestureRight === 'PINCH' && !isGrabbed) {
            setIsGrabbed(true);
            // Stop idle animations
            gsap.killTweensOf(meshRef.current.scale);
            gsap.killTweensOf(meshRef.current.position);
            // Scale up slightly when grabbed
            gsap.to(meshRef.current.scale, {
                x: 1.1,
                y: 1.1,
                z: 1.1,
                duration: 0.2,
                ease: 'back.out(1.7)'
            });
        }

        if (isGrabbed) {
            if (gestureRight === 'PINCH') {
                // Follow hand with smooth lerp
                position.lerp(handPos, 0.2);
                meshRef.current.position.copy(position);
            } else {
                // Released
                setIsGrabbed(false);
                const result = onDrop(id, position);

                console.log('Drop result:', result);

                // Check if placement was successful
                if (!result || !result.success) {
                    // Wrong placement - shake and return
                    console.log('Triggering shake animation');
                    triggerShake();
                    gsap.to(position, {
                        x: startPos[0],
                        y: startPos[1],
                        z: startPos[2],
                        duration: 0.5,
                        ease: 'back.out(1.7)',
                        onUpdate: () => {
                            if (meshRef.current) {
                                meshRef.current.position.copy(position);
                            }
                        }
                    });
                }

                // Reset scale
                gsap.to(meshRef.current.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.2
                });
            }
        } else if (!isShaking) {
            // Idle: lerp back to spawn slowly
            const target = new Vector3(...startPos);
            position.lerp(target, 0.05);
            if (!isGrabbed) {
                meshRef.current.position.x = position.x;
                meshRef.current.position.z = position.z;
                // Y is handled by GSAP floating animation
            }
        }
    });

    return (
        <group ref={meshRef} position={startPos}>
            <RoundedBox args={[2.5, 1, 0.2]} radius={0.1} smoothness={4}>
                <meshStandardMaterial
                    color={isHovered ? '#00f3ff' : getColor()}
                    emissive={isHovered ? '#00f3ff' : '#000000'}
                    emissiveIntensity={isHovered ? 0.7 : 0}
                    metalness={0.3}
                    roughness={0.7}
                />
            </RoundedBox>

            {/* Neon border when hovered */}
            {isHovered && (
                <RoundedBox args={[2.6, 1.1, 0.25]} radius={0.1} smoothness={4}>
                    <meshBasicMaterial
                        color="#00f3ff"
                        transparent
                        opacity={0.2}
                        wireframe
                    />
                </RoundedBox>
            )}

            <Text
                position={[0, 0, 0.11]}
                fontSize={0.15}
                color="white"
                maxWidth={2.3}
                textAlign="center"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.01}
                outlineColor="#000"
            >
                {text}
            </Text>
        </group>
    );
};

export default KnowledgeBlock;
