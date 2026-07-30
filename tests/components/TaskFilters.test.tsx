import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskFilters from "../../src/components/TaskFilters/TaskFilters";

describe("TaskFilters", () => {
  it("muestra los tres filtros", () => {
    render(<TaskFilters value="all" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Todas" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Pendientes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Completadas" }),
    ).toBeInTheDocument();
  });

  it("marca como presionado (aria-pressed) el filtro activo", () => {
    render(<TaskFilters value="pending" onChange={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Pendientes" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Todas" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(
      screen.getByRole("button", { name: "Completadas" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("llama a onChange con el filtro elegido al hacer clic", async () => {
    const handleChange = vi.fn();
    render(<TaskFilters value="all" onChange={handleChange} />);

    await userEvent.click(screen.getByRole("button", { name: "Completadas" }));

    expect(handleChange).toHaveBeenCalledWith("completed");
  });
});
