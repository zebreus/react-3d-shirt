import { OrbitControls, OrbitControlsProps } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useCallback, useEffect, useState } from "react"
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

      const getMouse = (
        target: HTMLElement | undefined | null,
        thing: { clientX: number; clientY: number } | undefined
      ) => {
        if (!target || !thing) throw new Error("No target or thing")
        const rect = target.getBoundingClientRect?.()
        const mouse = new Vector2()
        mouse.x = ((thing.clientX - rect.x) / rect.width) * 2 - 1
        mouse.y = -((thing.clientY - rect.y) / rect.height) * 2 + 1

        return mouse
      }

      const filterInteraction = (e: MouseEvent | PointerEvent | TouchEvent) => {
        const target = e.currentTarget as HTMLElement | null
        const mouse = e instanceof TouchEvent ? getMouse(target, e.touches[0]) : getMouse(target, e)

        const hovering = isHovering(mouse)
        // console.log(`Registered ${e.type} event`)
        // console.log("hovering: ", hovering)

        if (hovering && !disabled) {
          orbit.enabled = true
          orbit?.update?.()
          e.preventDefault()
        } else {
          orbit.enabled = false
          orbit?.update?.()
        }
      }

      domElement.addEventListener("touchstart", filterInteraction, true)
      domElement.addEventListener("pointerdown", filterInteraction, true)
      domElement.addEventListener("contextmenu", filterInteraction, true)
      return () => {
        domElement.removeEventListener("touchstart", filterInteraction, true)
        domElement.removeEventListener("pointerdown", filterInteraction, true)
        domElement.removeEventListener("contextmenu", filterInteraction, true)
      }
    }
  }, [orbit, isHovering, disabled])

  useFrame(state => {
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
        onStart={() => {
          setActive(() => true)
          if (orbit) {
            orbit.dampingFactor = 0.1
          }
        }}
        onEnd={() => {
          setActive(() => false)
          if (orbit) {
            orbit.dampingFactor = 0.01
            orbit.setPolarAngle?.(Math.PI / 2)
            orbit.setAzimuthalAngle?.(0)
          }
        }}
        enabled={!disabled || active}
        enableZoom={false}
        enablePan={false}
      />
    </>
  )
}
