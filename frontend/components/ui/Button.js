"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Button = ({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  icon: Icon,
  children,
  ...props
}) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-200",
    outline: "bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-50",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-none",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm shadow-green-200",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={loading}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
      ) : Icon ? (
        <Icon size={18} strokeWidth={2.5} />
      ) : null}
      {children}
    </button>
  );
};

export default Button;
