"use client";

import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";

export default function TodoPage() {
  const [TodoList, setTodoList] = useState<React.ComponentType<any> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Dynamically import the TodoList component
    import('@/components/todo/todo-list')
      .then((module) => {
        setTodoList(() => module.TodoList);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error loading TodoList component:', error);
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">To-Do List</h1>
        <p className="text-muted-foreground">
          Keep track of your tasks with this simple to-do list.
        </p>
      </div>
      
      {isLoading ? (
        <Card className="p-6 text-center">
          <p>Loading your tasks...</p>
        </Card>
      ) : TodoList ? (
        <TodoList />
      ) : (
        <Card className="p-6 text-center">
          <p>Could not load the Todo list. Please try refreshing the page.</p>
        </Card>
      )}
    </div>
  );
}