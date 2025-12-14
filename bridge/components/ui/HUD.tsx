import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

const HUD = ({ gestureLeft, gestureRight }) => {
    const {
        score, currentStage, gameState, startGame,
        stageElapsedTime, streakCount, multiplier, // Keep stageElapsedTime if needed for other logic, but we will use gameStartTime for display
        gamePhase, houseHealth, defenseTimeLeft,
        gameStartTime
    } = useGameStore();

    const getStageName = (s) => {
        switch (s) {
            case 'FOUNDATION': return 'Xây Móng (Nền tảng)';
            case 'PILLARS': return 'Dựng Cột (Chức năng)';
            case 'WALLS': return 'Xây Tường (Hôn nhân)';
            case 'ROOF': return 'Lợp Mái (Phương hướng)';
            default: return '';
        }
    };

    // Local timer state for smooth updates
    const [currentTime, setCurrentTime] = useState(0);

    // Update timer locally every second to ensure it ticks
    useEffect(() => {
        if (!gameStartTime) return;

        const updateTimer = () => {
            setCurrentTime(Date.now() - gameStartTime);
        };

        // Initial update
        updateTimer();

        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [gameStartTime]);

    const formatTime = (ms) => {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

    const [showRoofAlert, setShowRoofAlert] = useState(false);

    useEffect(() => {
        if (currentStage === 'ROOF') {
            setShowRoofAlert(true);
            const timer = setTimeout(() => setShowRoofAlert(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [currentStage]);

    // PRE_INTRO, INTRO, WON states are handled entirely within 3D scenes
    if (gameState === 'PRE_INTRO' || gameState === 'INTRO' || gameState === 'WON') return null;

    if (gameState === 'GAME_OVER') {
        return (
            <div style={{ ...styles.fullscreenOverlay, background: 'rgba(20, 0, 0, 0.9)' }}>
                <h1 style={{ ...styles.title, color: 'red', textShadow: '0 0 20px red' }}>THẤT BẠI!</h1>
                <p style={{ ...styles.subtitle, color: '#ffaaaa' }}>Ngôi nhà đã bị gió độc phá hủy.</p>
                <p style={{ fontSize: '1.2rem', marginBottom: '30px' }}>Điểm số: {score}</p>
                <button style={{ ...styles.button, borderColor: 'red', color: 'red', boxShadow: '0 0 20px rgba(255,0,0,0.5)' }} onClick={startGame}>
                    CHƠI LẠI
                </button>
            </div>
        );
    }

    // Defense UI
    if (gamePhase === 'DEFEND') {
        return (
            <div style={styles.hudContainer}>
                {/* Health Bar */}
                <div style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    width: '600px', height: '40px', background: 'rgba(0,0,0,0.5)',
                    border: '2px solid red', borderRadius: '20px', overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${houseHealth}%`, height: '100%',
                        background: houseHealth > 50 ? 'linear-gradient(90deg, #4caf50, #8bc34a)' : 'linear-gradient(90deg, #f44336, #ff9800)',
                        transition: 'width 0.3s ease'
                    }} />
                    <span style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        color: 'white', fontWeight: 'bold', textShadow: '0 0 5px black'
                    }}>
                        MÁU NHÀ: {houseHealth}%
                    </span>
                </div>

                {/* Warning & Timer */}
                <div style={{
                    position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    textAlign: 'center', animation: 'pulse 1s infinite'
                }}>
                    <h2 style={{ color: 'red', fontSize: '2rem', margin: 0, textShadow: '0 0 10px red' }}>⚠️ BẢO VỆ TỔ ẤM! ⚠️</h2>
                    <h3 style={{ color: 'white', fontSize: '1.5rem', margin: '10px 0' }}>Còn lại: {defenseTimeLeft}s</h3>
                </div>

                {/* Hand Status Overlay - Fixed to Bottom */}
                <div style={{
                    ...styles.gestureBar,
                    position: 'absolute',
                    bottom: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: 0
                }}>
                    <div style={styles.gestureItem}><span>Tay Phải: {gestureLeft}</span></div>
                    <div style={styles.gestureItem}><span>Tay Trái: {gestureRight}</span></div>
                </div>
            </div>
        );
    }



    // Roof Instruction Alert
    if (showRoofAlert && gamePhase !== 'DEFEND') {
        return (
            <div style={{ ...styles.fullscreenOverlay, background: 'rgba(0,0,0,0.8)' }}>
                <h1 style={{ ...styles.title, fontSize: '3rem', color: '#DAA520' }}>⚠️ GIAI ĐOẠN LỢP MÁI ⚠️</h1>
                <h2 style={{ color: 'white', marginBottom: '20px' }}>YÊU CẦU SỨC MẠNH ĐỒNG TÂM</h2>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '20px', borderRadius: '15px' }}>
                    <p style={{ fontSize: '1.5rem', margin: '10px 0' }}>👐 <strong>DÙNG HAI TAY</strong> để nâng mái nhà</p>
                    <p style={{ fontSize: '1.2rem', color: '#aaa' }}>Giữ thăng bằng và phối hợp nhịp nhàng!</p>
                </div>
            </div>
        );
    }

    // Default HUD
    return (
        <div style={styles.hudContainer}>
            {/* Top Bar */}
            <div style={styles.topBar}>
                <div style={styles.scoreBox}>
                    <span style={styles.label}>ĐIỂM SỐ</span>
                    <span style={styles.value}>{score}</span>
                </div>

                {/* Timer */}
                <div style={styles.timerBox}>
                    <span style={styles.label}>⏱️ THỜI GIAN</span>
                    <span style={styles.value}>{formatTime(currentTime)}</span>
                </div>

                <div style={styles.stageBox}>
                    <span style={styles.label}>GIAI ĐOẠN</span>
                    <span style={styles.value}>{getStageName(currentStage)}</span>
                </div>
            </div>

            {/* Streak/Combo Indicator */}
            {streakCount > 0 && (
                <div style={styles.streakBox}>
                    <span style={styles.streakText}>
                        🔥 STREAK: {streakCount}
                    </span>
                    {multiplier > 1 && (
                        <span style={styles.multiplierText}>
                            ✨ x{multiplier} MULTIPLIER
                        </span>
                    )}
                </div>
            )}

            {/* Gesture Status */}
            <div style={styles.gestureBar}>
                <div style={styles.gestureItem}>
                    <span>Tay Phải: </span>
                    <span style={{ color: gestureLeft !== 'NONE' ? '#00f3ff' : '#666', textShadow: gestureLeft !== 'NONE' ? '0 0 10px #00f3ff' : 'none' }}>{gestureLeft}</span>
                </div>
                <div style={styles.gestureItem}>
                    <span>Tay Trái: </span>
                    <span style={{ color: gestureRight !== 'NONE' ? '#ff00ff' : '#666', textShadow: gestureRight !== 'NONE' ? '0 0 10px #ff00ff' : 'none' }}>{gestureRight}</span>
                </div>
            </div>
        </div>
    );
};

const styles = {
    hudContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 100,
        padding: '20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    fullscreenOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0a0a0f 0%, #121218 100%)',
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        textAlign: 'center',
        backdropFilter: 'blur(20px)',
    },
    title: {
        fontSize: '4rem',
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '8px',
        fontWeight: '900',
        background: 'linear-gradient(90deg, #00f3ff 0%, #ff00ff 50%, #9d00ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 30px rgba(0, 243, 255, 0.6))',
        animation: 'pulse 2s ease-in-out infinite',
    },
    subtitle: {
        fontSize: '1.5rem',
        marginBottom: '40px',
        color: '#aaa',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
    },
    button: {
        padding: '18px 50px',
        fontSize: '1.3rem',
        fontWeight: '700',
        background: 'transparent',
        color: '#00f3ff',
        border: '2px solid #00f3ff',
        borderRadius: '50px',
        cursor: 'pointer',
        pointerEvents: 'auto',
        marginBottom: '30px',
        boxShadow: '0 0 30px rgba(0, 243, 255, 0.5), inset 0 0 10px rgba(0, 243, 255, 0.1)',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        transition: 'all 0.3s ease',
    },
    instructions: {
        padding: '30px 40px',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        lineHeight: '2',
    },
    quote: {
        fontSize: '1.2rem',
        marginBottom: '40px',
        color: '#fff',
        fontStyle: 'italic',
        maxWidth: '600px',
        lineHeight: '1.6',
        textShadow: '0 0 20px rgba(255, 0, 255, 0.5)',
    },
    topBar: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        gap: '15px',
    },
    scoreBox: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '15px 25px',
        borderRadius: '15px',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)',
        flex: 1,
    },
    timerBox: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '15px 25px',
        borderRadius: '15px',
        border: '1px solid rgba(157, 0, 255, 0.3)',
        boxShadow: '0 0 20px rgba(157, 0, 255, 0.2)',
        flex: 1,
        textAlign: 'center',
    },
    stageBox: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '15px 25px',
        borderRadius: '15px',
        border: '1px solid rgba(255, 0, 255, 0.3)',
        boxShadow: '0 0 20px rgba(255, 0, 255, 0.2)',
        textAlign: 'right',
        flex: 1,
    },
    label: {
        display: 'block',
        fontSize: '0.75rem',
        color: '#888',
        marginBottom: '5px',
        letterSpacing: '2px',
        textTransform: 'uppercase',
    },
    value: {
        fontSize: '1.8rem',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #00f3ff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 10px rgba(0, 243, 255, 0.5))',
    },
    streakBox: {
        alignSelf: 'center',
        marginTop: '20px',
        background: 'rgba(255, 136, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        padding: '15px 30px',
        borderRadius: '20px',
        border: '2px solid #ff8800',
        boxShadow: '0 0 30px rgba(255, 136, 0, 0.5)',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        animation: 'bounce 1s infinite',
    },
    streakText: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
        color: '#ffa500',
        textShadow: '0 0 15px #ffa500',
    },
    multiplierText: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(90deg, #ff00ff, #00f3ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        textShadow: '0 0 20px rgba(0, 243, 255, 0.7)',
    },
    gestureBar: {
        display: 'flex',
        gap: '20px',
        alignSelf: 'center',
        marginBottom: '20px',
    },
    gestureItem: {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        padding: '10px 20px',
        borderRadius: '25px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        color: 'white',
        fontSize: '1rem',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    }
};

export default HUD;
