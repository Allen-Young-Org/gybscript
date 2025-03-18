import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown } from "lucide-react";

interface ComboboxOption {
  value: string;
  label: string;
}

interface FloatingLabelComboboxProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options?: ComboboxOption[];
  error?: string;
  disabled?: boolean;
}

export const FloatingLabelCombobox: React.FC<FloatingLabelComboboxProps> = ({
  label,
  value,
  onChange,
  options = [],
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Find selected option
  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle option selection
  const handleSelect = (option: ComboboxOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main display field */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
              setTimeout(() => inputRef.current?.focus(), 0);
            }
          }
        }}
        className={cn(
          "min-h-[40px] w-full font-poppins rounded-md border px-3 py-2 text-left",
          "relative cursor-pointer bg-white dark:bg-gray-800 dark:text-gray-200",
          error ? "border-red-500" : "border-black dark:border-gray-600",
          isOpen ? "border-[#C09239] font-poppins" : ""
        )}
      >
        <div className="flex items-center font-poppins justify-between">
          <span
            className={cn(
              "block truncate font-poppins",
              !selectedOption && "text-gray-500 dark:text-gray-400"
            )}
          >
            {selectedOption ? selectedOption.label : ""}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 opacity-50 transition-transform duration-200",
              isOpen ? "transform rotate-180" : ""
            )}
          />
        </div>

        <label
          className={cn(
            "absolute left-3 font-poppins transition-all duration-200 pointer-events-none bg-white dark:bg-gray-800 px-1",
            selectedOption || isOpen ? "-top-2.5 text-xs" : "top-2 text-sm",
            error ? "text-red-500" : "text-gray-500 dark:text-gray-400"
          )}
        >
          {label}
        </label>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400 dark:text-gray-500" />
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setSearchTerm(e.target.value)
                }
                placeholder={`Search ${label.toLowerCase()}...`}
                className="w-full rounded-md border font-poppins border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 dark:text-gray-200 py-2 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#C09239] focus:border-transparent"
              />
            </div>
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                No {label.toLowerCase()} found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={cn(
                    "px-2 py-2 text-sm cursor-pointer font-poppins",
                    option.value === value
                      ? "bg-[#C09239] text-white"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200"
                  )}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <span className="text-xs text-red-500 mt-1 block">{error}</span>
      )}
    </div>
  );
};
