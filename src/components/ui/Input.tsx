"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-10 w-full rounded-md border border-border bg-night/40 px-3 text-sm text-foreground outline-none placeholder:text-mist/60 focus:border-accent",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-md border border-border bg-night/40 px-3 py-2 text-sm text-foreground outline-none placeholder:text-mist/60 focus:border-accent min-h-28",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("mb-1.5 block text-xs font-medium uppercase tracking-wider text-mist", className)}>
      {children}
    </label>
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-md border border-border bg-night/40 px-3 text-sm text-foreground outline-none focus:border-accent",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}
