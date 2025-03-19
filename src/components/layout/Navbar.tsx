import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import GybLogo from "../../assets/image/gyblogo.png";
import { Icon } from "@iconify/react";
import activeLive from "../../assets/image/header/activeLive.png";
import inactiveLive from "../../assets/image/header/inactiveLive.png";
import { ModeToggle } from "./mode-toggle";
import { useAuth } from "../../providers/AuthProvider";

const Navbar = () => {
  const { currentUser, logout, userDetails } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const nav = useNavigate();
  const location = useLocation();
  const displayType = location.pathname.split("/")[1];
  const secondSegment = location.pathname.split("/")[2];
  const uploadSong = () => {
    nav(`/${"music/uploadsong"}`);
  };

  const uploadAlbum = () => {
    nav(`/${"music/createalbum"}`);
  };
  const gybLive = () => {
    nav(`/${"music/gybLive"}`);
  };

  const mylibrary = () => {
    nav(`/${"music/library"}`);
  };

  const demo = () => {
    nav(`/${"music/demo"}`);
  };

  const sync = () => {
    nav(`/${"music/sync"}`);
  };

  const customizeClick = () => {
    nav(`/home/${"customize"}`);
  };
  const feedClick = () => {
    nav(`/home/${"feed"}`);
  };
  const registrationClick = () => {
    nav(`/home/${"registration"}`);
  };
  const PromoteMusic = () => {
    nav(`/${"promote/music"}`);
  };
  const PromoteShows = () => {
    nav(`/${"promote/shows"}`);
  };
  const SavedDrafts = () => {
    nav(`/${"promote/draft"}`);
  };
  const Bookings = () => {
    nav(`/${"promote/bookings"}`);
  };
  const MapATour = () => {
    nav(`/${"promote/mapatour"}`);
  };
  const PromoAssets = () => {
    nav(`/${"promote/assets"}`);
  };
  const Deposits = () => {
    nav(`/${"royalty/deposits"}`);
  };
  const PayRecieve = () => {
    nav(`/${"royalty/payreceive"}`);
  };
  const PaymentSchedule = () => {
    nav(`/${"royalty/paymentschedule"}`);
  };
  const Royalties = () => {
    nav(`/${"royalty/allroyalty"}`);
  };

  const Friends = () => {
    nav(`/${"community/friends"}`);
  };

  const Collaborators = () => {
    nav(`/${"community/collaborators"}`);
  };

  const Discord = () => {
    nav(`/${"community/discord"}`);
  };

  const SalesPurchase = () => {
    nav(`/${"royalty/salespurchases"}`);
  };

  const SalesLicenses = () => {
    nav(`/${"royalty/license"}`);
  };

  const Lyrics = () => {
    nav(`/${"assets/lyrics"}`);
  };

  const Documents = () => {
    nav(`/${"assets/documents"}`);
  };

  const Agreements = () => {
    nav(`/${"assets/agreements"}`);
  };

  const Analytics = () => {
    nav(`/${"analytics/analytics"}`);
  };

  const MetaData = () => {
    nav(`/${"analytics/metadata"}`);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/home"
            className="text-2xl font-bold text-gray-800 dark:text-white"
          >
            <img src={GybLogo} alt="GYB Logo" />
          </Link>
        </div>
        <div className="w-[54%]">
          {displayType === "home" && secondSegment && (
            <div className="flex space-x-4  gap-5">
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={registrationClick}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="gg:list"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "registration"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "registration"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Registration
                    </div>
                    <div
                      className={`${
                        secondSegment === "registration"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={feedClick}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="mdi:signal-variant"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "feed"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "feed"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Feed
                    </div>
                    <div
                      className={`${
                        secondSegment === "feed"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={customizeClick}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="rivet-icons:settings"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "customize"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "customize"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Customize
                    </div>
                    <div
                      className={`${
                        secondSegment === "customize"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {displayType === "music" && secondSegment && (
            <div className="flex space-x-4  gap-5">
              <div>
                <div
                  onClick={mylibrary}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="gravity-ui:book"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "library"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "library"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      My Library
                    </div>
                    <div
                      className={`${
                        secondSegment === "library"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={uploadSong}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="lets-icons:upload"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "uploadsong"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "uploadsong"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Upload Song
                    </div>
                    <div
                      className={`${
                        secondSegment === "uploadsong"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={uploadAlbum}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="streamline:tape-cassette-record"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "createalbum"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "createalbum"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Upload Album
                    </div>
                    <div
                      className={`${
                        secondSegment === "createalbum"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={gybLive}
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={
                        secondSegment === "gybLive" ? activeLive : inactiveLive
                      }
                      alt=""
                      className="cursor-pointer h-7"
                    />
                    <div
                      className={` mt-1 text-xs ${
                        secondSegment === "gybLive"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      GYB Live
                    </div>
                    <div
                      className={`${
                        secondSegment === "gybLive"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={demo}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="ic:outline-headset"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "demo"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "demo"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Demos
                    </div>
                    <div
                      className={`${
                        secondSegment === "demo"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={sync}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="uil:sync"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "sync"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "sync"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Sync Licenses
                    </div>
                    <div
                      className={`${
                        secondSegment === "sync"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {displayType === "community" && secondSegment && (
            <div className="flex space-x-4  gap-5">
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={Friends}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="fe:smile"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "friends"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "friends"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Friends
                    </div>
                    <div
                      className={`${
                        secondSegment === "friends"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={Collaborators}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="carbon:collaborate"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "collaborators"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "collaborators"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Collaborators
                    </div>
                    <div
                      className={`${
                        secondSegment === "collaborators"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={Discord}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="ri:discord-line"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "discord"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "discord"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Discord
                    </div>
                    <div
                      className={`${
                        secondSegment === "discord"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {displayType === "promote" && secondSegment && (
            <div className="flex space-x-4  gap-5">
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={PromoteMusic}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="ion:musical-note-outline"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "music"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "music"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Promote Music
                    </div>
                    <div
                      className={`${
                        secondSegment === "music"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div
                  onClick={PromoteShows}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="uil:ticket"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "shows"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "shows"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Promote Shows
                    </div>
                    <div
                      className={`${
                        secondSegment === "shows"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
              <div>
                <div
                  onClick={SavedDrafts}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="nimbus:diskette"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "draft"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "draft"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Saved Drafts
                    </div>
                    <div
                      className={`${
                        secondSegment === "draft"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={Bookings}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="material-symbols-light:collections-bookmark-outline"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "bookings"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "bookings"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Bookings
                    </div>
                    <div
                      className={`${
                        secondSegment === "bookings"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={MapATour}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="proicons:airplane"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "mapatour"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "mapatour"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Map A Tour
                    </div>
                    <div
                      className={`${
                        secondSegment === "mapatour"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={PromoAssets}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="fluent:image-copy-20-regular"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "assets"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "assets"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Promo Assets
                    </div>
                    <div
                      className={`${
                        secondSegment === "assets"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {displayType === "analytics" && secondSegment && (
            <div className="flex space-x-4  gap-5">
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={Analytics}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="uil:analytics"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "analytics"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "analytics"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Analytics
                    </div>
                    <div
                      className={`${
                        secondSegment === "analytics"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={MetaData}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="uil:database"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "metadata"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "metadata"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Meta Data
                    </div>
                    <div
                      className={`${
                        secondSegment === "metadata"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {displayType === "assets" && secondSegment && (
            <div className="flex space-x-4  gap-5">
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={Lyrics}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="mingcute:paper-line"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "lyrics"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "lyrics"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Lyrics
                    </div>
                    <div
                      className={`${
                        secondSegment === "lyrics"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={Documents}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="ep:document"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "documents"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "documents"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Documents
                    </div>
                    <div
                      className={`${
                        secondSegment === "documents"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={Agreements}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="mdi:like-outline"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "agreements"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "agreements"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Agreements
                    </div>
                    <div
                      className={`${
                        secondSegment === "agreements"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {displayType === "royalty" && secondSegment && (
            <div className="flex space-x-4  gap-5">
              <div>
                <div
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                  onClick={Royalties}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="mdi:cash-multiple"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "allroyalty"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "allroyalty"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Royalties
                    </div>
                    <div
                      className={`${
                        secondSegment === "allroyalty"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={Deposits}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="uil:money-withdrawal"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "deposits"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "deposits"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Deposits
                    </div>
                    <div
                      className={`${
                        secondSegment === "deposits"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={PayRecieve}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="fluent:money-hand-24-regular"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "payreceive"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "payreceive"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Pay / Receive
                    </div>
                    <div
                      className={`${
                        secondSegment === "payreceive"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={PaymentSchedule}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="mdi:calendar-outline"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "paymentschedule"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "paymentschedule"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Payment Schedules
                    </div>
                    <div
                      className={`${
                        secondSegment === "paymentschedule"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={SalesPurchase}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="mdi:graph-bar-stacked"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "salespurchases"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "salespurchases"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Sales Purchases
                    </div>
                    <div
                      className={`${
                        secondSegment === "salespurchases"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>

              <div>
                <div
                  onClick={SalesLicenses}
                  className={`pb-1 flex justify-center items-center cursor-pointer`}
                >
                  <div className="flex flex-col items-center">
                    <Icon
                      icon="ix:user-profile"
                      style={{ fontSize: "32px" }}
                      className={`${
                        secondSegment === "license"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    />
                    <div
                      className={` text-xs ${
                        secondSegment === "license"
                          ? "text-accent"
                          : "text-gray-500"
                      } `}
                    >
                      Sales Licenses
                    </div>
                    <div
                      className={`${
                        secondSegment === "license"
                          ? "border-b-4 border-accent"
                          : ""
                      } h-1 w-full`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <ModeToggle />
          {currentUser ? (
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {userDetails?.firstName?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden md:inline-block">
                  {userDetails?.firstName} {userDetails?.lastName}
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
