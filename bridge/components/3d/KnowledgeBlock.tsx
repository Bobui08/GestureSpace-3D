import type { MutableRefObject } from "react";
import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text, useTexture } from "@react-three/drei";
import { Vector3 } from "three";
import type { Group } from "three";
import gsap from "gsap";
import { NODE_ICON_FILES, getImagePath } from "../../data/gameData";
import type { HandsResultsRef } from "../../hooks/useHandTracking";

type BlockProps = {
  data: {
    id: string;
    text: string;
    nodeType: string;
    position: [number, number, number];
    originalPosition: [number, number, number];
  };
  rightHandPosRef: MutableRefObject<Vector3>;
  leftHandPosRef: MutableRefObject<Vector3>;
  handsResultsRef: HandsResultsRef;
  grabbedBlockIdRef: MutableRefObject<string | null>;
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
  rightHandPosRef,
  leftHandPosRef,
  handsResultsRef,
  grabbedBlockIdRef,
  setGrabbedBlockId,
  onDrop,
}) => {
  const meshRef = useRef<Group>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isGrabbed, setIsGrabbed] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [balanceWarning, setBalanceWarning] = useState(false);
  const positionRef = useRef(new Vector3(...data.position));
  const targetRef = useRef(new Vector3(...data.position));
  const midPointRef = useRef(new Vector3());
  const hoveredRef = useRef(false);
  const grabbedRef = useRef(false);
  const shakingRef = useRef(false);
  const balanceWarningRef = useRef(false);
  const isHeavy = data.nodeType === "DIEM_CHI_HUY";
  const iconPath = getImagePath(
    NODE_ICON_FILES[data.nodeType as keyof typeof NODE_ICON_FILES] ?? NODE_ICON_FILES.CO_SO_QUAN_CHUNG
  );
  const iconTexture = useTexture(iconPath);

  const syncHovered = (nextValue: boolean) => {
    if (hoveredRef.current === nextValue) return;
    hoveredRef.current = nextValue;
    setIsHovered(nextValue);
  };

  const syncGrabbed = (nextValue: boolean) => {
    if (grabbedRef.current === nextValue) return;
    grabbedRef.current = nextValue;
    setIsGrabbed(nextValue);
  };

  const syncShaking = (nextValue: boolean) => {
    if (shakingRef.current === nextValue) return;
    shakingRef.current = nextValue;
    setIsShaking(nextValue);
  };

  const syncBalanceWarning = (nextValue: boolean) => {
    if (balanceWarningRef.current === nextValue) return;
    balanceWarningRef.current = nextValue;
    setBalanceWarning(nextValue);
  };

  useEffect(() => {
    positionRef.current.set(...data.position);
    targetRef.current.set(...data.position);
    syncHovered(false);
    syncGrabbed(false);
    syncShaking(false);
    syncBalanceWarning(false);
    if (meshRef.current) {
      meshRef.current.position.set(...data.position);
      meshRef.current.scale.set(1, 1, 1);
      meshRef.current.rotation.set(0, 0, 0);
    }
  }, [data.id, data.position]);

  useEffect(() => {
    if (!meshRef.current || grabbedRef.current) return;

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
    syncShaking(true);
    const tl = gsap.timeline({ onComplete: () => syncShaking(false) });
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
    if (!meshRef.current || shakingRef.current) return;

    const position = positionRef.current;
    const rightHandPos = rightHandPosRef.current;
    const leftHandPos = leftHandPosRef.current;
    const { gestureRight, gestureLeft } = handsResultsRef.current;
    const rightDist = rightHandPos.distanceTo(position);
    const leftDist = leftHandPos.distanceTo(position);
    const anyHandClose = rightDist < 1.45 || leftDist < 1.45;
    const dualClose = rightDist < 2 && leftDist < 2;
    syncHovered(anyHandClose);

    if (!grabbedRef.current) {
      if (grabbedBlockIdRef.current !== null) return;
      if (isHeavy) {
        if (dualClose && gestureRight === "PINCH" && gestureLeft === "PINCH") {
          syncGrabbed(true);
          setGrabbedBlockId(data.id);
          gsap.killTweensOf(meshRef.current.scale);
          gsap.killTweensOf(meshRef.current.position);
        }
      } else if (rightDist < 1.45 && gestureRight === "PINCH") {
        syncGrabbed(true);
        setGrabbedBlockId(data.id);
        gsap.killTweensOf(meshRef.current.scale);
        gsap.killTweensOf(meshRef.current.position);
      }
    }

    if (grabbedRef.current) {
      let stillGrabbing = false;
      if (isHeavy) {
        stillGrabbing = gestureRight === "PINCH" && gestureLeft === "PINCH";
        if (stillGrabbing) {
          const mid = midPointRef.current.set(
            (rightHandPos.x + leftHandPos.x) / 2,
            (rightHandPos.y + leftHandPos.y) / 2,
            0
          );
          position.lerp(mid, 0.2);
          syncBalanceWarning(Math.abs(rightHandPos.y - leftHandPos.y) > 2);
        }
      } else {
        stillGrabbing = gestureRight === "PINCH";
        if (stillGrabbing) {
          position.lerp(rightHandPos, 0.2);
        }
      }

      if (stillGrabbing) {
        meshRef.current.position.copy(position);
      } else {
        syncGrabbed(false);
        syncBalanceWarning(false);
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
    } else if (!shakingRef.current) {
      const target = targetRef.current.set(...data.position);
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
        position={[0.1, -0.02, 0.13]}
        fontSize={0.135}
        color={isHovered ? "#02121f" : "white"}
        maxWidth={1.9}
        textAlign="center"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.012}
        outlineColor="#0f172a"
      >
        {data.text} {isHeavy ? "(2 tay)" : ""}
      </Text>

      <mesh position={[-0.93, 0.28, 0.135]}>
        <planeGeometry args={[0.38, 0.38]} />
        <meshBasicMaterial color="#08111d" transparent opacity={0.88} />
      </mesh>

      <mesh position={[-0.93, 0.28, 0.14]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial map={iconTexture} transparent toneMapped={false} />
      </mesh>

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
