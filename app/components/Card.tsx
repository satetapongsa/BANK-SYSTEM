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
    "bg-slate-900/60 border border-slate-800/80 rounded-2xl animate-fade-in-up transition-all duration-300 backdrop-blur-md",
    elevated ? "shadow-lg shadow-black/60 scale-[1.01]" : "shadow-md shadow-black/30",
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
