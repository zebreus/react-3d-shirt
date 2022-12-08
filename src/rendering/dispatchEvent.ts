import { WorkerProps } from "OffscreenShirt"
import { Event, Object3D } from "three"

export interface TickEvent extends Event {
  detail: {
    delta: number
    total: number
  }
  type: "tick"
}

export interface UpdatePropsEvent extends Event {
  detail: {
    props: WorkerProps
    previous: WorkerProps | undefined
  }
  type: "updateProps"
}

export interface DestroyEvent extends Event {
  type: "destroy"
}

export interface LoadedTextureEvent extends Event {
  detail: {
    url: string
    status: "success" | "error"
  }
  type: "loadedTexture"
}

export const dispatchEvent = (
  object: Object3D,
  event: TickEvent | DestroyEvent | LoadedTextureEvent | UpdatePropsEvent
) => {
  object.dispatchEvent?.(event)
  // @ts-expect-error: material is only available on Mesh. It is ok, if it is not defined.
  object["material"]?.dispatchEvent?.(event)

  object.children?.forEach((child?) => dispatchEvent(child, event))
}
