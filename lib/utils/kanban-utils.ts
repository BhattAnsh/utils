import { Column, KanbanState, Task } from "@/lib/types";

// Initial kanban data with default columns
export const initialKanbanState: KanbanState = {
  columns: [
    { id: "backlog", title: "Backlog", tasks: [] },
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ],
};

export const LOCAL_STORAGE_KEY = "kanban-board-data";

// Load kanban data from localStorage
export const loadKanbanData = (): KanbanState => {
  if (typeof window === "undefined") {
    return initialKanbanState;
  }

  try {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!savedData) return initialKanbanState;

    const parsedData = JSON.parse(savedData);
    
    // Convert ISO date strings back to Date objects
    const columns = parsedData.columns.map((column: Column) => ({
      ...column,
      tasks: column.tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
      })),
    }));

    return { columns };
  } catch (error) {
    console.error("Error loading kanban data from localStorage:", error);
    return initialKanbanState;
  }
};

// Save kanban data to localStorage
export const saveKanbanData = (data: KanbanState): void => {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving kanban data to localStorage:", error);
  }
};

// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Add a new task
export const addTask = (
  state: KanbanState,
  columnId: string,
  task: Omit<Task, "id" | "columnId" | "createdAt">
): KanbanState => {
  const newTask: Task = {
    id: generateId(),
    columnId,
    createdAt: new Date(),
    ...task,
  };

  const updatedColumns = state.columns.map((column) => {
    if (column.id === columnId) {
      return {
        ...column,
        tasks: [...column.tasks, newTask],
      };
    }
    return column;
  });

  return { ...state, columns: updatedColumns };
};

// Update an existing task
export const updateTask = (
  state: KanbanState,
  taskId: string,
  updatedTask: Partial<Omit<Task, "id" | "columnId" | "createdAt">>
): KanbanState => {
  const updatedColumns = state.columns.map((column) => {
    const taskIndex = column.tasks.findIndex((task) => task.id === taskId);
    if (taskIndex !== -1) {
      const updatedTasks = [...column.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        ...updatedTask,
      };
      return { ...column, tasks: updatedTasks };
    }
    return column;
  });

  return { ...state, columns: updatedColumns };
};

// Delete a task
export const deleteTask = (
  state: KanbanState,
  taskId: string
): KanbanState => {
  const updatedColumns = state.columns.map((column) => {
    return {
      ...column,
      tasks: column.tasks.filter((task) => task.id !== taskId),
    };
  });

  return { ...state, columns: updatedColumns };
};

// Move a task between columns
export const moveTask = (
  state: KanbanState,
  taskId: string,
  sourceColumnId: string,
  destinationColumnId: string
): KanbanState => {
  // Find the task to move
  const sourceColumn = state.columns.find((col) => col.id === sourceColumnId);
  if (!sourceColumn) return state;

  const taskToMove = sourceColumn.tasks.find((task) => task.id === taskId);
  if (!taskToMove) return state;

  // Remove task from source column and add to destination column
  const updatedColumns = state.columns.map((column) => {
    if (column.id === sourceColumnId) {
      return {
        ...column,
        tasks: column.tasks.filter((task) => task.id !== taskId),
      };
    }
    if (column.id === destinationColumnId) {
      return {
        ...column,
        tasks: [...column.tasks, { ...taskToMove, columnId: destinationColumnId }],
      };
    }
    return column;
  });

  return { ...state, columns: updatedColumns };
};

// Reorder columns
export const reorderColumns = (
  state: KanbanState,
  startIndex: number,
  endIndex: number
): KanbanState => {
  const result = Array.from(state.columns);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return { ...state, columns: result };
};

// Reorder tasks within the same column
export const reorderTasks = (
  state: KanbanState,
  columnId: string,
  startIndex: number,
  endIndex: number
): KanbanState => {
  const column = state.columns.find((col) => col.id === columnId);
  if (!column) return state;

  const newTasks = Array.from(column.tasks);
  const [removed] = newTasks.splice(startIndex, 1);
  newTasks.splice(endIndex, 0, removed);

  const updatedColumns = state.columns.map((col) => {
    if (col.id === columnId) {
      return { ...col, tasks: newTasks };
    }
    return col;
  });

  return { ...state, columns: updatedColumns };
};

// Find a task by ID
export const findTaskById = (state: KanbanState, taskId: string): Task | null => {
  for (const column of state.columns) {
    const task = column.tasks.find((task) => task.id === taskId);
    if (task) return task;
  }
  return null;
};

// Find the column containing a task
export const findColumnByTaskId = (state: KanbanState, taskId: string): Column | null => {
  for (const column of state.columns) {
    if (column.tasks.some((task) => task.id === taskId)) {
      return column;
    }
  }
  return null;
};