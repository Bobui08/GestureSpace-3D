import React, { useEffect, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import HouseZone from "./HouseZone";
import KnowledgeBlock from "./KnowledgeBlock";
import { useGameStore } from "../../store/gameStore";
import { BLOCKS, SLOTS } from "../../data/gameData";
import HandModel from "./HandModel";

const Scene = ({ leftHand, rightHand, gestureLeft, gestureRight }) => {
  const groupRef = useRef<THREE.Group>(null);
  const { currentStage, placedBlocks, placeBlock } = useGameStore();

  const [availableBlocks, setAvailableBlocks] = useState<any[]>([]);
  const [grabbedBlockId, setGrabbedBlockId] = useState<string | null>(null);
  const [rightHandPos, setRightHandPos] = useState(new Vector3(0, 0, 0));
  const [leftHandPos, setLeftHandPos] = useState(new Vector3(0, 0, 0));

  useEffect(() => {
    const placedIds = (placedBlocks[currentStage] ?? []).map((b) => b.id);
    const stageBlocks = BLOCKS[currentStage] ?? [];
    const remaining = stageBlocks.filter((b) => !placedIds.includes(b.id));

    setAvailableBlocks(
      remaining.map((block, index) => ({
        ...block,
        position: [index % 2 === 0 ? -6 : -8, 1.8 + index * 1.3, 0] as [number, number, number],
        originalPosition: [index % 2 === 0 ? -6 : -8, 1.8 + index * 1.3, 0] as [number, number, number],
      }))
    );
  }, [currentStage, placedBlocks]);

  useFrame(({ viewport }) => {
    if (rightHand?.[8]) {
      const x = (1 - rightHand[8].x) * viewport.width - viewport.width / 2;
      const y = (1 - rightHand[8].y) * viewport.height - viewport.height / 2;
      setRightHandPos(new Vector3(x, y, 0));
    }
    if (leftHand?.[8]) {
      const x = (1 - leftHand[8].x) * viewport.width - viewport.width / 2;
      const y = (1 - leftHand[8].y) * viewport.height - viewport.height / 2;
      setLeftHandPos(new Vector3(x, y, 0));
    }
  });

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
      setGrabbedBlockId(null);
      return placementResult;
    }
    return { success: false, reason: "NO_NEARBY_SLOT" };
  };

  return (
    <>
      <group ref={groupRef}>
        <HouseZone />
      </group>

      <HandModel landmarks={leftHand} isRight={false} />
      <HandModel landmarks={rightHand} isRight />

      {availableBlocks.map((block) => (
        <KnowledgeBlock
          key={block.id}
          data={block}
          handPos={rightHandPos}
          leftHandPos={leftHandPos}
          gestureRight={gestureRight}
          gestureLeft={gestureLeft}
          grabbedBlockId={grabbedBlockId}
          setGrabbedBlockId={setGrabbedBlockId}
          onDrop={(_, pos) => handleDrop(pos, block)}
        />
      ))}
    </>
  );
};

export default Scene;
