import { KanbanBoard } from "@/components/kanban/board";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
        <p className="text-muted-foreground">
          Manage your tasks with this minimalist Kanban board.
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}