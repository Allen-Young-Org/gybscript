/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

import { useAuth } from "@/providers/AuthProvider";
import LoadingSpinner from "@/components/layout/LoadingSpinner";
import RegistrationStep0 from "./Components/RegistrationStep0";
import RegistrationStep1 from "./Components/RegistrationStep1";
import RegistrationStep2 from "./Components/RegistrationStep2";
import RegistrationStep3 from "./Components/RegistrationStep3";
import RegistrationStep4 from "./Components/RegistrationStep4";


// Define types for registration steps
export type RegistrationStep = "0" | "1" | "2" | "3" | "4";

// Define user data interface based on the form fields in all steps
export interface UserData {
  // Personal Information
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;

  // Address
  street_address_1?: string;
  street_address_2?: string;
  street_city?: string;
  street_state?: string;
  street_country?: string;
  street_zip?: string;

  // Identity
  dob?: string;
  publishing_company?: string;
  citizenship?: string;
  ssn?: string;
  label_organization?: string;
  validIdUrl?: string;
  validId?: string | null | undefined | ArrayBuffer;

  // Banking
  bank_name?: string;
  routing_number?: string;
  account_name?: string;
  account_number?: string;

  // Additional fields
  searchableName?: string;
  [key: string]: any; // Allow for additional properties
}

const Registration: React.FC = () => {
  const [step, setStep] = useState<RegistrationStep>("0");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const { currentUser, refreshUserDetails } = useAuth();

  const handleStepChange = (newStep: RegistrationStep, newData: Partial<UserData> | null = null): void => {
    setIsAnimating(true);
    if (newData) {
      setUserData(prevData => prevData ? { ...prevData, ...newData } : newData as UserData);
    }
    setTimeout(() => {
      setStep(newStep);
      setIsAnimating(false);
    }, 200);
  };

  // useEffect(() => {
  //   if (currentUser?.email) {
  //     refreshUserDetails().then((data) => {
  //       if (data) {
  //         // Convert auth data to registration format if needed
  //         setUserData({
  //           first_name: data.firstName,
  //           last_name: data.lastName,
  //           email: data.email,
  //           phone: data.phone,
  //           // Map other fields as needed
  //         });
  //       }
  //     });
  //   }
  // }, [currentUser, refreshUserDetails]);
  useEffect(() => {
    if (currentUser) {
      refreshUserDetails().then(data => {
        setUserData(data)
      })
    }
  }, [])
  console.log(` this is Step ${step} data`, userData);

  const handleRegistrationComplete = (finalData: UserData): void => {
    console.log("Registration completed with data:", finalData);
  };

  return (
    <div className="mx-auto py-8 px-4">
      {isSubmitting && <LoadingSpinner />}

      <div className={`transition-all duration-300 transform ${isAnimating ? "opacity-0" : "opacity-100"}`}>
        {step === "0" && userData !== null && (
          <RegistrationStep0
            onStepComplete={(data: Partial<UserData>) => handleStepChange("1", data)}
            userData={userData}
          />
        )}
        {step === "1" && userData !== null && (
          <RegistrationStep1
            onStepComplete={(data: Partial<UserData>) => handleStepChange("2", data)}
            onBack={() => handleStepChange("0")}
            userData={userData}
          />
        )}
        {step === "2" && userData !== null && (
          <RegistrationStep2
            onBack={() => handleStepChange("1")}
            onStepComplete={(data: Partial<UserData>) => handleStepChange("3", data)}
            userData={userData}
          />
        )}
        {step === "3" && userData !== null && (
          <RegistrationStep3
            onBack={() => handleStepChange("2")}
            onStepComplete={(data: Partial<UserData>) => handleStepChange("4", data)}
            userData={userData}
          />
        )}
        {step === "4" && userData !== null && (
          <RegistrationStep4
            userData={userData}
            onBack={() => handleStepChange("3")}
            onEdit={() => handleStepChange("1")}
            onStepComplete={handleRegistrationComplete}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default Registration;