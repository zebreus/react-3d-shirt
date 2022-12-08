import { useEffect, useState } from "react"

let shirtWorker: Worker | undefined

export const useWorker = (dontLoad: boolean) => {
  // if (dontLoad) {
  //   return undefined
  // }
  // if (!shirtWorker) {
  //   shirtWorker = new Worker(new URL("../util/shirt.worker.ts", import.meta.url))
  // }
  // return shirtWorker
  const [worker, setWorker] = useState<Worker | undefined>(shirtWorker)

  useEffect(() => {
    if (dontLoad) {
      // @ts-expect-error: Make worker available to the console
      window.workerDebug = undefined
      setWorker(undefined)
      return
    }
    if (worker) {
      return
    }
    if (!shirtWorker) {
      shirtWorker = new Worker(new URL("./shirtworker.ts", import.meta.url), {
        type: "module",
      })
    }
    // @ts-expect-error: Make worker available to the console
    window.workerDebug = shirtWorker
    setWorker(shirtWorker)
  }, [dontLoad, worker])

  return worker
}
