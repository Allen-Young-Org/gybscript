import { REGEX } from "@/constants/regexp";
import { ErrorMessage } from '@hookform/error-message';
import { addDoc, collection } from "firebase/firestore";
import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import homeIcon from "../../assets/image/landingPage/home.png";
import royaltyIcon from "../../assets/image/landingPage/royalty.png";
import musicIcon from "../../assets/image/landingPage/music.png";
import analyticsIcon from "../../assets/image/landingPage/analytics.png";
import communityIcon from "../../assets/image/landingPage/community.png";
import assetsIcon from "../../assets/image/landingPage/assets.png";
import promoteIcon from "../../assets/image/landingPage/promote.png";
import { db } from "@/firebase";

// Define interface for form data
interface FormData {
  first_name: string;
  last_name: string;
  artist_name: string;
  email_address: string;
  activity_type: string;
  distribution_type: string;
}

// Define interface for icon items
interface IconItem {
  id: string;
  icon: string;
  top: string;
  left?: string;
  right?: string;
  bottom?: string;
}

const PreSubs: React.FC = () => {
  const [savingUser, setSavingUser] = useState<boolean>(false);

  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm<FormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      artist_name: "",
      email_address: "",
      activity_type: "",
      distribution_type: "",
    },
  });

  const nav = useNavigate();

  const icons: IconItem[] = [
    { id: "home", icon: homeIcon, top: "-15%", left: "43.5%" },
    { id: "money", icon: royaltyIcon, top: "-5%", left: "12%" },
    { id: "music", icon: musicIcon, top: "-5%", right: "12%" },
    { id: "chart", icon: analyticsIcon, top: "18%", left: "-9%" },
    { id: "users", icon: communityIcon, top: "18%", right: "-9%" },
    { id: "briefcase", icon: assetsIcon, top: "50%", left: "-14%" },
    { id: "speaker", icon: promoteIcon, top: "50%", right: "-14%" },
  ];

  const onFormSubmit = useCallback(async (data: FormData): Promise<void> => {
    try {
      setSavingUser(true);
      await addDoc(collection(db, "pre_signup_users"), data);
      setSavingUser(false);
      nav(`/pre-signup/success`);
    } catch (error) {
      console.error("Error adding document: ", error);
      setSavingUser(false);
    }
  }, [nav]);

  return (
    <div
      className="flex flex-col items-center py-14 space-y-10"
      style={{
        background:
          "linear-gradient(to right, #383533, #ececec, #ececec, #383533)",
      }}
    >
      <div className="relative w-[300px] h-[300px] border-[40px] border-white rounded-full flex justify-center items-center">
        <div className="absolute w-full h-full bg-transparent rounded-full flex flex-col items-center justify-center shadow-lg">
          <h1 className="text-3xl font-bold">WholeNote</h1>
          <p className="text-sm text-gray-600">ONE-STOP VIRTUAL RECORD LABEL</p>
          <p className="text-xs text-yellow-500">by Got Your Back</p>
        </div>

        {icons.map(item => (
          <div
            key={item.id}
            className="absolute text-2xl cursor-pointer h-[23px] w-[23px] transition"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
          >
            <img src={item.icon} className="object-contain h-full w-full" alt={item.id} />
          </div>
        ))}
      </div>

      <div className="flex flex-col space-y-3">
        <div className="w-[300px]">
          <p className="font-bold text-[30px] text-[#fcc101] text-center">
            MUSIC DISTRIBUTION
          </p>
          <p className="text-center">
            Upload your song to Spotify and 100+ streaming apps.
          </p>
        </div>
        <div className="w-[300px]">
          <p className="font-bold text-[30px] text-[#fcc101] text-center">
            MUSIC PUBLISHING
          </p>
          <p className="text-center">
            We make you the publisher, ensuring ownership and maximum royalty
            potential.
          </p>
        </div>
        <div className="w-[300px]">
          <p className="font-bold text-[30px] text-[#fcc101] text-center">
            COLLECT ALL ROYALTIES
          </p>
          <p className="text-center">
            Advanced automated artist/song registration system to get all the
            money you're owed.
          </p>
        </div>
        <div className="w-[300px]">
          <p className="font-bold text-[30px] text-[#fcc101] text-center">
            PROMOTION TOOLS
          </p>
          <p className="text-center">
            Keep your audience informed with simultaneous posts to your socials,
            hyperfollow, and other tools so they know about new music and
            upcoming shows.
          </p>
        </div>
        <div className="w-[300px]">
          <p className="font-bold text-[30px] text-[#fcc101] text-center">
            AND so much more.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-10 w-[300px]">
        <div className="flex flex-col">
          <p className="text-center text-[20px] font-bold">No Fee.</p>
          <p className="text-center text-[30px] font-bold">PRE-SUBSCRIBE</p>
        </div>

        <p className="text-center">
          Be among the first indenpendent artists to try the newest and most
          robust way of releasing music and getting the money you're owed.
        </p>
      </div>

      <form
        className="flex-1 flex flex-col space-y-5 py-5 w-[300px]"
        onSubmit={handleSubmit(onFormSubmit)}
      >
        {/* firstname */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col w-full">
            <input
              placeholder="First Name"
              className="border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none m-0 p-0 leading-none tracking-tighter"
              {...register("first_name", {
                maxLength: {
                  value: 15,
                  message: "First name exceeded to maximum length.",
                },
                required: "First name is required.",
                pattern: {
                  value: REGEX.plainText,
                  message: "Invalid first name.",
                },
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="first_name"
            render={({ message }) => (
              <p className="w-full text-red-500 text-lg">{message}</p>
            )}
          />
        </div>
        {/* lastname */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col w-full">
            <input
              placeholder="Last Name"
              className="border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none m-0 p-0 leading-none tracking-tighter"
              {...register("last_name", {
                maxLength: {
                  value: 15,
                  message: "Last name exceeded to maximum length.",
                },
                required: "Last name is required.",
                pattern: {
                  value: REGEX.plainText,
                  message: "Invalid last name.",
                },
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="last_name"
            render={({ message }) => (
              <p className="w-full text-red-500 text-lg">{message}</p>
            )}
          />
        </div>
        {/* artist name */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col w-full">
            <input
              placeholder="Artist Name"
              className="border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none m-0 p-0 leading-none tracking-tighter"
              {...register("artist_name", {
                maxLength: {
                  value: 20,
                  message: "Artist name exceeded to maximum length.",
                },
                required: "Artist name is required.",
                pattern: {
                  value: REGEX.plainText,
                  message: "Invalid artist name.",
                },
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="artist_name"
            render={({ message }) => (
              <p className="w-full text-red-500 text-lg">{message}</p>
            )}
          />
        </div>
        {/* emailaddress */}
        <div className="flex flex-col items-center">
          <div className="flex flex-col w-full">
            <input
              placeholder="Email Address"
              className="border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none"
              {...register("email_address", {
                maxLength: {
                  value: 100,
                  message: "Email address exceeded to maximum length.",
                },
                required: "Email address is required.",
                pattern: {
                  value: REGEX.email,
                  message: "Invalid email address.",
                },
              })}
            />
          </div>
          <ErrorMessage
            errors={errors}
            name="email_address"
            render={({ message }) => (
              <p className="w-full text-red-500 text-lg">{message}</p>
            )}
          />
        </div>
        {/* activity type */}
        <div className="flex flex-col items-center">
          <textarea
            className="w-full border border-[#444444] text-[#444444] rounded-md p-2 focus:outline-none max-h-48"
            placeholder="What do you do related to music?"
            {...register("activity_type", {
              required: "This field is required.",
              maxLength: {
                value: 220,
                message: "Activity type exceeded to maximum length.",
              },
            })}
          />
          <ErrorMessage
            errors={errors}
            name="activity_type"
            render={({ message }) => (
              <p className="w-full text-red-500 text-lg">{message}</p>
            )}
          />
        </div>
        {/* distribution type */}
        <div className="flex flex-col items-center">
          <textarea
            className="w-full border border-[#444444] text-[#444444] rounded-md p-2 focus:outline-none max-h-48"
            placeholder="How do you distribute music now?"
            {...register("distribution_type", {
              required: "This field is required.",
              maxLength: {
                value: 220,
                message: "Distribution type exceeded to maximum length.",
              },
            })}
          />
          <ErrorMessage
            errors={errors}
            name="distribution_type"
            render={({ message }) => (
              <p className="w-full text-red-500 text-lg">{message}</p>
            )}
          />
        </div>
        <button
          className="text-white bg-[#008EEB] px-5 py-1 rounded-full"
          type="submit"
          disabled={savingUser}
        >
          {savingUser ? "Saving..." : "Submit"}
        </button>
        <p className="text-center font-bold text-[30px]">LAUNCHING 2025</p>
      </form>
    </div>
  );
};

export default PreSubs;