import { useState, type SubmitEvent } from "react";
import {
  validateTaskTitle,
  validateTaskDescription,
} from "../../features/tasks/validateTask";
import "./TodoForm.css";

interface TodoFormProps {
  onSubmit: (values: { title: string; description: string }) => void;
  onCancel: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
}

function TodoForm({ onSubmit, onCancel }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const titleResult = validateTaskTitle(title);
    const descriptionResult = validateTaskDescription(description);

    setErrors({
      title: titleResult.ok ? undefined : titleResult.error,
      description: descriptionResult.ok ? undefined : descriptionResult.error,
    });

    if (!titleResult.ok || !descriptionResult.ok) {
      return;
    }

    onSubmit({
      title: titleResult.value,
      description: descriptionResult.value,
    });
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

      <div className="todo-form-actions">
        <button type="submit" className="primary">
          Guardar tarea
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default TodoForm;
