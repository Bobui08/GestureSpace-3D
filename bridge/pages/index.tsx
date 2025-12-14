import Head from 'next/head'
import dynamic from 'next/dynamic'

// Dynamically import Game to avoid SSR issues with MediaPipe/Canvas
const Game = dynamic(() => import('../components/Game'), { ssr: false })

export default function Home() {
  return (
    <>
      <Head>
        <title>Family Builder 3D</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Game />
    </>
  )
}
