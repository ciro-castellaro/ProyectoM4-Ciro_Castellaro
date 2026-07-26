import { useState, type SubmitEvent } from "react";
import {
  validateTaskTitle,
  validateTaskDescription,
} from "../../features/tasks/validateTask";
import type { Result } from "../../types/result";
import "./TodoForm.css";

interface TodoFormProps {
  onSubmit: (values: {
    title: string;
    description: string;
  }) => Promise<Result<unknown>>;
  onCancel: () => void;
  initialValues?: { title: string; description: string };
}

interface FormErrors {
  title?: string;
  description?: string;
}

function TodoForm({ onSubmit, onCancel, initialValues }: TodoFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleResult = validateTaskTitle(title);
    const descriptionResult = validateTaskDescription(description);

    setErrors({
      title: titleResult.ok ? undefined : titleResult.error,
      description: descriptionResult.ok ? undefined : descriptionResult.error,
    });
    setSubmitError(null);

    if (!titleResult.ok || !descriptionResult.ok) {
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      title: titleResult.value,
      description: descriptionResult.value,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setTitle("");
    setDescription("");
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="todo-title">Título</label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Ej: Comprar leche"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.title)}
          aria-describedby={errors.title ? "todo-title-error" : undefined}
        />
        {errors.title && (
          <p id="todo-title-error" className="field-error" role="alert">
            ⚠ {errors.title}
          </p>
        )}
      </div>

      <div className="field">
        <label htmlFor="todo-description">Descripción</label>
        <textarea
          id="todo-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Detalles opcionales de la tarea"
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.description)}
          aria-describedby={
            errors.description ? "todo-description-error" : undefined
          }
        />
        {errors.description && (
          <p id="todo-description-error" className="field-error" role="alert">
            ⚠ {errors.description}
          </p>
        )}
      </div>

      {submitError && (
        <p className="field-error" role="alert">
          ⚠ {submitError}
        </p>
      )}

      <div className="todo-form-actions">
        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting ? "Guardando..." : "Guardar tarea"}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default TodoForm;
