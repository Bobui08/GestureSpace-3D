import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html, Extrude, OrbitControls } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import * as THREE from 'three';

// 1. HEART SHAPE (Tình yêu / Hôn nhân)
const SymbolHeart = ({ position, color }) => {
    const meshRef = useRef();

    const shape = useMemo(() => {
        const s = new THREE.Shape();
        const x = 0, y = 0;
        s.moveTo(x + 5, y + 5);
        s.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
        s.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
        s.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
        s.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
        s.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
        s.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);
        return s;
    }, []);

    const extrudeSettings = { depth: 2, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.02;
            meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1 + Math.PI; // Flip to stand up
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1} position={position}>
            <group scale={0.08} rotation={[Math.PI, 0, 0]}> {/* Flip upright */}
                <Extrude ref={meshRef} args={[shape, extrudeSettings]}>
                    <meshPhysicalMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={0.8}
                        metalness={0.8}
                        roughness={0.2}
                        clearcoat={1}
                        transparent
                        opacity={0.9}
                    />
                </Extrude>
            </group>
            <Text position={[0, -1.8, 0]} fontSize={0.3} color={color} anchorX="center">
                HẠNH PHÚC
            </Text>
        </Float>
    );
};

// 2. HOUSE SHAPE (Tổ ấm / Gia đình)
const SymbolHouse = ({ position, color }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y -= 0.01;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1} position={position}>
            <group ref={groupRef} scale={0.8}>
                {/* Base */}
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1.5, 1.5, 1.5]} />
                    <meshStandardMaterial color={color} wireframe />
                </mesh>
                <mesh position={[0, 0, 0]}>
                    <boxGeometry args={[1.4, 1.4, 1.4]} />
                    <meshStandardMaterial color={color} transparent opacity={0.1} />
                </mesh>

                {/* Roof */}
                <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 4, 0]}>
                    <coneGeometry args={[1.5, 1, 4]} />
                    <meshStandardMaterial color={color} wireframe />
                </mesh>

                {/* Inner Glow Core */}
                <mesh>
                    <sphereGeometry args={[0.3, 16, 16]} />
                    <meshBasicMaterial color="white" />
                </mesh>
            </group>
            <Text position={[0, -1.8, 0]} fontSize={0.3} color={color} anchorX="center">
                TỔ ẤM
            </Text>
        </Float>
    );
};

// 3. DNA SHAPE (Tái sản xuất / Huyết thống)
const SymbolDNA = ({ position, color }) => {
    const groupRef = useRef();

    // Create DNA strands points
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < 20; i++) {
            const t = i * 0.3;
            p.push({ x: Math.sin(t), y: i * 0.2 - 2, z: Math.cos(t) }); // Strand 1
            p.push({ x: Math.sin(t + Math.PI), y: i * 0.2 - 2, z: Math.cos(t + Math.PI) }); // Strand 2
        }
        return p;
    }, []);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.03;
        }
    });

    return (
        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
            <group ref={groupRef} scale={0.8} rotation={[0, 0, Math.PI / 6]}>
                {points.map((pt, i) => (
                    <group key={i} position={[pt.x, pt.y, pt.z]}>
                        <mesh>
                            <sphereGeometry args={[0.08, 8, 8]} />
                            <meshStandardMaterial color={i % 2 === 0 ? color : '#ffffff'} emissive={color} emissiveIntensity={2} />
                        </mesh>
                        {/* Connecting bars every 2 points */}
                        {i % 2 === 0 && (
                            <mesh position={[0, 0, 0]} rotation={[0, -i * 0.3, 0]}> {/* Approximate alignment */}
                                {/* This is simplified, actual connecting rod math is complex, simple sphere cloud is good enough for 'abstract' */}
                            </mesh>
                        )}
                    </group>
                ))}
            </group>
            <Text position={[0, -1.8, 0]} fontSize={0.3} color={color} anchorX="center">
                HUYẾT THỐNG
            </Text>
        </Float>
    );
};

// 4. BOOK SHAPE (Giáo dục / Văn hóa)
const SymbolBook = ({ position, color }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            // Floating animation
            groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
            groupRef.current.rotation.y += 0.01;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={1} position={position}>
            <group ref={groupRef} scale={0.8}>
                {/* Left Page */}
                <mesh position={[-0.6, 0, 0]} rotation={[0, 0.2, 0]}>
                    <boxGeometry args={[1.2, 1.6, 0.1]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Right Page */}
                <mesh position={[0.6, 0, 0]} rotation={[0, -0.2, 0]}>
                    <boxGeometry args={[1.2, 1.6, 0.1]} />
                    <meshStandardMaterial color={color} />
                </mesh>
                {/* Glowing Text/Symbol on Page */}
                <mesh position={[0, 0.1, 0.1]}>
                    <planeGeometry args={[0.5, 0.5]} />
                    <meshBasicMaterial color="#ffffff" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            </group>
            <Text position={[0, -1.5, 0]} fontSize={0.3} color={color} anchorX="center">
                GIÁO DỤC
            </Text>
        </Float>
    );
};

import SocialEnvironment from './SocialEnvironment';

// ... (existing imports)

// ... (existing Symbol components)

const IntroEffect = () => {
    const groupRef = useRef<THREE.Group>(null);
    const { startGame } = useGameStore();

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        // Slow rotation of the entire group
        groupRef.current.rotation.y = t * 0.05;
    });

    return (
        <>
            {/* Camera Controls */}
            <OrbitControls makeDefault enableZoom={true} enablePan={true} enableRotate={true} />

            {/* Background Environment */}
            <SocialEnvironment />

            <group ref={groupRef}>
                {/* Central Text */}
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Text
                        position={[0, 5.5, 0]} // Raised higher to be above ground/trees if needed
                        fontSize={1.8}
                        color="#00f3ff"
                        anchorX="center"
                        anchorY="middle"
                        outlineWidth={0.04}
                        outlineColor="#ff00ff"
                    >
                        HÀNH TRÌNH XÂY TỔ ẤM
                    </Text>
                    <Text
                        position={[0, 4.2, 0]} // Raised relative to title
                        fontSize={0.7}
                        color="#ffffff"
                        anchorX="center"
                        anchorY="middle"
                        fillOpacity={0.9}
                    >
                        XÂY DỰNG GIA ĐÌNH - KIẾN TẠO TƯƠNG LAI
                    </Text>
                </Float>

                {/* Thematic Orbiting Shapes - Lifted up slightly */}
                <SymbolHeart position={[-4, 3.5, -2]} color="#ff0080" />
                <SymbolHouse position={[4, 3.5, -2]} color="#00f3ff" />

                {/* Raised DNA and Book to be visible above ground/trees */}
                <SymbolDNA position={[-3, 3.5, 2]} color="#9d00ff" />
                <SymbolBook position={[3, 3.5, 2]} color="#00ff88" />

                {/* Interactive UI within 3D Scene */}
                <Html position={[0, 1.0, 0]} transform center zIndexRange={[100, 0]}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '20px',
                        marginTop: '45px',
                        pointerEvents: 'auto', // Important for interactivity
                        width: '400px',
                        userSelect: 'none'
                    }}>
                        <button
                            onClick={startGame}
                            style={{
                                padding: '15px 40px',
                                fontSize: '1.5rem',
                                fontWeight: 'bold',
                                color: '#00f3ff',
                                background: 'rgba(0, 0, 0, 0.6)',
                                border: '2px solid #00f3ff',
                                borderRadius: '30px',
                                cursor: 'pointer',
                                textTransform: 'uppercase',
                                letterSpacing: '3px',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 0 20px rgba(0, 243, 255, 0.5)',
                                transition: 'all 0.3s ease',
                                fontFamily: "'Orbitron', sans-serif",
                                marginTop: '40px'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.background = '#00f3ff';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 243, 255, 0.8)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.6)';
                                e.currentTarget.style.color = '#00f3ff';
                                e.currentTarget.style.boxShadow = '0 0 20px rgba(0, 243, 255, 0.5)';
                            }}
                        >
                            BẮT ĐẦU
                        </button>

                        <div style={{
                            padding: '20px 30px',
                            background: 'rgba(255, 255, 255, 0.1)',
                            backdropFilter: 'blur(10px)',
                            borderRadius: '15px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            textAlign: 'center',
                            color: 'white',
                            fontFamily: "'Rajdhani', sans-serif",
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}>
                            <p>✋ Phải: Xoay nhà | ✊ Trái: Gắp khối</p>
                            <p>🖱️ Chuột: Điều khiển Camera</p>
                            <p>⚠️ Cần bật Camera và dùng 2 tay</p>
                        </div>
                    </div>
                </Html>
            </group>
        </>
    );
};

export default IntroEffect;
