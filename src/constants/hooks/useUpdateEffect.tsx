import { useEffect, useRef, EffectCallback, DependencyList } from "react";

export const useUpdateEffect = (cb: EffectCallback, deps: DependencyList) => {
  const startEffect = useRef(false);

  useEffect(() => {
    if (startEffect.current) {
      cb();
    }

    startEffect.current = true;
  }, deps);
};
