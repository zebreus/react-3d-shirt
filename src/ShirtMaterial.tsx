import { PerspectiveCamera, RenderTexture, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { Suspense, useRef } from "react"

export const UrlMaterial = ({ url }: { url: string | undefined }) => {
  if (!url) {
    throw new Promise(() => {})
  }
  const motif = useTexture(url, texture => {
    const textures = Array.isArray(texture) ? texture : [texture]
    textures.forEach(t => {
      t.flipY = false
    })
  })

  return (
    <meshPhongMaterial map={motif} depthTest depthWrite={false} transparent polygonOffset polygonOffsetFactor={-4} />
  )
}

const RotatingShape = () => {
  const meshRef = useRef<{ rotation: { x: number; y: number } }>()
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = meshRef.current.rotation.y += delta
    }
  })
  return (
    <mesh
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={meshRef as any}
      scale={2}
    >
      <icosahedronGeometry args={[1]} />
      <meshStandardMaterial color="goldenrod" />
    </mesh>
  )
}

const LoaderMaterial = () => {
  return (
    <meshStandardMaterial roughness={0.6} transparent polygonOffset polygonOffsetFactor={-10}>
      <RenderTexture attach="map" anisotropy={16}>
        <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <RotatingShape />
      </RenderTexture>
    </meshStandardMaterial>
  )
}

export const ShirtMaterial = ({ url }: { url: string | undefined }) => {
  return (
    <Suspense fallback={<LoaderMaterial />}>
      <UrlMaterial url={url} />
    </Suspense>
  )
}
