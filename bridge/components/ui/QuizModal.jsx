import { useState, useEffect } from 'react'
import useGameStore from '@/store/gameStore'

export default function QuizModal() {
    const { quizOpen, currentQuestion, setQuizOpen, score } = useGameStore()
    const [selected, setSelected] = useState(null)
    const [result, setResult] = useState(null) // 'correct' | 'wrong'

    if (!quizOpen || !currentQuestion) return null

    const handleAnswer = (index) => {
        setSelected(index)
        if (index === currentQuestion.correctAnswer) {
            setResult('correct')
            // Bonus score?
        } else {
            setResult('wrong')
        }
    }

    const handleClose = () => {
        setQuizOpen(false)
        setSelected(null)
        setResult(null)
    }

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 100, backdropFilter: 'blur(5px)'
        }}>
            <div style={{
                background: '#1a1a2e', padding: '30px', borderRadius: '15px',
                border: '2px solid #ffd700', width: '500px', maxValue: '90%',
                color: '#fff', boxShow: '0 0 20px rgba(255, 215, 0, 0.3)',
                fontFamily: 'Outfit, sans-serif'
            }}>
                <h2 style={{ color: '#ffd700', marginTop: 0 }}>CÂU HỎI KIẾN THỨC</h2>
                <p style={{ fontSize: '18px', lineHeight: '1.5' }}>{currentQuestion.question}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
                    {currentQuestion.options.map((opt, i) => (
                        <button
                            key={i}
                            onClick={() => !result && handleAnswer(i)}
                            style={{
                                padding: '12px', borderRadius: '8px',
                                border: '1px solid #444',
                                background: selected === i
                                    ? (result === 'correct' ? '#2e7d32' : result === 'wrong' ? '#c62828' : '#333')
                                    : '#222',
                                color: '#fff', cursor: result ? 'default' : 'pointer',
                                textAlign: 'left', fontSize: '16px'
                            }}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {result && (
                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <p style={{
                            color: result === 'correct' ? '#4caf50' : '#f44336',
                            fontWeight: 'bold', fontSize: '18px'
                        }}>
                            {result === 'correct' ? 'CHÍNH XÁC! Cây cầu đã ổn định.' : 'SAI RỒI! Cây cầu đang lung lay...'}
                        </p>
                        <p style={{ fontSize: '14px', color: '#aaa' }}>{currentQuestion.explanation}</p>
                        <button
                            onClick={handleClose}
                            style={{
                                marginTop: '10px', padding: '10px 30px',
                                background: '#ffd700', border: 'none', borderRadius: '5px',
                                color: '#000', fontWeight: 'bold', cursor: 'pointer'
                            }}
                        >
                            TIẾP TỤC
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
