import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150 disabled:pointer-events-none disabled:opacity-45";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-white hover:bg-accent-strong",
  secondary:
    "border border-line-strong bg-raised text-ink hover:border-line-strong hover:bg-overlay",
  ghost: "text-ink-secondary hover:bg-raised hover:text-ink",
  danger:
    "border border-hard/40 bg-transparent text-hard hover:bg-hard/10",
};

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${base} ${variants[variant]} ${className ?? ""}`}
      {...props}
    />
  );
}
