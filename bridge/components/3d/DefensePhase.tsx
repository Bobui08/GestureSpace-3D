import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';

// Projectile Type: 'BAD' (Vice) or 'GOOD' (Value)
type ProjectileType = 'BAD' | 'GOOD';

const BAD_LABELS = ['Ma túy', 'Cờ bạc', 'Mại dâm', 'Bạo lực', 'Rượu chè', 'Mê tín'];
const GOOD_LABELS = ['Hạnh phúc', 'Yêu thương', 'Sẻ chia', 'Thủy chung', 'Hiếu thảo', 'Hòa thuận'];

const MovingProjectile = ({ id, pos, type, onHitHouse, onHitHand, leftHandPos, rightHandPos }) => {
    const ref = useRef<THREE.Group>(null);
    const [isDead, setIsDead] = useState(false);
    const speed = useRef(Math.random() * 2 + 3); // Speed 3-5

    const label = useMemo(() => {
        const list = type === 'BAD' ? BAD_LABELS : GOOD_LABELS;
        return list[Math.floor(Math.random() * list.length)];
    }, [type]);

    useFrame((state, delta) => {
        if (isDead || !ref.current) return;

        // Move towards house center (0, 2, 0)
        const target = new THREE.Vector3(0, 2, 0);
        const dir = target.clone().sub(ref.current.position).normalize();
        ref.current.position.add(dir.multiplyScalar(speed.current * delta));

        // House Collision Check
        if (ref.current.position.distanceTo(target) < 1.0) {
            onHitHouse();
            setIsDead(true);
            return;
        }

        // Hand Collision Check
        // Hand Collision Check - Improved
        const checkHand = (handPos) => {
            if (!handPos) return false;

            // IGNORE Z distance for gameplay feel (perspective projection is tricky)
            // Just check XY plane distance with larger radius
            const distXY = new THREE.Vector2(ref.current.position.x, ref.current.position.y)
                .distanceTo(new THREE.Vector2(handPos.x, handPos.y));

            // Check Z to ensure it's not BEHIND the player too much (hand is at Z=5)
            // Projectile moves from Z=15 to Z=0. Hand is at Z=5.
            // Allow hit if projectile is roughly near the hand plane or passed it slightly
            const zDiff = Math.abs(ref.current.position.z - handPos.z);

            // Radius 1.5 for XY, and generous Z range
            return distXY < 1.5 && zDiff < 4.0;
        };

        if (checkHand(leftHandPos) || checkHand(rightHandPos)) {
            // Hand hit
            onHitHand();
            setIsDead(true);
        }
    });

    if (isDead) return null;

    return (
        <group ref={ref} position={pos}>
            <Sphere args={[0.4, 16, 16]}>
                <meshStandardMaterial
                    color={type === 'BAD' ? '#212121' : '#FFD700'}
                    emissive={type === 'BAD' ? '#000000' : '#FFA000'}
                    emissiveIntensity={0.5}
                />
            </Sphere>
            <Billboard>
                <Text
                    position={[0, 0.6, 0]}
                    fontSize={0.4}
                    color="white"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.05}
                    outlineColor="black"
                >
                    {label}
                </Text>
            </Billboard>
        </group>
    );
};

const DefensePhase = ({ leftHand, rightHand }) => {
    const { damageHouse, healHouse, gamePhase } = useGameStore();
    const [projectiles, setProjectiles] = useState<{ id: number, pos: THREE.Vector3, type: ProjectileType }[]>([]);
    const lastSpawnTime = useRef(0);

    // Convert hand landmarks to 3D roughly
    // This is a naive conversion. In Game.tsx or Scene.tsx we have a better mapping usually.
    // If not passed, we can't interact.
    // Let's assume leftHand/rightHand props are the RAW landmarks from MediaPipe (0-1).
    // calculateWorldPos converts normalized coords to Scene coords at Z=5 (mid-air).
    const calculateWorldPos = (hand) => {
        if (!hand || !hand[8]) return null; // Index finger tip
        // Viewport: x: -8 to 8, y: -5 to 5 approx at Z=0.
        // Camera at Z=10.
        // If we want to interact at Z=5 (midway), parallax applies.
        // Simple mapping for now:
        const x = (0.5 - hand[8].x) * 16; // Invert X
        const y = (0.5 - hand[8].y) * 10; // Invert Y
        return new THREE.Vector3(x, y + 2, 5); // Offset Y+2 to match center, Z=5 to be in front
    };

    const leftPos = useMemo(() => calculateWorldPos(leftHand), [leftHand]);
    const rightPos = useMemo(() => calculateWorldPos(rightHand), [rightHand]);

    useFrame((state) => {
        if (gamePhase !== 'DEFEND') return;

        const time = state.clock.getElapsedTime();
        if (time - lastSpawnTime.current > 1.2) {
            lastSpawnTime.current = time;

            // Spawn from distance 15
            // RESTRICT TO FRONT SEMISPHERE (Z > 0)
            // Angle 0 to PI (0 is +X, PI is -X, Z is sin) -> wait Threejs coords:
            // X right, Y up, Z towards viewer.
            // We want Z > 0 (front). 
            // x = r * cos(theta), z = r * sin(theta)
            // sin(theta) > 0 implies theta in (0, PI).

            const angle = Math.random() * Math.PI; // 0 to PI
            const r = 15;
            // Spawn mainly from upper hemisphere
            const yOffset = Math.random() * 5 + 2;
            const x = Math.cos(angle) * r;
            const z = Math.abs(Math.sin(angle) * r); // Force Z positive just in case

            // Logic to ensure they come from "Customer View" (Z > 0) mostly?
            // Actually random is fine for chaos.

            const type = Math.random() > 0.4 ? 'BAD' : 'GOOD';

            setProjectiles(prev => [...prev, {
                id: Date.now(),
                pos: new THREE.Vector3(x, yOffset, z),
                type
            }]);
        }
    });

    const handleHitHouse = (id, type) => {
        if (type === 'BAD') {
            damageHouse(10);
            // Shake effect?
        } else {
            healHouse(5);
        }
        setProjectiles(prev => prev.filter(p => p.id !== id));
    };

    const handleHitHand = (id, type) => {
        if (type === 'BAD') {
            // Blocked Bad!
            // Sound effect?
        } else {
            // Collected Good!
            healHouse(5);
        }
        setProjectiles(prev => prev.filter(p => p.id !== id));
    };

    return (
        <group>
            {/* Hand Visualizers (Shields) */}
            {leftPos && (
                <mesh position={leftPos}>
                    <ringGeometry args={[0.5, 1.5, 32]} />
                    <meshBasicMaterial color="#00f3ff" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}
            {rightPos && (
                <mesh position={rightPos}>
                    <ringGeometry args={[0.5, 1.5, 32]} />
                    <meshBasicMaterial color="#00f3ff" transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}

            {projectiles.map(p => (
                <MovingProjectile
                    key={p.id}
                    {...p}
                    onHitHouse={() => handleHitHouse(p.id, p.type)}
                    leftHandPos={leftPos}
                    rightHandPos={rightPos}
                    onHitHand={() => handleHitHand(p.id, p.type)}
                />
            ))}
        </group>
    );
};

export default DefensePhase;
