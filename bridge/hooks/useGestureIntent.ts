import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";

// MediaPipe coordinates are normalized [0, 1]
// x: 0 is left edge, 1 is right edge
// y: 0 is top edge, 1 is bottom edge
const STABILIZATION_FACTOR = 0.45; // Lower is smoother but laggier

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

export const useGestureIntent = (
  rightHand: Landmark[] | null,
  gestureRight: string
) => {
  const { setCursorPos, setIsPinching } = useGameStore();

  const currentPosRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const isPinchingRef = useRef(false);

  useEffect(() => {
    if (!rightHand || !rightHand[8]) {
      // Hands lost
      setCursorPos(null);
      return;
    }

    // Index finger tip is landmark 8
    const tip = rightHand[8];

    // Convert normalized coordinates to absolute viewport pixels
    // Note: In selfie mode, x might need to be inverted depending on how MediaPipe was set up.
    // The previous hook configures selfieMode: true, which acts like a mirror.
    // Normalized x=0 is left of the image (which is user's right in a mirror).
    // So 1 - x gives the correct screen space mapping.
    const targetX = (1 - tip.x) * window.innerWidth;
    const targetY = tip.y * window.innerHeight;

    // Apply exponential smoothing
    currentPosRef.current.x += (targetX - currentPosRef.current.x) * STABILIZATION_FACTOR;
    currentPosRef.current.y += (targetY - currentPosRef.current.y) * STABILIZATION_FACTOR;

    setCursorPos({ x: currentPosRef.current.x, y: currentPosRef.current.y });

    // Handle Pinch (Click Intent)
    const isPinchingNow = gestureRight === "PINCH";

    if (isPinchingNow && !isPinchingRef.current) {
      // Just started pinching -> trigger click
      isPinchingRef.current = true;
      setIsPinching(true);

      // We use document.elementFromPoint to find what's under the cursor
      const el = document.elementFromPoint(
        currentPosRef.current.x,
        currentPosRef.current.y
      );

      if (el && el instanceof HTMLElement) {
        // Trigger a synthetic click event
        el.click();
        
        // Add a tactical click sound or brief flash to the element
        el.style.transform = "scale(0.96)";
        setTimeout(() => {
          if (el.style) el.style.transform = "";
        }, 100);
      }
    } else if (!isPinchingNow && isPinchingRef.current) {
      // Stopped pinching
      isPinchingRef.current = false;
      setIsPinching(false);
    }

  }, [rightHand, gestureRight, setCursorPos, setIsPinching]);
};
