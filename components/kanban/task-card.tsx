"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskForm } from "./task-form";
import { cn } from "@/lib/utils";
import { useKanbanStore } from "@/hooks/use-kanban-store";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";

interface TaskCardProps {
  task: Task;
  columnId: string;
}

export function TaskCard({ task, columnId }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTask = useKanbanStore((state) => state.deleteTask);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setIsDeleting(false);
  };

  // Get task status color based on column
  const getTaskColor = (columnId: string) => {
    switch (columnId) {
      case "backlog":
        return "hover:border-muted focus-within:border-muted";
      case "todo":
        return "hover:border-blue-200 focus-within:border-blue-300 dark:hover:border-blue-800 dark:focus-within:border-blue-700";
      case "in-progress":
        return "hover:border-amber-200 focus-within:border-amber-300 dark:hover:border-amber-800 dark:focus-within:border-amber-700";
      case "done":
        return "hover:border-green-200 focus-within:border-green-300 dark:hover:border-green-800 dark:focus-within:border-green-700";
      default:
        return "hover:border-muted focus-within:border-muted";
    }
  };

  if (isEditing) {
    return (
      <TaskForm
        task={task}
        onCancel={() => setIsEditing(false)}
        onComplete={() => setIsEditing(false)}
      />
    );
  }

  return (
    <>
      <Card 
        ref={setNodeRef}
        style={style}
        className={cn(
          "mb-3 cursor-grab border transition-all duration-200",
          getTaskColor(columnId),
          isDragging 
            ? "rotate-[2deg] scale-105 opacity-90 shadow-lg" 
            : "hover:-translate-y-0.5 hover:shadow-md active:scale-95",
          !task.description && "pb-0"
        )}
        {...attributes}
        {...listeners}
      >
        <CardHeader className="p-3 pb-0">
          <h3 className="text-sm font-medium leading-tight">{task.title}</h3>
        </CardHeader>
        {task.description && (
          <CardContent className="p-3 pt-2">
            <p className="text-xs text-muted-foreground">{task.description}</p>
          </CardContent>
        )}
        <CardFooter className="flex items-center justify-between p-3 pt-0">
          <div className="text-[10px] text-muted-foreground">
            {format(task.createdAt, 'MMM d')}
          </div>
          <div className="flex space-x-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 transition-transform hover:scale-110 active:scale-95"
              onClick={() => setIsEditing(true)}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 text-destructive transition-transform hover:scale-110 hover:text-destructive active:scale-95"
              onClick={() => setIsDeleting(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}