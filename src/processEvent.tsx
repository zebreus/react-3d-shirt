import { createRoot, extend } from "@react-three/fiber"
import {
  CanvasReadyMessage,
  InitMessage,
  InteractionMessage,
  UpdatePropsMessage,
  UpdateTextureMessage,
} from "OffscreenShirt"
import { useState } from "react"
import { ShirtContent } from "Shirt"
import { useShirtMaterial } from "ShirtMaterial"
// eslint-disable-next-line import/no-namespace
import * as THREE from "three"
import { Event } from "three"

extend(THREE)

function noop() {}

class ElementProxyReceiver extends THREE.EventDispatcher {
  left = 0
  top = 0
  width = 0
  height = 0
  style = {}
  ownerDocument
  body
  constructor() {
    super()
    this.ownerDocument = this
    this.body = this
  }
  get clientWidth() {
    return this.width
  }
  get clientHeight() {
    return this.height
  }
  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height,
    }
  }
  handleEvent(data: Record<string, unknown> & Event) {
    if (data["type"] === "size") {
      this.left = data["left"] as number
      this.top = data["top"] as number
      this.width = data["width"] as number
      this.height = data["height"] as number
      return
    }
    data["preventDefault"] = noop
    data["stopPropagation"] = noop
    this.dispatchEvent(data)
  }
  focus() {}
  releasePointerCapture() {}
}

class ProxyManager {
  targets: Record<string, ElementProxyReceiver>
  constructor() {
    this.targets = {}
    this.handleEvent = this.handleEvent.bind(this)
  }
  makeProxy(data: { id: string }) {
    const { id } = data
    const proxy = new ElementProxyReceiver()
    this.targets[id] = proxy
  }
  getProxy(id: string) {
    return this.targets[id]
  }
  handleEvent(data: { id: string; data: Record<string, unknown> & Event }) {
    this.targets[data.id]?.handleEvent(data.data)
  }
}

const proxyManager = new ProxyManager()

export const OffscreenShirtContent = ({
  decalUrl,
  color = "#202020",
  wobbleRange,
  wobbleSpeed,
  disabled,
  decalScale,
  decalBaseline,
}: {
  /** An url to an image that is printed onto the shirt */
  decalUrl?: string
  /** The shirt color */
  color?: string
  /** How much the camera wobbles */
  wobbleRange?: number
  /** How fast the camera wobbles */
  wobbleSpeed?: number
  /** Disable interaction */
  disabled?: boolean
  /** Scale the decal size by this factor */
  decalScale?: number
  /** Set the vertical baseline of the decal (shift it up or down) */
  decalBaseline?: number
}) => {
  const { material, aspectRatio, ready: materialReady } = useShirtMaterial(decalUrl)

  const ready = materialReady

  return (
    <ShirtContent
      ready={ready}
      wobbleRange={wobbleRange}
      wobbleSpeed={wobbleSpeed}
      color={color}
      disabled={disabled}
      decalMaterial={material}
      decalAspect={aspectRatio}
      decalScale={decalScale}
      decalBaseline={decalBaseline}
    />
  )
}

const textureBitmap: Record<string, ImageBitmap | undefined | false> = {}
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

const processUpdateTexture = ({ texture, url }: UpdateTextureMessage) => {
  textureBitmap[url] = texture
  textureReadyCallbacks[url]?.forEach(cb => cb())
}

export const processEvent = (event: InitMessage | UpdatePropsMessage | InteractionMessage | UpdateTextureMessage) => {
  if (event.type === "init") {
    processInit(event)
  }

  if (event.type === "interaction") {
    processInteraction(event)
  }

  if (event.type === "updateProps") {
    processUpdate(event)
  }

  if (event.type === "updateTexture") {
    processUpdateTexture(event)
  }
}

const processInteraction = ({ event }: InteractionMessage) => {
  proxyManager.handleEvent({ id: "alpha", data: event })
}

let globalSetProps: ((props: InitMessage["props"]) => void) | undefined = undefined
let globalInitialProps: InitMessage["props"] = {} as InitMessage["props"]

const App = () => {
  const [props, setProps] = useState<InitMessage["props"]>(globalInitialProps)

  if (!globalSetProps) {
    globalSetProps = setProps
  }

  return (
    <OffscreenShirtContent
      color={props.color}
      disabled={props.disabled}
      decalUrl={props.motif}
      decalBaseline={props.decalBaseline}
      decalScale={props.decalScale}
      wobbleRange={props.wobbleRange}
      wobbleSpeed={props.wobbleSpeed}
    />
  )
}

const processInit = ({ canvas, width, height, pixelRatio, props }: InitMessage) => {
  proxyManager.makeProxy({ id: "alpha" })
  const proxy = proxyManager.getProxy("alpha")
  if (!proxy) {
    throw new Error("Proxy should exist, because we just created it")
  }
  // // @ts-expect-error: newly defined
  // proxy["body"] = proxy
  // @ts-expect-error: newly defined
  self.window = proxy
  // @ts-expect-error: newly defined
  self.document = proxy
  // // @ts-expect-error: newly defined
  // proxy.ownerDocument = proxy
  // @ts-expect-error: newly defined
  self.proxy = proxy

  const root = createRoot(canvas as unknown as HTMLCanvasElement)

  proxy.width = width
  proxy.height = height

  root.configure({
    size: {
      width,
      height,
      top: 0,
      left: 0,
      updateStyle: false,
    },
    dpr: pixelRatio, // important
    onCreated: state => {
      state.events.connect?.(proxy)
      const message: CanvasReadyMessage = {
        type: "setCanvasReady",
        value: true,
      }
      postMessage(message)
    },
    events: undefined,
  })

  globalInitialProps = props

  root.render(<App />)
}

const processUpdate = ({ props }: UpdatePropsMessage) => {
  globalInitialProps = props
  if (!globalSetProps) {
    // Canvas is not ready yet, setting initial props should be enough
    return
  }

  globalSetProps(props)
}
