import { TodoItem, TodoFormValues, TodoState, TaskFormValues } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

// Initial state for the todo list
export const initialTodoState: TodoState = {
    todos: [],
};

// Local storage functions for todos
const STORAGE_KEY = "todo_data";

export const loadTodoData = (): TodoState => {
    if (typeof window === "undefined") return initialTodoState;
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (!savedData) return initialTodoState;
    
    try {
        const parsedData = JSON.parse(savedData);
        return parsedData;
    } catch (error) {
        console.error("Error loading todo data:", error);
        return initialTodoState;
    }
};

export const saveTodoData = (state: TodoState): void => {
    if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
};

// Todo operations
export const addTodo = (state: TodoState, todo: TodoFormValues): TodoState => {
    const newTodo: TodoItem = {
        id: uuidv4(),
        title: todo.title,
        description: todo.description || "",
        completed: false,
        createdAt: new Date().toISOString(),
        priority: todo.priority,
        dueDate: todo.dueDate,
        addedToKanban: false,
    };
    
    return {
        ...state,
        todos: [...state.todos, newTodo],
    };
};

export const toggleTodoCompletion = (state: TodoState, todoId: string): TodoState => {
    return {
        ...state,
        todos: state.todos.map((todo) => 
            todo.id === todoId 
                ? { ...todo, completed: !todo.completed } 
                : todo
        ),
    };
};

export const updateTodo = (
    state: TodoState, 
    todoId: string, 
    updatedTodo: Partial<TodoFormValues>
): TodoState => {
    return {
        ...state,
        todos: state.todos.map((todo) =>
            todo.id === todoId ? { ...todo, ...updatedTodo } : todo
        ),
    };
};

export const deleteTodo = (state: TodoState, todoId: string): TodoState => {
    return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== todoId),
    };
};

export const markTodoAsAddedToKanban = (state: TodoState, todoId: string): TodoState => {
    return {
        ...state,
        todos: state.todos.map((todo) =>
            todo.id === todoId ? { ...todo, addedToKanban: true } : todo
        ),
    };
};

export const findTodoById = (state: TodoState, todoId: string): TodoItem | null => {
    const todo = state.todos.find((todo) => todo.id === todoId);
    return todo || null;
};

// Convert Todo to Kanban Task
export const convertTodoToKanbanTask = (todo: TodoItem): TaskFormValues => {
    return {
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
    };
};
