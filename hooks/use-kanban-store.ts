"use client";

import { create } from "zustand";
import { Column, KanbanState, Task, TaskFormValues } from "@/lib/types";
import { 
  initialKanbanState, 
  loadKanbanData, 
  saveKanbanData,
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  reorderColumns,
  reorderTasks,
  findTaskById
} from "@/lib/utils/kanban-utils";

interface KanbanStore extends KanbanState {
  initializeStore: () => void;
  addTask: (columnId: string, task: TaskFormValues) => void;
  updateTask: (taskId: string, updatedTask: Partial<TaskFormValues>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, sourceColumnId: string, destinationColumnId: string) => void;
  reorderColumns: (startIndex: number, endIndex: number) => void;
  reorderTasks: (columnId: string, startIndex: number, endIndex: number) => void;
  getTask: (taskId: string) => Task | null;
}

export const useKanbanStore = create<KanbanStore>((set, get) => ({
  ...initialKanbanState,
  
  initializeStore: () => {
    const data = loadKanbanData();
    set(data);
  },
  
  addTask: (columnId, task) => {
    set((state) => {
      const newState = addTask(state, columnId, task);
      saveKanbanData(newState);
      return newState;
    });
  },
  
  updateTask: (taskId, updatedTask) => {
    set((state) => {
      const newState = updateTask(state, taskId, updatedTask);
      saveKanbanData(newState);
      return newState;
    });
  },
  
  deleteTask: (taskId) => {
    set((state) => {
      const newState = deleteTask(state, taskId);
      saveKanbanData(newState);
      return newState;
    });
  },
  
  moveTask: (taskId, sourceColumnId, destinationColumnId) => {
    set((state) => {
      const newState = moveTask(state, taskId, sourceColumnId, destinationColumnId);
      saveKanbanData(newState);
      return newState;
    });
  },
  
  reorderColumns: (startIndex, endIndex) => {
    set((state) => {
      const newState = reorderColumns(state, startIndex, endIndex);
      saveKanbanData(newState);
      return newState;
    });
  },
  
  reorderTasks: (columnId, startIndex, endIndex) => {
    set((state) => {
      const newState = reorderTasks(state, columnId, startIndex, endIndex);
      saveKanbanData(newState);
      return newState;
    });
  },
  
  getTask: (taskId) => {
    return findTaskById(get(), taskId);
  },
}));