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
