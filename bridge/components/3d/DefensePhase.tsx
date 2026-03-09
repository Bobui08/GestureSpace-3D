import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { VirusModel, StarModel } from './ProjectileModels';
import { HitEffect } from './ParticleSystem';

// Projectile Type: 'BAD' (Vice) or 'GOOD' (Value)
type ProjectileType = 'BAD' | 'GOOD';

const BAD_LABELS = ['Can quet', 'Lo co so', 'Danh pha tiep te', 'Ap chien luoc', 'Do bo quan My', 'Nhiu thong tin'];
const GOOD_LABELS = ['Chi vien', 'Bao mat', 'Doan ket', 'Bam dan', 'Dau tri', 'Phan tan luc luong'];

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
            onHitHouse(ref.current.position);
            setIsDead(true);
            return;
        }

        // Hand Collision Check
        const checkHand = (handPos) => {
            if (!handPos) return false;

            // Just check XY plane distance with larger radius
            const distXY = new THREE.Vector2(ref.current.position.x, ref.current.position.y)
                .distanceTo(new THREE.Vector2(handPos.x, handPos.y));

            // Check Z to ensure it's not BEHIND the player too much (hand is at Z=5)
            const zDiff = Math.abs(ref.current.position.z - handPos.z);

            // Radius 1.5 for XY, and generous Z range
            return distXY < 0.7 && zDiff < 4.0;
        };

        if (checkHand(leftHandPos) || checkHand(rightHandPos)) {
            onHitHand(ref.current.position);
            setIsDead(true);
        }
    });

    if (isDead) return null;

    return (
        <group ref={ref} position={pos}>
            {type === 'BAD' ? (
                <VirusModel color="#212121" />
            ) : (
                <StarModel color="#FFD700" />
            )}
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

// --- Damage Flash Component ---
const DamageFlash = ({ trigger }) => {
    const meshRef = useRef<THREE.Mesh>(null);
    const { camera } = useThree();
    const [opacity, setOpacity] = useState(0);

    useEffect(() => {
        if (trigger) {
            setOpacity(0.5);
        }
    }, [trigger]);

    useFrame((state, delta) => {
        if (opacity > 0) {
            setOpacity(Math.max(0, opacity - delta * 2));
        }
        if (meshRef.current) {
            meshRef.current.lookAt(camera.position);
            // Keep it in front of camera
            meshRef.current.position.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(1));
        }
    });

    if (opacity <= 0) return null;

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[10, 10]} />
            <meshBasicMaterial color="red" transparent opacity={opacity} depthTest={false} />
        </mesh>
    );
};

const DefensePhase = ({ leftHand, rightHand }) => {
    const { damageHouse, healHouse, gamePhase } = useGameStore();
    const [projectiles, setProjectiles] = useState<{ id: number, pos: THREE.Vector3, type: ProjectileType }[]>([]);
    const [effects, setEffects] = useState<{ id: number, pos: THREE.Vector3, color: string }[]>([]);
    const [damageTrigger, setDamageTrigger] = useState(0); // Trigger for flash
    const lastSpawnTime = useRef(0);

    // Convert hand landmarks to 3D
    const calculateWorldPos = (hand) => {
        if (!hand || !hand[8]) return null;
        const x = (0.5 - hand[8].x) * 16;
        const y = (0.5 - hand[8].y) * 10;
        return new THREE.Vector3(x, y + 2, 5);
    };

    const leftPos = useMemo(() => calculateWorldPos(leftHand), [leftHand]);
    const rightPos = useMemo(() => calculateWorldPos(rightHand), [rightHand]);

    const addEffect = (pos, color) => {
        setEffects(prev => [...prev, { id: Date.now() + Math.random(), pos: pos.clone(), color }]);
    };

    useFrame((state) => {
        if (gamePhase !== 'DEFEND') return;

        const time = state.clock.getElapsedTime();
        if (time - lastSpawnTime.current > 1.2) {
            lastSpawnTime.current = time;

            // Spawn from distance 15
            // Restrict to FRONT narrower cone (60 to 120 degrees)
            const angle = Math.PI / 3 + Math.random() * (Math.PI / 3);
            const r = 15;
            const yOffset = Math.random() * 5 + 2;
            const x = Math.cos(angle) * r;
            const z = Math.abs(Math.sin(angle) * r);

            const type = Math.random() > 0.4 ? 'BAD' : 'GOOD';

            setProjectiles(prev => [...prev, {
                id: Date.now(),
                pos: new THREE.Vector3(x, yOffset, z),
                type
            }]);
        }
    });

    const handleHitHouse = (id, type, pos) => {
        if (type === 'BAD') {
            damageHouse(10);
            addEffect(pos, '#ff0000'); // Red explosion for damage
            setDamageTrigger(Date.now()); // Trigger flash
        } else {
            // Missed a Good Value! No heal.
            // Maybe a subtle fade out effect?
            addEffect(pos, '#ffffff'); // White puff (missed)
        }
        setProjectiles(prev => prev.filter(p => p.id !== id));
    };

    const handleHitHand = (id, type, pos) => {
        if (type === 'BAD') {
            // Blocked Bad!
            addEffect(pos, '#555555'); // Grey explosion (blocked)
        } else {
            // Collected Good!
            healHouse(10); // Reward active catching more
            addEffect(pos, '#FFD700'); // Gold sparkles
        }
        setProjectiles(prev => prev.filter(p => p.id !== id));
    };

    return (
        <group>
            {/* Hand Visualizers (Shields) */}
            {leftPos && (
                <mesh position={leftPos}>
                    <ringGeometry args={[0.2, 0.6, 32]} />
                    <meshBasicMaterial color="#00f3ff" side={THREE.DoubleSide} />
                </mesh>
            )}
            {rightPos && (
                <mesh position={rightPos}>
                    <ringGeometry args={[0.2, 0.6, 32]} />
                    <meshBasicMaterial color="#00f3ff" side={THREE.DoubleSide} />
                </mesh>
            )}

            {projectiles.map(p => (
                <MovingProjectile
                    key={p.id}
                    {...p}
                    onHitHouse={(pos) => handleHitHouse(p.id, p.type, pos)}
                    leftHandPos={leftPos}
                    rightHandPos={rightPos}
                    onHitHand={(pos) => handleHitHand(p.id, p.type, pos)}
                />
            ))}

            {/* Particle Effects */}
            {effects.map(e => (
                <HitEffect
                    key={e.id}
                    position={e.pos}
                    color={e.color}
                    onComplete={() => setEffects(prev => prev.filter(eff => eff.id !== e.id))}
                />
            ))}

            <DamageFlash trigger={damageTrigger} />
        </group>
    );
};

export default DefensePhase;
