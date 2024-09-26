"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TimerIcon } from "lucide-react";

export function StopwatchComponent() {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  const formatTime = useCallback((timeInSeconds: number) => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = timeInSeconds % 60;

    return [hours, minutes, seconds]
      .map((v) => (v < 10 ? "0" + v : v))
      .filter((v, i) => v !== "00" || i > 0)
      .join(":");
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  const handleStartStop = useCallback(() => {
    setIsRunning((prevIsRunning) => !prevIsRunning);
  }, []);

  const handleReset = useCallback(() => {
    setIsRunning(false);
    setTime(0);
  }, []);

  return (
    <div className="text-3xl font-bold tabular-nums flex flex-row justify-center items-center" aria-live="polite">
      <TimerIcon />
      {formatTime(time)}
    </div>
  );
}
