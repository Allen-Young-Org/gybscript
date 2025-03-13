import { useEffect, useRef } from "react";

export const useUpdateEffect = (cb, deps) => {
  const startEffect = useRef(false);

  useEffect(() => {
    if (!!startEffect.current) {
      cb();
    }

    startEffect.current = true;
  }, deps);
};
