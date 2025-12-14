import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

interface Feedback {
    isCorrect: boolean;
    text: string;
}

const QuestionPanel = () => {
    const { gameState, currentQuestion, answerQuiz } = useGameStore();
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<Feedback | null>(null);

    // Reset state when new question appears
    useEffect(() => {
        if (currentQuestion) {
            console.log('New question loaded, resetting state');
            setSelectedOption(null);
            setFeedback(null);
        }
    }, [currentQuestion?.id]); // Reset when question ID changes

    if (gameState !== 'QUIZ' || !currentQuestion) return null;

    const handleAnswer = (index: number) => {
        console.log('User clicked answer:', index);
        const result = answerQuiz(index);
        if (result.correct) {
            setFeedback({ isCorrect: true, text: 'CHÍNH XÁC! +10 điểm' });
        } else {
            setFeedback({ isCorrect: false, text: `SAI RỒI! Gợi ý: ${result.hint}` });
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <div style={styles.neonBorder}></div>
                <h2 style={styles.questionTitle}>CÂU HỎI KIẾN THỨC</h2>
                <div style={styles.questionText}>{currentQuestion.question}</div>

                <div style={styles.optionsList}>
                    {currentQuestion.options.map((opt, idx) => (
                        <button
                            key={idx}
                            className={`quiz-option-btn`}
                            style={{
                                ...(feedback && !feedback.isCorrect && idx === selectedOption ? styles.wrongOption : {}),
                                ...(feedback && feedback.isCorrect && idx === selectedOption ? styles.correctOption : {})
                            }}
                            onClick={() => {
                                // Allow click if no feedback OR if feedback is WRONG (not correct)
                                if (!feedback || !feedback.isCorrect) {
                                    setSelectedOption(idx);
                                    handleAnswer(idx);
                                }
                            }}
                            // Only disable ALL buttons if the answer is CORRECT (to prevent spamming)
                            disabled={feedback && feedback.isCorrect}
                        >
                            <span style={styles.optionIndex}>{String.fromCharCode(65 + idx)}</span>
                            {opt}
                        </button>
                    ))}
                </div>

                {feedback && (
                    <div style={{
                        ...styles.feedback,
                        ...(feedback.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong)
                    }}>
                        {feedback.text}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        zIndex: 150,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
    },
    card: {
        width: '700px',
        maxWidth: '90%',
        background: 'rgba(20, 20, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 0 50px rgba(0, 243, 255, 0.3), 0 0 100px rgba(255, 0, 255, 0.2)',
        textAlign: 'center',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        position: 'relative',
        animation: 'slideInUp 0.5s ease-out',
    },
    neonBorder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: '20px',
        padding: '2px',
        background: 'linear-gradient(45deg, #00f3ff, #ff00ff, #9d00ff, #00f3ff)',
        backgroundSize: '300% 300%',
        opacity: 0.3,
        zIndex: -1,
        animation: 'gradientShift 3s ease infinite',
    },
    questionTitle: {
        background: 'linear-gradient(90deg, #00f3ff, #ff00ff)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        marginBottom: '25px',
        fontSize: '1.5rem',
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: '3px',
        filter: 'drop-shadow(0 0 15px rgba(0, 243, 255, 0.7))',
    },
    questionText: {
        color: '#fff',
        fontSize: '1.5rem',
        marginBottom: '35px',
        lineHeight: '1.7',
        textShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
    },
    optionsList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
    },
    optionBtn: {
        padding: '18px 20px',
        color: '#fff',
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 243, 255, 0.3)',
        borderRadius: '12px',
        fontSize: '1.1rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        textAlign: 'left' as const,
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)',
    },
    optionIndex: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '35px',
        height: '35px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #00f3ff, #ff00ff)',
        color: '#000',
        fontWeight: '700',
        fontSize: '1rem',
        flexShrink: 0,
    },
    wrongOption: {
        background: 'rgba(255, 82, 82, 0.2)',
        borderColor: '#ff5252',
        boxShadow: '0 0 20px rgba(255, 82, 82, 0.5)',
    },
    correctOption: {
        background: 'rgba(0, 255, 136, 0.2)',
        borderColor: '#00ff88',
        boxShadow: '0 0 20px rgba(0, 255, 136, 0.5)',
    },
    feedback: {
        marginTop: '25px',
        fontWeight: '700',
        fontSize: '1.3rem',
        padding: '15px',
        borderRadius: '10px',
        textTransform: 'uppercase',
        letterSpacing: '2px',
    },
    feedbackCorrect: {
        color: '#00ff88',
        background: 'rgba(0, 255, 136, 0.1)',
        border: '1px solid #00ff88',
        textShadow: '0 0 15px #00ff88',
    },
    feedbackWrong: {
        color: '#ff5252',
        background: 'rgba(255, 82, 82, 0.1)',
        border: '1px solid #ff5252',
        textShadow: '0 0 15px #ff5252',
    }
};

export default QuestionPanel;
