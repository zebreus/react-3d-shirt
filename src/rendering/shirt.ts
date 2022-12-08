import { ShirtReadyMessage } from "OffscreenShirt"
import { addTextureMaterial } from "rendering/decalMaterial"
import { UpdatePropsEvent } from "rendering/dispatchEvent"
import { shirturi } from "shirtdata"
import { BufferGeometry, DoubleSide, Euler, Mesh, MeshStandardMaterial, Scene, Vector3 } from "three"
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export type BasicShirtProps = {
  color: string
  disabled?: boolean
  motif?: string
  // decalMaterial: Material
  // decalAspect: number
  /** Scale the decal size by this factor */
  decalScale?: number
  /** Set the vertical baseline of the decal (shift it up or down) */
  decalBaseline?: number
}

export const sendReadyMessage = (canvasId: string) => {
  const message: ShirtReadyMessage = {
    type: "setShirtReady",
    value: true,
    canvasId: canvasId,
  }
  postMessage(message)
}

export const addShirt = async (
  scene: Scene,
  props: BasicShirtProps = {
    color: "green",
    disabled: false,
    decalScale: 1,
    decalBaseline: 0,
  }
) => {
  const mesh = await loadShirtAsync()
  const material = new MeshStandardMaterial({ color: "white", roughness: 1, side: DoubleSide })
  mesh.material = material
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.geometry
  mesh.name = "shirt"

  scene.add(mesh)

  const decalMesh = new Mesh(undefined, undefined)
  decalMesh.name = "decal"

  scene.add(decalMesh)

  mesh.addEventListener("updateProps", event => {
    const updatePropsEvent = event as UpdatePropsEvent
    updateShirt(scene, updatePropsEvent.detail.props)
  })

  updateShirt(scene, props)
}

export const updateShirt = (scene: Scene, { color, decalScale = 1, decalBaseline = 0, motif }: BasicShirtProps) => {
  const shirt = scene.getObjectByName("shirt") as Mesh
  const decal = scene.getObjectByName("decal") as Mesh

  console.log(shirt)

  // Set the shirt color
  const material = shirt.material as MeshStandardMaterial
  material.color.set(color)

  addTextureMaterial(decal, motif, (decalMaterial, decalAspect) => {
    // Ensure polygon offset is enabled
    decalMaterial.polygonOffset = true
    decalMaterial.polygonOffsetFactor = -4

    // Set the decal material
    decal.material = decalMaterial

    const newDecalGeometry = new DecalGeometry(
      shirt,
      new Vector3(0, -decalBaseline, 1),
      new Euler(0, Math.PI, Math.PI),
      new Vector3(2 * decalScale, (2 * decalScale) / decalAspect, 2 * decalScale)
    )
    decal.geometry = newDecalGeometry
  })
}

let loadedNodesPromise: Promise<BufferGeometry> | undefined

const loadShirtAsync = async () => {
  if (!loadedNodesPromise) {
    loadedNodesPromise = new GLTFLoader().loadAsync(shirturi).then(gltf => {
      const mesh = gltf?.scenes[0]?.children[0] as Mesh

      const geometry = mesh.geometry
      geometry.rotateX(Math.PI / 2)

      return geometry
    })
  }

  const geometry = await loadedNodesPromise
  return new Mesh(geometry)
}
