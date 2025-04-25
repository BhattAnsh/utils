"use client";

import { useEffect, useState } from "react";
import { 
  DndContext, 
  MouseSensor,
  TouchSensor,
  useSensor, 
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  closestCorners
} from "@dnd-kit/core";
import { 
  SortableContext, 
  arrayMove,
  horizontalListSortingStrategy
} from "@dnd-kit/sortable";
import { Column } from "./column";
import { TaskCard } from "./task-card";
import { useKanbanStore } from "@/hooks/use-kanban-store";
import { Task } from "@/lib/types";
import { toast } from "sonner";

export function KanbanBoard() {
  const { columns, initializeStore, moveTask, reorderColumns, reorderTasks } = useKanbanStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Setup sensors with activation constraints to prevent unintended drags
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // 5px of movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay for touch
        tolerance: 5, // 5px of movement allowed during delay
      },
    })
  );

  // Extract column IDs for SortableContext
  const columnIds = columns.map((column) => column.id);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === "task") {
      setActiveTask(activeData.task);
      setActiveColumnId(activeData.task.columnId);
    } else if (activeData?.type === "column") {
      setActiveColumnId(activeData.column.id);
    }

    // Add visual feedback for active drag item
    document.body.classList.add("dragging");
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveTask(null);
      setActiveColumnId(null);
      document.body.classList.remove("dragging");
      return;
    }

    // Handle column reordering
    if (active.data.current?.type === "column") {
      const activeColumnIndex = columns.findIndex(
        (col) => col.id === active.id
      );
      const overColumnIndex = columns.findIndex(
        (col) => col.id === over.id
      );

      if (activeColumnIndex !== overColumnIndex) {
        reorderColumns(activeColumnIndex, overColumnIndex);
        toast.success("Column reordered");
      }
    }

    setActiveTask(null);
    setActiveColumnId(null);
    document.body.classList.remove("dragging");
  };

  // Handle drag over for tasks
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;
    
    // Only handle task movements
    if (active.data.current?.type !== "task") return;

    const activeColumnId = active.data.current.task.columnId;
    const activeTask = active.data.current.task;

    // Find the destination column (could be over a task or directly over a column)
    const isOverTask = over.data.current?.type === "task";
    
    // Determine destination column
    let destinationColumnId: string;
    
    if (isOverTask && over.data.current) {
      destinationColumnId = over.data.current.task.columnId;
    } else {
      // Over a column directly
      destinationColumnId = over.id as string;
    }
    
    // If no change in column, do nothing
    if (activeColumnId === destinationColumnId) return;
    
    // Move task to new column
    moveTask(activeId as string, activeColumnId, destinationColumnId);
    toast.success("Task moved to new column");
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragOver={handleDragOver}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {columns.map((column) => (
            <div key={column.id} className="h-full w-72 flex-shrink-0">
              <Column column={column} />
            </div>
          ))}
        </SortableContext>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} columnId={activeColumnId || ""} />}
      </DragOverlay>
    </DndContext>
  );
}