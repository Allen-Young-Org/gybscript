import { useUpdateEffect } from "@/constants/hooks/useUpdateEffect";
import React, { useCallback, useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";

interface OtpProps {
  elCount: number;
  loading: boolean;
  error?: string | null;
  onFinish?: (otp: string) => void;
  onChange?: (otp: string) => void;
}

const Otp: React.FC<OtpProps> = ({ elCount, loading, error = null, onFinish, onChange }) => {
  // Use a ref to hold an array of input element references.
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  
  // State for the currently pressed key.
  const [keyPress, setKeyPress] = useState<string | null>(null);
  
  // State to hold OTP digits. Keys are indices and values are strings.
  const [otp, setOtp] = useState<Record<number, string>>({});

  // Update handler for each OTP input.
  const onOtpChange = useCallback(
    (keyIndex: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setOtp((prev) => {
        const newOtp = { ...prev, [keyIndex]: newValue };
        // Call onChange with the complete OTP string
        const otpString = Object.values(newOtp).join("");
        onChange?.(otpString);
        return newOtp;
      });
      
      // Handle focus based on key pressed.
      if (keyPress === "Backspace") {
        if (keyIndex - 1 >= 0 && inputRefs.current[keyIndex - 1]) {
          inputRefs.current[keyIndex - 1]?.focus();
          // Clear the previous input value
          inputRefs.current[keyIndex - 1]!.value = "";
        }
      } else {
        if (keyIndex + 1 < elCount && inputRefs.current[keyIndex + 1]) {
          inputRefs.current[keyIndex + 1]?.focus();
        } else {
          inputRefs.current[keyIndex]?.blur();
        }
      }
    },
    [elCount, keyPress, onChange]
  );

  // When error is present, clear the OTP values.
  useEffect(() => {
    if (!!error) {
      setOtp((prev) => {
        const clearedOtp = Object.keys(prev).reduce((acc, key) => {
          acc[Number(key)] = "";
          return acc;
        }, {} as Record<number, string>);
        return clearedOtp;
      });
      // Clear the input elements
      inputRefs.current.forEach((input) => {
        if (input) input.value = "";
      });
    }
  }, [error]);

  // Custom hook that fires on updates (not on initial mount) to check if OTP is complete.
  useUpdateEffect(() => {
    const isOtpComplete = Object.values(otp).filter((val) => !!val).length === elCount;
    if (isOtpComplete) {
      onFinish?.(Object.values(otp).join(""));
    }
  }, [otp, elCount, onFinish]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex space-x-2">
        {elCount && !loading &&
          Array.from({ length: elCount }).map((_, i) => (
            <input
              ref={(e) => {
                if (e) inputRefs.current[i] = e;
              }}
              key={i}
              className="border-2 border-gray-400 rounded-lg h-[60px] w-[45px] bg-white focus:outline-none text-lg text-center"
              onChange={onOtpChange(i)}
              onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => setKeyPress(e.key)}
              type="password"
              maxLength={1}
            />
          ))}
        {loading && <p className="font-bold text-[30px]">Verfying Code...</p>}
      </div>
      {!loading && !!error && (
        <p className="w-[80%] lg:w-full text-center font-bold text-[19px] text-red-500 mt-1">
          {error}
        </p>
      )}
    </div>
  );
};

export default Otp;