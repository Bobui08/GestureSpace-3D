export default function Bridge() {
    return (
        <group>
            {/* Main Bridge Walkway */}
            <mesh position={[0, -0.5, 0]} receiveShadow>
                <boxGeometry args={[18, 1, 4]} />
                <meshStandardMaterial color="#444" roughness={0.8} />
            </mesh>

            {/* Rails/Details */}
            <mesh position={[0, 0.2, 2.1]} castShadow>
                <boxGeometry args={[18, 0.4, 0.2]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[0, 0.2, -2.1]} castShadow>
                <boxGeometry args={[18, 0.4, 0.2]} />
                <meshStandardMaterial color="#333" />
            </mesh>

            {/* Glowing Energy Underneath ?? */}
            <mesh position={[0, -1.2, 0]}>
                <boxGeometry args={[16, 0.2, 3]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.2} />
            </mesh>
        </group>
    )
}
