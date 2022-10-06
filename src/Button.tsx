import { css } from "@emotion/react"

export type ButtonProps = {
  text?: string
  onClick?: () => void
}
export const Button = ({ text, onClick }: ButtonProps) => (
  <button
    css={css`
      position: relative;
      background-color: transparent;
      padding: 0.4rem 0.8rem;
      border: 2px solid #333;
      text-align: center;
      transition: all 0.35s;

      &:hover {
        color: white;
      }

      &:before {
        position: absolute;
        content: "";
        inset: 0;
        width: 0;
        background: #ff003b;
        transition: all 0.35s;
        z-index: -1;
      }

      &:hover:before {
        width: 100%;
      }
    `}
    onClick={onClick}
  >
    {text ?? ""}
  </button>
)
