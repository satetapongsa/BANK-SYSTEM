// app/components/Button.tsx
"use client";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

export default function Button({ children, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`btn ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
