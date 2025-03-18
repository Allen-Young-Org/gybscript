import React, { useCallback, useState } from "react";
 
import musicIcon from "../../assets/image/accesscode/music-icon.png";
import spotifyIcon from "../../assets/image/accesscode/spotify-icon.png";
 
import { useNavigate } from "react-router-dom";
import { sysAccessCode } from "../../constants/accesscode";
 
import gybLogo from "../../assets/image/pre-signup/gyb-white-logo.png";
 
import gybCompleteLeftImage from "../../assets/image/gyb-complete-left-image.png";
import { useDimensions } from "@/constants/hooks/useWindowDimension";
import { useDeferred } from "@/constants/hooks/useDeferred";
import Otp from "@/components/ui/Otp";

function EarlyRegistration() {
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [accessCodeError, setAccessCodeError] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const { phone } = useDimensions();

  const { cbDebounce } = useDeferred();

  const onSubmitAccessCode = useCallback(() => {
    setLoading(() => true);
    setAccessCodeError(() => "");
    cbDebounce(() => {
      if (accessCode.toLowerCase() === sysAccessCode) {
        setAccessCode(() => "");
        nav("/pre-subscription");
      } else {
        setAccessCode(() => "");
        setAccessCodeError(
          () => "You have entered an Incorrect access code! Please try again.",
        );
      }
      setLoading(() => false);
    });
  }, [accessCode]);

  return (
    <div
      className="min-h-screen lg:px-32 flex flex-col overflow-x-hidden"
      style={{ backgroundColor: "#FCC703" }}
    >
      <div className="flex items-end justify-center flex-row w-full lg:h-[65vh]">
        {/* left */}
        {phone ? (
          <div className="w-full flex flex-1 items-center flex-col lg:justify-center lg:items-start">
            <div className="h-[100px] w-[100px] translate-y-[20px]">
              <img
                src={gybLogo}
                alt=""
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex flex-col lg:ml-10">
              <div className="flex space-x-2 lg:flex-col lg:space-x-0">
                <div className="flex justify-center">
                  <p className="font-extrabold text-[#444444] text-[35px] lg:text-[55px]">
                    GOT YOUR
                  </p>
                </div>
                <div className="flex justify-center">
                  <p className="font-extrabold text-[#444444] text-[35px] lg:text-[100px]">
                    BACK
                  </p>
                </div>
              </div>
              <div className="flex space-x-1 justify-center">
                <div>
                  <p className="text-white font-bold text-[22.2px]">MUSIC,</p>
                </div>
                <div>
                  <p className="text-white font-bold text-[22.2px]">
                    BUSINESS,
                  </p>
                </div>
                <div>
                  <p className="text-white font-bold text-[22.2px]">POWER.</p>
                </div>
              </div>
              <div className="mt-3 flex flex-col items-center">
                <div>
                  <p className="font-extrabold text-[25px] text-[#444444]">
                    Fully registered
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-[#444444] text-[16px] mt-1">
                    for all royalties and ownership
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-[25px] text-[#444444] mt-3">
                    Your music on Spotify
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-[16px] text-[#444444] mt-1">
                    and 100 + Digital Streaming Platforms
                  </p>
                </div>
                <div className="mt-4 flex items-center space-x-3">
                  <div className="h-[50px] w-[50px] rounded-full">
                    <img
                      src={spotifyIcon}
                      alt=""
                      className="w-[100%] h-[100%] object-contain"
                    />
                  </div>{" "}
                  <div className="h-[50px] w-[50px] bg-[#fafafa] rounded-full flex items-center justify-center">
                    <img
                      src={musicIcon}
                      alt=""
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
              alt=""
              className="h-full w-full object-contain"
            />
            {/* <div>
              <p className="font-extrabold text-[#444444] lg:text-[39.3px] text-right">
                A SOLUTION. BY ARTISTS, FOR ARTISTS.
              </p>
            </div>
            <div className="lg:w-[80%] flex items-end justify-center lg:justify-end space-x-2">
              <div className="lg:mt-[40px]">
                <p className="font-extrabold lg:text-right text-white text-[40px] lg:text-[60px]">
                  THE
                </p>
              </div>
              <div className="lg:flex-1">
                <p className="font-extrabold lg:text-right text-white text-[65px] md:text-[50px] lg:text-[110px]">
                  UNIVERSAL
                </p>
              </div>
            </div>

            <div className="lg:w-[80%] flex items-end justify-center lg:justify-between space-x-3">
              <div>
                <p className="font-extrabold text-right text-white text-[65px] md:text-[50px] lg:text-[110px]">
                  PORTAL
                </p>
              </div>
              <div>
                <p className="font-extrabold text-white text-[35px] md:text-[30px] lg:text-[38px]">
                  All-IN-ONE
                </p>
              </div>
            </div>

            <div className="w-full lg:w-full flex items-end justify-center lg:justify-end space-x-3 mt-1">
              <div>
                <p className="font-bold text-[16px] md:text-[13px] lg:text-[27.5px] text-[#444444]">
                  MUSIC DISTRIBUTION
                </p>
              </div>
              <div>
                <p className="font-bold text-[16px] md:text-[12px] lg:text-[27.5px] text-[#444444]">
                  ~
                </p>
              </div>
              <div>
                <p className="font-bold text-[16px] md:text-[13px] lg:text-[27.5px] text-[#444444]">
                  MANAGEMENT
                </p>
              </div>
              <div>
                <p className="font-bold text-[16px] md:text-[12px] lg:text-[27.5px] text-[#444444]">
                  ~
                </p>
              </div>
              <div>
                <p className="font-bold text-[16px] md:text-[13px] lg:text-[27.5px] text-[#444444]">
                  REGISTRATION
                </p>
              </div>
            </div> */}
          </div>
        )}
        {/* center */}
        {/* {!phone && (
          <div className="h-full w-[20%] flex items-end">
            <div className="h-[90%] w-full">
              <img
                style={{ width: "100%", height: "100%" }}
                className="object-contain"
                src={LoloImage}
              ></img>
            </div>
          </div>
        )} */}
        {/* right */}
        {!phone && (
          <div className="flex flex-col justify-center items-start h-[73%] mb-10">
            <div className="flex flex-col">
              <div className="flex flex-col relative">
                <div className="flex justify-center translate-y-[40px]">
                  <p
                    className="font-extrabold text-[#444444] text-[35px] md:text-[25px] lg:text-[55px]"
                    style={{ letterSpacing: "-3px" }}
                  >
                    GOT YOUR
                  </p>
                </div>
                <div className="flex justify-center">
                  <p
                    className="font-extrabold text-[#444444] text-[35px] md:text-[25px]  lg:text-[100px]"
                    style={{ letterSpacing: "-7px" }}
                  >
                    BACK
                  </p>
                </div>
                <div className="h-[130px] w-[130px] absolute top-[-20%] left-[50%] translate-x-[-50%]">
                  <img
                    src={gybLogo}
                    className="w-full h-full object-contain"
                    alt=""
                  />
                </div>
              </div>
              <div className="flex space-x-1 justify-center md:-ml-10 lg:-ml-0">
                <div>
                  <p className="text-white font-bold md:text-[18px] lg:text-[22.2px] text-[22.2px]">
                    MUSIC,
                  </p>
                </div>
                <div>
                  <p className="text-white font-bold md:text-[18px] lg:text-[22.2px] text-[22.2px]">
                    BUSINESS,
                  </p>
                </div>
                <div>
                  <p className="text-white font-bold md:text-[18px] lg:text-[22.2px] text-[22.2px]">
                    POWER.
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-col items-center md:-ml-10 lg:-ml-0">
                <div>
                  <p className="font-extrabold text-[25px] text-[#444444]">
                    Fully registered
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-[#444444] text-[16px] mt-1">
                    for all royalties and ownership
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-[25px] text-[#444444] mt-3">
                    Your music on Spotify
                  </p>
                </div>
                <div>
                  <p className="font-extrabold text-[16px] text-[#444444] mt-1">
                    and 100 + Digital Streaming Platforms
                  </p>
                </div>
                <div className="mt-4 flex items-center space-x-3">
                  <div className="h-[50px] w-[50px] rounded-full">
                    <img
                      src={spotifyIcon}
                      alt=""
                      className="w-[100%] h-[100%] object-contain"
                    />
                  </div>{" "}
                  <div className="h-[50px] w-[50px] bg-[#fafafa] rounded-full flex items-center justify-center">
                    <img
                      src={musicIcon}
                      alt=""
                      className="w-[65%] h-[65%] object-contain"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-2 mt-3">
        <div>
          <p className="font-semibold text-white text-[30px] lg:text-[40px] text-center">
            EARLY ACCESS PRE-SIGNUP
          </p>
        </div>
        <div>
          <p className="font-semibold text-[#008EEB] text-[25px] text-center">
            ACCESS CODE
          </p>
        </div>
        <div className="flex justify-center space-x-3">
          <Otp
            elCount={6}
            loading={loading}
            onFinish={code => setAccessCode(() => code)}
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
        <div className="mt-3 px-2">
          <div className="text-center">
            <p className="font-semibold text-[#444444] lg:text-[25px]">
              Artists are losing time, money, and ownership.
            </p>
          </div>
          <div className="text-center">
            <p className="font-semibold text-[#444444] lg:text-[25px]">
              Be the first artists to use a new, all-in-one platform for music
              ownership, distribution and management.
            </p>
          </div>
          <div className="text-center mt-2 pb-2">
            <p className="font-semibold text-white lg:text-[25px]">
              Join the countdown to launch!
            </p>
          </div>
        </div>
      </div>
      {phone && (
        <div className="flex items-start w-full relative lg:w-[20%] lg:h-full lg:mt-0">
          <img
            src={gybCompleteLeftImage}
            alt=""
            className="h-full w-full object-contain"
          />
          {/* <div className="flex w-[60%] md:w-[46%] flex-col justify-center lg:items-end">
            <div className="lg:w-[80%]">
              <p className="font-extrabold text-[#444444] text-[14.7px] text-center md:text-[40px] md:text-right">
                A SOLUTION. BY ARTISTS, FOR ARTISTS.
              </p>
            </div>
            <div className="lg:w-[80%] flex items-end justify-center lg:justify-end space-x-1">
              <div className="lg:mt-[40px]">
                <p className="font-extrabold lg:text-right text-white text-[20px] lg:text-[60px]">
                  THE
                </p>
              </div>
              <div className="lg:flex-1">
                <p className="font-extrabold lg:text-right text-white text-[39px] lg:text-[110px]">
                  UNIVERSAL
                </p>
              </div>
            </div>

            <div className="lg:w-[80%] flex items-end justify-center lg:justify-between space-x-3">
              <div>
                <p className="font-extrabold text-right text-white text-[39px] lg:text-[110px]">
                  PORTAL
                </p>
              </div>
              <div>
                <p className="font-extrabold text-white text-[20px] lg:text-[38px]">
                  All-IN-ONE
                </p>
              </div>
            </div>

            <div className="w-full lg:w-[80%] flex items-end justify-center lg:justify-end space-x-1 mt-1">
              <div>
                <p className="font-bold text-[11px] lg:text-[27.5px] text-[#444444]">
                  MUSIC DISTRIBUTION
                </p>
              </div>
              <div>
                <p className="font-bold text-[10.5px] lg:text-[27.5px] text-[#444444]">
                  ~
                </p>
              </div>
              <div>
                <p className="font-bold text-[11px] lg:text-[27.5px] text-[#444444]">
                  MANAGEMENT
                </p>
              </div>
              <div>
                <p className="font-bold text-[10.5px] lg:text-[27.5px] text-[#444444]">
                  ~
                </p>
              </div>
              <div>
                <p className="font-bold text-[11px] lg:text-[27.5px] text-[#444444]">
                  REGISTRATION
                </p>
              </div>
            </div>
          </div>
          <div className="h-[30vh] lg:h-[90%] -ml-2">
            <img
              style={{ width: "100%", height: "100%" }}
              className="-mt-4"
              src={LoloImage}
            ></img>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default EarlyRegistration;
