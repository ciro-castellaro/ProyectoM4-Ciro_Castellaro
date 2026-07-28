import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import EmailSummary from "../../src/components/EmailSummary/EmailSummary";
import type { TaskSummary } from "../../src/types/email";

const summary: TaskSummary = {
  total: 3,
  pending: 2,
  completed: 1,
  pendingTitles: ["Comprar leche", "Lavar el auto"],
  completedTitles: ["Pagar el alquiler"],
};

describe("EmailSummary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("muestra la explicación con los contadores del resumen", () => {
    render(<EmailSummary summary={summary} onSend={vi.fn()} />);

    expect(screen.getByText(/3 en total/i)).toBeInTheDocument();
    expect(screen.getByText(/2 pendientes/i)).toBeInTheDocument();
    expect(screen.getByText(/1 completada/i)).toBeInTheDocument();
  });

  it("muestra 'Enviando...' mientras se procesa el envío", async () => {
    let resolveSend: (value: { ok: true; value: { message: string } }) => void;
    const onSend = vi.fn(
      () =>
        new Promise<{ ok: true; value: { message: string } }>((resolve) => {
          resolveSend = resolve;
        }),
    );

    render(<EmailSummary summary={summary} onSend={onSend} />);

    await userEvent.click(
      screen.getByRole("button", { name: /enviar resumen por email/i }),
    );

    expect(screen.getByRole("button", { name: /enviando/i })).toBeDisabled();

    resolveSend!({ ok: true, value: { message: "ok" } });
    expect(
      await screen.findByText(/te enviamos un resumen a tu email/i),
    ).toBeInTheDocument();
  });

  it("muestra un error comprensible si el envío falla", async () => {
    const onSend = vi.fn().mockResolvedValue({
      ok: false,
      error: "Tenés que iniciar sesión para enviar el resumen.",
    });

    render(<EmailSummary summary={summary} onSend={onSend} />);

    await userEvent.click(
      screen.getByRole("button", { name: /enviar resumen por email/i }),
    );

    expect(
      await screen.findByText(/tenés que iniciar sesión para enviar el resumen/i),
    ).toBeInTheDocument();
  });

  it("limpia el feedback anterior si cambian los contadores del resumen", async () => {
    const onSend = vi.fn().mockResolvedValue({
      ok: false,
      error: "No se pudo enviar el resumen.",
    });

    const { rerender } = render(
      <EmailSummary summary={summary} onSend={onSend} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: /enviar resumen por email/i }),
    );
    expect(
      await screen.findByText(/no se pudo enviar el resumen/i),
    ).toBeInTheDocument();

    // Se creó/editó/eliminó una tarea en otra sección: los contadores
    // cambiaron sin que se volviera a tocar el botón.
    rerender(
      <EmailSummary
        summary={{ ...summary, total: 4, pending: 3 }}
        onSend={onSend}
      />,
    );

    expect(
      screen.queryByText(/no se pudo enviar el resumen/i),
    ).not.toBeInTheDocument();
  });
});
