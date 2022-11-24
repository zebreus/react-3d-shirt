import { Decal, useCursor } from "@react-three/drei"
import { ShirtReadyMessage } from "OffscreenShirt"
import { useCanvasId } from "processEvent"
import { memo, ReactNode, useEffect, useState } from "react"
import { shirturi } from "shirtdata"
import { BufferGeometry, DoubleSide, Material, Mesh, Object3D } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

type BasicShirtProps = {
  color: string
  objectRef?: React.MutableRefObject<Object3D<Event>[] | undefined>
  disabled?: boolean
  decalMaterial: ReactNode
  decalAspect: number
  /** Scale the decal size by this factor */
  decalScale?: number
  /** Set the vertical baseline of the decal (shift it up or down) */
  decalBaseline?: number
}

let loadedNodes: Mesh | undefined
let loadedNodesPromise: Promise<Mesh> | undefined

const loadShirtAsync = () => {
  if (!loadedNodesPromise) {
    loadedNodesPromise = new GLTFLoader().loadAsync(shirturi).then(gltf => {
      const mesh = gltf?.scenes[0]?.children[0] as Mesh
      loadedNodes = mesh
      return mesh
    })
  }

  return loadedNodesPromise
}

const useShirtMesh = () => {
  const [mesh, setMesh] = useState<Mesh | undefined>(loadedNodes)
  const loaded = !!mesh
  useEffect(() => {
    if (!loaded) {
      loadShirtAsync().then(setMesh)
    }
  }, [loaded])
  return mesh
}

export const BasicShirt = memo(
  ({ color, objectRef, disabled, decalMaterial, decalAspect, decalScale = 1, decalBaseline = 0 }: BasicShirtProps) => {
    const gltf = useShirtMesh()
    const canvasId = useCanvasId()

    useEffect(() => {
      if (gltf) {
        const message: ShirtReadyMessage = {
          type: "setShirtReady",
          value: true,
          canvasId: canvasId,
        }
        postMessage(message)
      }
    }, [gltf, canvasId])

    const [hover, setHover] = useState(false)
    useCursor(hover && !disabled)

    return gltf ? (
      <mesh
        ref={(ref: Object3D<Event> & Mesh<BufferGeometry, Material | Material[]>) => {
          if (objectRef) {
            objectRef.current = [ref]
          }
        }}
        castShadow
        receiveShadow
        scale={1}
        // /** @ts-expect-error: TODO: Look into why ts thinks there is no geometry property*/
        geometry={gltf?.geometry}
        rotation={[0.5 * Math.PI + 0.1, 0, 0]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial color={color} roughness={1} side={DoubleSide} />

        <Decal
          position={[0, 1, -decalBaseline]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[2 * decalScale, (2 * decalScale) / decalAspect, 2 * decalScale]}
        >
          {decalMaterial}
        </Decal>
      </mesh>
    ) : null
  }
)
