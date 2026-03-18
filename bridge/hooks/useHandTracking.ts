import type { MutableRefObject } from 'react';
import { useEffect, useRef, useState } from 'react';

// MediaPipe Types
export interface Landmark {
    x: number;
    y: number;
    z?: number;
}

export type GestureType = 'NONE' | 'PINCH' | 'OPEN' | 'POINT' | 'UNKNOWN';

export interface HandsResults {
    leftHand: Landmark[] | null;
    rightHand: Landmark[] | null;
    gestureLeft: GestureType;
    gestureRight: GestureType;
}

export type HandsResultsRef = MutableRefObject<HandsResults>;

const EMPTY_HANDS_RESULTS: HandsResults = {
    leftHand: null,
    rightHand: null,
    gestureLeft: 'NONE',
    gestureRight: 'NONE',
};

declare global {
    interface Window {
        Hands: any;
    }
}

export const useHandTracking = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const requestRef = useRef<number | undefined>(undefined);
    const handsResultsRef = useRef<HandsResults>({ ...EMPTY_HANDS_RESULTS });
    const uiResultsRef = useRef<HandsResults>({ ...EMPTY_HANDS_RESULTS });
    const [handsResults, setHandsResults] = useState<HandsResults>({ ...EMPTY_HANDS_RESULTS });
    const [scriptsLoaded, setScriptsLoaded] = useState(false);

    // Detect gesture helper
    const detectGesture = (landmarks: Landmark[]): GestureType => {
        if (!landmarks) return 'NONE';

        const thumbTip = landmarks[4];
        const indexTip = landmarks[8];
        const middleTip = landmarks[12];
        const ringTip = landmarks[16];
        const pinkyTip = landmarks[20];

        // PINCH: Distance between thumb tip and index tip is small
        const pinchDist = Math.hypot(thumbTip.x - indexTip.x, thumbTip.y - indexTip.y);
        if (pinchDist < 0.05) return 'PINCH';

        // OPEN: All fingers extended
        if (indexTip.y < landmarks[6].y && middleTip.y < landmarks[10].y && ringTip.y < landmarks[14].y && pinkyTip.y < landmarks[18].y) {
            return 'OPEN';
        }

        // POINT: Index extended, others curled
        if (indexTip.y < landmarks[6].y && middleTip.y > landmarks[10].y) {
            return 'POINT';
        }

        return 'UNKNOWN';
    };

    useEffect(() => {
        if (window.Hands) {
            setScriptsLoaded(true);
            return;
        }

        const existingScript = document.querySelector<HTMLScriptElement>('script[data-mediapipe-hands="true"]');
        if (existingScript) {
            const handleReady = () => setScriptsLoaded(true);

            existingScript.addEventListener('load', handleReady);
            if (window.Hands) {
                setScriptsLoaded(true);
            }

            return () => existingScript.removeEventListener('load', handleReady);
        }

        // Dynamically load MediaPipe Hands script
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        script.dataset.mediapipeHands = 'true';
        script.crossOrigin = 'anonymous';
        script.async = true;

        script.onload = () => {
            console.log('MediaPipe Hands script loaded');
            setScriptsLoaded(true);
        };

        script.onerror = () => {
            console.error('Failed to load MediaPipe Hands script');
        };

        document.body.appendChild(script);

        return () => {
            // Cleanup logic if needed, but usually scripts stay
            // document.body.removeChild(script);
        };
    }, []);

    useEffect(() => {
        if (!scriptsLoaded || !videoRef.current || !window.Hands) return;

        const hands = new window.Hands({
            locateFile: (file: string) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        });

        hands.onResults((results: any) => {
            let left = null;
            let right = null;

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    // Check if multiHandedness exists and has the index
                    if (results.multiHandedness && results.multiHandedness[i]) {
                        const label = results.multiHandedness[i].label; // 'Left' or 'Right'
                        const landmarks = results.multiHandLandmarks[i];

                        // Note: MediaPipe labels are often mirrored (Left hand appears as Right in selfie view).
                        // But in "selfie mode" (using mirror transform on video), visual matches.
                        // The label might be inverted logic wise.
                        // Let's assume standard behavior:
                        if (label === 'Left') left = landmarks;
                        if (label === 'Right') right = landmarks;
                    }
                }
            }

            const nextResults = {
                leftHand: left,
                rightHand: right,
                gestureLeft: left ? detectGesture(left) : 'NONE',
                gestureRight: right ? detectGesture(right) : 'NONE',
            };

            handsResultsRef.current = nextResults;

            const previousUiResults = uiResultsRef.current;
            const presenceChanged =
                Boolean(previousUiResults.leftHand) !== Boolean(nextResults.leftHand) ||
                Boolean(previousUiResults.rightHand) !== Boolean(nextResults.rightHand);
            const gestureChanged =
                previousUiResults.gestureLeft !== nextResults.gestureLeft ||
                previousUiResults.gestureRight !== nextResults.gestureRight;

            if (presenceChanged || gestureChanged) {
                uiResultsRef.current = nextResults;
                setHandsResults(nextResults);
            }
        });

        const animate = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                await hands.send({ image: videoRef.current });
            }
            requestRef.current = requestAnimationFrame(animate);
        };

        const enableCamera = async () => {
            if (!videoRef.current) {
                console.warn("Video element not ready");
                return;
            }
            
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: {
                            width: { ideal: 640 },
                            height: { ideal: 480 },
                            frameRate: { ideal: 30, max: 30 },
                            facingMode: 'user',
                        }
                    });
                    
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                        videoRef.current.onloadedmetadata = () => {
                            if (videoRef.current) {
                                videoRef.current.play();
                                requestRef.current = requestAnimationFrame(animate);
                            }
                        };
                    }
                } catch (err) {
                    console.error("Error accessing webcam:", err);
                }
            } else {
                console.warn("getUserMedia not supported in this browser");
            }
        };

        enableCamera();

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            hands.close();
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                if (tracks) tracks.forEach(track => track.stop());
            }
        };
    }, [scriptsLoaded]);

    return { videoRef, handsResultsRef, ...handsResults };
};
