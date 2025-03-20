/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { DEFAULTS } from "../defaults";

export const useDeferred = (value: any, delayTime?: number) => {
  const [val, setVal] = useState<any>();
  let timeOutId: NodeJS.Timeout | null = null;

  const cbDebounce = (cb: () => void) => {
    if (timeOutId) {
      clearTimeout(timeOutId);
    }

    timeOutId = setTimeout(() => {
      cb();
    }, delayTime || DEFAULTS.deferredtime);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setVal(value);
    }, delayTime || DEFAULTS.deferredtime);

    return () => clearTimeout(delay);
  }, [value, delayTime]);

  return { val, cbDebounce };
};
