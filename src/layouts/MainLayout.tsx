import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
 
import Navbar from "../components/layout/Navbar";
import Chatbox from "../components/layout/Chatbox";
import ListedPlatforms from "../components/layout/ListedPlatforms";
import Footer from "../components/layout/Footer";
//import { useTheme } from "../providers/ThemeProvider";
import Sidebar from "../components/layout/Sidebar";
 
interface MainLayoutProps {
  children?: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
  

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 dark:text-white">
      <Navbar />
      <div className="flex flex-grow container px-4 mx-auto space-x-2 mt-2">
        <div className="w-[20%] bg-white dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700 shadow dark:shadow-gray-900">
          <Sidebar />
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
