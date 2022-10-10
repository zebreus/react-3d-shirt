import { OrbitControls, OrbitControlsProps } from "@react-three/drei"
import { useFrame } from "@react-three/fiber"
import { useRef, useState } from "react"

type ShirtControlsProps = {
  wobbleSpeed?: number
  wobbleRange?: number
  /** Disable interactivity */
  disabled?: boolean
}
export const ShirtControls = ({ wobbleSpeed = 0.3, wobbleRange = 0.07, disabled }: ShirtControlsProps) => {
  const ref = useRef<OrbitControlsProps>(null)
  const [active, setActive] = useState(false)

  useFrame(state => {
    if (!active && ref.current) {
      const polar = Math.PI / 2 + Math.sin(state.clock.getElapsedTime() * wobbleSpeed) * wobbleRange
      const azimuthal = Math.cos(state.clock.getElapsedTime() * wobbleSpeed) * wobbleRange
      ref.current.setPolarAngle?.(polar)
      ref.current.setAzimuthalAngle?.(azimuthal)
    }
  })

  return (
    <>
      <OrbitControls
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={ref as any}
        rotation={[0, 0, 0]}
        minDistance={2}
        maxDistance={5}
        maxPolarAngle={Math.PI - 0.5}
        minPolarAngle={0.5}
        onStart={() => {
          setActive(true)
          if (ref.current) {
            ref.current.dampingFactor = 0.1
          }
        }}
        onEnd={() => {
          setActive(false)
          if (ref.current) {
            ref.current.dampingFactor = 0.01
            ref.current.setPolarAngle?.(Math.PI / 2)
            ref.current.setAzimuthalAngle?.(0)
          }
        }}
        enabled={!disabled || active}
        enableZoom={false}
      />
    </>
  )
}
