import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "../src/App";

describe("App", () => {
  it("muestra el encabezado MateCode", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", { name: /matecode/i }),
    ).toBeInTheDocument();
  });

  it("muestra el botón de acción principal", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: /acción principal/i }),
    ).toBeInTheDocument();
  });
});
