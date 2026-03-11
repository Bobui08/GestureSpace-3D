import { useEffect, useRef, useState } from "react";

interface Landmark {
  x: number;
  y: number;
  z?: number;
}

type HandLandmarks = Landmark[];
type GestureType = "NONE" | "PINCH" | "OPEN" | "POINT" | "UNKNOWN";

interface HandsResults {
  leftHand: HandLandmarks | null;
  rightHand: HandLandmarks | null;
  gestureLeft: GestureType;
  gestureRight: GestureType;
}

interface MediaPipeHandedness {
  label: "Left" | "Right";
  score?: number;
}

interface MediaPipeResults {
  multiHandLandmarks?: HandLandmarks[];
  multiHandedness?: MediaPipeHandedness[];
}

declare global {
  interface Window {
    Hands?: new (config: { locateFile: (file: string) => string }) => {
      setOptions: (options: Record<string, unknown>) => void;
      onResults: (cb: (results: MediaPipeResults) => void) => void;
      send: (input: { image: HTMLVideoElement }) => Promise<void>;
      close: () => void;
    };
  }
}

const FRAME_INTERVAL_MS = 1000 / 50;
const HOLD_LAST_HAND_MS = 220;
const BASE_SMOOTHING = 0.32;
const FAST_SMOOTHING = 0.68;
const MOTION_THRESHOLD = 0.03;
const GESTURE_DEBOUNCE_MS = 70;

const distance2D = (a: Landmark, b: Landmark) => Math.hypot(a.x - b.x, a.y - b.y);

const cloneLandmarks = (landmarks: HandLandmarks): HandLandmarks =>
  landmarks.map((lm) => ({ x: lm.x, y: lm.y, z: lm.z ?? 0 }));

const smoothLandmarks = (
  current: HandLandmarks | null,
  previous: HandLandmarks | null
): HandLandmarks | null => {
  if (!current) return null;
  if (!previous) return cloneLandmarks(current);

  return current.map((lm, idx) => {
    const prev = previous[idx] ?? lm;
    const lmZ = lm.z ?? 0;
    const prevZ = prev.z ?? 0;
    const motion = Math.hypot(lm.x - prev.x, lm.y - prev.y, lmZ - prevZ);
    const alpha = motion > MOTION_THRESHOLD ? FAST_SMOOTHING : BASE_SMOOTHING;

    return {
      x: prev.x + (lm.x - prev.x) * alpha,
      y: prev.y + (lm.y - prev.y) * alpha,
      z: prevZ + (lmZ - prevZ) * alpha,
    };
  });
};

const hasMeaningfulHandChange = (
  prev: HandLandmarks | null,
  next: HandLandmarks | null,
  threshold = 0.0008
) => {
  if (!prev && !next) return false;
  if (!prev || !next) return true;
  if (!prev[0] || !prev[8] || !next[0] || !next[8]) return true;

  const wristDelta = distance2D(prev[0], next[0]);
  const tipDelta = distance2D(prev[8], next[8]);
  return wristDelta > threshold || tipDelta > threshold;
};

const detectGesture = (landmarks: HandLandmarks, previousGesture: GestureType): GestureType => {
  if (!landmarks?.[20]) return "NONE";

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const pinchDist = distance2D(thumbTip, indexTip);
  const pinchThreshold = previousGesture === "PINCH" ? 0.06 : 0.045;
  if (pinchDist < pinchThreshold) return "PINCH";

  const openHand =
    indexTip.y < landmarks[6].y &&
    middleTip.y < landmarks[10].y &&
    ringTip.y < landmarks[14].y &&
    pinkyTip.y < landmarks[18].y;
  if (openHand) return "OPEN";

  const pointHand = indexTip.y < landmarks[6].y && middleTip.y > landmarks[10].y;
  if (pointHand) return "POINT";

  return "UNKNOWN";
};

export const useHandTracking = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const requestRef = useRef<number | null>(null);
  const [handsResults, setHandsResults] = useState<HandsResults>({
    leftHand: null,
    rightHand: null,
    gestureLeft: "NONE",
    gestureRight: "NONE",
  });
  const [scriptsLoaded, setScriptsLoaded] = useState(false);

  const handCacheRef = useRef<{ left: HandLandmarks | null; right: HandLandmarks | null }>({
    left: null,
    right: null,
  });
  const handLastSeenRef = useRef({ left: 0, right: 0 });
  const lastFrameAtRef = useRef(0);
  const gestureRef = useRef<{ left: GestureType; right: GestureType }>({
    left: "NONE",
    right: "NONE",
  });
  const gestureChangedAtRef = useRef({ left: 0, right: 0 });

  useEffect(() => {
    if (window.Hands) {
      setScriptsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js";
    script.crossOrigin = "anonymous";
    script.async = true;

    script.onload = () => setScriptsLoaded(true);
    script.onerror = () => {
      console.error("Failed to load MediaPipe Hands script");
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    if (!scriptsLoaded || !videoRef.current || !window.Hands) return;

    const hands = new window.Hands({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 2,
      selfieMode: true,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    const stabilizeGesture = (
      side: "left" | "right",
      candidate: GestureType,
      hasHand: boolean,
      nowMs: number
    ): GestureType => {
      if (!hasHand) {
        gestureRef.current[side] = "NONE";
        gestureChangedAtRef.current[side] = nowMs;
        return "NONE";
      }

      const current = gestureRef.current[side];
      if (candidate === current) return current;

      if (nowMs - gestureChangedAtRef.current[side] < GESTURE_DEBOUNCE_MS) {
        return current;
      }

      gestureRef.current[side] = candidate;
      gestureChangedAtRef.current[side] = nowMs;
      return candidate;
    };

    hands.onResults((results: MediaPipeResults) => {
      let detectedLeft: HandLandmarks | null = null;
      let detectedRight: HandLandmarks | null = null;

      if (results.multiHandLandmarks?.length) {
        for (let i = 0; i < results.multiHandLandmarks.length; i += 1) {
          const label = results.multiHandedness?.[i]?.label;
          const landmarks = results.multiHandLandmarks[i];
          if (!label || !landmarks) continue;

          if (label === "Left") detectedLeft = landmarks;
          if (label === "Right") detectedRight = landmarks;
        }
      }

      const now = performance.now();

      if (detectedLeft) {
        handLastSeenRef.current.left = now;
        handCacheRef.current.left = smoothLandmarks(detectedLeft, handCacheRef.current.left);
      } else if (now - handLastSeenRef.current.left > HOLD_LAST_HAND_MS) {
        handCacheRef.current.left = null;
      }

      if (detectedRight) {
        handLastSeenRef.current.right = now;
        handCacheRef.current.right = smoothLandmarks(detectedRight, handCacheRef.current.right);
      } else if (now - handLastSeenRef.current.right > HOLD_LAST_HAND_MS) {
        handCacheRef.current.right = null;
      }

      const leftCandidate = handCacheRef.current.left
        ? detectGesture(handCacheRef.current.left, gestureRef.current.left)
        : "NONE";
      const rightCandidate = handCacheRef.current.right
        ? detectGesture(handCacheRef.current.right, gestureRef.current.right)
        : "NONE";

      const gestureLeft = stabilizeGesture("left", leftCandidate, !!handCacheRef.current.left, now);
      const gestureRight = stabilizeGesture("right", rightCandidate, !!handCacheRef.current.right, now);

      setHandsResults((prev) => {
        const leftChanged = hasMeaningfulHandChange(prev.leftHand, handCacheRef.current.left);
        const rightChanged = hasMeaningfulHandChange(prev.rightHand, handCacheRef.current.right);
        const gestureChanged =
          prev.gestureLeft !== gestureLeft || prev.gestureRight !== gestureRight;

        if (!leftChanged && !rightChanged && !gestureChanged) {
          return prev;
        }

        return {
          leftHand: handCacheRef.current.left ? cloneLandmarks(handCacheRef.current.left) : null,
          rightHand: handCacheRef.current.right ? cloneLandmarks(handCacheRef.current.right) : null,
          gestureLeft,
          gestureRight,
        };
      });
    });

    const animate = async (time: number) => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        if (time - lastFrameAtRef.current >= FRAME_INTERVAL_MS) {
          lastFrameAtRef.current = time;
          try {
            await hands.send({ image: videoRef.current });
          } catch (error) {
            console.error("Hands tracking error:", error);
          }
        }
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    const enableCamera = async () => {
      if (!videoRef.current) return;

      if (!navigator.mediaDevices?.getUserMedia) {
        console.warn("getUserMedia not supported in this browser");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });

        if (!videoRef.current) return;

        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          requestRef.current = requestAnimationFrame(animate);
        };
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    enableCamera();

    return () => {
      if (requestRef.current !== null) {
        cancelAnimationFrame(requestRef.current);
      }
      hands.close();
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [scriptsLoaded]);

  return { videoRef, ...handsResults };
};
