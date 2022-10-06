import { fireEvent, render, screen } from "@testing-library/react"
import { Button } from "Button"

it("is actually a button", () => {
  const testMessage = "Test Message"
  render(<Button text={testMessage} />)

  expect(screen.queryByText(testMessage)).toBeInstanceOf(HTMLButtonElement)
})

it("calls onClick on clicks", () => {
  const onClick = jest.fn()
  render(<Button onClick={onClick} />)

  const buttonElement = screen.queryByRole("button")
  expect(buttonElement).toBeTruthy()
  if (!buttonElement) throw new Error()

  expect(onClick).toHaveBeenCalledTimes(0)
  fireEvent.click(buttonElement)
  expect(onClick).toHaveBeenCalledTimes(1)
})
