export type TaskPriority = "low" | "medium" | "high"

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  completed: boolean
  priority: TaskPriority
  // Fecha de vencimiento como "YYYY-MM-DD", o null si no tiene. Se guarda
  // como string plano (no Date/Timestamp) para evitar corrimientos de un
  // día por zona horaria al mostrarla o compararla.
  dueDate: string | null
  // Posición manual para el orden por arrastre (más alto = aparece primero).
  // Nuevo, en milisegundos de cuándo se creó o se reordenó por última vez.
  order: number
  createdAt: string
  updatedAt: string
}

export type TaskFilter = "all" | "pending" | "completed"

export type TaskSortOption = "default" | "priority" | "dueDate"
