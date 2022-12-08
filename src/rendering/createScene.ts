import { WorkerProps } from "OffscreenShirt"
import { addShirt, updateShirt } from "rendering/shirt"
import { DirectionalLight, PerspectiveCamera, Scene } from "three"

export const createScene = (props: WorkerProps) => {
  const fov = 75
  const aspect = 2 // the canvas default
  const near = 0.1
  const far = 100
  const camera = new PerspectiveCamera(fov, aspect, near, far)
  camera.position.z = 4

  const scene = new Scene()

  {
    const color = 0xffffff
    const intensity = 1
    const light = new DirectionalLight(color, intensity)
    light.position.set(-1, 2, 4)
    scene.add(light)
  }

  const addedShirt = addShirt(scene, props)

  const updateProps = async (props: WorkerProps) => {
    await addedShirt
    updateShirt(scene, {
      color: props.color,
      decalBaseline: props.decalBaseline,
      decalScale: props.decalScale,
      motif: props.motif,
      disabled: props.disabled,
    })
  }

  return { scene, camera, updateProps }
}
