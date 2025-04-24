"use client";

import { create } from "zustand";
import { TodoState, TodoItem, TodoFormValues } from "@/lib/types";
import {
  initialTodoState,
  loadTodoData,
  saveTodoData,
  addTodo,
  updateTodo,
  deleteTodo,
  toggleTodoCompletion,
  markTodoAsAddedToKanban,
  findTodoById,
} from "@/lib/utils/todo-utils";

interface TodoStore extends TodoState {
  initializeStore: () => void;
  addTodo: (todo: TodoFormValues) => void;
  updateTodo: (todoId: string, updatedTodo: Partial<TodoFormValues>) => void;
  deleteTodo: (todoId: string) => void;
  toggleCompletion: (todoId: string) => void;
  getTodo: (todoId: string) => TodoItem | null;
  markAsAddedToKanban: (todoId: string) => void;
}

export const useTodoStore = create<TodoStore>((set, get) => ({
  ...initialTodoState,
  
  initializeStore: () => {
    const data = loadTodoData();
    set(data);
  },
  
  addTodo: (todo) => {
    set((state) => {
      const newState = addTodo(state, todo);
      saveTodoData(newState);
      return newState;
    });
  },
  
  updateTodo: (todoId, updatedTodo) => {
    set((state) => {
      const newState = updateTodo(state, todoId, updatedTodo);
      saveTodoData(newState);
      return newState;
    });
  },
  
  deleteTodo: (todoId) => {
    set((state) => {
      const newState = deleteTodo(state, todoId);
      saveTodoData(newState);
      return newState;
    });
  },
  
  toggleCompletion: (todoId) => {
    set((state) => {
      const newState = toggleTodoCompletion(state, todoId);
      saveTodoData(newState);
      return newState;
    });
  },
  
  getTodo: (todoId) => {
    return findTodoById(get(), todoId);
  },

  markAsAddedToKanban: (todoId) => {
    set((state) => {
      const newState = markTodoAsAddedToKanban(state, todoId);
      saveTodoData(newState);
      return newState;
    });
  },
}));