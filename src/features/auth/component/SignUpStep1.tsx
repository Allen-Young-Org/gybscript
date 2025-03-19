/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { auth, db } from "@/firebase";
import { v4 as uuidv4 } from "uuid";
import debounce from "lodash/debounce";
import bcrypt from "bcryptjs";
import {
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import {
  doc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
 
import { Button } from "@/components/ui/button";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Checkbox } from "@/components/ui/checkbox"; 
import logoBrown from '../../../assets/image/login/GYB-Logo-1.png';
import googleIcon from '../../../assets/google.svg';
import appleIcon from '../../../assets/apple-icon.png'; 
import { UserDetails } from "@/types/auth";

interface SignUpStep1Props {
  onStepComplete: (data: Partial<UserDetails>) => void;
}

interface FormValues {
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  special: boolean;
  alphanumeric: boolean;
}

const SignUpStep1 = ({ onStepComplete }: SignUpStep1Props) => { 
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEmailChecking, setIsEmailChecking] = useState<boolean>(false);
  const [emailExists, setEmailExists] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    special: false,
    alphanumeric: false,
  });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<FormValues>();

  const password = watch("password", "");
  const email = watch("email", "");
 
  const checkEmailExistence = async (email: string): Promise<void> => {
    try {
      setIsEmailChecking(true);
      const signInMethods = await fetchSignInMethodsForEmail(auth, email);

      const usersRef = collection(db, "user_registration");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      const exists = signInMethods.length > 0 || !querySnapshot.empty;
      setEmailExists(exists);

      if (exists) {
        setError("email", {
          type: "manual",
          message: "This email is already registered",
        });
      } else {
        clearErrors("email");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      setError("email", {
        type: "manual",
        message: "Error checking email availability",
      });
    } finally {
      setIsEmailChecking(false);
    }
  };
 
  const debouncedCheckEmail = debounce(checkEmailExistence, 500);

  useEffect(() => {
    if (email && /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      debouncedCheckEmail(email);
    }
    return () => debouncedCheckEmail.cancel();
  }, [email]);

  useEffect(() => {
    if (password) {
      setPasswordValidation({
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        alphanumeric: /(?=.*[a-zA-Z])(?=.*[0-9])/.test(password),
      });
    }
  }, [password]);

  const validatePassword = (value: string): boolean | string => {
    if (value.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(value))
      return "Password must contain at least 1 uppercase letter";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value))
      return "Password must contain at least 1 special character";
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value))
      return "Password must contain both letters and numbers";
    return true;
  };

  const handleFormSubmit = async (data: FormValues): Promise<void> => {
    if (isLoading || !termsAccepted) return;

    try {
      setIsLoading(true);
 
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
 
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(data.password, salt);
 
      const userId = uuidv4();
      const userData: Partial<UserDetails> = {
        id: userId,
        authId: userCredential.user.uid,
        email: data.email.toLowerCase(),
        created_pasword: hashedPassword,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
        emailVerified: false,
        currentStep: "1",
        status: "pending",
        account_name: "",
        account_type: "",
        age18orAbove: false,
        alt_name: "",
        artist_band_name: "",
        bank_name: "",
        bio: "",
        business_title: "",
        citizenship: "",
        completeDetails: false,
        dob: "",
        facebook_link: "",
        first_name: "",
        instagram_link: "",
        label_organization: "",
        last_name: "",
        mailing_address_1: "",
        mailing_address_2: "",
        mailing_city: "",
        mailing_country: "",
        mailing_state: "",
        mailing_zip: "",
        middle_name: "",
        performer_ch_both: "",
        phone: "",
        publishing_company: "",
        registering_type: "",
        routingNumber: "",
        ssn: "",
        street_address_1: "",
        street_address_2: "",
        street_city: "",
        street_country: "",
        street_state: "",
        street_zip: "",
        tiktok_link: "",
        twitter_link: "",
        website_link: "",
        youtube_link: ""
      }; 
      await setDoc(doc(db, "user_registration", userId), userData);
 
      onStepComplete(userData);
 
    } catch (error: any) {
      console.error("Error during signup:", error); 
      if (error.code === "auth/email-already-in-use") {
        setError("email", {
          type: "manual",
          message: "This email is already registered",
        });
      } else {
        setError("root.serverError", {
          type: "manual",
          message: "An error occurred during registration",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex lg:hidden justify-center mb-6">
        <img src={logoBrown} alt="GYB Logo" className="w-24" />
      </div>

      <h2 className="text-2xl text-[#C09239] font-bold mb-2 text-center">
        CREATE YOUR ACCOUNT
      </h2>
      <div className="flex justify-center gap-2 mb-2">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`w-3 h-3 rounded-full ${
              dot === 1 ? "bg-[#C09239]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <div className="space-y-3 mb-6">
        <Button
          variant="outline"
          className="bg-[#F7F7F7] h-9 border border-[#CFD8E6] font-normal !font-poppins text-[12px] leading-[1.125rem] mt-2 cursor-pointer text-[#121212] w-full"
          disabled={isLoading}
        >
          <img src={googleIcon} className="w-5 h-5" alt="Google" />
          Sign in with Google
        </Button>

        <Button
          variant="outline"
          className="w-full flex hover:bg-black hover:text-white items-center justify-center mt-2 gap-2 bg-black text-white text-[12px] leading-[1.125rem] font-normal !font-poppins"
          disabled={isLoading}
        >
          <img src={appleIcon} className="w-8 h-8" alt="Apple" />
          Sign in with Apple
        </Button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="relative">
          <FloatingLabelInput
            label="Email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            error={errors.email?.message}
            disabled={isLoading}
            value={email}
            onChange={(e) => register("email").onChange(e)}
          />
          {isEmailChecking && (
            <span
              className={`absolute right-3 top-1/2 ${
                errors.email?.message ? "top-1/3" : "top-1/2"
              } -translate-y-1/2 text-sm text-gray-500}`}
            >
              <svg
                className="animate-spin h-5 w-5 text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          )}
        </div>

        <div className="relative">
          <FloatingLabelInput
            label="Password"
            type={showPassword ? "text" : "password"}
            {...register("password", {
              required: "Password is required",
              validate: validatePassword,
            })}
            error={errors.password?.message}
            disabled={isLoading}
            value={password}
            onChange={(e) => register("password").onChange(e)}
          />
          <button
            type="button"
            className={`absolute right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${
              errors.password?.message ? "top-1/3" : "top-1/2"
            }`}
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="relative">
          <FloatingLabelInput
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            {...register("confirmPassword", {
              required: "Please confirm your password",
              validate: (value) =>
                value === password || "Passwords don't match",
            })}
            error={errors.confirmPassword?.message}
            disabled={isLoading}
          />
          <button
            type="button"
            className={`absolute right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${
              errors.confirmPassword?.message ? "top-1/3" : "top-1/2"
            }`}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
          >
            {showConfirmPassword ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="text-sm text-gray-500 space-y-1 font-poppins">
          <p className="font-poppins">Password requirements:</p>
          <ul className="list-disc pl-5 text-xs space-y-1 font-poppins">
            <li
              className={`font-poppins ${
                passwordValidation.length ? "text-green-500" : ""
              }`}
            >
              At least 8 characters in length
            </li>
            <li
              className={`font-poppins ${
                passwordValidation.uppercase ? "text-green-500" : ""
              }`}
            >
              1 uppercase letter
            </li>
            <li
              className={`font-poppins ${
                passwordValidation.special ? "text-green-500" : ""
              }`}
            >
              1 special character
            </li>
            <li
              className={`font-poppins ${
                passwordValidation.alphanumeric ? "text-green-500" : ""
              }`}
            >
              A combination of letters & numbers
            </li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 flex items-center space-x-1">
          <Checkbox
            id="terms1"
            checked={termsAccepted}
            onCheckedChange={(checked) => 
              setTermsAccepted(checked === true)
            }
            disabled={isLoading}
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="terms1"
              className="font-poppins text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I agree with privacy policy and terms & conditions
            </label>
          </div>
        </div>

        {errors.root?.serverError && (
          <p className="text-sm text-red-500">{errors.root.serverError.message}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-[#C09239] hover:bg-[#C09239]/90 text-white"
          disabled={isLoading || !termsAccepted || emailExists}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </Button>
        <p className="text-sm text-gray-500 font-poppins text-center m-0">
          <span className="text-gray-600 font-poppins text-sm text-center">
            Already have an{" "}
          </span>
          <Link
            to="/user_sign_in"
            className="text-[#C09239] font-poppins hover:text-[#aa8233]"
          >
            account?
          </Link>
        </p>
      </form>
    </>
  );
};

export default SignUpStep1;