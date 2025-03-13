// src/providers/DetectScaleContext.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define the type for the context value
type ScaleContextType = number;

// Create the context with an initial value
const DetectScaleContext = createContext<ScaleContextType | undefined>(undefined);

// Define props interface for the provider component
interface ScaleProviderProps {
  children: ReactNode;
}

// Create a provider component with TypeScript annotations
export const ScaleProvider: React.FC<ScaleProviderProps> = ({ children }) => {
  const [scale, setScale] = useState<number>(window.devicePixelRatio);

  useEffect(() => {
    const handleResize = (): void => {
      setScale(window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <DetectScaleContext.Provider value={scale}>
      {children}
    </DetectScaleContext.Provider>
  );
};

// Create and type the custom hook
export const useScale = (): number => {
  const context = useContext(DetectScaleContext);
  if (context === undefined) {
    throw new Error('useScale must be used within a ScaleProvider');
  }
  return context;
};