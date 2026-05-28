// app/components/Card.tsx
"use client";
import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div className={`glass rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}
