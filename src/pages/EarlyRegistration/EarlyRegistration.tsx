import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import musicIcon from "../../assets/image/accesscode/music-icon.png";
import spotifyIcon from "../../assets/image/accesscode/spotify-icon.png";
import Otp from "../../components/ui/Otp";
import { sysAccessCode } from "../../constants/accesscode";
import { useDimensions } from "../../hooks/useWindowDimension";
import gybLogo from "../../assets/image/pre-signup/gyb-white-logo.png";
import { useDeferred } from "../../hooks/useDeferred";
import gybCompleteLeftImage from "../../assets/image/gyb-complete-left-image.png";

const EarlyRegistration: React.FC = () => {
  const nav = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [accessCodeError, setAccessCodeError] = useState<string>("");
  const [accessCode, setAccessCode] = useState<string>("");

  const { phone } = useDimensions();
  const { cbDebounce } = useDeferred();

  const onSubmitAccessCode = useCallback(() => {
    setLoading(true);
    setAccessCodeError("");

    cbDebounce(() => {
      if (accessCode.toLowerCase() === sysAccessCode) {
        setAccessCode("");
        nav("/pre-subscription");
      } else {
        setAccessCode("");
        setAccessCodeError(
          "You have entered an Incorrect access code! Please try again."
        );
      }
      setLoading(false);
    });
  }, [accessCode, cbDebounce, nav]);

  return (
    <div
      className="min-h-screen lg:px-32 flex flex-col overflow-x-hidden"
      style={{ backgroundColor: "#FCC703" }}
    >
      <div className="flex items-end justify-center flex-row w-full lg:h-[65vh]">
        {/* Left Section */}
        {phone ? (
          <div className="w-full flex flex-1 items-center flex-col lg:justify-center lg:items-start">
            <div className="h-[100px] w-[100px] translate-y-[20px]">
              <img
                src={gybLogo}
                alt="GYB Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col lg:ml-10">
              <div className="flex space-x-2 lg:flex-col lg:space-x-0">
                <p className="font-extrabold text-[#444444] text-[35px] lg:text-[55px]">
                  GOT YOUR
                </p>
                <p className="font-extrabold text-[#444444] text-[35px] lg:text-[100px]">
                  BACK
                </p>
              </div>
              <div className="flex space-x-1 justify-center">
                <p className="text-white font-bold text-[22.2px]">MUSIC,</p>
                <p className="text-white font-bold text-[22.2px]">BUSINESS,</p>
                <p className="text-white font-bold text-[22.2px]">POWER.</p>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <p className="font-extrabold text-[25px] text-[#444444]">
                  Fully registered
                </p>
                <p className="font-extrabold text-[#444444] text-[16px] mt-1">
                  for all royalties and ownership
                </p>
                <p className="font-extrabold text-[25px] text-[#444444] mt-3">
                  Your music on Spotify
                </p>
                <p className="font-extrabold text-[16px] text-[#444444] mt-1">
                  and 100+ Digital Streaming Platforms
                </p>
                <div className="mt-4 flex items-center space-x-3">
                  <img
                    src={spotifyIcon}
                    alt="Spotify"
                    className="h-[50px] w-[50px] rounded-full"
                  />
                  <div className="h-[50px] w-[50px] bg-[#fafafa] rounded-full flex items-center justify-center">
                    <img
                      src={musicIcon}
                      alt="Music"
                      className="w-[65%] h-[65%] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col justify-center items-end h-[90%] mb-10">
            <img
              src={gybCompleteLeftImage}
              alt="Complete Image"
              className="h-full w-full object-contain"
            />
          </div>
        )}

        {/* Right Section */}
        {!phone && (
          <div className="flex flex-col justify-center items-start h-[73%] mb-10">
            <div className="flex flex-col">
              <div className="flex flex-col relative">
                <p className="font-extrabold text-[#444444] text-[35px] md:text-[25px] lg:text-[55px] text-center">
                  GOT YOUR
                </p>
                <p className="font-extrabold text-[#444444] text-[35px] md:text-[25px] lg:text-[100px] text-center">
                  BACK
                </p>
                <div className="h-[130px] w-[130px] absolute top-[-20%] left-[50%] translate-x-[-50%]">
                  <img
                    src={gybLogo}
                    className="w-full h-full object-contain"
                    alt="GYB Logo"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Access Code Section */}
      <div className="flex flex-col space-y-2 mt-3">
        <p className="font-semibold text-white text-[30px] lg:text-[40px] text-center">
          EARLY ACCESS PRE-SIGNUP
        </p>
        <p className="font-semibold text-[#008EEB] text-[25px] text-center">
          ACCESS CODE
        </p>
        <div className="flex justify-center space-x-3">
          <Otp
            elCount={6}
            loading={loading}
            onFinish={(code) => setAccessCode(code)}
            error={accessCodeError}
          />
        </div>
        <div className="flex justify-center mt-3">
          <button
            className={`px-4 py-1 rounded-full bg-[#008EEB] text-white ${
              !accessCode && "opacity-[0.7]"
            }`}
            onClick={onSubmitAccessCode}
            disabled={!accessCode}
          >
            Submit
          </button>
        </div>
        <div className="mt-3 px-2 text-center">
          <p className="font-semibold text-[#444444] lg:text-[25px]">
            Artists are losing time, money, and ownership.
          </p>
          <p className="font-semibold text-[#444444] lg:text-[25px]">
            Be the first artists to use a new, all-in-one platform for music
            ownership, distribution, and management.
          </p>
          <p className="font-semibold text-white lg:text-[25px] mt-2 pb-2">
            Join the countdown to launch!
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarlyRegistration;
