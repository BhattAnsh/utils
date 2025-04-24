"use client";

import { useState, useEffect } from "react";
import { useTodoStore } from "@/hooks/use-todo-store";
import { TodoItem } from "./todo-item";
import { TodoForm } from "./todo-form";
import { Button } from "@/components/ui/button";
import { Plus, SlidersHorizontal } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export function TodoList() {
  const { todos, initializeStore } = useTodoStore();
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority">("newest");
  
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);
  
  // Filter and sort todos
  const filteredAndSortedTodos = [...todos]
    .filter((todo) => {
      if (filter === "all") return true;
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === "priority") {
        const priorityValues = { high: 3, medium: 2, low: 1, undefined: 0 };
        const aPriority = a.priority ? priorityValues[a.priority] : 0;
        const bPriority = b.priority ? priorityValues[b.priority] : 0;
        return bPriority - aPriority;
      }
      return 0;
    });

  // Count active and completed todos
  const activeTodos = todos.filter((todo) => !todo.completed).length;
  const completedTodos = todos.filter((todo) => todo.completed).length;

  return (
    <div className="w-full max-w-3xl">
      {/* Header with filters and counts */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "all" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className="h-8"
          >
            All
            <Badge variant="secondary" className="ml-1 text-xs">
              {todos.length}
            </Badge>
          </Button>
          <Button
            variant={filter === "active" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter("active")}
            className="h-8"
          >
            Active
            <Badge variant="secondary" className="ml-1 text-xs">
              {activeTodos}
            </Badge>
          </Button>
          <Button
            variant={filter === "completed" ? "secondary" : "outline"}
            size="sm"
            onClick={() => setFilter("completed")}
            className="h-8"
          >
            Completed
            <Badge variant="secondary" className="ml-1 text-xs">
              {completedTodos}
            </Badge>
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Sort dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={sortBy === "newest"}
                onCheckedChange={() => setSortBy("newest")}
              >
                Newest
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "oldest"}
                onCheckedChange={() => setSortBy("oldest")}
              >
                Oldest
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={sortBy === "priority"}
                onCheckedChange={() => setSortBy("priority")}
              >
                Priority
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            onClick={() => setIsAddingTodo(true)}
            disabled={isAddingTodo}
            size="sm"
            className="h-8"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Todo
          </Button>
        </div>
      </div>

      <Card className="p-4">
        {isAddingTodo && (
          <TodoForm
            onCancel={() => setIsAddingTodo(false)}
            onComplete={() => setIsAddingTodo(false)}
          />
        )}
        
        <div className="space-y-1">
          {filteredAndSortedTodos.length > 0 ? (
            filteredAndSortedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              {filter === "all" && "No todos yet. Add your first todo!"}
              {filter === "active" && "No active todos. All done!"}
              {filter === "completed" && "No completed todos yet."}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}