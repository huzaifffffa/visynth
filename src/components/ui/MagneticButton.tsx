"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  strength?: number;
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.25,
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (reducedMotion || !btnRef.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = btnRef.current.getBoundingClientRect();
      const middleX = clientX - (left + width / 2);
      const middleY = clientY - (top + height / 2);
      setPosition({ x: middleX * strength, y: middleY * strength });
    },
    [reducedMotion, strength]
  );

  const reset = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  return (
    <button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={reset}
      className={cn(
        "relative inline-flex items-center justify-center transition-transform duration-300 ease-out active:scale-[0.97] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ff2a2a] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        className
      )}
      style={{
        transform: reducedMotion ? "none" : `translate3d(${position.x}px, ${position.y}px, 0)`,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

