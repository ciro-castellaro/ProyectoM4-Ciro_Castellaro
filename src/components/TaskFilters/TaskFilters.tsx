import type { TaskFilter } from "../../types/task";
import "./TaskFilters.css";

interface TaskFiltersProps {
  value: TaskFilter;
  onChange: (filter: TaskFilter) => void;
}

const FILTERS: { value: TaskFilter; label: string }[] = [
  { value: "all", label: "Todas" },
  { value: "pending", label: "Pendientes" },
  { value: "completed", label: "Completadas" },
];

function TaskFilters({ value, onChange }: TaskFiltersProps) {
  return (
    <div className="task-filters" role="group" aria-label="Filtrar tareas">
      {FILTERS.map((filterOption) => (
        <button
          key={filterOption.value}
          type="button"
          className={value === filterOption.value ? "primary" : "secondary"}
          aria-pressed={value === filterOption.value}
          onClick={() => onChange(filterOption.value)}
        >
          {filterOption.label}
        </button>
      ))}
    </div>
  );
}

export default TaskFilters;
