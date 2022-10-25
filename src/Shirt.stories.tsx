import { css } from "@emotion/react"
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

export const WithSmallDownMotif = () => {
  const [baseline, setBaseline] = useState(0)
  const [scale, setScale] = useState(1)

  return (
    <>
      <label htmlFor="baselineInput">Baseline</label>
      <input
        type="range"
        min="-1.5"
        max="1.5"
        step="0.1"
        defaultValue="0"
        onChange={e => setBaseline(+e.currentTarget.value)}
        name="baselineInput"
      />
      <p>Baseline: {baseline}</p>
      <label htmlFor="scaleInput">Scale</label>
      <input
        type="range"
        min="0.1"
        max="2"
        step="0.1"
        defaultValue="1"
        onChange={e => setScale(+e.currentTarget.value)}
        name="scaleInput"
      />
      <p>Scale: {scale}</p>

      <Shirt motif="https://picsum.photos/300/300" motifScale={scale} motifBaseline={baseline} />
    </>
  )
}

export const ThreeShirtsWithMotif = () => (
  <div
    css={css`
      display: flex;
      flex-direction: row;
    `}
  >
    <Shirt motif="https://picsum.photos/300/300" />
    <Shirt motif="https://picsum.photos/300/300" />
    <Shirt motif="https://picsum.photos/300/300" />
  </div>
)

export const WithNonSquareMotif = () => (
  <>
    <Shirt motif="https://picsum.photos/400/600" />
  </>
)

export const MotifLoadingTest = () => {
  const [motif, setMotif] = useState<string | undefined>(undefined)
  useEffect(() => {
    const interval = setInterval(() => {
      setMotif(prev => (prev ? undefined : "https://picsum.photos/300/300"))
    }, 5000)
    return () => clearInterval(interval)
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

export const SuspenseShirtMotif = () => (
  <>
    <Shirt
      color="#000000"
      motif="https://picsum.photos/300/300"
      cover={<div style={{ width: "100%", height: "100%", background: "black" }}>sda</div>}
    />
  </>
)

export const SuspenseShirt = () => (
  <>
    <Shirt color="#000000" cover={<div style={{ width: "100%", height: "100%", background: "black" }}>sda</div>} />
  </>
)

export const SuspenseShirtBlackBg = () => <div style={{ width: "100%", height: "100%", background: "black" }}>sda</div>

export const WhiteShirt = () => (
  <>
    <Shirt color="#ffffff" />
  </>
)

export const DisabledShirt = () => {
  const [disabled, setDisabled] = useState(true)
  return (
    <>
      <h2>
        State: <b>{disabled ? "disabled" : "enabled"}</b>
      </h2>
      <button onClick={() => setDisabled(prev => !prev)}>{disabled ? "Enable shirt!" : "Disable shirt!"}</button>
      <Shirt disabled={disabled} />
    </>
  )
}

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
