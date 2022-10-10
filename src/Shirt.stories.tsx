import { useEffect, useState } from "react"
import { Shirt } from "Shirt"

export const DefaultShirt = () => (
  <>
    <Shirt />
  </>
)

export const WithMotif = () => (
  <>
    <Shirt motif="https://picsum.photos/300/300" />
  </>
)

export const MotifLoadingTest = () => {
  const [motif, setMotif] = useState<string | undefined>(undefined)
  useEffect(() => {
    setInterval(() => {
      setMotif(prev => (prev ? undefined : "https://picsum.photos/300/300"))
    }, 5000)
  })

  return (
    <>
      <h3>{motif ? motif : "none"}</h3>
      <Shirt motif={motif} />
    </>
  )
}

export const ColoredShirt = () => (
  <>
    <Shirt color="#ff0000" />
  </>
)

export const WhiteShirt = () => (
  <>
    <Shirt color="#ffffff" />
  </>
)

export const DisabledShirt = () => (
  <>
    <Shirt disabled />
  </>
)

export const WobblyShirt = () => (
  <>
    <Shirt wobbleRange={0.2} wobbleSpeed={1} />
  </>
)

export const ScrollableShirt = () => (
  <>
    <Shirt color="#ffffff" />
    <div
      style={{
        height: 800,
        width: 200,
        background: "red",
      }}
    />
  </>
)
