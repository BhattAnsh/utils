"use client";

import { useState, useEffect } from "react";
import { TodoItem as TodoItemType } from "@/lib/types";
import { useTodoStore } from "@/hooks/use-todo-store";
import { useKanbanStore } from "@/hooks/use-kanban-store";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Trello } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { TodoForm } from "./todo-form";
import { convertTodoToKanbanTask } from "@/lib/utils/todo-utils";
import { toast } from "sonner";
import * as AlertDialog from "@/components/ui/alert-dialog";

interface TodoItemProps {
  todo: TodoItemType;
}

export function TodoItem({ todo }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showKanbanDialog, setShowKanbanDialog] = useState(false);
  const todoStore = useTodoStore();
  const kanbanStore = useKanbanStore();
  
  // Monitor completion status for auto-move to Kanban "done" column
  const [prevCompleted, setPrevCompleted] = useState(todo.completed);
  
  useEffect(() => {
    // If the todo was just marked as completed and it's in the Kanban board
    if (!prevCompleted && todo.completed && todo.addedToKanban) {
      // Move to "done" in Kanban
      const task = convertTodoToKanbanTask(todo);
      kanbanStore.addTask("done", task);
      toast.success("Task moved to Done column in Kanban board");
    }
    
    setPrevCompleted(todo.completed);
  }, [todo.completed, prevCompleted, todo, kanbanStore, todo.addedToKanban]);

  const getPriorityColor = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400";
      case "low":
        return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  // Enhanced priority badges with icons
  const getPriorityIcon = (priority: string | undefined) => {
    switch (priority) {
      case "high":
        return "🔥";
      case "medium":
        return "⚡";
      case "low":
        return "✅";
      default:
        return "";
    }
  };

  const handleAddToKanban = () => {
    setShowKanbanDialog(false);
    
    // Convert todo to kanban task and add to appropriate column
    const task = convertTodoToKanbanTask(todo);
    const targetColumn = todo.completed ? "done" : "todo";
    
    kanbanStore.addTask(targetColumn, task);
    todoStore.markAsAddedToKanban(todo.id);
    
    toast.success(
      todo.completed
        ? "Task added to Done column in Kanban board"
        : "Task added to Todo column in Kanban board"
    );
  };

  if (isEditing) {
    return (
      <TodoForm
        todo={todo}
        onCancel={() => setIsEditing(false)}
        onComplete={() => setIsEditing(false)}
      />
    );
  }

  return (
    <>
      <div 
        className={cn(
          "mb-2 flex items-center justify-between rounded-md border bg-card p-3 shadow-sm transition-all",
          todo.completed && "bg-muted/40 opacity-75"
        )}
      >
        <div className="flex w-full items-center gap-3">
          <Checkbox
            checked={todo.completed}
            onCheckedChange={() => todoStore.toggleCompletion(todo.id)}
            className="h-5 w-5"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={cn("font-medium", todo.completed && "line-through text-muted-foreground")}>
                {todo.title}
              </p>
              {todo.priority && (
                <Badge variant="secondary" className={cn("text-xs", getPriorityColor(todo.priority))}>
                  {getPriorityIcon(todo.priority)} {todo.priority}
                </Badge>
              )}
              {todo.addedToKanban && (
                <Badge variant="outline" className="text-xs">
                  In Kanban
                </Badge>
              )}
            </div>
            {todo.description && (
              <p className={cn("mt-1 text-sm text-muted-foreground", todo.completed && "line-through")}>
                {todo.description}
              </p>
            )}
            {todo.dueDate && (
              <p className={cn("mt-1 text-xs text-muted-foreground", todo.completed && "line-through")}>
                Due: {format(new Date(todo.dueDate), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-1">
          {!todo.addedToKanban && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary"
              onClick={() => setShowKanbanDialog(true)}
            >
              <Trello className="h-4 w-4" />
              <span className="sr-only">Add to Kanban</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => todoStore.deleteTodo(todo.id)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        </div>
      </div>

      <AlertDialog.AlertDialog open={showKanbanDialog} onOpenChange={setShowKanbanDialog}>
        <AlertDialog.AlertDialogContent>
          <AlertDialog.AlertDialogHeader>
            <AlertDialog.AlertDialogTitle>Add to Kanban Board</AlertDialog.AlertDialogTitle>
            <AlertDialog.AlertDialogDescription>
              Do you want to add this task to the Kanban board? 
              {todo.completed 
                ? " It will be added to the Done column." 
                : " It will be added to the Todo column."}
            </AlertDialog.AlertDialogDescription>
          </AlertDialog.AlertDialogHeader>
          <AlertDialog.AlertDialogFooter>
            <AlertDialog.AlertDialogCancel>Cancel</AlertDialog.AlertDialogCancel>
            <AlertDialog.AlertDialogAction onClick={handleAddToKanban}>
              Add to Kanban
            </AlertDialog.AlertDialogAction>
          </AlertDialog.AlertDialogFooter>
        </AlertDialog.AlertDialogContent>
      </AlertDialog.AlertDialog>
    </>
  );
}