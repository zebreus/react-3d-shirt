import { PerspectiveCamera, RenderTexture } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { DecalReadyMessage } from "OffscreenShirt"
import { addTextureReadyCallback, getTexture, removeTextureReadyCallback } from "processEvent"
import { useEffect, useMemo, useRef, useState } from "react"
import { CanvasTexture, Texture } from "three"

const useTexture = (url: string | undefined) => {
  const [texture, setTexture] = useState<Texture | undefined>(() => {
    const imageBitmap = url && getTexture(url)
    return imageBitmap ? new CanvasTexture(imageBitmap) : undefined
  })
  const [failed, setFailed] = useState(() => {
    const imageBitmap = url && getTexture(url)
    return imageBitmap === false
  })

  useEffect(() => {
    if (!url) {
      return
    }
    const callback = () => {
      console.time("creating canvas texture")
      const imageBitmap = getTexture(url)
      if (imageBitmap === false) {
        setFailed(true)
        setTexture(undefined)
        return
      }
      if (imageBitmap === undefined) {
        setFailed(false)
        return
      }
      const newTexture = new CanvasTexture(imageBitmap)
      console.timeEnd("creating canvas texture")

      setFailed(false)
      setTexture(newTexture)
    }
    addTextureReadyCallback(url, callback)
    callback()
    return () => {
      removeTextureReadyCallback(url, callback)
    }
  }, [url])

  const hasTexture = !!texture
  useEffect(() => {
    const urlTexture = url ? getTexture(url) : undefined
    const message: DecalReadyMessage = {
      type: "setDecalReady",
      value: urlTexture === false || (!!hasTexture && !!urlTexture),
      error: urlTexture === false,
      hasPrevious: hasTexture,
    }
    postMessage(message)
  }, [url, hasTexture, failed])

  return { texture, failed }
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
  const { texture, failed } = useTexture(url)
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
  const ready = failed || !!texture || !url
  return { material, aspectRatio, failed, ready }
}
