import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline";
  size?: "sm" | "md" | "lg" | "icon";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    className,
    children,
    disabled,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      {...props}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-[10px] transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "active:scale-[0.98]",
        {
          // primary
          "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-sm hover:shadow-md":
            variant === "primary",
          // secondary
          "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 focus:ring-primary-500 shadow-sm":
            variant === "secondary",
          // outline
          "bg-transparent text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500":
            variant === "outline",
          // danger
          "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm":
            variant === "danger",
          // ghost
          "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-primary-500":
            variant === "ghost",
          // sizes
          "h-8 px-3 text-xs gap-1.5": size === "sm",
          "h-9 px-4 text-sm gap-2": size === "md",
          "h-11 px-6 text-base gap-2": size === "lg",
          "h-9 w-9 p-0": size === "icon",
        },
        className
      )}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
});
