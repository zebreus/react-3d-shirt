// main.jsx (main thread)

import { Dispatch, useEffect, useRef, useState } from "react"
import { ShirtProps } from "Shirt"

const prepareMouseEvent = (e: MouseEvent) => {
  const keepKeys = [
    "ctrlKey",
    "metaKey",
    "shiftKey",
    "button",
    "clientX",
    "clientY",
    "pageX",
    "pageY",
    "screenX",
    "screenY",
    "offsetX",
    "offsetY",
    "layerX",
    "layerY",
    "type",
    "x",
    "y",
    "timeStamp",
    "isPrimary",
    "pointerType",
  ]

  const entries: Array<[string, unknown]> = []
  for (const entry in e) {
    entries.push([entry, (e as unknown as Record<string, unknown>)[entry]])
  }
  const filteredEntries = entries.filter(([key]) => keepKeys.includes(key))
  const filteredEvent = Object.fromEntries(filteredEntries)
  return filteredEvent
}

export type WorkerProps = {
  /** An url to an image that is printed onto the shirt */
  motif?: string
  /** The shirt color */
  color: string
  /** How much the camera wobbles */
  wobbleRange?: number
  /** How fast the camera wobbles */
  wobbleSpeed?: number
  /** Disable interaction */
  disabled: boolean
  /** Scale the decal size by this factor */
  decalScale: number
  /** Set the vertical baseline of the decal (shift it up or down) */
  decalBaseline: number
}

export type InitMessage = {
  canvas: OffscreenCanvas
  width: number
  height: number
  pixelRatio: number
  props: WorkerProps
  type: "init"
}

export type UpdatePropsMessage = {
  props: WorkerProps
  type: "updateProps"
}

export type InteractionMessage = {
  event: Record<string, unknown> & Event
  type: "interaction"
}

export type UpdateTextureMessage = {
  texture: ImageBitmap
  url: string
  type: "updateTexture"
}

export type ShirtReadyMessage = {
  type: "setShirtReady"
  value: boolean
}

export type CanvasReadyMessage = {
  type: "setCanvasReady"
  value: boolean
}

export type DecalReadyMessage = {
  type: "setDecalReady"
  value: boolean
  error: boolean
  hasPrevious: boolean
}

export type OffscreenShirtCanvasProps = {
  worker: Worker
  setShirtReady: Dispatch<boolean>
  setDecalReady: Dispatch<boolean>
  setPreviousDecalReady: Dispatch<boolean>
  setCanvasReady: Dispatch<boolean>
} & ShirtProps

const texturePromises: Record<string, Promise<ImageBitmap>> = {}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const loadTextureAsync = (url: string) => {
  if (!url) {
    throw new Error("Url needs to be defined")
  }

  if (!texturePromises[url]) {
    texturePromises[url] = new Promise<ImageBitmap>((resolve, reject) => {
      try {
        const image = new Image()
        image.onload = async () => {
          try {
            console.timeEnd("load texture into image")
            console.time("create bitmap texture")
            const bitmap = await createImageBitmap(image)
            console.timeEnd("create bitmap texture")
            resolve(bitmap)
          } catch (e) {
            reject(e)
          }
        }
        console.time("load texture into image")
        image.src = url
      } catch (e) {
        reject(e)
      }
    })
  }

  return texturePromises[url]
}

const uploadedTextures: Record<string, boolean | undefined> = {}
const uploadTexture = async (url: string, worker: Worker) => {
  if (!url) {
    throw new Error("Url needs to be defined")
  }
  if (uploadedTextures[url]) {
    return
  }

  const texture = await loadTextureAsync(url)
  if (!texture) {
    throw new Error("texture not found" + url)
  }
  const updateTextureMessage: UpdateTextureMessage = {
    type: "updateTexture",
    url: url,
    texture,
  }

  if (uploadedTextures[url]) {
    return
  }
  worker.postMessage(updateTextureMessage, [texture])
  uploadedTextures[url] = true
}

export const OffscreenShirtCanvas = ({
  worker,
  motif,
  color = "#202020",
  wobbleRange,
  wobbleSpeed,
  disabled,
  motifScale,
  motifBaseline,
  setShirtReady,
  setDecalReady,
  setPreviousDecalReady,
  setCanvasReady,
}: OffscreenShirtCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenCanvasRef = useRef<OffscreenCanvas>()
  const initRef = useRef<boolean>(false)

  useEffect(() => {
    const listener = (event: MessageEvent<CanvasReadyMessage | DecalReadyMessage | ShirtReadyMessage>) => {
      if (event.data.type === "setShirtReady") {
        setShirtReady(event.data.value)
        return
      }
    }

    worker.addEventListener("message", listener)
    return () => worker.removeEventListener("message", listener)
  }, [setShirtReady, worker])

  useEffect(() => {
    const listener = (event: MessageEvent<CanvasReadyMessage | DecalReadyMessage | ShirtReadyMessage>) => {
      if (event.data.type === "setCanvasReady") {
        setCanvasReady(event.data.value)
        return
      }
    }

    worker.addEventListener("message", listener)
    return () => worker.removeEventListener("message", listener)
  }, [setCanvasReady, worker])

  useEffect(() => {
    const listener = (event: MessageEvent<CanvasReadyMessage | DecalReadyMessage | ShirtReadyMessage>) => {
      if (event.data.type === "setDecalReady") {
        setDecalReady(event.data.value)
        setPreviousDecalReady(event.data.hasPrevious)
        return
      }
    }

    worker.addEventListener("message", listener)
    return () => worker.removeEventListener("message", listener)
  }, [setDecalReady, setPreviousDecalReady, worker])

  useEffect(() => {
    if (!canvasRef.current) {
      throw new Error("shouldnt happen 1")
    }
    const offscreenCanvas = offscreenCanvasRef.current ?? canvasRef.current?.transferControlToOffscreen()
    if (!offscreenCanvas) {
      throw new Error("shouldnt happen 2")
    }

    offscreenCanvasRef.current = offscreenCanvas

    if (initRef.current) {
      return
    }
    const initMessage: InitMessage = {
      canvas: offscreenCanvas,
      width: canvasRef.current?.clientWidth,
      height: canvasRef.current?.clientHeight,
      pixelRatio: window.devicePixelRatio,
      type: "init",
      props: {
        motif: motif,
        color: color,
        wobbleRange: wobbleRange,
        wobbleSpeed: wobbleSpeed,
        disabled: !!disabled,
        decalScale: motifScale ?? 1,
        decalBaseline: motifBaseline ?? 0,
      },
    }
    worker.postMessage(initMessage, [offscreenCanvas])
    initRef.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [worker])

  useEffect(() => {
    if (!initRef.current) {
      return
    }
    const updatePropsMessage: UpdatePropsMessage = {
      type: "updateProps",
      props: {
        motif: motif,
        color: color,
        wobbleRange: wobbleRange,
        wobbleSpeed: wobbleSpeed,
        disabled: !!disabled,
        decalScale: motifScale ?? 1,
        decalBaseline: motifBaseline ?? 0,
      },
    }
    worker.postMessage(updatePropsMessage)
  }, [worker, motif, color, wobbleRange, wobbleSpeed, disabled, motifScale, motifBaseline])

  useEffect(() => {
    if (!initRef.current) {
      return
    }
    if (!motif) {
      return
    }
    uploadTexture(motif, worker)
  }, [worker, motif])

  return (
    <canvas
      onClick={e => {
        worker.postMessage({
          event: prepareMouseEvent(e.nativeEvent),
          type: "interaction",
        })
      }}
      onPointerDown={e => {
        worker.postMessage({
          event: prepareMouseEvent(e.nativeEvent),
          type: "interaction",
        })
      }}
      onPointerMove={e => {
        worker.postMessage({
          event: prepareMouseEvent(e.nativeEvent),
          type: "interaction",
        })
      }}
      onPointerUp={e => {
        worker.postMessage({
          event: prepareMouseEvent(e.nativeEvent),
          type: "interaction",
        })
      }}
      style={{
        width: "100%",
        height: "100%",
      }}
      ref={canvasRef}
    />
  )
}

export type OffscreenShirtProps = {
  /** A webworker that has processEvent as the handler for messages. Will only display cover until the worker is set */
  worker?: Worker
} & ShirtProps

export const OffscreenShirt = ({
  worker,
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
}: OffscreenShirtProps) => {
  const [decalReady, setDecalReady] = useState<boolean>(false)
  const [previousDecalReady, setPreviousDecalReady] = useState<boolean>(false)

  const [canvasReady, setCanvasReady] = useState<boolean>(false)

  const [shirtReady, setShirtReady] = useState<boolean>(false)

  const [delayReady, setDelayReady] = useState(!renderDelay)

  useEffect(() => {
    if (renderDelay) {
      const timeout = setTimeout(() => {
        setDelayReady(true)
      }, renderDelay)
      return () => clearTimeout(timeout)
    }
  }, [renderDelay, setDelayReady])

  const coverElement = (
    <div style={{ background: "transparent", position: "absolute", width: "100%", height: "100%", zIndex: "1" }}>
      {cover}
    </div>
  )

  const ready =
    !!worker &&
    shirtReady &&
    canvasReady &&
    (decalReady || previousDecalReady || !coverLoading) &&
    (decalReady || !coverMotifChange) &&
    delayReady

  return (
    <div
      style={{ background: "transparent", position: "relative", width: "100%", height: "100%" }}
      className={`${className}`}
    >
      {ready ? null : coverElement}
      {worker && delayReady ? (
        <OffscreenShirtCanvas
          setDecalReady={setDecalReady}
          setShirtReady={setShirtReady}
          setCanvasReady={setCanvasReady}
          setPreviousDecalReady={setPreviousDecalReady}
          wobbleRange={wobbleRange}
          wobbleSpeed={wobbleSpeed}
          disabled={disabled}
          motif={motif}
          color={color}
          motifScale={motifScale}
          motifBaseline={motifBaseline}
          worker={worker}
        />
      ) : null}
    </div>
  )
}
