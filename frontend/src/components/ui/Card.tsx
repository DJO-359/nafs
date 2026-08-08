import type { CSSProperties, ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export default function Card({ children, className = "", style }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-[var(--app-surface)] p-4 shadow ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}
