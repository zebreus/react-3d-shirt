import { PerspectiveCamera, RenderTexture, useTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useEffect, useMemo, useRef, useState } from "react"
import { Texture, TextureLoader } from "three"

const textures: Record<string, Texture> = {}
const texturePromises: Record<string, Promise<Texture>> = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadTextureAsync = (url: string) => {
  if (!url) {
    throw new Error("Url needs to be defined")
  }
  if (!texturePromises[url]) {
    texturePromises[url] = new TextureLoader().loadAsync(url).then(texture => {
      texture.flipY = false
      textures[url] = texture
      return texture
    })
  }

  return texturePromises[url]
}

const useMyTexture = (url: string | undefined) => {
  const [, setTexture] = useState<Texture | undefined>(url ? textures[url] : undefined)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!url) {
      setTexture(undefined)
      setFailed(false)
      return
    }
    const work = async () => {
      try {
        const t = await loadTextureAsync(url)
        setTexture(t)
        setFailed(false)
      } catch (e) {
        setTexture(undefined)
        setFailed(true)
      }
    }
    work()
  }, [url])

  const loadedTexture = url ? textures[url] : undefined
  return { texture: loadedTexture, failed }
}

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

  return <TextureMaterial texture={motif} />
}

export const TextureMaterial = ({ texture }: { texture: Texture }) => {
  return (
    <meshPhongMaterial map={texture} depthTest depthWrite={false} transparent polygonOffset polygonOffsetFactor={-4} />
  )
}

const RotatingShape = ({ color = "goldenrod" }: { color?: string }) => {
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
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

const LoaderMaterial = ({ color }: { color?: string }) => {
  return (
    <meshStandardMaterial roughness={0.6} transparent polygonOffset polygonOffsetFactor={-10}>
      <RenderTexture attach="map" anisotropy={16}>
        <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 5]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <RotatingShape color={color} />
      </RenderTexture>
    </meshStandardMaterial>
  )
}

export const useShirtMaterial = (url: string | undefined) => {
  const { texture, failed } = useMyTexture(url)
  const aspectRatio = texture && !failed ? (texture?.image?.width ?? 1) / (texture?.image?.height ?? 1) : 1
  const material = useMemo(() => {
    if (failed) {
      return <LoaderMaterial color="firebrick" />
    }
    if (texture) {
      return <TextureMaterial texture={texture} />
    }
    return <LoaderMaterial color="goldenrod" />
  }, [texture, failed])
  const ready = failed || !!texture
  return { material, aspectRatio, failed, ready }
}
