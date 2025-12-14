import React, { useMemo } from 'react';
import { Sky, Plane, Box, Cone, Cylinder, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// --- ASSETS / HELPERS ---

const Tree = ({ position, scale = 1 }) => (
    <group position={position} scale={[scale, scale, scale]}>
        {/* Trunk */}
        <Cylinder args={[0.3, 0.4, 1.5, 8]} position={[0, 0.75, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#5D4037" roughness={0.9} />
        </Cylinder>
        {/* Canopy - Multi-layered to look less low-poly */}
        <Cone args={[1.5, 2.5, 8]} position={[0, 2, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#2E7D32" roughness={0.8} />
        </Cone>
        <Cone args={[1.2, 2, 8]} position={[0, 3, 0]} castShadow receiveShadow>
            <meshStandardMaterial color="#388E3C" roughness={0.8} />
        </Cone>
    </group>
);

const LampPost = ({ position }) => (
    <group position={position}>
        <Cylinder args={[0.05, 0.05, 3, 8]} position={[0, 1.5, 0]}>
            <meshStandardMaterial color="#333" />
        </Cylinder>
        <Sphere args={[0.2, 16, 16]} position={[0, 3, 0]}>
            <meshStandardMaterial color="white" emissive="#FFD700" emissiveIntensity={0.5} />
        </Sphere>
        <pointLight position={[0, 2.8, 0]} distance={5} intensity={0.5} color="#FFD700" />
    </group>
);

// --- ARCHITECTURE STYLES ---

// 1. Colonial Style (Yellow walls, Red roof) - Schools, Gov
const BuildingColonial = ({ position, size = [1, 1, 1], label = "", rotation = [0, 0, 0] }) => {
    const [w, h, d] = size;
    return (
        <group position={position} rotation={rotation}>
            {/* Main Body */}
            <Box args={[w, h, d]} position={[0, h / 2, 0]} castShadow receiveShadow>
                <meshStandardMaterial color="#F3E5AB" roughness={0.5} /> {/* Vàng kem */}
            </Box>

            {/* Base/Foundation */}
            <Box args={[w + 0.2, 0.2, d + 0.2]} position={[0, 0.1, 0]}>
                <meshStandardMaterial color="#757575" />
            </Box>

            {/* Roof (Hip roof simulation via Pyramid/Cone) */}
            <Cone args={[Math.max(w, d) * 0.8, h * 0.5, 4]} position={[0, h + h * 0.25, 0]} rotation={[0, Math.PI / 4, 0]}>
                <meshStandardMaterial color="#A52A2A" roughness={0.6} /> {/* Mái đỏ */}
            </Cone>

            {/* Pillars */}
            <Cylinder args={[0.15, 0.15, h, 8]} position={[w / 2 - 0.2, h / 2, d / 2 + 0.1]}>
                <meshStandardMaterial color="white" />
            </Cylinder>
            <Cylinder args={[0.15, 0.15, h, 8]} position={[-w / 2 + 0.2, h / 2, d / 2 + 0.1]}>
                <meshStandardMaterial color="white" />
            </Cylinder>

            {/* Windows (Simple planes) */}
            <Box args={[w * 0.8, h * 0.2, 0.05]} position={[0, h * 0.6, d / 2 + 0.01]}>
                <meshStandardMaterial color="#3E2723" />
            </Box>
        </group>
    );
};

// 2. Modern Tube House (Nhà ống) - Slim, balconies
const BuildingTube = ({ position, height = 3, color = "#ECEFF1", rotation = [0, 0, 0] }) => {
    return (
        <group position={position} rotation={rotation}>
            {/* Main Body */}
            <Box args={[2, height, 4]} position={[0, height / 2, 0]} castShadow receiveShadow>
                <meshStandardMaterial color={color} />
            </Box>
            {/* Balcony */}
            <Box args={[2.2, 0.1, 1]} position={[0, height * 0.6, 2]} castShadow>
                <meshStandardMaterial color="#333" />
            </Box>
            <Box args={[2.2, 0.1, 1]} position={[0, height * 0.3, 2]} castShadow>
                <meshStandardMaterial color="#333" />
            </Box>
        </group>
    );
};

const SocialEnvironment = () => {
    return (
        <group>
            {/* --- SKY & ATMOSPHERE --- */}
            {/* Afternoon sky: Sun slightly lower, warm tone */}
            <Sky
                sunPosition={[100, 40, 50]}
                turbidity={0.8}
                rayleigh={0.3}
                mieCoefficient={0.005}
                mieDirectionalG={0.8}
            />
            {/* Ambient Light for Soft Shadows */}
            <ambientLight intensity={0.7} color="#FFF5E1" /> {/* Warm ambient */}
            <directionalLight
                position={[50, 60, 30]}
                intensity={1.2}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-bias={-0.0001}
            />

            {/* --- GROUND SYSTEM --- */}
            {/* 1. Main Dirt/Earth Ground */}
            <Plane args={[200, 200]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <meshStandardMaterial color="#5ca462" roughness={1} /> {/* Cỏ úa/Đất tự nhiên */}
            </Plane>

            {/* 2. Central Construction Plot (The "Home" area) */}
            {/* Concrete/Dirt mix to show construction site */}
            <Plane args={[12, 12]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <meshStandardMaterial color="#D7CCC8" roughness={0.9} /> {/* Đất nâu nhạt/Bê tông lót */}
            </Plane>

            {/* 3. Roads */}
            <group position={[0, 0.02, 0]}>
                {/* Ring Road */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                    <ringGeometry args={[18, 22, 64]} />
                    <meshStandardMaterial color="#78909C" roughness={0.8} /> {/* Asphalt/Concrete */}
                </mesh>
                {/* Connecting paths */}
                <Plane args={[4, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -20]}>
                    <meshStandardMaterial color="#78909C" roughness={0.8} />
                </Plane>
            </group>

            {/* --- SURROUNDING BUILDINGS (Farther distance > 20) --- */}

            {/* North: School (Education) */}
            <BuildingColonial position={[0, 0, -35]} size={[12, 5, 6]} label="TRƯỜNG HỌC" />
            <FlagPole position={[8, 0, -30]} />

            {/* West: Culture House (Nhà Văn Hóa) */}
            <BuildingColonial position={[-35, 0, 0]} size={[8, 4, 8]} rotation={[0, Math.PI / 2, 0]} label="VĂN HÓA" />

            {/* East: Committee/Gov (UBND) */}
            <BuildingColonial position={[35, 0, 0]} size={[10, 6, 6]} rotation={[0, -Math.PI / 2, 0]} label="UBND" />

            {/* South: Neighborhood (Tube Houses) */}
            <group position={[0, 0, 35]}>
                <BuildingTube position={[-6, 0, 0]} height={4} color="#FFF9C4" />
                <BuildingTube position={[-2, 0, 2]} height={3} color="#E1BEE7" />
                <BuildingTube position={[2, 0, 0]} height={3.5} color="#C8E6C9" />
                <BuildingTube position={[6, 0, 1]} height={3} color="#FFCCBC" />
            </group>

            {/* --- VEGETATION & PROPS --- */}
            {/* Trees around the central plot (Creating a park boundary) */}
            {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const r = 16; // Just inside the ring road
                return <Tree key={i} position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]} scale={1.5} />;
            })}

            {/* Lamp Posts along the road */}
            <LampPost position={[14, 0, 14]} />
            <LampPost position={[-14, 0, 14]} />
            <LampPost position={[14, 0, -14]} />
            <LampPost position={[-14, 0, -14]} />

        </group>
    );
};

const FlagPole = ({ position }) => (
    <group position={position}>
        <Cylinder args={[0.1, 0.1, 6, 8]} position={[0, 3, 0]}>
            <meshStandardMaterial color="#ddd" />
        </Cylinder>
        {/* Flag */}
        <Box args={[1.5, 1, 0.05]} position={[0.75, 5.5, 0]}>
            <meshStandardMaterial color="red" />
        </Box>
        {/* Star (Yellow square for simplicity, or we could draw Star shape) */}
        <Box args={[0.3, 0.3, 0.06]} position={[0.75, 5.5, 0]}>
            <meshStandardMaterial color="yellow" />
        </Box>
    </group>
);

export default SocialEnvironment;
