// src/features/home/LandingPageConfig.tsx
import activeHome from '@/assets/image/newnav/activeHome.png';
import activeMusic from '@/assets/image/landingPage/activeMusic.png';
import activeAssets from '@/assets/image/landingPage/activeAssets.png';
import activeCommunity from '@/assets/image/landingPage/activeCommunity.png';
import activePromotion from '@/assets/image/landingPage/activePromotion.png';
import activeAnalytics from '@/assets/image/landingPage/activeAnalytics.png';
import activeRoyalties from '@/assets/image/landingPage/activeRoyalties.png';
import uploadSongIcon from '@/assets/image/landingPage/uploadSongIcon.png';
import uploadAlbumIcon from '@/assets/image/landingPage/uploadAlbumIcon.png';
import libraryIcon from '@/assets/image/landingPage/libraryIcon.png';
import gybLiveIcon from '@/assets/image/landingPage/gybLiveIcon.png';
import demoSessionsIcon from '@/assets/image/landingPage/demoSessionsIcon.png';
import syncIcon from '@/assets/image/landingPage/syncIcon.png';
import friendsIcon from '@/assets/image/landingPage/friendsIcon.png';
import collaboratorsIcon from '@/assets/image/landingPage/collaboratorsIcon.png';
import discordIcon from '@/assets/image/landingPage/discordIcon.png';
import lyricsIcon from '@/assets/image/landingPage/lyricsIcon.png';
import documentsIcon from '@/assets/image/landingPage/documentsIcon.png';
import agreementsIcon from '@/assets/image/landingPage/agreementsIcon.png';
import promoteMusicIcon from '@/assets/image/landingPage/promoteMusicIcon.png';
import promoteShowsIcon from '@/assets/image/landingPage/promoteShowsIcon.png';
import saveDraftsIcon from '@/assets/image/landingPage/saveDraftsIcon.png';
import bookingsIcon from '@/assets/image/landingPage/bookingsIcon.png';
import mapTourIcon from '@/assets/image/landingPage/mapTourIcon.png';
import promoAssetsIcon from '@/assets/image/landingPage/promoAssetsIcon.png';
import analyticsIcon from '@/assets/image/landingPage/analyticsIcon.png';
import metaDataIcon from '@/assets/image/landingPage/metaDataIcon.png';
import allRoyaltiesIcon from '@/assets/image/landingPage/allRoyaltiesIcon.png';
import depositsIcon from '@/assets/image/landingPage/depositsIcon.png';
import payRecieveIcon from '@/assets/image/landingPage/payRecieveIcon.png';
import paymentSchedulesIcon from '@/assets/image/landingPage/paymentSchedulesIcon.png';
import salesPurchasesIcon from '@/assets/image/landingPage/salesPurchasesIcon.png';
import licenseIcon from '@/assets/image/landingPage/licenseIcon.png';
import promote from '@/assets/image/landingPage/promote.png';
import analytics from '@/assets/image/landingPage/analytics.png';
import assets from '@/assets/image/landingPage/assets.png';
import music from '@/assets/image/landingPage/music.png';
import community from '@/assets/image/landingPage/community.png';
import royalty from '@/assets/image/landingPage/royalty.png';
import home from '@/assets/image/landingPage/home.png';
import feedIcon from '@/assets/image/landingPage/feedIcon.png';
import registrationIcon from '@/assets/image/landingPage/registration.png';
import customizeIcon from '@/assets/image/landingPage/customizeIcon.png';
import { SidebarType } from '@/types/firebase';
 

 
export interface NavigationItem {
  icon: string;
  link: string;
  text?: string;
  displayType?: SidebarType;
}

 
export interface PageConfig {
  centerIcon: string;
  leftItems: NavigationItem[];
  rightItems: NavigationItem[];
  centerItems: NavigationItem[];
}

const LandingPageConfig = (status: string): PageConfig => {
  switch (status) {
    case "home":
      return {
        centerIcon: activeHome,
        leftItems: [
          { icon: royalty, link: "/royalty", displayType: "royalty" },
          { icon: analytics, link: "/analytics", displayType: "analytics" },
          { icon: assets, link: "/assets", displayType: "assets" },
        ],
        rightItems: [
          { icon: music, link: "/music", displayType: "music" },
          { icon: community, link: "/community", displayType: "community" },
          { icon: promote, link: "/promote", displayType: "promote" },
        ],
        centerItems: [
          {
            icon: registrationIcon,
            text: "Registration",
            link: "/home/registration",
            displayType: "home"
          },
          {
            icon: feedIcon,
            text: "Feed",
            link: "/home/feed",
            displayType: "home"
          },
          {
            icon: customizeIcon,
            text: "Customize",
            link: "/home/customize",
            displayType: "home"
          }
        ]
      };
    case "music":
      return {
        centerIcon: activeMusic,
        leftItems: [
          { icon: home, link: "/home", displayType: "home" },
          { icon: royalty, link: "/royalty", displayType: "royalty" },
          { icon: analytics, link: "/analytics", displayType: "analytics" },
        ],
        rightItems: [
          { icon: community, link: "/community", displayType: "community" },
          { icon: assets, link: "/assets", displayType: "assets" },
          { icon: promote, link: "/promote", displayType: "promote" },
        ],
        centerItems: [
          {
            icon: libraryIcon,
            text: "Library",
            link: "/music/library",
            displayType: "music"
          },
          {
            icon: uploadSongIcon,
            text: "Upload Song",
            link: "/music/uploadsong",
            displayType: "music"
          },
          {
            icon: uploadAlbumIcon,
            text: "Upload Album",
            link: "/music/uploadalbum",
            displayType: "music"
          },
          {
            icon: gybLiveIcon,
            text: "GYB Live",
            link: "/music/gyblive",
            displayType: "music"
          },
          {
            icon: demoSessionsIcon,
            text: "Demo Sessions",
            link: "/music/demo",
            displayType: "music"
          },
          {
            icon: syncIcon,
            text: "Sync",
            link: "/music/sync",
            displayType: "music"
          }
        ]
      };
    case "community":
      return {
        centerIcon: activeCommunity,
        leftItems: [
          { icon: music, link: "/music", displayType: "music" },
          { icon: home, link: "/home", displayType: "home" },
          { icon: royalty, link: "/royalty", displayType: "royalty" },
        ],
        rightItems: [
          { icon: assets, link: "/assets", displayType: "assets" },
          { icon: promote, link: "/promote", displayType: "promote" },
          { icon: analytics, link: "/analytics", displayType: "analytics" },
        ],
        centerItems: [
          {
            icon: friendsIcon,
            text: "Friends",
            link: "/community/friends",
            displayType: "community"
          },
          {
            icon: collaboratorsIcon,
            text: "Colaborators",
            link: "/community/collaborators",
            displayType: "community"
          },
          {
            icon: discordIcon,
            text: "Discord",
            link: "/community/discord",
            displayType: "community"
          },
        ]
      };
    case "assets":
      return {
        centerIcon: activeAssets,
        leftItems: [
          { icon: community, link: "/community", displayType: "community" },
          { icon: music, link: "/music", displayType: "music" },
          { icon: home, link: "/home", displayType: "home" },
        ],
        rightItems: [
          { icon: promote, link: "/promote", displayType: "promote" },
          { icon: analytics, link: "/analytics", displayType: "analytics" },
          { icon: royalty, link: "/royalty", displayType: "royalty" },
        ],
        centerItems: [
          {
            icon: lyricsIcon,
            text: "Lyrics",
            link: "/assets/lyrics",
            displayType: "assets"
          },
          {
            icon: documentsIcon,
            text: "Documents",
            link: "/assets/documents",
            displayType: "assets"
          },
          {
            icon: agreementsIcon,
            text: "Agreements",
            link: "/assets/agreements",
            displayType: "assets"
          },
        ]
      };
    case "promote":
      return {
        centerIcon: activePromotion,
        leftItems: [
          { icon: assets, link: "/assets", displayType: "assets" },
          { icon: community, link: "/community", displayType: "community" },
          { icon: music, link: "/music", displayType: "music" },
        ],
        rightItems: [
          { icon: analytics, link: "/analytics", displayType: "analytics" },
          { icon: royalty, link: "/royalty", displayType: "royalty" },
          { icon: home, link: "/home", displayType: "home" },
        ],
        centerItems: [
          {
            icon: promoteMusicIcon,
            text: "Promote Music",
            link: "/promote/music",
            displayType: "promote"
          },
          {
            icon: promoteShowsIcon,
            text: "Promote Show",
            link: "/promote/shows",
            displayType: "promote"
          },
          {
            icon: saveDraftsIcon,
            text: "Save Drafts",
            link: "/promote/draft",
            displayType: "promote"
          },
          {
            icon: bookingsIcon,
            text: "Bookings",
            link: "/promote/bookings",
            displayType: "promote"
          },
          {
            icon: mapTourIcon,
            text: "Map A Tour",
            link: "/promote/mapatour",
            displayType: "promote"
          },
          {
            icon: promoAssetsIcon,
            text: "Promo Assets",
            link: "/promote/assets",
            displayType: "promote"
          }
        ]
      };
    case "analytics":
      return {
        centerIcon: activeAnalytics,
        leftItems: [
          { icon: promote, link: "/promote", displayType: "promote" },
          { icon: assets, link: "/assets", displayType: "assets" },
          { icon: community, link: "/community", displayType: "community" },
        ],
        rightItems: [
          { icon: royalty, link: "/royalty", displayType: "royalty" },
          { icon: home, link: "/home", displayType: "home" },
          { icon: music, link: "/music", displayType: "music" },
        ],
        centerItems: [
          {
            icon: analyticsIcon,
            text: "Analytics",
            link: "/analytics/analytics",
            displayType: "analytics"
          },
          {
            icon: metaDataIcon,
            text: "Meta Data",
            link: "/analytics/metadata",
            displayType: "analytics"
          },
        ]
      };
    case "royalty":
      return {
        centerIcon: activeRoyalties,
        leftItems: [
          { icon: analytics, link: "/analytics", displayType: "analytics" },
          { icon: promote, link: "/promote", displayType: "promote" },
          { icon: assets, link: "/assets", displayType: "assets" },
        ],
        rightItems: [
          { icon: home, link: "/home", displayType: "home" },
          { icon: music, link: "/music", displayType: "music" },
          { icon: community, link: "/community", displayType: "community" },
        ],
        centerItems: [
          {
            icon: allRoyaltiesIcon,
            text: "All Royalties",
            link: "/royalty/allroyalty",
            displayType: "royalty"
          },
          {
            icon: depositsIcon,
            text: "Deposits",
            link: "/royalty/deposits",
            displayType: "royalty"
          },
          {
            icon: payRecieveIcon,
            text: "Pay / Receive",
            link: "/royalty/payreceive",
            displayType: "royalty"
          },
          {
            icon: paymentSchedulesIcon,
            text: "Payment Schedules",
            link: "/royalty/paymentschedule",
            displayType: "royalty"
          },
          {
            icon: salesPurchasesIcon,
            text: "Sales / Purchases",
            link: "/royalty/salespurchases",
            displayType: "royalty"
          },
          {
            icon: licenseIcon,
            text: "License ",
            link: "/royalty/license",
            displayType: "royalty"
          }
        ]
      };
    default:
      // Provide a default configuration to satisfy TypeScript
      return {
        centerIcon: activeHome,
        leftItems: [],
        rightItems: [],
        centerItems: []
      };
  }
};

export default LandingPageConfig;