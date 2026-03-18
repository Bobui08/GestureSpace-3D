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
    const { videoRef, handsResultsRef, gestureLeft, gestureRight } = useHandTracking();
    const { gameState, gamePhase, updateStageTime } = useGameStore();

    // Update timer every second when playing
    // Update timer every second when playing
    useEffect(() => {
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
    }, [gameState, updateStageTime]);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#87CEEB', position: 'relative', overflow: 'hidden' }}>
            {/* Video Feed */}
            <video
                ref={videoRef}
                style={{
                    position: 'absolute',
                    top: '18px',
                    left: '18px',
                    width: '220px',
                    height: '150px',
                    borderRadius: '14px',
                    zIndex: 140,
                    transform: 'scaleX(-1)',
                    opacity: 0.9,
                    objectFit: 'cover',
                    border: '1px solid rgba(125, 211, 252, 0.45)',
                    background: 'rgba(2, 6, 23, 0.72)',
                    boxShadow: '0 12px 30px rgba(2, 6, 23, 0.35)'
                }}
            />

            {/* Main 3D Scene */}
            <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
                <Suspense fallback={null}>
                    {gameState === 'PRE_INTRO' ? (
                        <PreIntroEffect
                            handsResultsRef={handsResultsRef}
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
                                    handsResultsRef={handsResultsRef}
                                />
                            )}

                            {/* Render Defense Phase */}
                            {gamePhase === 'DEFEND' && (
                                <DefensePhase handsResultsRef={handsResultsRef} />
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
