import { Decal, useGLTF, useTexture } from "@react-three/drei"
import { Canvas, useFrame } from "@react-three/fiber"
import { useRef } from "react"
import { datauri } from "shirtdata"
import THREE, { DoubleSide } from "three"

const RotatingShirt = ({ url, color = "#202020" }: ShirtProps) => {
  // This reference gives us direct access to the THREE.Mesh object
  const ref = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.Material | THREE.Material[]>>(null)
  // Subscribe this component to the render-loop, rotate the mesh every frame
  useFrame((state, delta) => (ref.current ? (ref.current.rotation.z += delta / 2) : null))
  const motif = useTexture(url)
  const { nodes } = useGLTF(datauri)

  return (
    <mesh
      castShadow
      receiveShadow
      ref={ref}
      scale={1}
      /** @ts-expect-error: TODO: Look into why ts thinks there is no geometry property*/
      geometry={nodes["shirt"]?.geometry}
      rotation={[0.5 * Math.PI, 0, 0]}
    >
      <meshStandardMaterial color={color} roughness={1} side={DoubleSide} />
      <Decal position={[0, 1, 0]} rotation={Math.PI} scale={2}>
        <meshPhongMaterial
          map={motif}
          depthTest
          depthWrite={false}
          transparent
          polygonOffset
          polygonOffsetFactor={-4}
        />
      </Decal>
    </mesh>
  )
}

type ShirtProps = {
  url: string
  color: string
}

export const Shirt = ({ url = "https://picsum.photos/300/300", color = "#202020" }: Partial<ShirtProps>) => {
  return (
    <Canvas shadows>
      <ambientLight intensity={0.25} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -5, -10]} />
      <group scale={0.9}>
        <RotatingShirt url={url} color={color} />
      </group>
    </Canvas>
  )
}
