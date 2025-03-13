// src/features/home/LandingPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import classNames from "classnames";
import { useSidebar } from "@/providers/SidebarProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import LandingPageConfig, {
  NavigationItem,
  PageConfig,
} from "./LandingPageConfig";
import circular from "@/assets/image/circular.png";
import royalty from "@/assets/image/landingPage/royalty.png";
import { useScale } from "@/providers/DetectScaleContext";
import { SidebarType } from "@/types/firebase";

interface LandingPageProps {
  statusVar: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ statusVar }) => {
  const [isEdge, setIsEdge] = useState<boolean>(false);
  const [status, setStatus] = useState<string>(statusVar);
  const navigate = useNavigate();
  const { updateSidebarType } = useSidebar();
  const scale = useScale();
  const config: PageConfig = LandingPageConfig(status);

  // Navigation handler
  const handleNavigation = (link: string, displayType?: SidebarType): void => {
    if (displayType) {
      updateSidebarType(displayType);
    }
    navigate(link);
  };

  // Effects
  useEffect(() => {
    // Detect if browser is Microsoft Edge
    const isEdgeBrowser = navigator.userAgent.indexOf("Edg") !== -1;
    setIsEdge(isEdgeBrowser);
  }, []);

  useEffect(() => {
    setStatus(statusVar);
  }, [statusVar]);

  // CSS classes for responsive positioning
  // MARGIN TOP LEFT FIRST ICON
  const mtFLI = classNames({
    "mt-[10rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mt-28": scale == 1,
    "mt-[6.5rem]": scale == 1.0909090909090908 || scale == 1.100000023841858,
    "mt-[6rem]": scale == 1.2,
    "mt-[5.5rem]": scale == 1.3333333333333333 || scale === 1.25,
    "mt-32": scale == 1.5,
  });

  // MARGIN TOP LEFT SECOND ICON
  const mtSLI = classNames({
    "mt-[24rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mt-56": scale >= 1 && scale < 1.5,
    "mt-[14rem]": scale >= 1.5 && scale < 2,
    "mt-40": scale >= 2 && scale < 2.5,
  });

  // MARGIN TOP LEFT THIRD ICON
  const mtTLI = classNames({
    "mt-[42rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mt-96": scale >= 1 && scale < 1.5,
    "mt-[24rem]": scale >= 1.5 && scale < 2,
    "mt-40": scale >= 2 && scale < 2.5,
  });

  // PADDING LEFT SIDE FIRST ICON
  const pFLI = classNames({
    "mr-[45rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mr-[31%]": scale === 1,
    "mr-[32%]": scale === 1.0909090909090908 || scale === 1.100000023841858,
    "mr-[33%]": scale === 1.2 || scale === 1.25,
    "mr-[34%]": scale === 1.3333333333333333,
    "mr-[47.5%]": scale === 1.5 && isEdge,
    "mr-[50.5%]": scale >= 1.5 && !isEdge,
  });

  // PADDING LEFT SIDE SECOND ICON
  const pSLI = classNames({
    "mr-[64rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mr-[44%]": scale === 1,
    "mr-[48.2%]": scale === 1.0909090909090908 || scale == 1.100000023841858,
    "mr-[53%]": scale === 1.2,
    "mr-[55.5%]": scale === 1.25,
    "mr-[59%]": scale === 1.3333333333333333,
    "mr-[61.5%]": scale === 1.5 && isEdge,
    "mr-[66.5%]": scale >= 1.5 && !isEdge,
  });

  // PADDING LEFT SIDE THIRD ICON
  const pTLI = classNames({
    "mr-[64.5rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mr-[53%]": scale === 1,
    "mr-[58%]": scale === 1.0909090909090908 || scale == 1.100000023841858,
    "mr-[63.5%]": scale === 1.2,
    "mr-[66.5%]": scale === 1.25,
    "mr-[70.7%]": scale === 1.3333333333333333,
    "mr-[71.5%]": scale === 1.5 && isEdge,
    "mr-[79.5%]": scale >= 1.5 && !isEdge,
  });

  // MARGIN TOP RIGHT FIRST ICON
  const mtFRI = classNames({
    "mt-[10rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mt-28": scale == 1,
    "mt-[6.5rem]": scale == 1.0909090909090908 || scale == 1.100000023841858,
    "mt-[6rem]": scale == 1.2,
    "mt-[5.5rem]": scale == 1.3333333333333333 || scale === 1.25,
    "mt-32": scale == 1.5,
  });

  // MARGIN TOP RIGHT SECOND ICON
  const mtSRI = classNames({
    "mt-[24rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mt-56": scale >= 1 && scale < 1.5,
    "mt-[14rem]": scale >= 1.5 && scale < 2,
    "mt-40": scale >= 2 && scale < 2.5,
  });

  // MARGIN TOP RIGHT THIRD ICON
  const mtTRI = classNames({
    "mt-[42rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mt-96": scale >= 1 && scale < 1.5,
    "mt-[24rem]": scale >= 1.5 && scale < 2,
    "mt-40": scale >= 2 && scale < 2.5,
  });

  // PADDING RIGHT SIDE FIRST ICON
  const pFRI = classNames({
    "ml-[45rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "ml-[31%]": scale === 1,
    "ml-[32%]": scale === 1.0909090909090908 || scale == 1.100000023841858,
    "ml-[33%]": scale === 1.2 || scale === 1.25,
    "ml-[34%]": scale === 1.3333333333333333,
    "ml-[47.5%]": scale === 1.5 && isEdge,
    "ml-[50.5%]": scale >= 1.5 && !isEdge,
  });

  // PADDING RIGHT SIDE SECOND ICON
  const pSRI = classNames({
    "ml-[64rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "ml-[44%]": scale === 1,
    "ml-[48.2%]": scale === 1.0909090909090908 || scale == 1.100000023841858,
    "ml-[53%]": scale === 1.2,
    "ml-[55.5%]": scale === 1.25,
    "ml-[59%]": scale === 1.3333333333333333,
    "ml-[61.5%]": scale === 1.5 && isEdge,
    "ml-[66.5%]": scale >= 1.5 && !isEdge,
  });

  // PADDING RIGHT SIDE THIRD ICON
  const pTRI = classNames({
    "ml-[64.5rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "ml-[54%]": scale === 1,
    "ml-[58%]": scale === 1.0909090909090908 || scale == 1.100000023841858,
    "ml-[63.5%]": scale === 1.2,
    "ml-[66.5%]": scale === 1.25,
    "ml-[70.7%]": scale === 1.3333333333333333,
    "ml-[71.5%]": scale === 1.5 && isEdge,
    "ml-[79.5%]": scale >= 1.5 && !isEdge,
  });

  // Center Icons styling
  const CenterIcons = classNames({
    "mt-[25rem]":
      scale == 0.8999999761581421 ||
      scale == 0.8955223880597015 ||
      scale == 0.800000011920929 ||
      scale == 0.8,
    "mt-[15rem]": scale >= 1 && scale < 1.5,
    "mt-[10rem]": scale == 1.5,
  });

  const CenterIconsSize = classNames({
    "w-24 h-24": scale == 1.5 || scale == 1.3333333333333333 || scale == 1.25,
  });

  return (
    <>
      <div className="h-screen dark:bg-gray-600/50 overflow-hidden">
        <Navbar />

        <div className="theArcPlace flex justify-center mt-2 container mx-auto">
          <div className="absolute -mt-4 theCenterDisplay cursor-pointer z-50">
            <img src={config.centerIcon} alt="Center Icon" />
          </div>

          <div
            className={`absolute ${CenterIcons} theCenterDisplay text-center cursor-pointer`}
          >
            <h1 className="font-poppins text-accent text-6xl">
              {status.toUpperCase()}
            </h1>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {config.centerItems.map((item: NavigationItem, index: number) => (
                <div
                  key={index}
                  onClick={() => handleNavigation(item.link, item.displayType)}
                  className="flex flex-col items-center justify-center cursor-pointer z-50"
                >
                  <img
                    src={item.icon}
                    alt={item.text || ""}
                    className={`${CenterIconsSize} w-42 h-42`}
                  />
                  <p className="font-poppins text-accent text-lg text-center">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {config.leftItems.map((item: NavigationItem, index: number) => {
            const mtClass = [mtFLI, mtSLI, mtTLI][index];
            const pClass = [pFLI, pSLI, pTLI][index];
            return (
              <div
                key={index}
                className={`absolute ${mtClass} ${pClass} z-50 theCenterDisplay cursor-pointer`}
              >
                <img
                  src={item.icon}
                  width={35}
                  height={35}
                  className={`${item.icon === royalty && "w-7 h-10"}`}
                  alt={`Left Icon ${index + 1}`}
                  onClick={() => handleNavigation(item.link, item.displayType)}
                />
              </div>
            );
          })}

          {config.rightItems.map((item: NavigationItem, index: number) => {
            const mtClass = [mtFRI, mtSRI, mtTRI][index];
            const pClass = [pFRI, pSRI, pTRI][index];
            return (
              <div
                key={index}
                className={`absolute ${mtClass} ${pClass} z-50 theCenterDisplay cursor-pointer`}
              >
                <img
                  src={item.icon}
                  width={35}
                  height={35}
                  className={`${item.icon === royalty && "w-7 h-10"}`}
                  alt={`Right Icon ${index + 1}`}
                  onClick={() => handleNavigation(item.link, item.displayType)}
                />
              </div>
            );
          })}

          <img
            src={circular}
            className="dark:opacity-30"
            alt="Background Circle"
          />
        </div>

        {scale !== 1.5 && (
          <div className="absolute bottom-0 w-full max-h-[200px]">
            <Footer />
          </div>
        )}
      </div>
    </>
  );
};

export default LandingPage;
