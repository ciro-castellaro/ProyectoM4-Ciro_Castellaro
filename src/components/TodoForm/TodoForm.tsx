import { useState, type SubmitEvent } from "react";
import {
  validateTaskTitle,
  validateTaskDescription,
  validateDueDate,
} from "../../features/tasks/validateTask";
import type { Result } from "../../types/result";
import type { TaskPriority } from "../../types/task";
import "./TodoForm.css";

interface TodoFormValues {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
}

interface TodoFormProps {
  onSubmit: (values: TodoFormValues) => Promise<Result<unknown>>;
  onCancel: () => void;
  initialValues?: TodoFormValues;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

function TodoForm({ onSubmit, onCancel, initialValues }: TodoFormProps) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(
    initialValues?.description ?? "",
  );
  const [priority, setPriority] = useState<TaskPriority>(
    initialValues?.priority ?? "medium",
  );
  const [dueDate, setDueDate] = useState(initialValues?.dueDate ?? "");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleResult = validateTaskTitle(title);
    const descriptionResult = validateTaskDescription(description);
    const dueDateResult = validateDueDate(dueDate);

    setErrors({
      title: titleResult.ok ? undefined : titleResult.error,
      description: descriptionResult.ok ? undefined : descriptionResult.error,
      dueDate: dueDateResult.ok ? undefined : dueDateResult.error,
    });
    setSubmitError(null);

    if (!titleResult.ok || !descriptionResult.ok || !dueDateResult.ok) {
      return;
    }

    setIsSubmitting(true);
    const result = await onSubmit({
      title: titleResult.value,
      description: descriptionResult.value,
      priority,
      dueDate: dueDateResult.value,
    });
    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
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

      <div className="todo-form-row">
        <div className="field">
          <label htmlFor="todo-priority">Prioridad</label>
          <select
            id="todo-priority"
            value={priority}
            onChange={(event) =>
              setPriority(event.target.value as TaskPriority)
            }
            disabled={isSubmitting}
          >
            <option value="low">Baja</option>
            <option value="medium">Media</option>
            <option value="high">Alta</option>
          </select>
        </div>

        <div className="field">
          <label htmlFor="todo-due-date">Fecha de vencimiento (opcional)</label>
          <input
            id="todo-due-date"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.dueDate)}
            aria-describedby={
              errors.dueDate ? "todo-due-date-error" : undefined
            }
          />
          {errors.dueDate && (
            <p id="todo-due-date-error" className="field-error" role="alert">
              ⚠ {errors.dueDate}
            </p>
          )}
        </div>
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
