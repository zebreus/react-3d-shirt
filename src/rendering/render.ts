import { dispatchEvent } from "rendering/dispatchEvent"
import { getSubcanvases, Subcanvas } from "rendering/subcanvas"
import { Event, WebGLRenderer } from "three"

const screenSize = {
  width: 300, // canvas default
  height: 150, // canvas default
}

export const setScreenSize = ({ width, height }: { width: number; height: number }) => {
  screenSize.width = width
  screenSize.height = height

  if (!globalCanvas || !globalRenderer) {
    initializeScreen()
  }

  const needResize = globalCanvas.width !== width || globalCanvas.height !== height
  if (needResize) {
    globalRenderer.setSize(width, height, false)
  }
}

// eslint-disable-next-line import/no-mutable-exports
let globalCanvas: OffscreenCanvas
let globalRenderer: WebGLRenderer

export const initializeScreen = () => {
  if (globalCanvas) {
    return
  }
  /* eslint-disable-line no-unused-vars */
  globalCanvas = new OffscreenCanvas(screenSize.width, screenSize.height)
  const renderer = new WebGLRenderer({ canvas: globalCanvas, alpha: true })
  globalRenderer = renderer
  startRendering()
}

const setScissorForSubCanvas = (renderer: WebGLRenderer, elem: Subcanvas) => {
  const left = elem.x
  const bottom = elem.y + elem.height
  const width = elem.width
  const height = elem.height

  const positiveYUpBottom = screenSize.height - bottom
  renderer.setScissor(left, positiveYUpBottom, width, height)
  renderer.setViewport(left, positiveYUpBottom, width, height)

  return width / height
}

const renderSubcanvas = (renderer: WebGLRenderer, subcanvas: Subcanvas) => {
  const aspect = setScissorForSubCanvas(renderer, subcanvas)
  subcanvas.camera.aspect = aspect
  subcanvas.camera.updateProjectionMatrix()
  renderer.render(subcanvas.scene, subcanvas.camera)
}

let accumulatedDelta = 0
let totalTime = 0
const interval = 1 / 30
let last: number | undefined = undefined

export const getRenderer = () => {
  if (!globalRenderer) {
    initializeScreen()
  }
  return globalRenderer as WebGLRenderer
}

const startRendering = () => {
  const callback = (current: number) => {
    if (last === undefined) {
      last = current
    }
    const delta = current - last
    last = current

    accumulatedDelta += delta / 1000

    if (accumulatedDelta > interval) {
      totalTime += accumulatedDelta
      render(accumulatedDelta, totalTime)

      accumulatedDelta = 0
    }

    setTimeout(() => {
      requestAnimationFrame(callback)
    }, 10)
  }
  requestAnimationFrame(callback)
}

export interface TickEvent extends Event {
  detail: {
    delta: number
    total: number
  }
}

const render = (delta: number, total: number) => {
  if (!globalRenderer) {
    return
  }

  const subcanvases = Object.values(getSubcanvases())

  subcanvases.forEach(subcanvas => {
    dispatchEvent(subcanvas.scene, { type: "tick", detail: { delta: delta, total } })
  })

  const renderer = globalRenderer
  renderer.setScissorTest(true)

  subcanvases.forEach(subcanvas => {
    renderSubcanvas(renderer, subcanvas)
  })

  subcanvases.forEach(subcanvas => {
    const context = subcanvas.canvas.getContext("2d")

    const width = Math.min(subcanvas.width, screenSize.width - subcanvas.x)
    const height = Math.min(subcanvas.height, screenSize.height - subcanvas.x)

    context?.drawImage(globalCanvas, subcanvas.x, subcanvas.y, width, height, 0, 0, width, height)
  })
}
