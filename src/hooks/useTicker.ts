// src/hooks/useTicker.ts
import { useState, useEffect } from 'react';

// Single shared interval across the entire application
let globalTick = 0;
const subscribers = new Set<(tick: number) => void>();
let intervalId: ReturnType<typeof setInterval> | null = null;

function startGlobalTicker() {
  if (intervalId === null && typeof window !== 'undefined') {
    intervalId = setInterval(() => {
      globalTick += 1;
      subscribers.forEach((callback) => callback(globalTick));
    }, 1000);
  }
}

function stopGlobalTicker() {
  if (subscribers.size === 0 && intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

/**
 * Shared ticker hook providing 1-second pulse for CountdownClocks and live freshness displays.
 * Exactly one setInterval is used for the entire application.
 */
export function useTicker(): number {
  const [, setTick] = useState(globalTick);

  useEffect(() => {
    const handleTick = (newTick: number) => {
      setTick(newTick);
    };

    subscribers.add(handleTick);
    startGlobalTicker();

    return () => {
      subscribers.delete(handleTick);
      stopGlobalTicker();
    };
  }, []);

  return globalTick;
}
