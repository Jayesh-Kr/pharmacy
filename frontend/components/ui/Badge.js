"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Badge = ({
  className,
  variant = "blue",
  children,
  ...props
}) => {
  const variants = {
    blue: "bg-blue-50 text-blue-700 ring-blue-700/10",
    green: "bg-green-50 text-green-700 ring-green-600/20",
    red: "bg-red-50 text-red-700 ring-red-600/10",
    yellow: "bg-yellow-50 text-yellow-800 ring-yellow-600/20",
    purple: "bg-purple-50 text-purple-700 ring-purple-700/10",
    gray: "bg-gray-50 text-gray-600 ring-gray-500/10",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold ring-1 ring-inset",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
