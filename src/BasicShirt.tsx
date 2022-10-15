import { Decal, useCursor, useGLTF } from "@react-three/drei"
import { ReactNode, useState } from "react"
import { shirturi } from "shirtdata"
import { BufferGeometry, DoubleSide, Material, Mesh, Object3D } from "three"

type BasicShirtProps = {
  color: string
  objectRef?: React.MutableRefObject<Object3D<Event>[] | undefined>
  disabled?: boolean
  decalMaterial: ReactNode
}

export const BasicShirt = ({ color, objectRef, disabled, decalMaterial }: BasicShirtProps) => {
  const { nodes } = useGLTF(shirturi)

  const [hover, setHover] = useState(false)
  useCursor(hover && !disabled)

  return (
    <mesh
      ref={(ref: Object3D<Event> & Mesh<BufferGeometry, Material | Material[]>) => {
        if (objectRef) {
          objectRef.current = [ref]
        }
      }}
      castShadow
      receiveShadow
      scale={1}
      /** @ts-expect-error: TODO: Look into why ts thinks there is no geometry property*/
      geometry={nodes["shirt"]?.geometry}
      rotation={[0.5 * Math.PI + 0.1, 0, 0]}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <meshStandardMaterial color={color} roughness={1} side={DoubleSide} />
      <Decal position={[0, 1, 0]} rotation={0} scale={2}>
        {decalMaterial}
      </Decal>
    </mesh>
  )
}
