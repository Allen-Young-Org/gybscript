import { ErrorMessage } from "@hookform/error-message";
import { useState } from "react";
import { UseFormRegister, FieldErrors, UseFormWatch } from "react-hook-form";

interface Option {
  value: string;
  label: string;
}

interface FloatingLabelSelectProps {
  name: string;
  label: string;
  register: UseFormRegister<any>;
  required?: boolean;
  errors: FieldErrors;
  watch: UseFormWatch<any>;
  options: Option[];
  className?: string;
  className2?: string;
}

const FloatingLabelSelect: React.FC<FloatingLabelSelectProps> = ({
  name,
  label,
  register,
  required,
  errors,
  watch,
  options,
  className = "",
  className2 = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const value = watch(name);

  return (
    <div className="relative">
      <select
        {...register(name, { required: required ? `${label} is required` : false })}
        className={`border border-black font-poppins rounded-xl px-8 dark:bg-gray-800 dark:text-white bg-white py-2 focus:outline-none w-full focus:border focus:border-accent ${errors?.[name] ? 'border-red-500' : 'border-black'} ${className}`}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      >
        <option value="" disabled hidden>
          {" "}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="font-poppins">
            {option.label}
          </option>
        ))}
      </select>
      <label
        htmlFor={name}
        className={`absolute left-4 font-poppins transition-all duration-200 pointer-events-none ${className2}
          ${(isFocused || value) ? '-top-3 text-sm dark:bg-gray-800 text-accent bg-white px-1' : 'top-2 text-gray-500'}`}
      >
        {label}
      </label>
      {errors?.[name] && (
        <ErrorMessage
          errors={errors}
          name={name}
          render={({ message }) => (
            <p className="text-red-500 text-sm mt-1 font-poppins">{message}</p>
          )}
        />
      )}
    </div>
  );
};

export default FloatingLabelSelect;