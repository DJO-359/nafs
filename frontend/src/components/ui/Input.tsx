import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full rounded-lg border border-[var(--app-border)] px-3 py-2 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 ${className}`}
    />
  );
}
