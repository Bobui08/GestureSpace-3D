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

const Game = () => {
    const { videoRef, leftHand, rightHand, gestureLeft, gestureRight } = useHandTracking();
    const { gameState, updateStageTime } = useGameStore();

    // Update timer every second when playing
    // Update timer every second when playing
    useEffect(() => {
        if (gameState === 'PLAYING') {
            const interval = setInterval(() => {
                const state = useGameStore.getState();
                if (state.gamePhase === 'DEFEND') {
                    state.decrementDefenseTime();
                    if (state.defenseTimeLeft <= 0) {
                        // End Defense -> Go to Quiz
                        state.setGamePhase('BUILD');
                        state.transitionToQuiz();
                    }
                } else {
                    updateStageTime();
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [gameState, updateStageTime]);

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

                            {/* Camera Controls */}
                            <OrbitControls makeDefault enableZoom={true} enablePan={true} enableRotate={true} />

                            {/* Render Game Scene (Building) */}
                            {useGameStore.getState().gamePhase === 'BUILD' && (
                                <Scene
                                    leftHand={leftHand}
                                    rightHand={rightHand}
                                    gestureLeft={gestureLeft}
                                    gestureRight={gestureRight}
                                />
                            )}

                            {/* Render Defense Phase */}
                            {useGameStore.getState().gamePhase === 'DEFEND' && (
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
