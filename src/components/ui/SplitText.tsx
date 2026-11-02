"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface SplitTextProps {
  children: string;
  className?: string;
  lineClassName?: string;
}

export function SplitText({
  children,
  className = "",
  lineClassName = "",
}: SplitTextProps) {
  const lines = children.split("\n");

  return (
    <span className={cn("inline-block", className)}>
      {lines.map((line, idx) => (
        <span key={idx} className="block overflow-hidden leading-[inherit]">
          <span
            data-anim="split-line"
            className={cn(
              "block transform-gpu will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]",
              lineClassName
            )}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}

