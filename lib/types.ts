export interface Task {
  id: string;
  title: string;
  description?: string;
  columnId: string;
  priority?: "low" | "medium" | "high";
  createdAt: Date;
  dueDate?: string;
  completed?: boolean;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

export interface KanbanState {
  columns: Column[];
}

export type TaskFormValues = Omit<Task, 'id' | 'createdAt' | 'columnId'>;

export type DragEndEvent = {
  active: { id: string; data: { current: any } };
  over: { id: string } | null;
};

export interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
  addedToKanban: boolean;
  type?: "academic" | "work" | string;
}

export interface TodoFormValues {
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string;
}

export interface TodoState {
  todos: TodoItem[];
}