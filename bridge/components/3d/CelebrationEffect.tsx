import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import SocialEnvironment from './SocialEnvironment';
import { useGameStore } from '../../store/gameStore';

const Fireworks = ({ count = 5 }) => {
    const particles = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = (Math.random() - 0.5) * 10 + 5;
            const z = (Math.random() - 0.5) * 10 - 5;
            const color = new THREE.Color().setHSL(Math.random(), 1, 0.5);
            temp.push({ position: [x, y, z], color, speed: Math.random() * 0.2 + 0.1 });
        }
        return temp;
    }, [count]);

    return (
        <group>
            {particles.map((p, i) => (
                <Firework key={i} {...p} />
            ))}
        </group>
    );
};

const Firework = ({ position, color }) => {
    const ref = useRef();
    const particleCount = 50;

    // Create explosion geometry
    const [positions, colors] = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const col = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = Math.random() * 2;

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);

            col[i * 3] = color.r;
            col[i * 3 + 1] = color.g;
            col[i * 3 + 2] = color.b;
        }
        return [pos, col];
    }, [color]);

    useFrame((state) => {
        if (!ref.current) return;
        const time = state.clock.getElapsedTime();
        // Expand/Explode effect
        ref.current.rotation.y += 0.01;
        ref.current.scale.setScalar(1 + Math.sin(time * 5) * 0.5);
    });

    return (
        <points ref={ref} position={position}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={particleCount}
                    array={colors}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial size={0.2} vertexColors sizeAttenuation transparent opacity={0.8} />
        </points>
    );
};

const CelebrationEffect = () => {
    const groupRef = useRef();

    const { score, gameStartTime } = useGameStore();
    const totalTime = gameStartTime ? Date.now() - gameStartTime : 0;

    // Format duration
    const formatDuration = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${minutes}p ${s}s`;
    };

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            // Psychedelic rotating camera effect
            groupRef.current.rotation.z = Math.sin(t * 0.5) * 0.1;
            groupRef.current.rotation.y = Math.cos(t * 0.2) * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Warp Speed Stars */}
            {/* Warp Speed Stars */}
            {/* Removed Stars for Residential Context */}
            <SocialEnvironment />

            {/* Floating 3D Text */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                <Text
                    position={[0, 4.5, -5]}
                    fontSize={1.5}
                    color="#00f3ff"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="#ff00ff"
                >
                    CHÚC MỪNG!
                </Text>
                <Text
                    position={[0, 3.2, -5]}
                    fontSize={0.6}
                    color="#ffffff"
                    anchorX="center"
                    anchorY="middle"
                >
                    NGÔI NHÀ HẠNH PHÚC ĐÃ HOÀN THÀNH
                </Text>

                <Text
                    position={[0, 2.2, -5]}
                    fontSize={0.4}
                    color="#FFD700"
                    anchorX="center"
                    anchorY="middle"
                >
                    ĐIỂM SỐ: {score} | THỜI GIAN: {formatDuration(totalTime)}
                </Text>
            </Float>

            {/* Camera Controls */}
            <OrbitControls makeDefault autoRotate autoRotateSpeed={0.5} />

            {/* Particle Fireworks */}
            <Fireworks count={20} />

            {/* Replay Button */}
            <Html position={[0, -0.2, -5]} transform center>
                <button
                    onClick={() => window.location.reload()}
                    style={{
                        padding: '18px 50px',
                        fontSize: '1.3rem',
                        fontWeight: '700',
                        background: 'transparent',
                        color: '#00f3ff',
                        border: '2px solid #00f3ff',
                        borderRadius: '50px',
                        cursor: 'pointer',
                        pointerEvents: 'auto',
                        boxShadow: '0 0 30px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.1)',
                        textTransform: 'uppercase',
                        letterSpacing: '3px',
                        transition: 'all 0.3s ease',
                        fontFamily: "'Orbitron', sans-serif",
                        whiteSpace: 'nowrap',
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.background = '#00f3ff';
                        e.currentTarget.style.color = '#000';
                        e.currentTarget.style.boxShadow = '0 0 40px rgba(0, 243, 255, 0.8)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#00f3ff';
                        e.currentTarget.style.boxShadow = '0 0 30px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.1)';
                    }}
                >
                    CHƠI LẠI
                </button>
            </Html>

            {/* Background Atmosphere - Enhanced for celebration but within context */}
            {/* Added a subtle warm light for the 'happy home' feeling */}
            <pointLight position={[0, 5, 5]} intensity={1} color="#ffaa00" distance={20} />
        </group>
    );
};

export default CelebrationEffect;
