import useGameStore from '@/store/gameStore'

export default function HUD() {
    const { gesture, isHandDetected, score, pillars } = useGameStore()

    const completedCount = pillars.filter(p => p.completed).length

    return (
        <div style={{ position: 'absolute', top: 20, left: 20, right: 20, pointerEvents: 'none', display: 'flex', justifyContent: 'space-between', fontFamily: 'Orbitron, sans-serif' }}>

            {/* Status Panel */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '10px', border: '1px solid #333' }}>
                    <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Status</div>
                    <div style={{ color: isHandDetected ? '#0f0' : '#f00', fontWeight: 'bold' }}>
                        {isHandDetected ? 'HAND LINKED' : 'SEARCHING...'}
                    </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '10px', border: '1px solid #333' }}>
                    <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Gesture</div>
                    <div style={{ color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>
                        {gesture}
                    </div>
                </div>
            </div>

            {/* Score / Progress */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '10px', border: '1px solid #333' }}>
                    <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Values Bridged</div>
                    <div style={{ color: '#ffd700', fontSize: '24px', fontWeight: 'bold' }}>
                        {score} / 50
                    </div>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.6)', padding: '10px 20px', borderRadius: '10px', border: '1px solid #333' }}>
                    <div style={{ color: '#888', fontSize: '12px', textTransform: 'uppercase' }}>Pillars Active</div>
                    <div style={{ display: 'flex', gap: '5px', marginTop: '5px' }}>
                        {pillars.map((p, i) => (
                            <div key={i} style={{
                                width: '20px', height: '10px',
                                background: p.completed ? '#ffd700' : '#333',
                                border: '1px solid #555'
                            }} />
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}
