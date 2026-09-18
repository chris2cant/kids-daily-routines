"use client";

import { useEffect, useState } from "react";

export function useClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    function scheduleNextMinute() {
      const current = new Date();
      const delay = 60_050 - current.getSeconds() * 1_000 - current.getMilliseconds();
      timeout = setTimeout(() => {
        setNow(new Date());
        scheduleNextMinute();
      }, delay);
    }

    scheduleNextMinute();
    return () => clearTimeout(timeout);
  }, []);

  return now;
}
