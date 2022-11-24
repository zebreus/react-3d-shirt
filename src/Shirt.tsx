import { Canvas, useThree } from "@react-three/fiber"
import { BasicShirt } from "BasicShirt"
import { ReactNode, Suspense, useEffect, useRef, useState } from "react"
import { ShirtControls } from "ShirtControls"
import { useShirtMaterial } from "ShirtMaterial"

export type ShirtProps = {
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
  /** Also display cover while loading a changed decal */
  coverMotifChange?: boolean
  /** Scale the decal size by this factor */
  motifScale?: number
  /** Set the vertical baseline of the decal (shift it up or down) */
  motifBaseline?: number
  /** Additional classnames */
  className?: string
  /** Wait a few milliseconds before rendering. This can be used to make transitions smoother.
   *
   * In future I should look into using a offscreen canvas for this
   */
  renderDelay?: number
}

const StopClockUntilReady = ({ ready }: { ready: boolean }) => {
  const three = useThree()

  useEffect(() => {
    if (ready) {
      const startTimeout = setTimeout(() => {
        if (!three.clock.running) {
          three.clock.start()
        }
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
  coverLoading,
  coverMotifChange,
  motifScale,
  motifBaseline,
  className,
  renderDelay,
}: Partial<ShirtProps>) => {
  const [canvasReady, setCanvasReady] = useState(false)
  const [delayReady, setDelayReady] = useState(!renderDelay)

  useEffect(() => {
    if (renderDelay) {
      const timeout = setTimeout(() => {
        setDelayReady(true)
      }, renderDelay)
      return () => clearTimeout(timeout)
    }
  }, [renderDelay, setDelayReady])

  const { material, aspectRatio, ready: materialReady } = useShirtMaterial(motif)

  const coverElement = (
    <div style={{ background: "transparent", position: "absolute", width: "100%", height: "100%", zIndex: "1" }}>
      {cover}
    </div>
  )

  const ready = canvasReady && (materialReady || !coverLoading || !coverMotifChange) && delayReady

  return (
    <div
      style={{ background: "transparent", position: "relative", width: "100%", height: "100%" }}
      className={`${className}`}
    >
      {ready ? null : coverElement}
      {delayReady ? (
        <Suspense fallback={coverElement}>
          <Canvas shadows onCreated={() => setCanvasReady(true)}>
            <ShirtContent
              ready={ready}
              wobbleRange={wobbleRange}
              wobbleSpeed={wobbleSpeed}
              color={color}
              disabled={disabled}
              decalMaterial={material}
              decalAspect={aspectRatio}
              decalScale={motifScale}
              decalBaseline={motifBaseline}
            />
          </Canvas>
        </Suspense>
      ) : null}
    </div>
  )
}

export const ShirtNoRender = ({
  motif,
  color = "#202020",
  wobbleRange,
  wobbleSpeed,
  disabled,
  cover,
  coverLoading,
  coverMotifChange,
  motifScale,
  motifBaseline,
  className,
  renderDelay,
}: Partial<ShirtProps>) => {
  const [canvasReady, setCanvasReady] = useState(false)
  const [delayReady, setDelayReady] = useState(!renderDelay)

  useEffect(() => {
    if (renderDelay) {
      const timeout = setTimeout(() => {
        setDelayReady(true)
      }, renderDelay)
      return () => clearTimeout(timeout)
    }
  }, [renderDelay, setDelayReady])

  const { material, aspectRatio, ready: materialReady } = useShirtMaterial(motif)

  const coverElement = (
    <div style={{ background: "transparent", position: "absolute", width: "100%", height: "100%", zIndex: "1" }}>
      {cover}
    </div>
  )

  const ready = canvasReady && (materialReady || !coverLoading || !coverMotifChange) && delayReady

  return (
    <div
      style={{ background: "transparent", position: "relative", width: "100%", height: "100%" }}
      className={`${className}`}
    >
      {ready ? null : coverElement}
      {delayReady ? (
        <Suspense fallback={coverElement}>
          <Canvas shadows onCreated={() => setCanvasReady(true)}>
            <ShirtContent
              ready={ready}
              wobbleRange={wobbleRange}
              wobbleSpeed={wobbleSpeed}
              color={color}
              disabled={disabled}
              decalMaterial={material}
              decalAspect={aspectRatio}
              decalScale={motifScale}
              decalBaseline={motifBaseline}
            />
          </Canvas>
        </Suspense>
      ) : null}
    </div>
  )
}

export const ShirtContent = ({
  ready,
  wobbleSpeed,
  wobbleRange,
  disabled,
  color,
  decalMaterial,
  decalAspect,
  decalScale,
  decalBaseline,
}: {
  ready: boolean
  wobbleSpeed?: number
  wobbleRange?: number
  /** Disable interactivity */
  disabled?: boolean
  /** The shirt color */
  color: string

  decalMaterial: ReactNode
  decalAspect: number
  /** Scale the decal size by this factor */
  decalScale?: number
  /** Set the vertical baseline of the decal (shift it up or down) */
  decalBaseline?: number
}) => {
  const objectRef = useRef<THREE.Object3D<Event>[] | undefined>()
  return (
    <>
      {/* <color attach="background" args={[255, 0, 0]} /> */}
      <StopClockUntilReady ready={ready} />
      <ambientLight intensity={0.25} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -5, -10]} />
      <group scale={0.9}>
        <ShirtControls wobbleRange={wobbleRange} wobbleSpeed={wobbleSpeed} disabled={disabled} objectRef={objectRef} />
        <BasicShirt
          color={color}
          objectRef={objectRef}
          disabled={disabled}
          decalMaterial={decalMaterial}
          decalAspect={decalAspect}
          decalScale={decalScale}
          decalBaseline={decalBaseline}
        />
      </group>
    </>
  )
}
