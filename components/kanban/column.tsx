"use client";

import { useState } from "react";
import { Column as ColumnType, Task } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TaskCard } from "./task-card";
import { TaskForm } from "./task-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ColumnProps {
  column: ColumnType;
}

export function Column({ column }: ColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const taskIds = column.tasks.map((task) => task.id);

  // Minimal column styling
  const getColumnColor = (columnId: string) => {
    return "bg-card";
  };

  const getColumnHeaderColor = (columnId: string) => {
    return "bg-muted/30";
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex min-h-[300px] w-[280px] flex-col rounded-md border transition-all duration-200",
        getColumnColor(column.id),
        isDragging ? "opacity-90 shadow-md" : ""
      )}
      {...attributes}
    >
      <CardHeader 
        className={cn(
          "flex flex-row items-center justify-between rounded-t-lg p-3 transition-colors duration-200",
          getColumnHeaderColor(column.id)
        )}
      >
        <div 
          className="flex cursor-grab items-center gap-2 transition-transform active:scale-95"
          {...listeners}
        >
          <CardTitle className="text-sm font-medium">
            {column.title}
          </CardTitle>
          <Badge 
            variant="secondary" 
            className={cn(
              "h-5 rounded-sm px-1.5 text-xs font-normal transition-all",
              column.tasks.length > 0 ? "opacity-100" : "opacity-50"
            )}
          >
            {column.tasks.length}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 shrink-0 transition-transform hover:scale-110 active:scale-95"
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add task</span>
        </Button>
      </CardHeader>
      <CardContent 
        className={cn(
          "flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-muted/20",
          column.tasks.length === 0 && "bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,hsl(var(--muted))_1px,transparent_11px)]"
        )}
      >
        {isAddingTask && (
          <TaskForm
            columnId={column.id}
            onCancel={() => setIsAddingTask(false)}
            onComplete={() => setIsAddingTask(false)}
          />
        )}
        {column.tasks.length === 0 ? (
          <div className="text-center text-muted-foreground">Drag tasks here or click + to add a task</div>
        ) : (
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                columnId={column.id}
              />
            ))}
          </SortableContext>
        )}
      </CardContent>
    </Card>
  );
}