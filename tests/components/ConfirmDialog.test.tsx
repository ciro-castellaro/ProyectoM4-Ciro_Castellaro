import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ConfirmDialog from "../../src/components/ConfirmDialog/ConfirmDialog";

function renderDialog(overrides: Partial<Parameters<typeof ConfirmDialog>[0]> = {}) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  render(
    <ConfirmDialog
      title="Eliminar tarea"
      description='¿Eliminar la tarea "Comprar leche"?'
      confirmLabel="Eliminar"
      isConfirming={false}
      error={null}
      onConfirm={onConfirm}
      onCancel={onCancel}
      {...overrides}
    />,
  );

  return { onConfirm, onCancel };
}

describe("ConfirmDialog", () => {
  it("muestra el título y la descripción", () => {
    renderDialog();

    expect(
      screen.getByRole("dialog", { name: /eliminar tarea/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('¿Eliminar la tarea "Comprar leche"?'),
    ).toBeInTheDocument();
  });

  it("enfoca el botón Cancelar al abrirse", () => {
    renderDialog();

    expect(screen.getByRole("button", { name: /cancelar/i })).toHaveFocus();
  });

  it("llama a onConfirm al hacer clic en el botón de acción destructiva", async () => {
    const { onConfirm } = renderDialog();

    await userEvent.click(screen.getByRole("button", { name: /^eliminar$/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("llama a onCancel al hacer clic en Cancelar", async () => {
    const { onCancel } = renderDialog();

    await userEvent.click(screen.getByRole("button", { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("llama a onCancel al presionar Escape", async () => {
    const { onCancel } = renderDialog();

    await userEvent.keyboard("{Escape}");

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("muestra el error cuando se le pasa uno", () => {
    renderDialog({ error: "No se pudo eliminar la tarea." });

    expect(
      screen.getByText(/no se pudo eliminar la tarea/i),
    ).toBeInTheDocument();
  });

  it("deshabilita los botones mientras isConfirming es true", () => {
    renderDialog({ isConfirming: true });

    expect(screen.getByRole("button", { name: /cancelar/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /eliminando/i }),
    ).toBeDisabled();
  });
});
