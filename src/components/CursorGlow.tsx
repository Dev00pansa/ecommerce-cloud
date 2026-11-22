"use client";

import { useEffect, useRef } from "react";

/**
 * เอฟเฟกต์แสงสีเขียวมรกตติดตามตำแหน่งเมาส์ (Cursor Emerald Spotlight)
 * - ทำงานเฉพาะอุปกรณ์ที่มีเมาส์ละเอียด (pointer: fine) เพื่อไม่รบกวนหน้าจอมือถือ
 * - อัปเดตตำแหน่งผ่าน DOM CSS Variables ภายใน requestAnimationFrame โดยไม่ใช้ useState
 *   จึงไม่เกิด React Re-render และไม่กระตุกขณะขยับเมาส์
 */
export function CursorGlow() {
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el || typeof window === "undefined") return;

    const finePointerQuery = window.matchMedia("(pointer: fine)");
    if (!finePointerQuery.matches) return;

    let rafId: number | null = null;
    let latestX = -999;
    let latestY = -999;
    let isVisible = false;

    const commitPosition = () => {
      rafId = null;
      el.style.setProperty("--mouse-x", `${latestX}px`);
      el.style.setProperty("--mouse-y", `${latestY}px`);
      if (!isVisible) {
        isVisible = true;
        el.style.opacity = "1";
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      latestX = event.clientX;
      latestY = event.clientY;
      if (rafId === null) {
        rafId = window.requestAnimationFrame(commitPosition);
      }
    };

    const handleMouseLeave = () => {
      isVisible = false;
      el.style.opacity = "0";
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{
        opacity: 0,
        background:
          "radial-gradient(400px circle at var(--mouse-x, -999px) var(--mouse-y, -999px), rgba(16, 185, 129, 0.14), transparent 72%)",
      }}
    />
  );
}
