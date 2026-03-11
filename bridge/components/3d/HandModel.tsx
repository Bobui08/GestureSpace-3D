import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Mesh, Vector3 } from "three";

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

interface HandModelProps {
  landmarks: Landmark[] | null;
  isRight: boolean;
}

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [0, 5],
  [5, 6],
  [6, 7],
  [7, 8],
  [0, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [0, 13],
  [13, 14],
  [14, 15],
  [15, 16],
  [0, 17],
  [17, 18],
  [18, 19],
  [19, 20],
  [5, 9],
  [9, 13],
  [13, 17],
];

const HAND_JOINT_COUNT = 21;

const HandModel: React.FC<HandModelProps> = ({ landmarks, isRight }) => {
  const jointsRef = useRef<(Mesh | null)[]>([]);
  const bonesRef = useRef<(Mesh | null)[]>([]);
  const smoothPointsRef = useRef<Vector3[]>(
    Array.from({ length: HAND_JOINT_COUNT }, () => new Vector3())
  );
  const targetPointsRef = useRef<Vector3[]>(
    Array.from({ length: HAND_JOINT_COUNT }, () => new Vector3())
  );
  const tempMidRef = useRef(new Vector3());

  const project3D = (landmark: Landmark, viewport: { width: number; height: number }) => {
    const x = landmark.x * viewport.width - viewport.width / 2;
    const y = (1 - landmark.y) * viewport.height - viewport.height / 2;
    const z = -(landmark.z ?? 0) * viewport.width;
    return { x, y, z };
  };

  useFrame(({ viewport }, delta) => {
    if (!landmarks) return;

    const blend = Math.min(0.6, Math.max(0.22, delta * 10));

    for (let i = 0; i < HAND_JOINT_COUNT; i += 1) {
      const lm = landmarks[i];
      const target = targetPointsRef.current[i];
      const smooth = smoothPointsRef.current[i];
      const jointMesh = jointsRef.current[i];

      if (!lm) continue;

      const projected = project3D(lm, viewport);
      target.set(projected.x, projected.y, projected.z);
      smooth.lerp(target, blend);

      if (jointMesh) {
        jointMesh.position.copy(smooth);
      }
    }

    for (let i = 0; i < CONNECTIONS.length; i += 1) {
      const [startIdx, endIdx] = CONNECTIONS[i];
      const bone = bonesRef.current[i];
      if (!bone) continue;

      const start = smoothPointsRef.current[startIdx];
      const end = smoothPointsRef.current[endIdx];
      const midpoint = tempMidRef.current.copy(start).lerp(end, 0.5);
      const length = start.distanceTo(end);

      bone.position.copy(midpoint);
      bone.lookAt(end);
      bone.rotateX(Math.PI / 2);
      bone.scale.set(1, Math.max(0.001, length), 1);
    }
  });

  if (!landmarks) return null;

  return (
    <group>
      {Array.from({ length: HAND_JOINT_COUNT }).map((_, idx) => (
        <mesh
          key={`joint-${idx}`}
          ref={(el) => {
            jointsRef.current[idx] = el;
          }}
          scale={[0.15, 0.15, 0.15]}
        >
          <sphereGeometry args={[1, 16, 16]} />
          <meshStandardMaterial
            color={isRight ? "#4CAF50" : "#2196F3"}
            emissive={isRight ? "#1B5E20" : "#0B3D91"}
            emissiveIntensity={0.22}
          />
        </mesh>
      ))}

      {CONNECTIONS.map((_, idx) => (
        <mesh
          key={`bone-${idx}`}
          ref={(el) => {
            bonesRef.current[idx] = el;
          }}
        >
          <cylinderGeometry args={[0.08, 0.08, 1, 8]} />
          <meshStandardMaterial color="white" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

export default HandModel;
