import React, { useEffect } from "react";
import { useGameStore } from "../../store/gameStore";

const GestureCursor = () => {
  const { cursorPos, isPinching } = useGameStore();

  if (!cursorPos) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 99999, // Above everything
        pointerEvents: "none", // Critically important! Let clicks pass through
        transform: `translate(${cursorPos.x}px, ${cursorPos.y}px)`,
        transition: "transform 0.05s linear", // Very short transition for ultra-smoothness
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          marginLeft: -12, // Center the cursor head
          marginTop: -12,
          borderRadius: "50%",
          background: isPinching ? "rgba(74, 222, 128, 0.6)" : "rgba(0, 243, 255, 0.4)",
          border: `2px solid ${isPinching ? "#4ade80" : "#00f3ff"}`,
          boxShadow: isPinching
            ? "0 0 15px rgba(74, 222, 128, 0.8), inset 0 0 10px rgba(74, 222, 128, 0.8)"
            : "0 0 12px rgba(0, 243, 255, 0.6)",
          transform: `scale(${isPinching ? 0.8 : 1})`,
          transition: "transform 0.1s cubic-bezier(0.4, 0, 0.2, 1), background 0.15s ease, border-color 0.15s ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#fff",
            opacity: isPinching ? 1 : 0.8,
          }}
        />
      </div>
    </div>
  );
};

export default GestureCursor;
