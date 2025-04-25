import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";

export default function PomodoroPage() {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-8 space-y-2">
        <h1 className="text-2xl font-medium tracking-tight">Pomodoro Timer</h1>
        <p className="text-muted-foreground">
          Boost your productivity with focused work sessions and scheduled breaks.
        </p>
      </div>
      <PomodoroTimer />
    </div>
  );
}