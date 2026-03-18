import { Line, Plane, Sphere, Text } from "@react-three/drei";
import { useMemo } from "react";
import { useGameStore } from "../../store/gameStore";
import { SLOTS, STAGE_LINKS, STAGE_META } from "../../data/gameData";

const SLOT_COLORS = {
  inactiveLine: "#7dd3fc",
  activeLine: "#facc15",
  inactiveCore: "#e0f2fe",
  activeCore: "#fef3c7",
  inactiveGlow: "#38bdf8",
  activeGlow: "#f59e0b",
};

const HouseZone = () => {
  const { placedBlocks, currentStage } = useGameStore();
  const slots = SLOTS[currentStage] ?? [];
  const links = STAGE_LINKS[currentStage] ?? [];
  const placedCount = placedBlocks[currentStage]?.length ?? 0;
  const activeIndices = useMemo(
    () => new Set(Array.from({ length: placedCount }, (_, i) => i)),
    [placedCount]
  );

  return (
    <group>
      <Plane args={[12, 8]} position={[0, 1.8, -0.04]}>
        <meshStandardMaterial color="#0f172a" transparent opacity={0.35} />
      </Plane>

      <Text
        position={[0, 5.6, 0]}
        color="#67e8f9"
        fontSize={0.32}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#082f49"
      >
        {STAGE_META[currentStage]?.years} - {STAGE_META[currentStage]?.title}
      </Text>

      {links.map(([a, b], idx) => {
        const aPos = slots[a]?.pos;
        const bPos = slots[b]?.pos;
        if (!aPos || !bPos) return null;
        const active = activeIndices.has(a) && activeIndices.has(b);

        return (
          <Line
            key={`${currentStage}-link-${idx}`}
            points={[aPos, bPos]}
            color={active ? SLOT_COLORS.activeLine : SLOT_COLORS.inactiveLine}
            lineWidth={active ? 3.6 : 2.2}
            transparent
            opacity={active ? 0.98 : 0.78}
          />
        );
      })}

      {slots.map((slot, i) => {
        const active = activeIndices.has(i);
        return (
          <group key={slot.id} position={slot.pos}>
            <Sphere args={[0.35, 24, 24]}>
              <meshStandardMaterial
                color={active ? SLOT_COLORS.activeCore : SLOT_COLORS.inactiveCore}
                emissive={active ? SLOT_COLORS.activeGlow : SLOT_COLORS.inactiveGlow}
                emissiveIntensity={active ? 1.35 : 0.55}
              />
            </Sphere>
            <Sphere args={[0.18, 18, 18]}>
              <meshStandardMaterial
                color={active ? "#fff7ed" : "#f8fafc"}
                emissive={active ? "#fde68a" : "#bae6fd"}
                emissiveIntensity={active ? 1.8 : 1.1}
              />
            </Sphere>
            <Sphere args={[0.56, 20, 20]}>
              <meshStandardMaterial
                color={active ? SLOT_COLORS.activeGlow : SLOT_COLORS.inactiveGlow}
                transparent
                opacity={active ? 0.28 : 0.16}
              />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
};

export default HouseZone;
