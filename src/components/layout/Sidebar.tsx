import { routeConfigs } from '@/routes/ProtectedRoute';
import { SidebarType } from '@/types/firebase';
import { Link, useLocation } from 'react-router-dom';
 

interface SidebarProps {
  displayType: SidebarType;
}

const Sidebar = ({ displayType }: SidebarProps) => {
  const location = useLocation();
  const routes = routeConfigs[displayType] || [];
  
  return (
    <nav className="space-y-2">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white capitalize">
        {displayType}
      </h2>
      
      <ul className="space-y-1">
        {routes.map((route) => (
          <li key={route.path}>
            <Link
              to={route.path}
              className={`block px-4 py-2 rounded-md ${
                location.pathname === route.path
                  ? 'bg-accent text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {route.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;