import type { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-[var(--app-surface)] p-4 shadow ${className}`}
    >
      {children}
    </div>
  );
}
