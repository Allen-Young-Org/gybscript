import React from "react";
import { Link, useLocation } from "react-router-dom";
import sideBarAnalytics from "@/assets/image/sidebar/sideBarAnalytics.png";
// import sidebarAssets from "@/assets/image/sidebar/sidebarAssets.png";
import sidebarAssets from '@/assets/image/sidebar/sidebarAssets.png';
import sidebarCommunity from "@/assets/image/sidebar/sidebarCommunity.png";
import sidebarHome from "@/assets/image/sidebar/sideBarHome.png";
import sidebarMusic from "@/assets/image/sidebar/sidebarMusic.png";
import sidebarRoyalties from "@/assets/image/sidebar/sidebarRoyalties.png";
import sidebarPromote from "@/assets/image/sidebar/sidebarPromote.png";

interface MenuItem {
  name: string;
  icon: string;
  path: string;
}

const menuItems: MenuItem[] = [
  { name: "Home", icon: sidebarHome, path: "/home/registration" },
  { name: "Music", icon: sidebarMusic, path: "/music/library" },
  { name: "Community", icon: sidebarCommunity, path: "/community/friends" },
  { name: "Assets", icon: sidebarAssets, path: "/assets/lyrics" },
  { name: "Promote", icon: sidebarPromote, path: "/promote/music" },
  { name: "Analytics", icon: sideBarAnalytics, path: "/analytics/analytics" },
  { name: "Royalty", icon: sidebarRoyalties, path: "/royalty/allroyalty" },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  return (
    <div className="flex flex-col w-64">
      <div className="flex-grow">
        <ul className="-space-y-3">
          {menuItems.map(({ name, icon, path }) => {
            const isActive = location.pathname === path;
            return (
              <li key={name}>
                <Link
                  to={path}
                  className={`flex items-center space-x-3 p-4 rounded-md ${isActive
                    ? "bg-[#C09239] text-white"
                    : "hover:bg-[#C09239] hover:text-white"
                    }`}
                >
                  <img src={icon} alt={name} />
                  <span>{name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
