import { LoadedTextureEvent } from "rendering/dispatchEvent"
import { getRenderer, TickEvent } from "rendering/render"
import { getTexture } from "rendering/textures"
import {
  DirectionalLight,
  Event,
  IcosahedronGeometry,
  Material,
  Mesh,
  MeshPhongMaterial,
  MeshStandardMaterial,
  Object3D,
  PerspectiveCamera,
  Scene,
  WebGLRenderTarget,
} from "three"

export const loadTexture = async (url: string | undefined) => {
  if (!url) {
    return
  }
  const texture = getTexture(url) || undefined

  return texture
}

export const getRotatingShape = (color = "goldenrod") => {
  const material = new MeshStandardMaterial({ color })
  const icosahedronGeometry = new IcosahedronGeometry(1)
  const mesh = new Mesh(icosahedronGeometry, material)
  mesh.scale.set(2, 2, 2)
  mesh.addEventListener<"tick">("tick", event => {
    const delta = event["detail"].delta ?? 0
    mesh.rotation.x = mesh.rotation.y += delta
  })

  return mesh
}

export const getLoaderMaterial = (color?: string) => {
  const renderer = getRenderer()

  const width = 200
  const height = 200

  const fov = 75
  const aspect = 1
  const near = 0.1
  const far = 100
  const camera = new PerspectiveCamera(fov, aspect, near, far)
  camera.position.z = 4

  const bufferScene = new Scene()

  {
    const color = 0xffffff
    const intensity = 1
    const light = new DirectionalLight(color, intensity)
    light.position.set(-1, 2, 4)
    bufferScene.add(light)
  }

  const sphere = getRotatingShape(color)
  bufferScene.add(sphere)

  const bufferTexture = new WebGLRenderTarget(width, height, { samples: 8 })

  renderer.setRenderTarget(bufferTexture)
  renderer.clearColor()
  renderer.render(bufferScene, camera)
  renderer.setRenderTarget(null)

  const loaderMaterial = new MeshStandardMaterial({
    roughness: 0.6,
    transparent: true,
    map: bufferTexture.texture,
  })

  loaderMaterial.addEventListener<"tick">("tick", event => {
    const tickEvent = event as TickEvent
    const tickAllChildren = (object: Object3D) => {
      object.dispatchEvent?.(tickEvent)
      object.children?.forEach((child?) => tickAllChildren(child))
    }
    tickAllChildren(bufferScene)
    renderer.setRenderTarget(bufferTexture)
    renderer.render(bufferScene, camera)
    renderer.setRenderTarget(null)
    loaderMaterial.map = bufferTexture.texture
  })

  return loaderMaterial
}

export const getTextureMaterial = async (url: string | undefined) => {
  const texture = await loadTexture(url)
  if (!texture) {
    const loader = getLoaderMaterial("green")
    return { material: loader, aspect: 1 }
  }
  const textureMaterial = new MeshPhongMaterial({ map: texture, depthTest: true, depthWrite: false, transparent: true })

  return { material: textureMaterial, aspect: texture.aspect }
}

export const addTextureMaterial = async (
  target: Mesh,
  url: string | undefined,
  callback: (material: Material, aspect: number) => void
) => {
  if (!url) {
    const loader = getLoaderMaterial("green")
    callback(loader, 1)
    return
  }

  const tryToLoadTexture = async () => {
    console.log("Trying to load texture")
    const texture = await loadTexture(url)
    if (!texture) {
      const loader = getLoaderMaterial("green")
      callback(loader, 1)
      return
    }
    const textureMaterial = new MeshPhongMaterial({
      map: texture,
      depthTest: true,
      depthWrite: false,
      transparent: true,
    })

    callback(textureMaterial, texture.aspect)
  }

  if (target.userData["textureUrl"] === url) {
    // There is already a texture loading for this url
    return
  }

  target.userData["textureUrl"] = url
  const eventListener = (event: Event) => {
    console.log("texture listener fired")
    const loadedTextureEvent = event as LoadedTextureEvent
    if (target.userData["textureUrl"] !== url) {
      target.removeEventListener<"loadedTexture">("loadedTexture", eventListener)
      return
    }
    if (loadedTextureEvent.detail.url !== target.userData["textureUrl"]) {
      return
    }
    if (!(loadedTextureEvent.detail.status === "success")) {
      const loader = getLoaderMaterial("red")
      callback(loader, 1)
      return
    }
    tryToLoadTexture()
  }

  target.addEventListener<"loadedTexture">("loadedTexture", eventListener)
  tryToLoadTexture()
}

// export const getShirtMaterial = async (url: string | undefined) => {
//   const texture = await loadTexture(url)
//   return { material, aspectRatio, failed, ready }
// }
// import { PerspectiveCamera, RenderTexture } from "@react-three/drei"
// import { useFrame } from "@react-three/fiber"
// import { DecalReadyMessage } from "OffscreenShirt"
// import { addTextureReadyCallback, getTexture, removeTextureReadyCallback, useCanvasId } from "processEvent"
// import { useEffect, useMemo, useRef, useState } from "react"
// import { CanvasTexture, Texture } from "three"

// const useTexture = (url: string | undefined) => {
//   const [texture, setTexture] = useState<Texture | undefined>(() => {
//     const imageBitmap = url && getTexture(url)
//     return imageBitmap ? new CanvasTexture(imageBitmap) : undefined
//   })
//   const [failed, setFailed] = useState(() => {
//     const imageBitmap = url && getTexture(url)
//     return imageBitmap === false
//   })

//   useEffect(() => {
//     if (!url) {
//       return
//     }
//     const callback = () => {
//       console.time("creating canvas texture")
//       const imageBitmap = getTexture(url)
//       if (imageBitmap === false) {
//         setFailed(true)
//         setTexture(undefined)
//         return
//       }
//       if (imageBitmap === undefined) {
//         setFailed(false)
//         return
//       }
//       const newTexture = new CanvasTexture(imageBitmap)
//       console.timeEnd("creating canvas texture")

//       setFailed(false)
//       setTexture(newTexture)
//     }
//     addTextureReadyCallback(url, callback)
//     callback()
//     return () => {
//       removeTextureReadyCallback(url, callback)
//     }
//   }, [url])

//   const hasTexture = !!texture
//   const canvasId = useCanvasId()

//   useEffect(() => {
//     const urlTexture = url ? getTexture(url) : undefined
//     const message: DecalReadyMessage = {
//       type: "setDecalReady",
//       value: urlTexture === false || (!!hasTexture && !!urlTexture),
//       error: urlTexture === false,
//       hasPrevious: hasTexture,
//       canvasId,
//     }
//     postMessage(message)
//   }, [url, hasTexture, failed, canvasId])

//   return { texture, failed }
// }

// export const TextureMaterial = ({ texture }: { texture: Texture }) => {
//   return (
//     <meshPhongMaterial map={texture} depthTest depthWrite={false} transparent polygonOffset polygonOffsetFactor={-4} />
//   )
// }

// const RotatingShape = ({ color = "goldenrod" }: { color?: string }) => {
//   const meshRef = useRef<{ rotation: { x: number; y: number } }>()
//   useFrame((state, delta) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x = meshRef.current.rotation.y += delta
//     }
//   })
//   return (
//     <mesh
//       // eslint-disable-next-line @typescript-eslint/no-explicit-any
//       ref={meshRef as any}
//       scale={2}
//     >
//       <icosahedronGeometry args={[1]} />
//       <meshStandardMaterial color={color} />
//     </mesh>
//   )
// }

// const LoaderMaterial = ({ color }: { color?: string }) => {
//   return (
//     <meshStandardMaterial roughness={0.6} transparent polygonOffset polygonOffsetFactor={-10}>
//       <RenderTexture attach="map" anisotropy={16}>
//         <PerspectiveCamera makeDefault manual aspect={1 / 1} position={[0, 0, 5]} />
//         <ambientLight intensity={0.5} />
//         <directionalLight position={[10, 10, 5]} />
//         <RotatingShape color={color} />
//       </RenderTexture>
//     </meshStandardMaterial>
//   )
// }

// export const useShirtMaterial = (url: string | undefined) => {
//   const { texture, failed } = useTexture(url)
//   const aspectRatio = texture && !failed ? (texture?.image?.width ?? 1) / (texture?.image?.height ?? 1) : 1
//   const material = useMemo(() => {
//     if (failed) {
//       return <LoaderMaterial color="firebrick" />
//     }
//     if (texture) {
//       return <TextureMaterial texture={texture} />
//     }
//     return <LoaderMaterial color="goldenrod" />
//   }, [texture, failed])
//   const ready = failed || !!texture || !url
//   return { material, aspectRatio, failed, ready }
// }
