// src/components/ui/FloatingLabelInput.tsx
"use client";

import { forwardRef, InputHTMLAttributes, ForwardedRef } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";

// Interface extending standard HTML input attributes
interface FloatingLabelInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  flexContainer?: boolean;
}

const FloatingLabelInput = forwardRef<HTMLInputElement, FloatingLabelInputProps>(
  (
    { className, label, value, onChange, error, flexContainer, ...props },
    ref,
  ) => {
    
    const location = useLocation();
    const path = location.pathname;

    const isAuthPage = path.includes("user_sign_up") || path.includes("user_sign_in");
    
    const accentColor = isAuthPage ? "#C09239" : "var(--accent-color, #C09239)";

    return (
      <div className={`relative ${!!flexContainer ? "w-full" : ""}`}>
        <div className={`relative ${!!flexContainer ? "w-full" : ""}`}>
          <input
            {...props}
            ref={ref}
            value={value}
            onChange={onChange}
            placeholder=" "
            className={cn(
              "block px-2.5 pb-1.5 pt-1.5 font-poppins w-full text-black bg-transparent rounded-md border appearance-none focus:outline-none focus:ring-0 peer",
              // Apply different styling for error states
              error
                ? "border-red-500 focus:border-red-500"
                : `border-black focus:border-accent`,
              // Don't apply dark mode on auth pages
              !isAuthPage && "dark:text-white dark:bg-gray-800",
              className,
            )}
          />
          <label
            className={cn(
              "absolute font-poppins text-md transition-all duration-300 transform -translate-y-4 scale-75 top-1 z-10 origin-[0] bg-white mx-2 peer-focus:mx-2",
              // Don't apply dark mode on auth pages
              !isAuthPage && "dark:bg-gray-800 dark:text-white",
              "peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2",
              "peer-focus:top-1 peer-focus:scale-75 peer-focus:-translate-y-4 left-1",
              "pointer-events-none",
              value ? "scale-75 -translate-y-4" : "",
              error
                ? "text-red-500 peer-focus:text-red-500"
                : `text-gray-500 peer-focus:text-accent`,
            )}
          >
            {label}
          </label>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500 font-poppins">{error}</p>
        )}
      </div>
    );
  },
);

FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingLabelInput };