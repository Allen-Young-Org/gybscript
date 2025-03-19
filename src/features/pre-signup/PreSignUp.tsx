import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import ReactPlayer from "react-player";

import { db } from "@/firebase";
import { REGEX } from "@/constants/regexp";

import playIcon from "../../assets/image/pre-signup/play-icon.png";
import preSignUpBg from "../../assets/image/pre-signup/pre-signup-bg.png";
import gybWhiteLogo from "../../assets/image/pre-signup/gyb-white-logo.png";

// Interface for form data
interface PreSignupFormData {
  first_name: string;
  last_name: string;
  artist_name: string;
  email_address: string;
  survey: string;
}

const PreSignUp = (): JSX.Element => {
  const nav = useNavigate();
  const vidRef = useRef<ReactPlayer>(null);
  const [toggleEmbesVideo, setToggleEmbedVideo] = useState<boolean>(false);
  const [savingUser, setSavingUser] = useState<boolean>(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreSignupFormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      artist_name: "",
      email_address: "",
      survey: "",
    },
  });

  const embesVideoModal = useMemo(() => {
    return (
      toggleEmbesVideo && (
        <div
          onClick={() => setToggleEmbedVideo(false)}
          className="fixed top-0 left-0 w-full h-full bg-white/30 flex items-center justify-center backdrop-blur-sm"
        >
          <div
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            className="h-[25%] w-[90%] lg:h-[50%] lg:w-[50%] rounded-lg overflow-hidden"
          >
            <ReactPlayer
              ref={vidRef}
              url={"https://www.youtube.com/watch?v=fo353IwDkY8"}
              height="100%"
              width="100%"
              playing
              controls
            />
          </div>
        </div>
      )
    );
  }, [toggleEmbesVideo]);

  const onFormSubmit = useCallback(async (data: PreSignupFormData): Promise<void> => {
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
    <>
      <div className="h-full flex flex-col lg:flex-row">
        {/* left */}
        <div className="lg:w-[60%] h-[30vh] lg:h-[100vh] bg-gradient-to-r from-[#02A6F3] to-[#026796] relative">
          <div className="absolute top-0 w-full h-full lg:translate-x-[6%]">
            <img
              src={gybWhiteLogo}
              alt=""
              className="w-full h-full object-fill"
            />
          </div>
          <div className="absolute bottom-0 w-full h-[90%]">
            <img
              src={preSignUpBg}
              alt=""
              className="w-full h-full object-contain "
            />
          </div>
          <div className="w-full flex flex-col items-center absolute bottom-20 left-[50%] translate-x-[-50%] lg:hidden">
            <div>
              <p>test</p>
              <p
                className="font-extrabold text-white text-[40px] m-0 p-0 leading-none tracking-tighter"
                style={{ textShadow: "2px 2px 4px #444444" }}
              >
                GOT YOUR BACK
              </p>
            </div>
            <div className="mt-2">
              <p
                className="font-extrabold text-[#fcc101] text-[25px] m-0 p-0 leading-none tracking-tighter"
                style={{ textShadow: "2px 2px 4px #444444" }}
              >
                EARLY ACCESS PRE-SIGNUP
              </p>
            </div>
          </div>
        </div>
        {/* right */}
        <div className="flex-1 bg-[#fcc101] flex flex-col lg:overflow-y-auto lg:pt-10 lg:w-[40%]">
          {/* top */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <div className="hidden lg:block">
              <div>
                <p className="font-extrabold text-white text-[50px] m-0 p-0 leading-none tracking-tighter">
                  GOT YOUR BACK
                </p>
              </div>
              <div className="mt-2">
                <p className="font-extrabold text-[#444444] text-[30px] m-0 p-0 leading-none tracking-tighter">
                  EARLY ACCESS PRE-SIGNUP
                </p>
              </div>
            </div>
            <div className="rounded-lg mt-3 overflow-hidden h-[150px] w-[300px] lg:h-[200px] lg:w-[400px] relative">
              <ReactPlayer
                ref={vidRef}
                url={"https://www.youtube.com/watch?v=fo353IwDkY8"}
                height="100%"
                width="100%"
                light
                playing={false}
              />
              <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                <button
                  className="h-[50px] w-[50px] rounded-full flex items-center justify-center bg-white"
                  onClick={() => setToggleEmbedVideo(true)}
                >
                  <img src={playIcon} alt="" />
                </button>
              </div>
            </div>
          </div>
          {/* bottom */}
          <form
            className="flex-1 flex flex-col space-y-5 py-5"
            onSubmit={handleSubmit(onFormSubmit)}
          >
            {/* firstname */}
            <div className="flex flex-col items-center w-[90%] lg:w-[57%] self-center">
              <div className="flex items-center w-full justify-between">
                <p className="font-semibold text-[#444444] text-[23px] m-0 p-0 leading-none tracking-tighter">
                  First Name
                </p>
                <input
                  placeholder="Enter first name"
                  className="w-[70%] border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none m-0 p-0 leading-none tracking-tighter"
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
            <div className="flex flex-col items-center w-[90%] lg:w-[57%] self-center">
              <div className="flex items-center w-full justify-between">
                <p className="font-semibold text-[#444444] text-[23px] m-0 p-0 leading-none tracking-tighter">
                  Last Name
                </p>
                <input
                  placeholder="Enter last name"
                  className="w-[70%] border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none"
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
            {/* artistname */}
            <div className="flex flex-col items-center w-[90%] lg:w-[57%] self-center">
              <div className="flex items-center w-full justify-between">
                <p className="font-semibold text-[#444444] text-[23px] m-0 p-0 leading-none tracking-tighter">
                  Artist Name
                </p>
                <input
                  placeholder="Enter artist name"
                  className="w-[70%] border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none"
                  {...register("artist_name", {
                    maxLength: {
                      value: 15,
                      message: "Artist name exceeded to maximum length.",
                    },
                    required: "Artist name is required.",
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
            <div className="flex flex-col items-center w-[90%] lg:w-[57%] self-center">
              <div className="flex items-center w-full justify-between">
                <p className="font-semibold text-[#444444] text-[23px] m-0 p-0 leading-none tracking-tighter">
                  Email Address
                </p>
                <input
                  placeholder="Enter email address"
                  className="w-[70%] border border-[#444444] text-[#444444] rounded-full px-3 py-1 focus:outline-none"
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
            {/* survey */}
            <div className="flex flex-col space-y-2 items-center w-[90%] lg:w-[57%] self-center">
              <p className="font-semibold text-[#444444] text-xl">
                What do you do related to music?
              </p>
              <ErrorMessage
                errors={errors}
                name="survey"
                render={({ message }) => (
                  <p className="w-full text-red-500 text-lg text-center">
                    {message}
                  </p>
                )}
              />
              <textarea
                className="w-full border border-[#444444] text-[#444444] rounded-md p-2 focus:outline-none max-h-48"
                {...register("survey", {
                  required: "This field is required.",
                  maxLength: {
                    value: 220,
                    message: "Survey exceeded to maximum length.",
                  },
                })}
              />
            </div>
            <div className="flex justify-center">
              <button
                className="text-white bg-[#008EEB] px-5 py-1 w-[20%] rounded-full"
                type="submit"
                disabled={savingUser}
              >
                {savingUser ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
          <div className="flex justify-center items-center absolute top-5 left-5">
            <button
              className="text-white border-2 border-white h-[50px] w-[50px] rounded-full"
              type="button"
              onClick={() => nav("/faq")}
            >
              FAQ
            </button>
          </div>
        </div>
      </div>
      {embesVideoModal}
    </>
  );
};

export default PreSignUp;