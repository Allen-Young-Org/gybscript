import { useEffect, useState } from "react";
import { Dimensions } from "../constants/dimensions";

export const useDimensions = () => {
  const [dimension, setDimension] = useState({
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
