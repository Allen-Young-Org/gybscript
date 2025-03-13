import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { SidebarType } from '@/types/firebase';
// import { SidebarType } from '@/types/navigation';

interface NavbarProps {
  displayType: SidebarType;
}

const Navbar = ({ displayType }: NavbarProps) => {
  const { currentUser, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      await logout();
     } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-white">
            GYB Script
          </Link>
          
          <nav className="hidden md:flex space-x-4">
            <Link 
              to="/home" 
              className={`px-3 py-2 rounded-md ${displayType === 'home' ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Home
            </Link>
            <Link 
              to="/music" 
              className={`px-3 py-2 rounded-md ${displayType === 'music' ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Music
            </Link>
            <Link 
              to="/community" 
              className={`px-3 py-2 rounded-md ${displayType === 'community' ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Community
            </Link>
            <Link 
              to="/assets" 
              className={`px-3 py-2 rounded-md ${displayType === 'assets' ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Assets
            </Link>
            <Link 
              to="/promote" 
              className={`px-3 py-2 rounded-md ${displayType === 'promote' ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Promote
            </Link>
            <Link 
              to="/analytics" 
              className={`px-3 py-2 rounded-md ${displayType === 'analytics' ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Analytics
            </Link>
            <Link 
              to="/royalty" 
              className={`px-3 py-2 rounded-md ${displayType === 'royalty' ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300'}`}
            >
              Royalty
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
          
          {currentUser ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {currentUser.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden md:inline-block">
                  {currentUser.email?.split('@')[0]}
                </span>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-md shadow-xl z-10 border border-gray-200 dark:border-gray-700">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex space-x-2">
              <Link
                to="/user_sign_in"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                Sign In
              </Link>
              <Link
                to="/user_sign_up"
                className="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent/90"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;