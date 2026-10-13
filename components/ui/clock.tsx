"use client";

import { useEffect, useState } from "react";
import { SlidingNumber } from "@/components/ui/sliding-number";

type ClockTime = {
  hours: number;
  minutes: number;
  seconds: number;
};

function getCurrentTime(): ClockTime {
  const now = new Date();
  return {
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
}

export function Clock() {
  const [time, setTime] = useState<ClockTime>({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const updateTime = () => setTime(getCurrentTime());
    updateTime();
    const intervalId = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const accessibleTime = [time.hours, time.minutes, time.seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");

  return (
    <time
      aria-label={`Local time ${accessibleTime}`}
      className="flex items-center gap-0.5 font-mono"
    >
      <SlidingNumber value={time.hours} padStart />
      <span aria-hidden="true" className="text-black">:</span>
      <SlidingNumber value={time.minutes} padStart />
      <span aria-hidden="true" className="text-black">:</span>
      <SlidingNumber value={time.seconds} padStart />
    </time>
  );
}