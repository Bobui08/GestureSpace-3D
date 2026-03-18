import type { MutableRefObject } from 'react';
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { VirusModel, StarModel } from './ProjectileModels';
import { HitEffect } from './ParticleSystem';
import type { HandsResultsRef, Landmark } from '../../hooks/useHandTracking';

// Projectile Type: 'BAD' (Vice) or 'GOOD' (Value)
type ProjectileType = 'BAD' | 'GOOD';

const BAD_LABELS = ['Càn quét', 'Lộ cơ sở', 'Đánh phá tiếp tế', 'Ấp chiến lược', 'Đổ bộ quân Mỹ', 'Nhiễu thông tin'];
const GOOD_LABELS = ['Chi viện', 'Bảo mật', 'Đoàn kết', 'Bám dân', 'Đấu trí', 'Phân tán lực lượng'];

const MovingProjectile = ({ id, pos, type, onHitHouse, onHitHand, leftHandPosRef, rightHandPosRef }: {
    id: number;
    pos: THREE.Vector3;
    type: ProjectileType;
    onHitHouse: (position: THREE.Vector3) => void;
    onHitHand: (position: THREE.Vector3) => void;
    leftHandPosRef: MutableRefObject<THREE.Vector3 | null>;
    rightHandPosRef: MutableRefObject<THREE.Vector3 | null>;
}) => {
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

        if (checkHand(leftHandPosRef.current) || checkHand(rightHandPosRef.current)) {
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

const calculateWorldPos = (target: THREE.Vector3, hand: Landmark[] | null) => {
    if (!hand || !hand[8]) return null;
    target.set((0.5 - hand[8].x) * 16, (0.5 - hand[8].y) * 10 + 2, 5);
    return target;
};

const DefensePhase = ({ handsResultsRef }: { handsResultsRef: HandsResultsRef }) => {
    const { damageHouse, healHouse, gamePhase } = useGameStore();
    const [projectiles, setProjectiles] = useState<{ id: number, pos: THREE.Vector3, type: ProjectileType }[]>([]);
    const [effects, setEffects] = useState<{ id: number, pos: THREE.Vector3, color: string }[]>([]);
    const [damageTrigger, setDamageTrigger] = useState(0); // Trigger for flash
    const lastSpawnTime = useRef(0);
    const leftHandPosRef = useRef<THREE.Vector3 | null>(null);
    const rightHandPosRef = useRef<THREE.Vector3 | null>(null);
    const leftShieldRef = useRef<THREE.Mesh>(null);
    const rightShieldRef = useRef<THREE.Mesh>(null);
    const leftTargetRef = useRef(new THREE.Vector3());
    const rightTargetRef = useRef(new THREE.Vector3());

    const addEffect = (pos, color) => {
        setEffects(prev => [...prev, { id: Date.now() + Math.random(), pos: pos.clone(), color }]);
    };

    useFrame((state) => {
        const { leftHand, rightHand } = handsResultsRef.current;
        leftHandPosRef.current = calculateWorldPos(leftTargetRef.current, leftHand);
        rightHandPosRef.current = calculateWorldPos(rightTargetRef.current, rightHand);

        if (leftShieldRef.current) {
            leftShieldRef.current.visible = Boolean(leftHandPosRef.current);
            if (leftHandPosRef.current) {
                leftShieldRef.current.position.copy(leftHandPosRef.current);
            }
        }

        if (rightShieldRef.current) {
            rightShieldRef.current.visible = Boolean(rightHandPosRef.current);
            if (rightHandPosRef.current) {
                rightShieldRef.current.position.copy(rightHandPosRef.current);
            }
        }

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
            <mesh ref={leftShieldRef} visible={false}>
                <ringGeometry args={[0.2, 0.6, 32]} />
                <meshBasicMaterial color="#00f3ff" side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={rightShieldRef} visible={false}>
                <ringGeometry args={[0.2, 0.6, 32]} />
                <meshBasicMaterial color="#00f3ff" side={THREE.DoubleSide} />
            </mesh>

            {projectiles.map(p => (
                <MovingProjectile
                    key={p.id}
                    {...p}
                    onHitHouse={(pos) => handleHitHouse(p.id, p.type, pos)}
                    leftHandPosRef={leftHandPosRef}
                    rightHandPosRef={rightHandPosRef}
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
