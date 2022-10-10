import { OrbitControls, OrbitControlsProps } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useRef, useState } from "react"
import { Object3D, Raycaster, Vector2 } from "three"

type ShirtControlsProps = {
  wobbleSpeed?: number
  wobbleRange?: number
  /** Disable interactivity */
  disabled?: boolean
  objectRef: React.MutableRefObject<Object3D<Event>[] | undefined>
}
export const ShirtControls = ({ wobbleSpeed = 0.3, wobbleRange = 0.07, disabled, objectRef }: ShirtControlsProps) => {
  const [orbit, setOrbit] = useState<OrbitControlsProps | null>(null)
  const [active, setActive] = useState(false)
  const [cancel, setCancel] = useState(false)

  const { camera } = useThree()

  const isHovering = useCallback(
    (mouse: Vector2 | undefined) => {
      const refr = objectRef?.current
      if (!refr || !mouse) return false
      const raycaster = new Raycaster()
      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObjects(refr, true)
      return intersects.length > 0
    },
    [camera, objectRef]
  )

  useEffect(() => {
    const domElement = orbit?.domElement
    if (domElement) {
      domElement.style.touchAction = "auto"
      ;(domElement.firstElementChild as HTMLDivElement).style.touchAction = "auto"
      ;(domElement.firstElementChild?.firstElementChild as HTMLCanvasElement).style.touchAction = "auto"
      const listener = (e: TouchEvent) => {
        const touch = e.touches[0]
        if (!touch) {
          return
        }
        const target = e.currentTarget as HTMLElement | null
        if (!target) {
          return
        }
        const rect = target.getBoundingClientRect?.()
        const mouse = new Vector2()
        mouse.x = ((touch.clientX - rect.x) / rect.width) * 2 - 1
        mouse.y = -((touch.clientY - rect.y) / rect.height) * 2 + 1

        const hovering = isHovering(mouse)
        console.log("hovering!: ", hovering)

        if (hovering) {
          e.preventDefault()
        }
      }
      domElement.addEventListener("touchstart", listener)
      return () => {
        domElement.removeEventListener("touchstart", listener)
      }
    }
  }, [orbit, isHovering])

  const mouseRef = useRef<Vector2 | undefined>()
  useFrame(state => {
    mouseRef.current = state.mouse
    if (!active && orbit) {
      const polar = Math.PI / 2 + Math.sin(state.clock.getElapsedTime() * wobbleSpeed) * wobbleRange
      const azimuthal = Math.cos(state.clock.getElapsedTime() * wobbleSpeed) * wobbleRange
      orbit.setPolarAngle?.(polar)
      orbit.setAzimuthalAngle?.(azimuthal)
    }
  })

  return (
    <>
      <OrbitControls
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ref={setOrbit}
        rotation={[0, 0, 0]}
        minDistance={2}
        maxDistance={5}
        maxPolarAngle={Math.PI - 0.5}
        minPolarAngle={0.5}
        enablePan={false}
        onPointerDown={() => console.log("down")}
        onStart={e => {
          console.log("start")
          const hovering = isHovering(mouseRef.current)
          console.log("hovering: ", hovering)

          if (hovering) {
            setActive(() => true)
            if (orbit) {
              orbit.dampingFactor = 0.1
            }
          } else {
            if (orbit) {
              orbit.domElement?.dispatchEvent(new Event("pointercancel"))
              orbit.domElement?.dispatchEvent(new Event("pointerup"))
              orbit.domElement?.dispatchEvent(new Event("touchcancel"))
              orbit.domElement?.dispatchEvent(new Event("touchend"))
              orbit.domElement?.dispatchEvent(new Event("touchup"))
              // @ts-expect-error: `e` is not really the correct type, but should suffice
              orbit.onPointerUp?.(e)
              orbit.dampingFactor = 0.01
            }
          }
        }}
        onEnd={() => {
          setActive(() => false)
          setCancel(() => false)
          if (orbit) {
            orbit.dampingFactor = 0.01
            orbit.setPolarAngle?.(Math.PI / 2)
            orbit.setAzimuthalAngle?.(0)
          }
        }}
        enabled={(!disabled || active) && !cancel}
        enableZoom={false}
      />
    </>
  )
}
