"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Search, BookOpen, Briefcase, Keyboard } from "lucide-react";
import { format } from "date-fns";
import { useHotkeys } from "react-hotkeys-hook";

export function TodoList() {
  const { todos, initializeStore } = useTodoStore();
  const [isAddingTodo, setIsAddingTodo] = useState(false);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "priority" | "dueDate">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [focusMode, setFocusMode] = useState(false);
  const [todoType, setTodoType] = useState<"all" | "academic" | "work">("all");
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);
  
  // Keyboard shortcuts
  useHotkeys('alt+n', () => setIsAddingTodo(true), { enableOnFormTags: false });
  useHotkeys('alt+f', () => searchInputRef.current?.focus(), { enableOnFormTags: false });
  useHotkeys('alt+z', () => setFocusMode(prev => !prev), { enableOnFormTags: false });
  useHotkeys('alt+1', () => setFilter("all"), { enableOnFormTags: false });
  useHotkeys('alt+2', () => setFilter("active"), { enableOnFormTags: false });
  useHotkeys('alt+3', () => setFilter("completed"), { enableOnFormTags: false });

  // Calculate completion stats
  const completedCount = todos.filter(todo => todo.completed).length;
  const totalCount = todos.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Get today's tasks
  const todayTasks = todos.filter(todo => {
    if (!todo.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(todo.dueDate);
    return (
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear()
    );
  });

  // Filter and sort todos
  const filteredAndSortedTodos = [...todos]
    .filter((todo) => {
      // Filter by status
      const statusMatch = 
        filter === "all" ? true : 
        filter === "active" ? !todo.completed : 
        todo.completed;
      
      // Filter by type
      const typeMatch = 
        todoType === "all" ? true :
        todoType === "academic" ? todo.type === "academic" :
        todoType === "work" ? todo.type === "work" : true;
      
      // Filter by search query
      const searchMatch = searchQuery === "" ? true : 
        todo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (todo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      
      return statusMatch && typeMatch && searchMatch;
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
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return 0;
    });

  // Count active and completed todos
  const activeTodos = todos.filter((todo) => !todo.completed).length;
  const completedTodos = todos.filter((todo) => todo.completed).length;

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  return (
    <div className={`space-y-4 transition-all duration-300 ${focusMode ? 'max-w-2xl mx-auto' : ''}`}>
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <Progress value={completionPercentage} className="w-40 h-2" />
            <span className="text-xs text-muted-foreground">{completionPercentage}% complete</span>
          </div>
          {todayTasks.length > 0 && (
            <div className="flex items-center text-sm">
              <Calendar className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <span>{todayTasks.length} task{todayTasks.length !== 1 ? 's' : ''} due today</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={toggleFocusMode}
          >
            {focusMode ? "Exit Focus" : "Focus Mode"}
          </Button>
          <Button
            size="sm"
            className="h-8"
            onClick={() => setIsAddingTodo(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Task
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search tasks..."
          className="w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="all" onValueChange={(v) => setFilter(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all" className="text-xs">
              All
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {todos.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Active
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {todos.filter(t => !t.completed).length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-xs">
              Completed
              <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs">
                {todos.filter(t => t.completed).length}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Sort</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={sortBy === "newest"}
                  onCheckedChange={() => setSortBy("newest")}
                >
                  Newest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "oldest"}
                  onCheckedChange={() => setSortBy("oldest")}
                >
                  Oldest First
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "priority"}
                  onCheckedChange={() => setSortBy("priority")}
                >
                  Priority
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={sortBy === "dueDate"}
                  onCheckedChange={() => setSortBy("dueDate")}
                >
                  Due Date
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1">
                  {todoType === "academic" ? (
                    <BookOpen className="h-3.5 w-3.5" />
                  ) : todoType === "work" ? (
                    <Briefcase className="h-3.5 w-3.5" />
                  ) : (
                    <span>Type</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem
                  checked={todoType === "all"}
                  onCheckedChange={() => setTodoType("all")}
                >
                  All Types
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={todoType === "academic"}
                  onCheckedChange={() => setTodoType("academic")}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Academic
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={todoType === "work"}
                  onCheckedChange={() => setTodoType("work")}
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Work
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Tabs>

      <Card className="overflow-hidden">
        <div className="divide-y">
          {filteredAndSortedTodos.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery ? "No matching tasks found." : "No tasks yet. Add one to get started!"}
            </div>
          ) : (
            filteredAndSortedTodos.map((todo) => (
              <TodoItem key={todo.id} todo={todo} />
            ))
          )}
        </div>
      </Card>

      {isAddingTodo && (
        <TodoForm
          onCancel={() => setIsAddingTodo(false)}
          onComplete={() => setIsAddingTodo(false)}
        />
      )}

      {!focusMode && (
        <div className="mt-6 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
          <div className="flex items-center space-x-2 text-sm font-medium">
            <Keyboard className="h-4 w-4" />
            <h3>Keyboard Shortcuts</h3>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
              <span>Add new task</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Alt+N</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
              <span>Search</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Alt+F</kbd>
            </div>
            <div className="flex items-center justify-between rounded-md border px-3 py-2 text-xs">
              <span>Toggle focus mode</span>
              <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Alt+Z</kbd>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}