import AlertBox from "@/components/ui/AlertBox";
import { Button } from "@/components/ui/button";
import Otp from "@/components/ui/Otp";
import { OTP } from "@/constants/accesscode";
import { db } from "@/firebase";

import { doc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

interface UserData {
  userId: string;
  // Include additional user fields as needed
}

interface SignUpStep2Props {
  onBack: () => void;
  onStepComplete: () => void;
  userData?: UserData;
}

const SignUpStep2: React.FC<SignUpStep2Props> = ({
  onBack,
  onStepComplete,
  userData,
}) => {
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(30);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  useEffect(() => {
    if (!userData || !userData.userId) {
      console.error("Invalid userData:", userData);
      // Optionally, trigger onBack() here if needed.
      return;
    }
  }, [userData, onBack]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]);

  const handleVerification = async (code: string): Promise<void> => {
    if (!userData || !userData.userId) {
      setError("User data is missing. Please try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const otpString = String(OTP);
      const codeString = String(code);

      if (codeString === otpString) {
        const docRef = doc(db, "user_registration", userData.userId);
        await updateDoc(docRef, {
          emailVerified: true,
          updatedAt: new Date(),
        });
        setShowDialog(true);
        // Optionally, call onStepComplete() here or after the dialog is dismissed.
      } else {
        setError("Invalid OTP code");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = (): void => {
    setResendDisabled(true);
    setCountdown(30);
    setError("");
    // Here you would typically trigger the OTP sending mechanism.
    console.log("Resending OTP...");
  };

  return (
    <div className="space-y-6 min-w-6xl">
      <h2 className="text-3xl font-bold mb-2 text-center">GET STARTED</h2>
      <p className="text-center text-gray-600 mb-2">
        Bells and Whistles to complete your profile.
      </p>
      <p className="text-center text-gray-600 mb-8">An OTP has been sent to</p>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4, 5].map((dot) => (
          <div
            key={dot}
            className={`w-3 h-3 rounded-full ${
              dot === 2 ? "bg-[#C09239]" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* OTP Input */}
      <div className="mb-8">
        <Otp
          elCount={6}
          loading={loading}
          onFinish={handleVerification}
          onChange={setOtp}
          error={error}
        />
      </div>

      <p className="text-center text-sm text-gray-600 mb-8">
        Didn't receive the code?{" "}
        {resendDisabled ? (
          <span className="text-gray-400">Resend in {countdown}s</span>
        ) : (
          <button
            className="text-[#C09239] hover:underline"
            onClick={handleResend}
          >
            Resend
          </button>
        )}
      </p>

      {/* Error Message */}
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="flex gap-4">
        <Button
          className="flex-1 bg-[#C09239] hover:bg-[#C09239]/90 text-white"
          onClick={() => handleVerification(otp)}
          disabled={loading || otp.length !== 6}
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </div>
      <AlertBox
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        onstepComplete={() => {
          setShowDialog(false);
          onStepComplete();
        }}
        title="Success!"
        description="You have successfully Verified your email!"
      />
    </div>
  );
};

export default SignUpStep2;
