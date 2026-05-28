// app/components/Card.tsx
"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
  noPadding?: boolean;
  style?: React.CSSProperties;
}

export default function Card({
  children,
  className = "",
  elevated = false,
  noPadding = false,
  style,
}: CardProps) {
  const classes = [
    "bg-[#131B2E]/90 border border-slate-800/80 rounded-2xl animate-fade-in-up transition-all duration-300 backdrop-blur-md",
    elevated ? "shadow-sky-500/5 shadow-2xl scale-[1.01]" : "shadow-xl",
    noPadding ? "p-0" : "p-6",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
}
