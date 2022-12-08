import { UpdateTextureMessage } from "OffscreenShirt"
import { dispatchEvent } from "rendering/dispatchEvent"
import { getSubcanvases } from "rendering/subcanvas"
import { CanvasTexture } from "three"

const textureBitmap: Record<string, (CanvasTexture & { aspect: number }) | undefined | false> = {}
const textureReadyCallbacks: Record<string, Array<() => void> | undefined> = {}

export const getTexture = (url: string) => {
  return textureBitmap[url]
}

export const addTextureReadyCallback = (url: string, cb: () => void) => {
  if (!textureReadyCallbacks[url]) {
    textureReadyCallbacks[url] = []
  }
  textureReadyCallbacks[url]?.push(cb)
}

export const removeTextureReadyCallback = (url: string, cb: () => void) => {
  const index = textureReadyCallbacks[url]?.indexOf(cb)
  if (index !== undefined && index !== -1) {
    textureReadyCallbacks[url]?.splice(index, 1)
  }
}

export const processUpdateTexture = ({ texture, url }: UpdateTextureMessage) => {
  const canvasTexture = new CanvasTexture(texture) as CanvasTexture & { aspect: number }
  canvasTexture.aspect = texture.width / texture.height
  textureBitmap[url] = canvasTexture

  // Inform all subcanvases that the texture is ready
  const subcanvases = getSubcanvases()
  subcanvases.forEach(subcanvas => {
    console.log("dispatching loadedTexture")
    dispatchEvent(subcanvas.scene, { type: "loadedTexture", detail: { url, status: "success" } })
  })

  textureReadyCallbacks[url]?.forEach(cb => cb())
}
