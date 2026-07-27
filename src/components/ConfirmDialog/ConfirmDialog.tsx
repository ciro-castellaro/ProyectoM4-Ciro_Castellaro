import { useEffect, useRef } from "react";
import "./ConfirmDialog.css";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  isConfirming: boolean;
  error: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  isConfirming,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="confirm-dialog-backdrop" onClick={onCancel}>
      <div
        className="confirm-dialog card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        <p>{description}</p>

        {error && (
          <p className="field-error" role="alert">
            ⚠ {error}
          </p>
        )}

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="primary"
            ref={cancelButtonRef}
            onClick={onCancel}
            disabled={isConfirming}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="danger"
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Eliminando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
