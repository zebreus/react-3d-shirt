import { css } from "@emotion/react"
import { OffscreenShirt } from "OffscreenShirt"
import { useEffect, useState } from "react"
import { useWorker } from "useWorker"
// @ts-expect-error: This is a test image
import testimageUrl from "./testimage.png"

export const DefaultShirt = () => {
  const [toggle, setToggle] = useState(false)
  const worker = useWorker(false)
  console.log(testimageUrl)
  return (
    <>
      <button onClick={() => setToggle(!toggle)}>Toggle</button>
      <div
        css={css`
          height: ${toggle ? "400px" : "800px"};
          position: relative;
        `}
      >
        <OffscreenShirt worker={worker} motif={testimageUrl} />
      </div>
    </>
  )
}

export const AlphaQuadTest = () => {
  const worker = useWorker(false)
  console.log(worker)
  const [shirtColor, setShirtColor] = useState("white")
  return (
    <>
      <button onClick={() => setShirtColor(color => (color === "white" ? "green" : "white"))}>Toggle color</button>

      <div
        css={css`
          display: grid;
          grid-template-columns: 1fr 1fr;
          grid-template-rows: 400px 400px;
          grid-gap: 10px;
        `}
      >
        <div
          css={css`
            background: red;
          `}
        >
          <OffscreenShirt worker={worker} color={shirtColor} />
        </div>
        <div
          css={css`
            background: green;
          `}
        >
          <OffscreenShirt worker={worker} />
        </div>
        <div
          css={css`
            background: blue;
          `}
        >
          <OffscreenShirt worker={worker} />
        </div>
        <div
          css={css`
            background: yellow;
          `}
        >
          <OffscreenShirt worker={worker} />
        </div>
      </div>
    </>
  )
}

export const ClickableShirt = () => (
  <>
    <button
      onClick={() => {
        alert("Clicked")
      }}
    >
      <OffscreenShirt />
    </button>
    <a href={`#${Math.floor(Math.random() * 1000)}`}>
      <OffscreenShirt />
    </a>
  </>
)

export const WithMotif = () => (
  <>
    <OffscreenShirt motif="https://picsum.photos/300/300" />
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

      <OffscreenShirt motif="https://picsum.photos/300/300" motifScale={scale} motifBaseline={baseline} />
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
    <OffscreenShirt motif="https://picsum.photos/300/300" />
    <OffscreenShirt motif="https://picsum.photos/300/300" />
    <OffscreenShirt motif="https://picsum.photos/300/300" />
  </div>
)

export const WithNonSquareMotif = () => (
  <>
    <OffscreenShirt motif="https://picsum.photos/400/600" />
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
      <OffscreenShirt motif={motif} />
    </>
  )
}

export const ColoredShirt = () => (
  <>
    <OffscreenShirt color="#ff0000" />
  </>
)

export const SuspenseShirtMotif = () => (
  <>
    <OffscreenShirt
      color="#000000"
      motif="https://picsum.photos/300/300"
      cover={<div style={{ width: "100%", height: "100%", background: "black" }}>sda</div>}
      coverLoading
    />
  </>
)

export const SuspenseShirtDelayedMotif = () => (
  <>
    <OffscreenShirt
      color="#000000"
      motif="http://127.0.0.1:4567/500/https://picsum.photos/300/300"
      cover={<div style={{ width: "100%", height: "100%", background: "black" }}>sda</div>}
      coverLoading
    />
  </>
)

export const SuspenseShirt = () => (
  <>
    <OffscreenShirt
      color="#000000"
      cover={<div style={{ width: "100%", height: "100%", background: "black" }}>sda</div>}
      coverLoading
    />
  </>
)

export const SuspenseShirtBlackBg = () => <div style={{ width: "100%", height: "100%", background: "black" }}>sda</div>

export const WhiteShirt = () => (
  <>
    <OffscreenShirt color="#ffffff" />
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
      <OffscreenShirt disabled={disabled} />
    </>
  )
}

export const WobblyShirt = () => (
  <>
    <OffscreenShirt wobbleRange={0.2} wobbleSpeed={1} />
  </>
)

export const ScrollableShirt = () => (
  <>
    <OffscreenShirt color="#ffffff" />
    <div
      style={{
        height: 800,
        width: 200,
        background: "red",
      }}
    />
  </>
)
