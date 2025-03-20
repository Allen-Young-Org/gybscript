 
import { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase'; 
import AlertBox from '@/components/ui/AlertBox';
import { Button } from '@/components/ui/button';
import Otp from '@/components/ui/Otp'; 
import { OTP } from '@/constants/accesscode'; 
import { UserDetails } from '@/types/auth';

interface SignUpStep2Props {
  onBack: () => void;
  onStepComplete: () => void;
  userData: UserDetails | null;
}

const SignUpStep2 = ({   onStepComplete, userData }: SignUpStep2Props) => { 
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);
  const [countdown, setCountdown] = useState<number>(30);
  const [showDialog, setShowDialog] = useState<boolean>(false); 
  useEffect(() => {
    if (!userData || !userData.id) {
      console.error('Invalid userData:', userData);
    }
  }, [userData]); 
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0 && resendDisabled) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setResendDisabled(false);
    }
    return () => clearTimeout(timer);
  }, [countdown, resendDisabled]); 
  const handleOtpChange = (otpValue: string) => {
    setOtp(otpValue);
  }; 
  const verifyOtp = async (code: string) => { 
    if (loading) return;
    
    if (!userData || !userData.id) {
      setError("User data is missing. Please try again.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const otpString = String(OTP);
      const codeString = String(code);

      if (codeString === otpString) {
        const docRef = doc(db, 'user_registration', userData.id);
        await updateDoc(docRef, {
          emailVerified: true,
          updatedAt: new Date()
        }); 
        setShowDialog(true);
      } else {
        setError("Invalid OTP code");
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError("Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }; 
  const handleOtpFinish = (completedOtp: string) => { 
    setTimeout(() => {
      verifyOtp(completedOtp);
    }, 0);
  }; 
  const handleManualVerification = () => {
    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }
    verifyOtp(otp);
  }; 
  const handleResend = () => {
    setResendDisabled(true);
    setCountdown(30);
    setError(null); 
    console.log("Resending OTP...");
  }; 
  const handleDialogClose = (shouldComplete: boolean) => {
    setShowDialog(false); 
    if (shouldComplete) { 
      setTimeout(() => {
        onStepComplete();
      }, 0);
    }
  };

  return (
    // <div className="space-y-6 min-w-6xl">
    <>
      <h2 className="text-3xl text-[#C09239] font-bold mb-2 text-center">GET STARTED</h2>
      <p className="text-center text-gray-600 mb-2">Bells and Whistles to complete your profile.</p>
      <p className="text-center text-gray-600 mb-8">
        An OTP has been sent to {userData?.email}
      </p>

   
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

     
      <div className="mb-8">
        <Otp
          elCount={6}
          loading={loading}
          onFinish={handleOtpFinish}
          onChange={handleOtpChange}
          error={error}
        />
      </div>

      <p className="text-center text-sm text-gray-600 mb-8">
        Didn't receive the code?{' '}
        {resendDisabled ? (
          <span className="text-gray-400">Resend in {countdown}s</span>
        ) : (
          <button
            className="text-[#C09239] hover:underline"
            onClick={handleResend}
            type="button"
          >
            Resend
          </button>
        )}
      </p>

      
      {error && (
        <p className="text-sm text-red-500 text-center">{error}</p>
      )}

      <div className="flex gap-4">
        <Button
          className="flex-1 bg-[#C09239] hover:bg-[#C09239]/90 text-white"
          onClick={handleManualVerification}
          disabled={loading || otp.length !== 6}
          type="button"
        >
          {loading ? 'Verifying...' : 'Continue'}
        </Button>
      </div>
      
      <AlertBox 
        showDialog={showDialog} 
        setShowDialog={(show) => handleDialogClose(!show)}
        onstepComplete={() => handleDialogClose(true)}
        title="Success!" 
        description="You have successfully verified your email!" 
      />
  {/* </div> */}
      </>
  );
};

export default SignUpStep2;