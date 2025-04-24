"use client";

import { useState } from "react";
import { TodoItem, TodoFormValues } from "@/lib/types";
import { useTodoStore } from "@/hooks/use-todo-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface TodoFormProps {
  todo?: TodoItem;
  onCancel: () => void;
  onComplete: () => void;
}

export function TodoForm({ todo, onCancel, onComplete }: TodoFormProps) {
  const { addTodo, updateTodo } = useTodoStore();
  const [title, setTitle] = useState(todo?.title || "");
  const [description, setDescription] = useState(todo?.description || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | undefined>(todo?.priority);
  const [dueDate, setDueDate] = useState<Date | undefined>(
    todo?.dueDate ? new Date(todo.dueDate) : undefined
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const todoData: TodoFormValues = {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      dueDate: dueDate?.toISOString(),
    };

    if (todo) {
      updateTodo(todo.id, todoData);
      toast.success("Todo updated");
    } else {
      addTodo(todoData);
      toast.success("Todo added");
    }

    onComplete();
  };

  return (
    <form onSubmit={handleSubmit} className="mb-2 space-y-3 rounded-md border bg-card p-3 shadow-sm">
      <Input
        placeholder="What needs to be done?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        autoFocus
      />
      
      <Textarea
        placeholder="Add a description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
      />
      
      <div className="flex flex-wrap gap-2">
        <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal",
                !dueDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? format(dueDate, "PPP") : <span>Due date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate}
              onSelect={setDueDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        
        <div className="ml-auto flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {todo ? "Update" : "Add"} Todo
          </Button>
        </div>
      </div>
    </form>
  );
}