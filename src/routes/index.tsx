import {   Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import EarlyRegistration from '../features/earlyregistration/EarlyRegistration';
import PreSignUp from '../features/pre-signup/PreSignUp';
import PreSubs from '../features/pre-signup/PreSubs';
import PreSignupSuccess from '../features/pre-signup/PreSignupSuccess';
import SignUpForm from '../features/auth/Signup';
import SignIn from '../features/auth/Signin';
import LandingPage from '../features/home/LandingPage';
import MainLayout from '../layouts/MainLayout';
import ProtectedRoute from './ProtectedRoute';
import UploadMusic from '@/features/music/UploadMusic';
import MyLibrary from '@/features/music/MyLibrary';
import Registration from '@/features/home/Registration';
import CreateAlbum from "@/features/music/CreateAlbum";
import Customize from '@/features/home/Customize';
import Feed from '@/features/home/Feed';
// Loading component
const LazyLoading = () => (
  <div className="loader-overlay">
    <div className="loader"></div>
  </div>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <EarlyRegistration />
      </Suspense>
    ),
  },
  {
    path: "/pre-signup",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <PreSignUp />
      </Suspense>
    ),
  },
  {
    path: "/pre-subscription",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <PreSubs />
      </Suspense>
    ),
  },
  {
    path: "/pre-signup/success",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <PreSignupSuccess />
      </Suspense>
    ),
  },
  {
    path: "/faq",
    element: <Suspense fallback={<LazyLoading />}>{/* <FAQ /> */}</Suspense>,
  },
  {
    path: "/user_sign_up",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <SignUpForm />
      </Suspense>
    ),
  },
  {
    path: "/user_sign_in",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <SignIn />
      </Suspense>
    ),
  },
  {
    path: "/home",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <LandingPage statusVar="home" />
      </Suspense>
    ),
  },
  {
    path: "/music",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <LandingPage statusVar="music" />
      </Suspense>
    ),
  },
  {
    path: "/community",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <LandingPage statusVar="community" />
      </Suspense>
    ),
  },
  {
    path: "/assets",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <LandingPage statusVar="assets" />
      </Suspense>
    ),
  },
  {
    path: "/promote",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <LandingPage statusVar="promote" />
      </Suspense>
    ),
  },
  {
    path: "/analytics",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <LandingPage statusVar="analytics" />
      </Suspense>
    ),
  },
  {
    path: "/royalty",
    element: (
      <Suspense fallback={<LazyLoading />}>
        <LandingPage statusVar="royalty" />
      </Suspense>
    ),
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      // Music routes
      {
        path: "music",
        element: <ProtectedRoute />,
        children: [
          {
            path: "library",
            element: (
              <Suspense fallback={<LazyLoading />}>
                <MyLibrary />
              </Suspense>
            ),
          },
          {
            path: "uploadsong",
            element: (
              <Suspense fallback={<LazyLoading />}>
                <UploadMusic />
              </Suspense>
            ),
          },
          {
            path: "createalbum",
            element: (
              <Suspense fallback={<LazyLoading />}>
                 <CreateAlbum /> 
              </Suspense>
            ),
          },
          {
            path: "gyblive",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <GYBLive /> */}
              </Suspense>
            ),
          },
          {
            path: "demo",
            element: (
              <Suspense fallback={<LazyLoading />}>{/* <Demo /> */}</Suspense>
            ),
          },
          {
            path: "sync",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <SyncLicense /> */}
              </Suspense>
            ),
          },
        ],
      },

      // Home routes
      {
        path: "home",
        element: <ProtectedRoute />,
        children: [
          {
            path: "registration",
            element: (
              <Suspense fallback={<LazyLoading />}>
                <Registration />
              </Suspense>
            ),
          },
          {
            path: "feed",
            element: (
              <Suspense fallback={<LazyLoading />}>  <Feed />  </Suspense>
            ),
          },
          {
            path: "customize",
            element: (
              <Suspense fallback={<LazyLoading />}>
                <Customize />
              </Suspense>
            ),
          },
        ],
      },

      // Promote routes
      {
        path: "promote",
        element: <ProtectedRoute />,
        children: [
          {
            path: "music",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <PromoteMusic /> */}
              </Suspense>
            ),
          },
          {
            path: "shows",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <PromoteShows /> */}
              </Suspense>
            ),
          },
          {
            path: "draft",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <SavedDraft /> */}
              </Suspense>
            ),
          },
          {
            path: "bookings",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Bookings /> */}
              </Suspense>
            ),
          },
          {
            path: "mapatour",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <MapATour /> */}
              </Suspense>
            ),
          },
          {
            path: "assets",
            element: (
              <Suspense fallback={<LazyLoading />}>{/* <Assets /> */}</Suspense>
            ),
          },
        ],
      },

      // Analytics routes
      {
        path: "analytics",
        element: <ProtectedRoute />,
        children: [
          {
            path: "analytics",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Analytics /> */}
              </Suspense>
            ),
          },
          {
            path: "metadata",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <MetaData /> */}
              </Suspense>
            ),
          },
        ],
      },

      // Community routes
      {
        path: "community",
        element: <ProtectedRoute />,
        children: [
          {
            path: "collaborators",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Collaborators /> */}
              </Suspense>
            ),
          },
          {
            path: "discord",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Discord /> */}
              </Suspense>
            ),
          },
          {
            path: "friends",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Friends /> */}
              </Suspense>
            ),
          },
          {
            path: "chat/:userID",
            element: (
              <Suspense fallback={<LazyLoading />}>{/* <Chat /> */}</Suspense>
            ),
          },
        ],
      },

      // Assets routes
      {
        path: "assets",
        element: <ProtectedRoute />,
        children: [
          {
            path: "lyrics",
            element: (
              <Suspense fallback={<LazyLoading />}>{/* <Lyrics /> */}</Suspense>
            ),
          },
          {
            path: "documents",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Documents /> */}
              </Suspense>
            ),
          },
          {
            path: "agreements",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Agreements /> */}
              </Suspense>
            ),
          },
        ],
      },

      // Royalty routes
      {
        path: "royalty",
        element: <ProtectedRoute />,
        children: [
          {
            path: "allroyalty",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <AllRoyalty /> */}
              </Suspense>
            ),
          },
          {
            path: "deposits",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <Deposits /> */}
              </Suspense>
            ),
          },
          {
            path: "payreceive",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <PayReceive /> */}
              </Suspense>
            ),
          },
          {
            path: "paymentschedule",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <PaymentSched /> */}
              </Suspense>
            ),
          },
          {
            path: "salespurchases",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <SalesPurchases /> */}
              </Suspense>
            ),
          },
          {
            path: "license",
            element: (
              <Suspense fallback={<LazyLoading />}>
                {/* <License /> */}
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);