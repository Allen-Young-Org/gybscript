import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { RouteConfig, SidebarType } from "../types/firebase";
 

interface ProtectedRouteProps {
  children?: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="loader-overlay">
        <div className="loader"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/user_sign_in" />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;

  
export const routeConfigs: Record<SidebarType, RouteConfig[]> = {
  home: [
    {
      path: '/home/registration',
      label: 'Registration',
    },
    {
      path: '/home/feed',
      label: 'Feed',
    },
    {
      path: '/home/customize',
      label: 'Customize',
    },
  ],
  music: [
    {
      path: '/music/library',
      label: 'My Library',
    },
    {
      path: '/music/uploadsong',
      label: 'Upload Song',
    },
    {
      path: '/music/uploadalbum',
      label: 'Upload Album',
    },
    {
      path: '/music/gyblive',
      label: 'GYB Live',
    },
    {
      path: '/music/demo',
      label: 'Demo',
    },
    {
      path: '/music/sync',
      label: 'Sync License',
    },
  ],
  community: [
    {
      path: '/community/collaborators',
      label: 'Collaborators',
    },
    {
      path: '/community/discord',
      label: 'Discord',
    },
    {
      path: '/community/friends',
      label: 'Friends',
    },
  ],
  assets: [
    {
      path: '/assets/lyrics',
      label: 'Lyrics',
    },
    {
      path: '/assets/documents',
      label: 'Documents',
    },
    {
      path: '/assets/agreements',
      label: 'Agreements',
    },
  ],
  promote: [
    {
      path: '/promote/music',
      label: 'Music',
    },
    {
      path: '/promote/shows',
      label: 'Shows',
    },
    {
      path: '/promote/draft',
      label: 'Saved Drafts',
    },
    {
      path: '/promote/bookings',
      label: 'Bookings',
    },
    {
      path: '/promote/mapatour',
      label: 'Map A Tour',
    },
    {
      path: '/promote/assets',
      label: 'Assets',
    },
  ],
  analytics: [
    {
      path: '/analytics/analytics',
      label: 'Analytics',
    },
    {
      path: '/analytics/metadata',
      label: 'Metadata',
    },
  ],
  royalty: [
    {
      path: '/royalty/allroyalty',
      label: 'All Royalty',
    },
    {
      path: '/royalty/deposits',
      label: 'Deposits',
    },
    {
      path: '/royalty/payreceive',
      label: 'Pay & Receive',
    },
    {
      path: '/royalty/paymentschedule',
      label: 'Payment Schedule',
    },
    {
      path: '/royalty/salespurchases',
      label: 'Sales & Purchases',
    },
    {
      path: '/royalty/license',
      label: 'License',
    },
  ],
};


