"use client";

import { useEffect, useRef, useState } from "react";

interface RipplePoint {
  id: number;
  x: number;
  y: number;
}

export function ClickRipple() {
  const [ripples, setRipples] = useState<RipplePoint[]>([]);
  const nextIdRef = useRef<number>(1);
  const timersRef = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const timers = timersRef.current;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || event.pointerType !== "mouse") {
        return;
      }

      const id = nextIdRef.current++;
      const x = event.clientX;
      const y = event.clientY;

      setRipples((prev) => [...prev.slice(-10), { id, x, y }]);

      const timeoutId = window.setTimeout(() => {
        setRipples((prev) => prev.filter((item) => item.id !== id));
        timers.delete(id);
      }, 380);

      timers.set(id, timeoutId);
    };

    window.addEventListener("pointerdown", handlePointerDown, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      for (const timeoutId of timers.values()) {
        window.clearTimeout(timeoutId);
      }
      timers.clear();
    };
  }, []);

  if (ripples.length === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          style={{ left: ripple.x, top: ripple.y }}
          className="animate-click-ripple absolute h-3.5 w-3.5 rounded-full border border-emerald-400/70 bg-emerald-400/20 shadow-[0_0_10px_rgba(16,185,129,0.4)] light:border-emerald-600/60 light:bg-emerald-500/15 light:shadow-none"
        />
      ))}
    </div>
  );
}
