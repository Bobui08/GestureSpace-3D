import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, RoundedBox, Text } from "@react-three/drei";
import { Vector3 } from "three";
import gsap from "gsap";
import { NODE_ICON_FILES, getImagePath } from "../../data/gameData";

type BlockProps = {
  data: {
    id: string;
    text: string;
    nodeType: string;
    position: [number, number, number];
    originalPosition: [number, number, number];
  };
  handPos: Vector3;
  leftHandPos: Vector3;
  gestureRight: string;
  gestureLeft: string;
  grabbedBlockId: string | null;
  setGrabbedBlockId: (id: string | null) => void;
  onDrop: (id: string, pos: Vector3) => { success: boolean } | undefined;
};

const getNodeColor = (nodeType: string, warning: boolean): string => {
  if (warning) return "#ef4444";
  switch (nodeType) {
    case "CO_SO_QUAN_CHUNG":
      return "#4ade80";
    case "DU_KICH":
      return "#22d3ee";
    case "TUYEN_VAN_CHUYEN":
      return "#f59e0b";
    case "VUNG_AN_TOAN":
      return "#60a5fa";
    case "DIEM_CHI_HUY":
      return "#f43f5e";
    default:
      return "#64748b";
  }
};

const KnowledgeBlock: React.FC<BlockProps> = ({
  data,
  handPos,
  leftHandPos,
  gestureRight,
  gestureLeft,
  grabbedBlockId,
  setGrabbedBlockId,
  onDrop,
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState(false);
  const [position] = useState(new Vector3(...data.position));
  const isHeavy = data.nodeType === "DIEM_CHI_HUY";
  const iconPath = getImagePath(
    NODE_ICON_FILES[data.nodeType as keyof typeof NODE_ICON_FILES] ?? NODE_ICON_FILES.CO_SO_QUAN_CHUNG
  );

  useEffect(() => {
    if (!meshRef.current || isGrabbed) return;

    gsap.to(meshRef.current.scale, {
      x: 1.04,
      y: 1.04,
      z: 1.04,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    gsap.to(meshRef.current.position, {
      y: data.position[1] + 0.15,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      if (!meshRef.current) return;
      gsap.killTweensOf(meshRef.current.scale);
      gsap.killTweensOf(meshRef.current.position);
    };
  }, [data.position, isGrabbed]);

  const triggerShake = () => {
    if (!meshRef.current) return;
    setIsShaking(true);
    const tl = gsap.timeline({ onComplete: () => setIsShaking(false) });
    tl.to(meshRef.current.position, {
      x: "+=0.08",
      duration: 0.05,
      repeat: 5,
      yoyo: true,
    }).to(
      meshRef.current.rotation,
      { z: "+=0.08", duration: 0.05, repeat: 5, yoyo: true },
      0
    );
  };

  useFrame(() => {
    if (!meshRef.current || isShaking) return;

    const rightDist = handPos ? handPos.distanceTo(position) : 999;
    const leftDist = leftHandPos ? leftHandPos.distanceTo(position) : 999;
    const anyHandClose = rightDist < 1.45 || leftDist < 1.45;
    const dualClose = rightDist < 2 && leftDist < 2;
    setIsHovered(anyHandClose);

    if (!isGrabbed) {
      if (grabbedBlockId !== null) return;
      if (isHeavy) {
        if (dualClose && gestureRight === "PINCH" && gestureLeft === "PINCH") {
          setIsGrabbed(true);
          setGrabbedBlockId(data.id);
          gsap.killTweensOf(meshRef.current.scale);
          gsap.killTweensOf(meshRef.current.position);
        }
      } else if (rightDist < 1.45 && gestureRight === "PINCH") {
        setIsGrabbed(true);
        setGrabbedBlockId(data.id);
        gsap.killTweensOf(meshRef.current.scale);
        gsap.killTweensOf(meshRef.current.position);
      }
    }

    if (isGrabbed) {
      let stillGrabbing = false;
      if (isHeavy) {
        stillGrabbing = gestureRight === "PINCH" && gestureLeft === "PINCH";
        if (stillGrabbing) {
          const mid = new Vector3(
            (handPos.x + leftHandPos.x) / 2,
            (handPos.y + leftHandPos.y) / 2,
            0
          );
          position.lerp(mid, 0.2);
          setBalanceWarning(Math.abs(handPos.y - leftHandPos.y) > 2);
        }
      } else {
        stillGrabbing = gestureRight === "PINCH";
        if (stillGrabbing) {
          position.lerp(handPos, 0.2);
        }
      }

      if (stillGrabbing) {
        meshRef.current.position.copy(position);
      } else {
        setIsGrabbed(false);
        setBalanceWarning(false);
        const result = onDrop(data.id, position);

        if (!result?.success) {
          setGrabbedBlockId(null);
          triggerShake();
          gsap.to(position, {
            x: data.position[0],
            y: data.position[1],
            z: data.position[2],
            duration: 0.45,
            ease: "back.out(1.7)",
            onUpdate: () => meshRef.current?.position.copy(position),
          });
        }

        gsap.to(meshRef.current.scale, { x: 1, y: 1, z: 1, duration: 0.2 });
      }
    } else if (!isShaking) {
      const target = new Vector3(...data.position);
      position.lerp(target, 0.05);
      meshRef.current.position.x = position.x;
      meshRef.current.position.z = position.z;
    }
  });

  return (
    <group ref={meshRef} position={data.position}>
      <RoundedBox args={[2.58, 1.05, 0.24]} radius={0.13} smoothness={6}>
        <meshStandardMaterial
          color={isHovered ? "#0ea5e9" : getNodeColor(data.nodeType, balanceWarning)}
          emissive={isHovered ? "#0284c7" : "#000000"}
          emissiveIntensity={isHovered ? 0.35 : 0}
          metalness={0.2}
          roughness={0.5}
        />
      </RoundedBox>

      <Text
        position={[0, 0, 0.13]}
        fontSize={0.135}
        color={isHovered ? "#02121f" : "white"}
        maxWidth={2.2}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#0f172a"
      >
        {data.text} {isHeavy ? "(2 tay)" : ""}
      </Text>

      <Html position={[-1.02, 0, 0.18]} transform distanceFactor={6} style={{ pointerEvents: "none" }}>
        <img
          src={iconPath}
          alt={data.nodeType}
          style={{
            width: 26,
            height: 26,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.6)",
            background: "rgba(2, 6, 23, 0.65)",
            objectFit: "cover",
          }}
        />
      </Html>

      {isGrabbed && isHeavy && (
        <mesh position={[0, -1, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3.7]} />
          <meshBasicMaterial color={balanceWarning ? "#ef4444" : "#22c55e"} transparent opacity={0.45} />
        </mesh>
      )}
    </group>
  );
};

export default KnowledgeBlock;
