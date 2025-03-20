

import signupSuccessTopBg from "../../assets/image/pre-signup/sign-success-top-bg.png";
import signupSuccessBottomBg from "../../assets/image/pre-signup/signup-success-bottom-bg.png";
import gybLogo from "../../assets/image/pre-signup/gyb-white-logo.png";

const PreSignupSuccess = () => {
  return (
    <div className="h-full flex flex-col">
      <div>
        <img
          src={signupSuccessTopBg}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
      <div className="flex-1 lg:py-10 bg-[#fcc101] flex flex-col justify-center items-center">
        <div className="h-[150px] w-[150px] lg:h-[300px] lg:w-[300px]">
          <img src={gybLogo} alt="" className="h-full w-full object-contain" />
        </div>
        <div className="flex space-x-1 items-end">
          <div>
            <p className="font-bold text-white text-[23px] lg:text-[40px]">
              Thank you,
            </p>
          </div>
          <div>
            <p className="font-bold text-white text-[23px] lg:text-[40px]">
              we've
            </p>
          </div>
          <div>
            <p className="font-extrabold text-white text-[30px] lg:text-[50px]">
              GOT YOUR BACK!
            </p>
          </div>
        </div>

        <div>
          <p className="font-bold text-[#444444] text-[17.5px] lg:text-[29px] mt-1 text-center">
            STAY TUNED FOR UPDATES TO OUR OFFICIAL LAUNCH!
          </p>
        </div>
      </div>
      <div>
        <img
          src={signupSuccessBottomBg}
          alt=""
          className="h-full w-full object-contain"
        />
      </div>
    </div>
  );
};

export default PreSignupSuccess;
