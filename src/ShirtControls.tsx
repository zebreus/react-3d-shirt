import { OrbitControls, OrbitControlsProps } from "@react-three/drei"
import { useFrame, useThree } from "@react-three/fiber"
import { useProxyElement } from "processEvent"
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
  const [active, setActive] = useState(true)
  const mouseDist = useRef(0)

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
      const firstChild = domElement.firstElementChild as HTMLDivElement | null
      const canvasChild = domElement.firstElementChild?.firstElementChild as HTMLCanvasElement | null
      if (domElement.style) {
        domElement.style.touchAction = "auto"
      }
      if (firstChild && firstChild.style) {
        firstChild.style.touchAction = "auto"
      }
      if (canvasChild && canvasChild.style) {
        canvasChild.style.touchAction = "auto"
      }

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

        const isLeftClick = ((e as MouseEvent).button || 0) === 0

        if (hovering && !disabled && isLeftClick) {
          orbit.enabled = true
          orbit?.update?.()
          e.preventDefault()
        } else {
          orbit.enabled = false
          orbit?.update?.()
        }
      }

      const updateState = (e: MouseEvent | PointerEvent | TouchEvent) => {
        if (e.type === "pointerdown") {
          mouseDist.current = 0
        }
        if (e.type === "pointermove") {
          mouseDist.current += Math.sqrt(
            Math.pow((e as PointerEvent).movementX, 2) + Math.pow((e as PointerEvent).movementY, 2)
          )
        }

        if (e.type === "pointerup") {
          if (mouseDist.current === 0 && (e as PointerEvent).pointerType === "touch" && orbit.enabled) {
            e.currentTarget?.dispatchEvent(new MouseEvent("click", e))
          }
          return
        }

        if (e.type === "click") {
          if (mouseDist.current > 0 && orbit.enabled) {
            e.preventDefault()
            e.cancelBubble = true
          }
        }
      }

      domElement.addEventListener("touchstart", filterInteraction, true)
      domElement.addEventListener("pointerdown", filterInteraction, true)
      domElement.addEventListener("click", updateState, true)
      domElement.addEventListener("pointerdown", updateState, true)
      domElement.addEventListener("pointerup", updateState, true)
      domElement.addEventListener("pointermove", updateState, true)

      return () => {
        domElement.removeEventListener("touchstart", filterInteraction, true)
        domElement.removeEventListener("pointerdown", filterInteraction, true)
        domElement.removeEventListener("click", updateState, true)
        domElement.removeEventListener("pointerdown", updateState, true)
        domElement.removeEventListener("pointerup", updateState, true)
        domElement.removeEventListener("pointermove", updateState, true)
      }
    }
  }, [orbit, isHovering, disabled])

  useFrame(state => {
    if (!active && orbit) {
      const time = state.clock.running ? state.clock.getElapsedTime() : 0
      const polar = Math.PI / 2 + Math.sin(time * wobbleSpeed) * wobbleRange
      const azimuthal = Math.sin(time * wobbleSpeed * 2) * wobbleRange
      orbit.setPolarAngle?.(polar)
      orbit.setAzimuthalAngle?.(azimuthal)
    }
  })

  const proxy = useProxyElement()

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
        enabled={true}
        enableZoom={false}
        enablePan={false}
        // @ts-expect-error: defined in process event
        domElement={proxy ?? undefined}
      />
    </>
  )
}
