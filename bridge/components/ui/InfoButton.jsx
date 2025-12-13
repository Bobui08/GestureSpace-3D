import { useState } from 'react'

export default function InfoButton() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    position: 'absolute', top: 20, right: 20,
                    background: 'rgba(0,0,0,0.6)', border: '1px solid #333',
                    color: '#fff', fontSize: '14px',
                    padding: '10px 15px', borderRadius: '8px',
                    cursor: 'pointer', zIndex: 50,
                    fontFamily: 'Orbitron, sans-serif'
                }}
            >
                INFO
            </button>

            {/* Dropdown / Modal */}
            {isOpen && (
                <div style={{
                    position: 'absolute', top: 60, right: 20,
                    width: '300px', background: 'rgba(10,10,10,0.95)',
                    border: '1px solid #444', borderRadius: '10px',
                    padding: '20px', color: '#ccc', zIndex: 50,
                    backdropFilter: 'blur(10px)',
                    fontFamily: 'sans-serif', fontSize: '14px', lineHeight: '1.5'
                }}>
                    <h3 style={{ color: '#ffd700', marginTop: 0, marginBottom: '10px' }}>How to Play</h3>
                    <ul style={{ paddingLeft: '20px', margin: 0 }}>
                        <li style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#fff' }}>Move Hand:</strong> Control the cursor in 3D space.
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#fff' }}>Pinch (Thumb+Index):</strong> Grab a floating stone.
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#fff' }}>Release (Open Hand):</strong> Drop the stone into a pillar slot.
                        </li>
                        <li style={{ marginBottom: '8px' }}>
                            <strong style={{ color: '#fff' }}>Swipe Left/Right:</strong> Switch between Traditional (Blue) and Modern (Red) values.
                        </li>
                        <li>
                            Match pairs to complete the <span style={{ color: '#ffd700' }}>Bridge of Generations</span>!
                        </li>
                    </ul>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            marginTop: '15px', width: '100%', padding: '8px',
                            background: '#333', border: 'none', color: '#fff',
                            cursor: 'pointer', borderRadius: '4px'
                        }}
                    >
                        Close
                    </button>
                </div>
            )}
        </>
    )
}
