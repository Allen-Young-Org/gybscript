import { useEffect, useState } from "react";
import { Dimensions } from "../dimensions";

interface Dimension {
  phone: boolean;
}

export const useDimensions = (): Dimension => {
  const [dimension, setDimension] = useState<Dimension>({
    phone: window.innerWidth <= Dimensions.phoneDimensions,
  });

  useEffect(() => {
    const onResize = () => {
      setDimension((prev) => ({
        ...prev,
        phone: window.innerWidth <= Dimensions.phoneDimensions,
      }));
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return dimension;
};
