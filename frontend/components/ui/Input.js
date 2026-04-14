"use client";

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Input = ({
  label,
  error,
  className,
  id,
  type = "text",
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        className={cn(
          "block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-black transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-black font-medium",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs font-bold text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
};

const Select = ({
  label,
  error,
  className,
  id,
  options = [],
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn(
          "block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-black transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 font-medium appearance-none cursor-pointer",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      >
        <option value="" disabled>Select an option</option>
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs font-bold text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
};

const TextArea = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-700">
          {label}
        </label>
      )}
      <textarea
        id={id}
        className={cn(
          "block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-black transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-400 placeholder:text-black font-medium min-h-25",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      ></textarea>
      {error && <p className="text-xs font-bold text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  );
};

export { Input, Select, TextArea };
