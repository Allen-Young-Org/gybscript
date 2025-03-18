import { SidebarType } from '@/types/firebase';
import { ReactNode, createContext, useContext, useState } from 'react';
 

interface SidebarContextType {
  sidebarType: SidebarType;
  updateSidebarType: (type: SidebarType) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [sidebarType, setSidebarType] = useState<SidebarType>('home');

  const updateSidebarType = (type: SidebarType) => {
    setSidebarType(type);
  };

  const value = { sidebarType, updateSidebarType };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export default SidebarProvider;