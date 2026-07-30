import type { TaskSortOption } from "../../types/task";
import "./TaskSort.css";

interface TaskSortProps {
  value: TaskSortOption;
  onChange: (sortBy: TaskSortOption) => void;
}

const SORT_OPTIONS: { value: TaskSortOption; label: string }[] = [
  { value: "default", label: "Más recientes" },
  { value: "priority", label: "Prioridad" },
  { value: "dueDate", label: "Fecha de vencimiento" },
];

function TaskSort({ value, onChange }: TaskSortProps) {
  return (
    <div className="task-sort">
      <label htmlFor="task-sort-select">Ordenar por</label>
      <select
        id="task-sort-select"
        value={value}
        onChange={(event) => onChange(event.target.value as TaskSortOption)}
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default TaskSort;
