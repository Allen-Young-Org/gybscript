import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

import AlertBox from "@/components/ui/AlertBox";
import googleIcon from "@/assets/google.svg"; // Replace with your own Google icon                                                  
import appleIcon from "@/assets/apple-icon.png";
import logoBrown from "@/assets/image/login/GYB-Logo-1.png";
import musician from "@/assets/image/login/musician.png";
import logo from "@/assets/image/login/logo.png";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface SignInFormData {
  email: string;
  password: string;
  remember?: boolean;
}

interface AlertState {
  show: boolean;
  title: string;
  description: string;
}

const SignIn = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertState, setAlertState] = useState<AlertState>({
    show: false,
    title: "",
    description: "",
  });

  const navigate = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SignInFormData>();

  const formValues = watch();

  const onAlertComplete = () => {
    if (alertState.title.includes("Success")) {
      navigate("/home");
    }
  };

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    try {
      const { redirectPath } = await login(data.email, data.password);

      setAlertState({
        show: true,
        title: "Success!",
        description: "You have successfully logged in.",
      });
    } catch (error: any) {
      console.error("Login error:", error);

      let errorMessage = "Failed to sign in. Please try again.";
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address.";
          break;
        case "auth/wrong-password":
          errorMessage = "Incorrect password. Please try again.";
          break;
        case "auth/invalid-email":
          errorMessage = "Invalid email address.";
          break;
      }

      setAlertState({
        show: true,
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(267deg, rgba(252,200,3,1) 54%, rgba(165,130,0,1) 100%)",
      }}
    >
      <div className="w-full min-h-[700px] max-w-6xl grid lg:grid-cols-2 p-4 lg:p-8">
        <div className="relative hidden lg:flex justify-between p-12 bg-[#C09239] rounded-l-3xl overflow-hidden">
          <img
            src={musician}
            alt="Musician with guitar"
            className="absolute left-0 bottom-0 h-full object-contain z-10 max-w-[65%]"
          />
          <div className="relative z-20 text-white text-center ml-auto max-w-[50%]">
            <img src={logo} alt="GYB Logo" className="w-48 mb-4" />
            <h2 className="text-3xl font-medium mb-2">GOT YOUR BACK</h2>
            <h3 className="text-2xl mb-4">UNIVERSAL PORTAL</h3>
            <ul className="space-y-1 text-lg">
              <li>Your Music</li>
              <li>Your Money</li>
              <li>Your Manager</li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-6 lg:p-12 rounded-3xl lg:rounded-l-none shadow-xl">
          <>
            <div className="flex lg:hidden justify-center mb-6">
              <img src={logoBrown} alt="GYB Logo" className="w-24" />
            </div>

            <h2 className="text-2xl font-bold mb-2 text-[#C09239] text-center">
              GOT YOUR BACK
            </h2>

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

              <Button
                variant="outline"
                className="bg-[#F7F7F7] h-9 border border-[#CFD8E6] font-normal !font-poppins text-[12px] leading-[1.125rem] mt-2 cursor-pointer text-[#121212] w-full"
                disabled={isLoading}
              >
                <img
                  src="https://cdn-icons-png.flaticon.com/512/732/732221.png"
                  className="w-5 h-5 mr-2"
                  alt="Microsoft"
                />
                Sign in with Microsoft
              </Button>

              <Button
                variant="outline"
                className="bg-[#1876f2c5] h-9 border border-[#1877F2] font-normal !font-poppins text-[12px] leading-[1.125rem] mt-2 cursor-pointer text-white w-full"
                disabled={isLoading}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png"
                  className="w-5 h-5 mr-2"
                  alt="Facebook"
                />
                Sign in with Facebook
              </Button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                  value={formValues.email || ""}
                  onChange={(e) => {
                    register("email").onChange(e);
                  }}
                />
              </div>

              <div className="relative">
                <FloatingLabelInput
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", {
                    required: "Password is required",
                  })}
                  error={errors.password?.message}
                  disabled={isLoading}
                  value={formValues.password || ""}
                  onChange={(e) => {
                    register("password").onChange(e);
                  }}
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" {...register("remember")} />
                  <label
                    htmlFor="remember"
                    className="text-sm font-poppins text-gray-600"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-sm font-poppins text-[#C09239] hover:text-[#aa8233]"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-[#C09239] hover:bg-[#C09239]/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Log In"}
              </Button>

              <div className="text-center mt-4">
                <span className="text-gray-600 font-poppins">
                  Not Registered Yet?{" "}
                </span>
                <Link
                  to="/user_sign_up"
                  className="text-[#C09239] font-poppins hover:text-[#aa8233]"
                >
                  Create Account
                </Link>
              </div>
            </form>
          </>
        </div>
      </div>

      <AlertBox
        showDialog={alertState.show}
        setShowDialog={(show) => setAlertState({ ...alertState, show })}
        onstepComplete={onAlertComplete}
        title={alertState.title}
        description={alertState.description}
      />
    </div>
  );
};

export default SignIn;
