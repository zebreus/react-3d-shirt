import { Canvas } from "@react-three/fiber"
import { BasicShirt } from "BasicShirt"
import { ShirtControls } from "ShirtControls"

type ShirtProps = {
  /** An url to an image that is printed onto the shirt */
  motif?: string
  /** The shirt color */
  color?: string
  /** How much the camera wobbles */
  wobbleRange?: number
  /** How fast the camera wobbles */
  wobbleSpeed?: number
  /** Disable interaction */
  disabled?: boolean
}

export const Shirt = ({ motif, color = "#202020", wobbleRange, wobbleSpeed, disabled }: Partial<ShirtProps>) => {
  return (
    <Canvas shadows>
      <ambientLight intensity={0.25} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -5, -10]} />
      <ShirtControls wobbleRange={wobbleRange} wobbleSpeed={wobbleSpeed} disabled={disabled} />
      <group scale={0.9}>
        <BasicShirt url={motif} color={color} />
      </group>
    </Canvas>
  )
}
