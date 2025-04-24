import { TodoList } from "@/components/todo/todo-list";

export default function TodoPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">To-Do List</h1>
        <p className="text-muted-foreground">
          Keep track of your tasks with this simple to-do list.
        </p>
      </div>
      <TodoList />
    </div>
  );
}