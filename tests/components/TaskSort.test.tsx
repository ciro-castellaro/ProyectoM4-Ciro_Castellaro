import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskSort from "../../src/components/TaskSort/TaskSort";

describe("TaskSort", () => {
  it("muestra las tres opciones de orden", () => {
    render(<TaskSort value="default" onChange={vi.fn()} />);

    const select = screen.getByLabelText(/ordenar por/i);
    expect(select).toHaveValue("default");
    expect(screen.getByRole("option", { name: "Más recientes" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Prioridad" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Fecha de vencimiento" }),
    ).toBeInTheDocument();
  });

  it("llama a onChange con la opción elegida", async () => {
    const handleChange = vi.fn();
    render(<TaskSort value="default" onChange={handleChange} />);

    await userEvent.selectOptions(screen.getByLabelText(/ordenar por/i), "priority");

    expect(handleChange).toHaveBeenCalledWith("priority");
  });
});
