import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'; 
import SignUpStep1 from "./component/SignUpStep1";
import SignUpStep2 from "./component/SignUpStep2";
import SignUpStep3 from './component/SignUpStep3'; 
import musician from '../../assets/image/login/musician.png';
import logo from '../../assets/image/login/logo.png'; 
import { AuthStep, UserDetails } from '@/types/auth';
import { useAuth } from '@/providers/AuthProvider';
import SignUpStep4 from "./component/SignUpStep4";
import SignUpStep5 from "./component/SignUpStep5";

export default function SignUpForm() {
  const navigate = useNavigate();
  const {  userDetails, initialStep } = useAuth();
  
  const [step, setStep] = useState<AuthStep>(initialStep);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserDetails | null>(null);

  useEffect(() => {
 
    if (initialStep === "complete") {
      navigate('/home');
    } else {
      setUserData(userDetails);
      setStep(initialStep);
    }
  }, [initialStep, userDetails, navigate]);

  const handleStepChange = (newStep: AuthStep, newData: Partial<UserDetails> | null = null) => {
    setIsAnimating(true);
    
    if (newData) {
      setUserData(prevData => prevData ? { ...prevData, ...newData } : newData as UserDetails);
    }
    
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 200);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center" 
      style={{
        background: "linear-gradient(267deg, rgba(252,200,3,1) 54%, rgba(165,130,0,1) 100%)"
      }}
    >
      <div className="w-full min-h-[700px] max-w-6xl grid lg:grid-cols-2 p-4 lg:p-8">
        {/* Left Section */}
        <div className="relative hidden lg:flex justify-between p-12 bg-[#C09239] rounded-l-3xl overflow-hidden">
          <img
            src={musician}
            alt="Musician with guitar"
            className="absolute left-0 bottom-0 h-full object-contain z-10 max-w-[65%]"
          />
          <div className="relative z-20 text-white text-center ml-auto max-w-[50%]">
            <img
              src={logo}
              alt="GYB Logo"
              className="w-48 mb-4"
            />
            <h2 className="text-3xl font-medium mb-2">GOT YOUR BACK</h2>
            <h3 className="text-2xl mb-4">UNIVERSAL PORTAL</h3>
            <ul className="space-y-1 text-lg">
              <li>Your Music</li>
              <li>Your Money</li>
              <li>Your Manager</li>
            </ul>
          </div>
        </div>

        {/* Right Section */}
        <div className="bg-white p-6 lg:p-12 rounded-3xl lg:rounded-l-none shadow-xl">
          <div 
            className={`transition-all duration-300 transform ${
              isAnimating ? "opacity-0" : "opacity-100"
            }`}
          >
            {step === "1" && (
              <SignUpStep1 
                onStepComplete={(data) => handleStepChange("2", data)} 
              />
            )}
            
            {step === "2" && (
              <SignUpStep2 
                onBack={() => handleStepChange("1")} 
                onStepComplete={() => handleStepChange("3")} 
                userData={userData} 
              />
            )}
            
            {step === "3" && (
              <SignUpStep3 
                onBack={() => handleStepChange("2")} 
                onStepComplete={(data) => handleStepChange("4", data)} 
                userData={userData}
              />
            )}
            
            {step === "4" && (
              <SignUpStep4 
                onBack={() => handleStepChange("3")} 
                onStepComplete={() => handleStepChange("5")} 
                userData={userData} 
              />
            )}
            
            {step === "5" && (
              <SignUpStep5 
                onBack={() => handleStepChange("4")} 
                onStepComplete={(artistType) => {
                  console.log("Selected artist type:", artistType);
                  navigate('/home');
                }} 
                userData={userData} 
              />
            )}
          </div>
        
        </div>
      </div>
    </div>
  );
}