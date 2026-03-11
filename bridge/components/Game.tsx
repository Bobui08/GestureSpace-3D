import React, { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Scene from './3d/Scene';
import HUD from './ui/HUD';
import QuestionPanel from './ui/QuestionPanel';

import { useHandTracking } from '../hooks/useHandTracking';
import { useGameStore } from '../store/gameStore';
import CelebrationEffect from './3d/CelebrationEffect';
import IntroEffect from './3d/IntroEffect';
import PreIntroEffect from './3d/PreIntroEffect';
import DefensePhase from './3d/DefensePhase';
import SocialEnvironment from './3d/SocialEnvironment';
import CommandRoomRoot from './command-room/CommandRoomRoot';
import { useGestureIntent } from '../hooks/useGestureIntent';
import GestureCursor from './ui/GestureCursor';

const Game = () => {
    const { videoRef, leftHand, rightHand, gestureLeft, gestureRight } = useHandTracking();
    const { gameState, gamePhase, gameMode, updateStageTime, campaignState } = useGameStore();

    // P4: Initialize Gesture Intent Layer
    useGestureIntent(rightHand, gestureRight);

    // Timer — branches by game mode
    useEffect(() => {
        if (gameMode === 'COMMAND_ROOM') {
            // Campaign turn timer: tick every second during TURN_PLANNING
            const state = useGameStore.getState();
            if (state.campaignState !== 'TURN_PLANNING') return;

            const interval = setInterval(() => {
                const s = useGameStore.getState();
                if (s.campaignState !== 'TURN_PLANNING') {
                    clearInterval(interval);
                    return;
                }
                s.tickTurnTimer();
                if (s.turnTimeLeft <= 1) {
                    // Auto-commit if time runs out (or transition to report)
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }

        // LEGACY mode timer
        if (gameState === 'PLAYING') {
            const interval = setInterval(() => {
                const state = useGameStore.getState();
                if (state.gamePhase === 'DEFEND') {
                    const nextTime = Math.max(0, state.defenseTimeLeft - 1);
                    state.decrementDefenseTime();
                    if (nextTime <= 0) {
                        state.setGamePhase('BUILD');
                        state.transitionToQuiz();
                    }
                } else {
                    updateStageTime();
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState, gameMode, campaignState, updateStageTime]);

    // ========================
    // COMMAND_ROOM MODE
    // ========================
    if (gameMode === 'COMMAND_ROOM') {
        return (
            <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
                {/* Webcam feed (small, bottom-left) */}
                <video
                    ref={videoRef}
                    style={{
                        position: 'absolute',
                        width: '140px',
                        height: '105px',
                        bottom: '16px',
                        left: '16px',
                        borderRadius: '8px',
                        zIndex: 300,
                        transform: 'scaleX(-1)',
                        opacity: 0.7,
                        border: '1px solid rgba(0, 243, 255, 0.2)',
                    }}
                />

                {/* Command Room UI (full-screen HTML overlay) */}
                <CommandRoomRoot />
                
                {/* P4: Virtual Cursor for interactions */}
                <GestureCursor />
            </div>
        );
    }

    // ========================
    // LEGACY MODE (unchanged)
    // ========================
    return (
        <div style={{ width: '100vw', height: '100vh', background: '#87CEEB', position: 'relative', overflow: 'hidden' }}>
            {/* Video Feed */}
            <video
                ref={videoRef}
                style={{
                    position: 'absolute',
                    width: '160px',
                    height: '120px',
                    bottom: '20px',
                    left: '20px',
                    borderRadius: '10px',
                    zIndex: 10,
                    transform: 'scaleX(-1)',
                    opacity: 0.8,
                    border: '2px solid rgba(0, 243, 255, 0.3)'
                }}
            />

            {/* Main 3D Scene */}
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                <Suspense fallback={null}>
                    {gameState === 'PRE_INTRO' ? (
                        <PreIntroEffect
                            leftHand={leftHand}
                            rightHand={rightHand}
                            gestureLeft={gestureLeft}
                            gestureRight={gestureRight}
                        />
                    ) : gameState === 'WON' ? (
                        <CelebrationEffect />
                    ) : gameState === 'GAME_OVER' ? (
                        <>
                            <color attach="background" args={['#000000']} />
                        </>
                    ) : gameState === 'INTRO' ? (
                        <IntroEffect />
                    ) : (
                        <>
                            {/* NEW ENVIRONMENT: Social Residential Area */}
                            <SocialEnvironment />

                            {/* Camera Controls - Mouse only, no hand control */}
                            <OrbitControls
                                makeDefault
                                enableZoom={true}
                                enablePan={true}
                                enableRotate={true}
                            />

                            {/* Render Game Scene (Building) */}
                            {gamePhase === 'BUILD' && (
                                <Scene
                                    leftHand={leftHand}
                                    rightHand={rightHand}
                                    gestureLeft={gestureLeft}
                                    gestureRight={gestureRight}
                                />
                            )}

                            {/* Render Defense Phase */}
                            {gamePhase === 'DEFEND' && (
                                <DefensePhase leftHand={leftHand} rightHand={rightHand} />
                            )}
                        </>
                    )}
                </Suspense>
            </Canvas>

            {/* UI Overlays */}
            <HUD gestureLeft={gestureLeft} gestureRight={gestureRight} />
            <QuestionPanel />
        </div>
    );
};

export default Game;
