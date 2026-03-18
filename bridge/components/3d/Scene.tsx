import React, { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import type { Group } from "three";
import HouseZone from "./HouseZone";
import KnowledgeBlock from "./KnowledgeBlock";
import { useGameStore } from "../../store/gameStore";
import { BLOCKS, SLOTS } from "../../data/gameData";
import HandModel from "./HandModel";
import type { HandsResultsRef, Landmark } from "../../hooks/useHandTracking";

const OFFSCREEN_Y = -999;

const updateHandPosition = (target: Vector3, fingerTip: Landmark | undefined, viewport: { width: number; height: number }) => {
  if (!fingerTip) {
    target.set(0, OFFSCREEN_Y, 0);
    return;
  }

  target.set(
    (1 - fingerTip.x) * viewport.width - viewport.width / 2,
    (1 - fingerTip.y) * viewport.height - viewport.height / 2,
    0
  );
};

const Scene = ({ handsResultsRef }: { handsResultsRef: HandsResultsRef }) => {
  const groupRef = useRef<Group>(null);
  const { currentStage, placedBlocks, placeBlock } = useGameStore();
  const grabbedBlockIdRef = useRef<string | null>(null);
  const rightHandPosRef = useRef(new Vector3(0, OFFSCREEN_Y, 0));
  const leftHandPosRef = useRef(new Vector3(0, OFFSCREEN_Y, 0));

  const availableBlocks = useMemo(() => {
    const placedIds = (placedBlocks[currentStage] ?? []).map((b) => b.id);
    const stageBlocks = BLOCKS[currentStage] ?? [];
    return stageBlocks
      .filter((b) => !placedIds.includes(b.id))
      .map((block, index) => ({
        ...block,
        position: [index % 2 === 0 ? -6 : -8, 1.8 + index * 1.3, 0] as [number, number, number],
        originalPosition: [index % 2 === 0 ? -6 : -8, 1.8 + index * 1.3, 0] as [number, number, number],
      }));
  }, [currentStage, placedBlocks]);

  useFrame(({ viewport }) => {
    const { leftHand, rightHand } = handsResultsRef.current;
    updateHandPosition(rightHandPosRef.current, rightHand?.[8], viewport);
    updateHandPosition(leftHandPosRef.current, leftHand?.[8], viewport);
  });

  useEffect(() => {
    grabbedBlockIdRef.current = null;
  }, [currentStage]);

  const handleDrop = (dropPos: Vector3, block: any) => {
    const stageSlots = SLOTS[currentStage] ?? [];
    let placementResult: { success: boolean; reason?: string } | null = null;

    for (let i = 0; i < stageSlots.length; i += 1) {
      if (placedBlocks[currentStage]?.[i]) continue;

      const worldSlotPos = new Vector3(...stageSlots[i].pos);
      if (groupRef.current) worldSlotPos.applyMatrix4(groupRef.current.matrixWorld);

      if (dropPos.distanceTo(worldSlotPos) < 1.55) {
        placementResult = placeBlock(currentStage, block);
        break;
      }
    }

    if (placementResult?.success) {
      grabbedBlockIdRef.current = null;
      return placementResult;
    }
    return { success: false, reason: "NO_NEARBY_SLOT" };
  };

  return (
    <>
      <group ref={groupRef}>
        <HouseZone />
      </group>

      <HandModel handsResultsRef={handsResultsRef} hand="left" isRight={false} />
      <HandModel handsResultsRef={handsResultsRef} hand="right" isRight />

      {availableBlocks.map((block) => (
        <KnowledgeBlock
          key={block.id}
          data={block}
          rightHandPosRef={rightHandPosRef}
          leftHandPosRef={leftHandPosRef}
          handsResultsRef={handsResultsRef}
          grabbedBlockIdRef={grabbedBlockIdRef}
          setGrabbedBlockId={(id) => {
            grabbedBlockIdRef.current = id;
          }}
          onDrop={(_, pos) => handleDrop(pos, block)}
        />
      ))}
    </>
  );
};

export default Scene;
