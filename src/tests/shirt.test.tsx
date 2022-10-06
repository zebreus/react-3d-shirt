import { render } from "@testing-library/react"
import { Shirt } from "Shirt"

it("does not crash without props", () => {
  render(<Shirt />)
  expect(true).toBeTruthy()
})
