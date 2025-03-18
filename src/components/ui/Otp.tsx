/* eslint-disable no-extra-boolean-cast */
 
import React, { useCallback, useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from "react";

interface OtpProps {
  elCount: number;
  loading: boolean;
  error?: string | null;
  onFinish?: (otp: string) => void;
  onChange?: (otp: string) => void;
}

const Otp: React.FC<OtpProps> = ({ elCount, loading, error = null, onFinish, onChange }) => { 
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]); 
  const [keyPress, setKeyPress] = useState<string | null>(null); 
  const [otp, setOtp] = useState<Record<number, string>>({}); 
  const isComplete = useRef<boolean>(false); 
  const onOtpChange = useCallback(
    (keyIndex: number) => (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setOtp((prev) => {
        const newOtp = { ...prev, [keyIndex]: newValue }; 
        const otpString = Object.values(newOtp).join("");
        onChange?.(otpString);
         
        const complete = Object.values(newOtp).filter(val => !!val).length === elCount;
        isComplete.current = complete;
        
        return newOtp;
      }); 
      if (keyPress === "Backspace") {
        if (keyIndex - 1 >= 0 && inputRefs.current[keyIndex - 1]) {
          inputRefs.current[keyIndex - 1]?.focus(); 
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
  useEffect(() => {
    if (!!error) {
      setOtp({}); 
      inputRefs.current.forEach((input) => {
        if (input) input.value = "";
      });
    }
  }, [error]);
 
  useEffect(() => { 
    const otpValues = Object.values(otp);
    const complete = otpValues.length === elCount && otpValues.every(val => !!val);
     
    if (complete && isComplete.current && onFinish) { 
      isComplete.current = false; 
      const timer = setTimeout(() => {
        onFinish(otpValues.join(""));
      }, 0);
      
      return () => clearTimeout(timer);
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
              disabled={loading}
            />
          ))}
        {loading && <p className="font-bold text-[30px]">Verifying Code...</p>}
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