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
    "bg-white border border-slate-200/60 rounded-2xl animate-fade-in-up transition-all duration-300",
    elevated ? "shadow-md shadow-slate-100/80 scale-[1.01]" : "shadow-sm shadow-slate-100/50",
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
