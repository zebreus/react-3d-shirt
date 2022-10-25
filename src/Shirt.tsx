import { Canvas, useThree } from "@react-three/fiber"
import { BasicShirt } from "BasicShirt"
import { ReactNode, Suspense, useEffect, useRef, useState } from "react"
import { ShirtControls } from "ShirtControls"
import { useShirtMaterial } from "ShirtMaterial"

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
  /** Display this while the shirt is loading */
  cover?: ReactNode
  /** Also display cover while loading the decal */
  coverLoading?: boolean
  /** Scale the decal size by this factor */
  motifScale?: number
  /** Set the vertical baseline of the decal (shift it up or down) */
  motifBaseline?: number
}

const StopClockUntilReady = ({ ready }: { ready: boolean }) => {
  const three = useThree()

  useEffect(() => {
    if (ready) {
      const startTimeout = setTimeout(() => {
        three.clock.start()
      }, 150)
      return () => clearTimeout(startTimeout)
    } else {
      three.clock.stop()
    }
  }, [ready, three])

  return null
}

export const Shirt = ({
  motif,
  color = "#202020",
  wobbleRange,
  wobbleSpeed,
  disabled,
  cover,
  motifScale,
  motifBaseline,
}: Partial<ShirtProps>) => {
  const objectRef = useRef<THREE.Object3D<Event>[] | undefined>()
  const [ready, setReady] = useState(false)

  const { material, aspectRatio } = useShirtMaterial(motif)

  const coverElement = (
    <div style={{ background: "transparent", position: "absolute", width: "100%", height: "100%", zIndex: "1" }}>
      {cover}
    </div>
  )

  return (
    <div style={{ background: "transparent", position: "relative", width: "100%", height: "100%" }}>
      {ready ? null : coverElement}
      <Suspense fallback={coverElement}>
        <Canvas shadows onCreated={() => setReady(true)}>
          <StopClockUntilReady ready={ready} />
          <ambientLight intensity={0.25} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -5, -10]} />
          <group scale={0.9}>
            <ShirtControls
              wobbleRange={wobbleRange}
              wobbleSpeed={wobbleSpeed}
              disabled={disabled}
              objectRef={objectRef}
            />
            <BasicShirt
              color={color}
              objectRef={objectRef}
              disabled={disabled}
              decalMaterial={material}
              decalAspect={aspectRatio}
              decalScale={motifScale}
              decalBaseline={motifBaseline}
            />
          </group>
        </Canvas>
      </Suspense>
    </div>
  )
}
