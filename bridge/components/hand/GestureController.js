import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'
// import { Hands, HAND_CONNECTIONS } from '@mediapipe/hands' // Removed
import useGameStore from '@/store/gameStore'

export default function GestureController() {
    const videoRef = useRef(null)
    const requestRef = useRef()
    const [scriptsLoaded, setScriptsLoaded] = useState(false)
    const setHands = useGameStore(state => state.setHands)
    const setCategory = useGameStore(state => state.setCategory)

    useEffect(() => {
        if (!scriptsLoaded || !window.Hands) return

        const hands = new window.Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            }
        })

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5
        })

        hands.onResults(onResults)

        const startCamera = async () => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                        video: { width: 640, height: 480 }
                    })
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream
                        videoRef.current.onloadedmetadata = () => {
                            videoRef.current.play()
                            requestRef.current = requestAnimationFrame(loop)
                        }
                    }
                } catch (e) {
                    console.error("Camera access denied or error:", e)
                }
            }
        }

        const loop = async () => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                await hands.send({ image: videoRef.current })
            }
            requestRef.current = requestAnimationFrame(loop)
        }

        startCamera()

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current)
            if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(t => t.stop())
            }
            hands.close()
        }
    }, [scriptsLoaded])

    const onResults = (results) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const handsData = results.multiHandLandmarks.map((landmarks, index) => {
                // keypoints
                const thumbTip = landmarks[4]
                const indexTip = landmarks[8]

                // Detect Grab (Fist)
                // Check if fingers are curled.
                // Finger tips: 8 (Index), 12 (Middle), 16 (Ring), 20 (Pinky)
                // Finger bases (MCP): 5, 9, 13, 17
                // Wrist: 0

                const isFingerCurled = (tipIdx, mcpIdx) => {
                    const tip = landmarks[tipIdx]
                    const mcp = landmarks[mcpIdx]
                    const wrist = landmarks[0]
                    // In normalized video coordinates (y increases downwards?)
                    // MediaPipe Y: 0 Top, 1 Bottom.
                    // Hand Upright: Wrist at bottom (High Y), Fingers at top (Low Y).
                    // Open: Tip Y < MCP Y (smaller value).
                    // Closed: Tip Y > MCP Y (larger value, closer to wrist/bottom).
                    // Wait, if wrist is bottom (Y=1), and fingers top (Y=0).
                    // Open: Tip(0.2) < Mcp(0.5).
                    // Closed: Tip(0.6) > Mcp(0.5).

                    // A more robust check: Distance from Tip to Wrist < Distance from MCP to Wrist
                    const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y, tip.z - wrist.z)
                    const distMcp = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y, mcp.z - wrist.z)
                    return distTip < distMcp
                }

                const fingersCurled = [
                    isFingerCurled(8, 5), // Index
                    isFingerCurled(12, 9), // Middle
                    isFingerCurled(16, 13), // Ring
                    isFingerCurled(20, 17) // Pinky
                ]

                const curledCount = fingersCurled.filter(c => c).length

                // Allow 3, 4, or 5 fingers curled to be a "Grab"
                let gesture = 'OPEN'
                if (curledCount >= 3) {
                    gesture = 'PINCH' // GRAB
                }

                // Coordinate Mapping
                // Use IndexTip as cursor position for interaction? Or Palm? Array index 9 is middle mcp
                const cursorPos = {
                    x: (1 - landmarks[9].x) * 2 - 1,
                    y: -(landmarks[9].y * 2 - 1),
                    z: 0
                }

                // Swipe Detection (Simplified for hand 0 for now to avoid conflict)
                if (index === 0) {
                    // Logic for swipe remains similar but should be decoupled
                    // For now, let's keep interactions simple.
                    // Only index 0 triggers category switch? or local gesture?
                }

                return {
                    id: index,
                    landmarks: landmarks, // Raw normalized landmarks
                    cursor: cursorPos,
                    gesture: gesture,
                    isDetected: true
                }
            })

            // Check swipe on first hand
            const firstHand = handsData[0]
            if (firstHand) {
                const x = firstHand.cursor.x
                const now = Date.now()
                if (!videoRef.current.lastX) videoRef.current.lastX = x

                const deltaX = x - videoRef.current.lastX
                if (Math.abs(deltaX) > 0.1 && (now - (videoRef.current.lastSwipe || 0) > 500)) {
                    if (deltaX > 0) {
                        // gesture = 'SWIPE_RIGHT' // Just event
                        setCategory('MODERN')
                    } else {
                        setCategory('TRADITIONAL')
                    }
                    videoRef.current.lastSwipe = now
                }
                videoRef.current.lastX = x
            }

            setHands(handsData)
        } else {
            setHands([])
        }
    }

    return (
        <>
            <Script
                src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"
                strategy="lazyOnload"
                onLoad={() => {
                    console.log('MediaPipe Hands Loaded')
                    setScriptsLoaded(true)
                }}
            />
            <div style={{ position: 'absolute', top: 0, left: 0, opacity: 0.8, pointerEvents: 'none', zIndex: 10 }}>
                {/* video element */}
                <video ref={videoRef} style={{ width: '160px', height: '120px', transform: 'scaleX(-1)' }} />
            </div>
        </>
    )
}
