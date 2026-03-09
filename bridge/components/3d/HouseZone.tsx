import { Line, Plane, Sphere, Text } from "@react-three/drei";
import { useMemo } from "react";
import { useGameStore } from "../../store/gameStore";
import { SLOTS, STAGE_LINKS, STAGE_META } from "../../data/gameData";

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
            color={active ? "#22c55e" : "#334155"}
            lineWidth={active ? 2.5 : 1}
            transparent
            opacity={active ? 0.9 : 0.45}
          />
        );
      })}

      {slots.map((slot, i) => {
        const active = activeIndices.has(i);
        return (
          <group key={slot.id} position={slot.pos}>
            <Sphere args={[0.35, 24, 24]}>
              <meshStandardMaterial
                color={active ? "#86efac" : "#475569"}
                emissive={active ? "#22c55e" : "#000000"}
                emissiveIntensity={active ? 0.9 : 0}
              />
            </Sphere>
            <Sphere args={[0.52, 20, 20]}>
              <meshStandardMaterial
                color={active ? "#22c55e" : "#64748b"}
                transparent
                opacity={active ? 0.14 : 0.06}
              />
            </Sphere>
          </group>
        );
      })}
    </group>
  );
};

export default HouseZone;
