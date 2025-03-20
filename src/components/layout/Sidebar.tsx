import React from "react";
import { Link, useLocation } from "react-router-dom";
import sideBarAnalytics from "@/assets/image/sidebar/sideBarAnalytics.png";
// import sidebarAssets from "@/assets/image/sidebar/sidebarAssets.png";
import sidebarAssets from "@/assets/image/sidebar/sideBarAssets.png";
import sidebarCommunity from "@/assets/image/sidebar/sideBarCommunity.png";
import sidebarHome from "@/assets/image/sidebar/sideBarHome.png";
import sidebarMusic from "@/assets/image/sidebar/sideBarMusic.png";
import sidebarRoyalties from "@/assets/image/sidebar/sideBarRoyalties.png";
import sidebarPromote from "@/assets/image/sidebar/sideBarPromote.png";

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
  const currentSegment = location.pathname.split("/")[1];
  return (
    <div className="flex flex-col w-64">
      <div className="flex-grow">
        <ul className="-space-y-3">
          {menuItems.map(({ name, icon, path }) => {
            const menuSegment = path.split("/")[1]; // extract first segment from the menu item's path
            const isActive = currentSegment === menuSegment;
            return (
              <li key={name}>
                <Link
                  to={path}
                  className={`flex items-center space-x-3 p-4 rounded-md ${
                    isActive
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
