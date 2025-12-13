import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useRef, useEffect } from 'react'
import { Html, Loader, OrbitControls } from '@react-three/drei'
import Head from 'next/head'
import GestureController from '@/components/hand/GestureController'
import useGameStore from '@/store/gameStore'
import HandSkeleton from '@/components/3d/HandSkeleton'
import Bridge from '@/components/3d/Bridge'
import Pillars from '@/components/3d/Pillars'
import Stones from '@/components/3d/Stones'
import HUD from '@/components/ui/HUD'
import GameOverlay from '@/components/ui/GameOverlay'
import InfoButton from '@/components/ui/InfoButton'
import QuizModal from '@/components/ui/QuizModal'

export default function Home() {
  const { loadQuestions } = useGameStore()

  useEffect(() => {
    import('../questions.json').then(mod => {
      loadQuestions(mod.default)
    })
  }, [])

  return (
    <>
      <Head>
        <title>Bridge of Generations</title>
        <meta name="description" content="A 3D interactive bridge experience" />
      </Head>

      <GestureController />
      <HUD />
      <InfoButton />
      <QuizModal />
      <GameOverlay />

      <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
        <Canvas camera={{ position: [0, 2, 8], fov: 60 }} shadows>
          <color attach="background" args={['#050510']} />
          <fog attach="fog" args={['#050510', 10, 30]} />
          <ambientLight intensity={0.4} />
          <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={1} castShadow />

          <Suspense fallback={<Html center><Loader /></Html>}>
            <HandSkeleton />

            <Bridge />
            <Pillars />
            <Stones />

            {/* Environment / Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color="#202020" />
            </mesh>

            <OrbitControls makeDefault enableZoom={true} enablePan={false} maxPolarAngle={Math.PI / 2} minDistance={5} maxDistance={20} />
          </Suspense>
        </Canvas>

        <div style={{ position: 'absolute', bottom: 30, width: '100%', textAlign: 'center', color: '#888', pointerEvents: 'none' }}>
          Wave hand to start • Pinch to Grab • Open to Release
        </div>
      </div>
    </>
  )
}
