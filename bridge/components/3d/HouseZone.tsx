import { STAGES, SLOTS } from '../../data/gameData';
import { useGameStore } from '../../store/gameStore';
import { Box, Cone, Cylinder } from '@react-three/drei';

const HouseZone = () => {
    const { placedBlocks, currentStage } = useGameStore();

    // Slot definitions
    const foundationSlots = SLOTS[STAGES.FOUNDATION];
    const pillarSlots = SLOTS[STAGES.PILLARS];
    const wallSlots = SLOTS[STAGES.WALLS];
    const roofSlots = SLOTS[STAGES.ROOF];

    return (
        <group>
            {/* FOUNDATION */}
            {foundationSlots.map((slot, i) => (
                <group key={slot.id} position={slot.pos}>
                    <Box args={[2, 0.5, 2]}>
                        <meshStandardMaterial
                            color={placedBlocks[STAGES.FOUNDATION][i] ? '#4CAF50' : '#333'}
                            transparent
                            opacity={placedBlocks[STAGES.FOUNDATION][i] ? 1 : 0.3}
                            wireframe={!placedBlocks[STAGES.FOUNDATION][i]}
                        />
                    </Box>
                    {placedBlocks[STAGES.FOUNDATION][i] && (
                        // Show text or content of placed block?
                        <mesh position={[0, 0.3, 0]} />
                    )}
                </group>
            ))}

            {/* PILLARS - Show phantom only if Foundation complete or active */}
            {(currentStage === STAGES.PILLARS || placedBlocks[STAGES.PILLARS].length > 0 || currentStage === STAGES.WALLS || currentStage === STAGES.ROOF || currentStage === 'WON') && pillarSlots.map((slot, i) => (
                <group key={slot.id} position={slot.pos}>
                    <Cylinder args={[0.3, 0.3, 3, 16]}>
                        <meshStandardMaterial
                            color={placedBlocks[STAGES.PILLARS][i] ? '#8BC34A' : '#444'}
                            transparent
                            opacity={placedBlocks[STAGES.PILLARS][i] ? 1 : 0.2}
                            wireframe={!placedBlocks[STAGES.PILLARS][i]}
                        />
                    </Cylinder>
                </group>
            ))}

            {/* WALLS */}
            {(currentStage === STAGES.WALLS || placedBlocks[STAGES.WALLS].length > 0 || currentStage === STAGES.ROOF || currentStage === 'WON') && wallSlots.map((slot, i) => (
                <group key={slot.id} position={slot.pos} rotation={slot.rot}>
                    <Box args={[2.8, 2.8, 0.2]}>
                        <meshStandardMaterial
                            color={placedBlocks[STAGES.WALLS][i] ? '#CDDC39' : '#555'}
                            transparent
                            opacity={placedBlocks[STAGES.WALLS][i] ? 1 : 0.2}
                            wireframe={!placedBlocks[STAGES.WALLS][i]}
                        />
                    </Box>
                </group>
            ))}

            {/* ROOF */}
            {(currentStage === STAGES.ROOF || placedBlocks[STAGES.ROOF].length > 0 || currentStage === 'WON') && roofSlots.map((slot, i) => (
                <group key={slot.id} position={slot.pos}>
                    <Cone args={[1.5, 1.5, 4]}>
                        <meshStandardMaterial
                            color={placedBlocks[STAGES.ROOF][i] ? '#FFEB3B' : '#666'}
                            transparent
                            opacity={placedBlocks[STAGES.ROOF][i] ? 1 : 0.2}
                            wireframe={!placedBlocks[STAGES.ROOF][i]}
                        />
                    </Cone>
                </group>
            ))}
        </group>
    );
};

export default HouseZone;
