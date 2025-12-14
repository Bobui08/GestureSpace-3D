import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3, MathUtils } from 'three';
import HouseZone from './HouseZone';
import KnowledgeBlock from './KnowledgeBlock';
import { useGameStore } from '../../store/gameStore';
import { BLOCKS, STAGES, SLOTS } from '../../data/gameData';
import HandModel from './HandModel';

const Scene = ({ leftHand, rightHand, gestureLeft, gestureRight }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();
    const [rotation, setRotation] = useState([0, 0, 0]);
    const { currentStage, placedBlocks, placeBlock } = useGameStore();

    const [availableBlocks, setAvailableBlocks] = useState([]);
    const [grabbedBlockId, setGrabbedBlockId] = useState<string | null>(null);
    // Single Block Grab Restriction


    useEffect(() => {
        const placedIds = placedBlocks[currentStage].map(b => b.id);
        const stageBlocks = BLOCKS[currentStage] || [];
        const remaining = stageBlocks.filter(b => !placedIds.includes(b.id));

        setAvailableBlocks(remaining.map((b, i) => ({
            ...b,
            position: [
                (i % 2 === 0 ? -6 : -8),
                2 + i * 1.5,
                0
            ],
            originalPosition: [
                (i % 2 === 0 ? -6 : -8),
                2 + i * 1.5,
                0
            ]
        })));
    }, [currentStage, placedBlocks]);

    useFrame(() => {
        // Only rotate if Left Hand is used and NO Mouse interaction is active (OrbitControls usually takes over)
        // But user asked for "Hand rotates" AND "Mouse rotates". 
        // OrbitControls handles mouse. Hand handles custom logic.
        // To allow OrbitControls to work, we shouldn't force rotation unless hand gesture is detected.
        if (leftHand && (gestureLeft === 'PINCH' || gestureLeft === 'OPEN')) {
            const indexTip = leftHand[8];
            const targetRotY = (indexTip.x - 0.5) * Math.PI * 2;
            const targetRotX = (indexTip.y - 0.5) * Math.PI * 0.5;

            // groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
            // groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);

            // Let's modify the Group rotation, not Camera. OrbitControls moves Camera.
            // So they can coexist.
            if (groupRef.current) {
                groupRef.current.rotation.y = MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.1);
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.1);
            }
        }
    });



    // --- Hand Position Logic ---
    const [handPos, setHandPos] = useState(new Vector3(0, 0, 0)); // Right Hand
    const [leftHandPos, setLeftHandPos] = useState(new Vector3(0, 0, 0)); // Left Hand

    useFrame(({ camera, viewport }) => {
        // Right Hand Processing
        if (rightHand && rightHand[8]) {
            const x = (1 - rightHand[8].x) * viewport.width - viewport.width / 2;
            const y = (1 - rightHand[8].y) * viewport.height - viewport.height / 2;
            setHandPos(new Vector3(x, y, 0));
        }

        // Left Hand Processing
        if (leftHand && leftHand[8]) {
            const x = (1 - leftHand[8].x) * viewport.width - viewport.width / 2;
            const y = (1 - leftHand[8].y) * viewport.height - viewport.height / 2;
            setLeftHandPos(new Vector3(x, y, 0));
        }
    });

    const handleDrop = (id, dropPos, block) => {
        const stageSlots = SLOTS[currentStage];
        let matched = false;
        let placementResult = null;

        for (let i = 0; i < stageSlots.length; i++) {
            const slot = stageSlots[i];
            if (placedBlocks[currentStage][i]) continue;

            const localSlotPos = new Vector3(...slot.pos);
            if (groupRef.current) {
                localSlotPos.applyMatrix4(groupRef.current.matrixWorld);
            }

            if (dropPos.distanceTo(localSlotPos) < 2.0) {
                const res = placeBlock(currentStage, block);
                placementResult = res;
                if (res.success) {
                    matched = true;
                }
                break;
            }
        }

        if (!matched) {
            console.log("Wrong placement - returning failure");
            return { success: false, reason: 'NO_NEARBY_SLOT' };
        }

        if (placementResult && placementResult.success) {
            setGrabbedBlockId(null); // Unlock when successfully placed
        }

        return placementResult || { success: false };
    };

    return (
        <>
            <group ref={groupRef}>
                <HouseZone />
            </group>

            {/* Hand Models */}
            <HandModel landmarks={leftHand} isRight={false} />
            <HandModel landmarks={rightHand} isRight={true} />

            {availableBlocks.map((block) => (
                <KnowledgeBlock
                    key={block.id}
                    data={block}
                    handPos={handPos}
                    leftHandPos={leftHandPos}
                    gestureRight={gestureRight}
                    gestureLeft={gestureLeft}
                    grabbedBlockId={grabbedBlockId}
                    setGrabbedBlockId={setGrabbedBlockId}
                    onDrop={(id, pos) => handleDrop(id, pos, block)}
                />
            ))}
        </>
    );
};

export default Scene;
