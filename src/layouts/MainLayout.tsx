import { ReactNode, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSidebar } from '@/providers/SidebarProvider';
import { useTheme } from '@/providers/ThemeProvider';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Chatbox from '../components/layout/Chatbox';
import ListedPlatforms from '../components/layout/ListedPlatforms';
import Footer from '../components/layout/Footer';
import { SidebarType } from '@/types/firebase';

interface MainLayoutProps {
  children?: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  const { sidebarType, updateSidebarType } = useSidebar();
  const { isDarkMode } = useTheme();

  useEffect(() => {
     const mainRoute = location.pathname.split('/')[1];
    
     const isValidSidebarType = (type: string): type is SidebarType => {
      return [
        'home', 
        'music', 
        'community', 
        'assets', 
        'promote', 
        'analytics', 
        'royalty'
      ].includes(type);
    };
    
    if (mainRoute && isValidSidebarType(mainRoute)) {
       updateSidebarType(mainRoute);
    }
  }, [location.pathname, updateSidebarType]);

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-background">
      <Navbar displayType={sidebarType} />

      <div className="flex flex-grow container px-4 mx-auto space-x-2 mt-2">
        <div className="w-[20%] bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-900">
          <Sidebar displayType={sidebarType} />
        </div>
        <div className="w-[65%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-900 rounded-md p-4">
          {children || <Outlet />}
        </div>
        <div className="w-[15%] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-900 rounded-md p-4">
          <Chatbox />
        </div>
      </div>

      <div className="py-3">
        <ListedPlatforms />
      </div>

      <Footer />
    </div>
  );
}

export default MainLayout;