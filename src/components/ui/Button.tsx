"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "gold";

const styles: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-pitch shadow-[0_0_0_1px_rgba(20,168,92,0.3)]",
  secondary:
    "bg-surface text-foreground border border-border hover:border-accent/50",
  ghost: "bg-transparent text-mist hover:text-foreground hover:bg-white/5",
  danger: "bg-danger/90 text-white hover:bg-danger",
  gold: "bg-gold text-night hover:brightness-110",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    };
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none",
          styles[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
