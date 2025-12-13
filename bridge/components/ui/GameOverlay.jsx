import useGameStore from '@/store/gameStore'

export default function GameOverlay() {
    const { score, pillars } = useGameStore()

    const completedCount = pillars.filter(p => p.completed).length
    const isFinished = completedCount === 5

    if (!isFinished) return null

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 100, backdropFilter: 'blur(5px)'
        }}>
            <h1 style={{ fontSize: '4rem', color: '#ffd700', marginBottom: '20px', textShadow: '0 0 20px rgba(255, 215, 0, 0.5)' }}>
                BRIDGE COMPLETED
            </h1>
            <p style={{ fontSize: '1.5rem', color: '#ccc', maxWidth: '600px', textAlign: 'center' }}>
                You have successfully connected the values of the past with the innovations of the future.
                <br /><br />
                Final Score: {score}
            </p>

            <button
                style={{
                    marginTop: '40px', padding: '15px 40px', fontSize: '1.2rem',
                    background: 'transparent', border: '2px solid #ffd700', color: '#ffd700',
                    cursor: 'pointer', borderRadius: '30px'
                }}
                onClick={() => window.location.reload()}
            >
                RESTART JOURNEY
            </button>
        </div>
    )
}
