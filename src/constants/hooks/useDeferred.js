import { useState, useEffect } from "react";
import { DEFAULTS } from "../constants/defaults";

export const useDeferred = (value, delayTime) => {
  const [val, setVal] = useState();
  let timeOutId = null;

  const cbDebounce = (cb) => {
    if (!!timeOutId) {
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
  }, [value]);

  return { val, cbDebounce };
};
