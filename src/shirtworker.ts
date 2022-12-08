import { processEvent } from "processEvent"

console.log("initworker")
addEventListener("message", (event: MessageEvent<any>) => {
  //   console.log("shirtworker.ts: received message from main thread", event, v)
  processEvent(event.data)
})
