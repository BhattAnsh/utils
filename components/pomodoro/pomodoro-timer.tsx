"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, RotateCcw, Settings, Volume2, VolumeX, Clock, BookOpen, Coffee, Brain } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerSettings {
  work: number;
  shortBreak: number;
  longBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  longBreakInterval: number;
  soundEnabled: boolean;
}

export function PomodoroTimer() {
  // Timer state
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [settings, setSettings] = useState<TimerSettings>({
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    autoStartBreaks: true,
    autoStartPomodoros: false,
    longBreakInterval: 4,
    soundEnabled: true,
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState("");

  // Sound references
  const workCompleteSound = useRef<HTMLAudioElement | null>(null);
  const breakCompleteSound = useRef<HTMLAudioElement | null>(null);

  // Initialize audio elements
  useEffect(() => {
    workCompleteSound.current = new Audio("/sounds/work-complete.mp3");
    breakCompleteSound.current = new Audio("/sounds/break-complete.mp3");
    
    return () => {
      workCompleteSound.current = null;
      breakCompleteSound.current = null;
    };
  }, []);

  // Reset timer when mode changes
  useEffect(() => {
    const duration = 
      mode === "work" 
        ? settings.work * 60 
        : mode === "shortBreak" 
          ? settings.shortBreak * 60 
          : settings.longBreak * 60;
    
    setTimeLeft(duration);
    setIsActive(false);
  }, [mode, settings]);

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      if (mode === "work") {
        // Work session completed
        const newCompletedCount = completedPomodoros + 1;
        setCompletedPomodoros(newCompletedCount);
        
        // Play sound if enabled
        if (settings.soundEnabled && workCompleteSound.current) {
          workCompleteSound.current.play().catch(e => console.error("Error playing sound:", e));
        }
        
        // Check if it's time for a long break
        const isLongBreakTime = newCompletedCount % settings.longBreakInterval === 0;
        const nextMode = isLongBreakTime ? "longBreak" : "shortBreak";
        
        setMode(nextMode);
        
        // Auto start break if enabled
        setIsActive(settings.autoStartBreaks);
      } else {
        // Break completed
        // Play sound if enabled
        if (settings.soundEnabled && breakCompleteSound.current) {
          breakCompleteSound.current.play().catch(e => console.error("Error playing sound:", e));
        }
        
        setMode("work");
        
        // Auto start next work session if enabled
        setIsActive(settings.autoStartPomodoros);
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, completedPomodoros, settings]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate progress percentage
  const calculateProgress = (): number => {
    const totalSeconds = 
      mode === "work" 
        ? settings.work * 60 
        : mode === "shortBreak" 
          ? settings.shortBreak * 60 
          : settings.longBreak * 60;
    
    const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Handle start/pause
  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  // Handle reset
  const resetTimer = () => {
    const duration = 
      mode === "work" 
        ? settings.work * 60 
        : mode === "shortBreak" 
          ? settings.shortBreak * 60 
          : settings.longBreak * 60;
    
    setTimeLeft(duration);
    setIsActive(false);
  };

  // Keyboard shortcuts
  useHotkeys('space', (e) => {
    e.preventDefault();
    toggleTimer();
  }, { enableOnFormTags: false });
  
  useHotkeys('r', (e) => {
    e.preventDefault();
    resetTimer();
  }, { enableOnFormTags: false });

  // Update settings
  const handleSettingChange = (key: keyof TimerSettings, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/40 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Focus Timer</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={mode === "work" ? "default" : "outline"} className="rounded-full px-3">
                {completedPomodoros} completed
              </Badge>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => settings.soundEnabled ? handleSettingChange('soundEnabled', false) : handleSettingChange('soundEnabled', true)}
              >
                {settings.soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Timer Settings</DialogTitle>
                    <DialogDescription>
                      Customize your Pomodoro timer to fit your workflow.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="workTime">Work Time (minutes)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="workTime"
                          min={1}
                          max={60}
                          step={1}
                          value={[settings.work]}
                          onValueChange={(value) => handleSettingChange('work', value[0])}
                          className="flex-1"
                        />
                        <span className="w-10 text-center">{settings.work}</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="shortBreakTime">Short Break (minutes)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="shortBreakTime"
                          min={1}
                          max={30}
                          step={1}
                          value={[settings.shortBreak]}
                          onValueChange={(value) => handleSettingChange('shortBreak', value[0])}
                          className="flex-1"
                        />
                        <span className="w-10 text-center">{settings.shortBreak}</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="longBreakTime">Long Break (minutes)</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="longBreakTime"
                          min={5}
                          max={45}
                          step={1}
                          value={[settings.longBreak]}
                          onValueChange={(value) => handleSettingChange('longBreak', value[0])}
                          className="flex-1"
                        />
                        <span className="w-10 text-center">{settings.longBreak}</span>
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="longBreakInterval">Long Break Interval</Label>
                      <div className="flex items-center gap-2">
                        <Slider
                          id="longBreakInterval"
                          min={1}
                          max={8}
                          step={1}
                          value={[settings.longBreakInterval]}
                          onValueChange={(value) => handleSettingChange('longBreakInterval', value[0])}
                          className="flex-1"
                        />
                        <span className="w-10 text-center">{settings.longBreakInterval}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoStartBreaks">Auto-start breaks</Label>
                      <Switch
                        id="autoStartBreaks"
                        checked={settings.autoStartBreaks}
                        onCheckedChange={(checked) => handleSettingChange('autoStartBreaks', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoStartPomodoros">Auto-start work sessions</Label>
                      <Switch
                        id="autoStartPomodoros"
                        checked={settings.autoStartPomodoros}
                        onCheckedChange={(checked) => handleSettingChange('autoStartPomodoros', checked)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={() => setSettingsOpen(false)}>Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs 
            defaultValue="work" 
            value={mode} 
            onValueChange={(value) => setMode(value as TimerMode)}
            className="mb-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="work" className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                <span>Work</span>
              </TabsTrigger>
              <TabsTrigger value="shortBreak" className="flex items-center gap-1">
                <Coffee className="h-4 w-4" />
                <span>Short Break</span>
              </TabsTrigger>
              <TabsTrigger value="longBreak" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Long Break</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative flex h-48 w-48 items-center justify-center rounded-full border-4 border-muted bg-card">
              <div className="absolute inset-0 rounded-full">
                <svg className="h-full w-full" viewBox="0 0 100 100">
                  <circle
                    className="stroke-muted-foreground/20"
                    cx="50"
                    cy="50"
                    r="46"
                    fill="transparent"
                    strokeWidth="8"
                  />
                  <circle
                    className={cn(
                      "stroke-primary transition-all duration-500",
                      mode === "work" ? "stroke-primary" : 
                      mode === "shortBreak" ? "stroke-green-500" : "stroke-blue-500"
                    )}
                    cx="50"
                    cy="50"
                    r="46"
                    fill="transparent"
                    strokeWidth="8"
                    strokeDasharray="289.02652413026095"
                    strokeDashoffset={289.02652413026095 * (1 - calculateProgress() / 100)}
                    transform="rotate(-90, 50, 50)"
                  />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold tabular-nums">{formatTime(timeLeft)}</div>
                <div className="text-sm text-muted-foreground">
                  {mode === "work" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={resetTimer}
                className="h-12 w-12 rounded-full"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                onClick={toggleTimer}
                className={cn(
                  "h-14 w-14 rounded-full",
                  mode === "work" ? "bg-primary hover:bg-primary/90" : 
                  mode === "shortBreak" ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
                )}
              >
                {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSettingsOpen(true)}
                className="h-12 w-12 rounded-full"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="mt-8">
            <Label htmlFor="currentTask">What are you working on?</Label>
            <div className="mt-2 flex gap-2">
              <Input
                id="currentTask"
                placeholder="Enter your current task..."
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
              />
              <Button variant="outline">
                <BookOpen className="mr-2 h-4 w-4" />
                Select Task
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 p-2 text-center text-xs text-muted-foreground">
          <div className="mx-auto flex items-center gap-2">
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">Space</kbd>
            <span>Start/Pause</span>
            <span className="mx-1">•</span>
            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">R</kbd>
            <span>Reset</span>
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Pomodoro Technique</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <p className="mb-4">
            The Pomodoro Technique is a time management method that uses a timer to break work into intervals, traditionally 25 minutes in length, separated by short breaks.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Choose a task you want to complete</li>
            <li>Set the timer for 25 minutes and focus solely on that task</li>
            <li>When the timer rings, take a 5-minute break</li>
            <li>After 4 pomodoros, take a longer break (15-30 minutes)</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
