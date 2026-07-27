import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export default function Button({
  loading = false,
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const variantStyles =
    variant === "secondary"
      ? "bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50"
      : "bg-emerald-600 text-white hover:bg-emerald-700";

  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`w-full rounded-lg px-4 py-2 transition disabled:cursor-not-allowed disabled:opacity-50 ${variantStyles} ${className}`}
    >
      {loading ? "Загрузка..." : children}
    </button>
  );
}
