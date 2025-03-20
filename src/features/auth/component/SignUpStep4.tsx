/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "@/firebase"; 
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AlertBox from "@/components/ui/AlertBox";  
import { useAuth } from "@/providers/AuthProvider"; 
import FreeTrial from "../../../assets/image/Subscription/FreeTrial.png";
import Subscribe from "../../../assets/image/Subscription/Subscribe.png"; 
import { UserDetails } from "@/types/auth";

interface SignUpStep4Props {
  onBack: () => void;
  onStepComplete: (action?: string) => void;
  userData: UserDetails | null;
}

type PlanType = 'free' | 'paid';

const SignUpStep4 = ({   onStepComplete, userData }: SignUpStep4Props) => {
 
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
console.log(selectedPlan)
 
  const calculateExpiryDate = (): string => {
    const date = new Date();
    date.setDate(date.getDate() + 15);
    return date.toISOString();
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      navigate('/user_sign_in');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

 
  const storeSubscriptionData = async (plan: PlanType): Promise<void> => {
    setIsLoading(true);
    try {
      if (!userData?.id || !userData?.email) {
        throw new Error("User data is missing");
      }

      const currentDate = new Date().toISOString();
      const subscriptionData = {
        ownerId: userData.id,
        autoRenew: false,
        createdAt: currentDate,
        emailAddress: userData.email,
        paymentMethod: null,
        subscriptionStarted: currentDate,
        subscription_method: plan === 'free' ? 'free' : null,
        subscription_type: plan === 'free' ? 'free' : null,
        subscriptionsExpiry: plan === 'free' ? calculateExpiryDate() : null,
        updatedAt: currentDate
      };

   
      await setDoc(doc(db, "subscriptions", userData.id), subscriptionData);

      if (plan === 'free') {
        setShowDialog(true);
      } else {
        onStepComplete("artistType");
      }
    } catch (error) {
      console.error("Error storing subscription data:", error);
     
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanSelection = (plan: PlanType): void => {
    setSelectedPlan(plan);
    storeSubscriptionData(plan);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-right">
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white"
          onClick={handleLogout}
        >
          Logout
        </Button>
      </div>

      <div className="space-y-4 text-center mb-8">
        <h2 className="text-2xl text-[#C09239] font-bold">Choose Your Plan</h2>
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-3 h-3 rounded-full ${
                dot === 4 ? "bg-[#C09239]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">
          Start with a 15-day free trial or subscribe now for full access
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Free Plan Card */}
        <Card className="relative border-2 hover:border-[#C09239] transition-all duration-300 dark:border-zinc-200 dark:bg-white dark:text-zinc-950 shadow dark:hover:border-[#C09239]">
          <CardHeader className="text-center">
            <CardTitle>Free</CardTitle>
            <p className="text-sm text-gray-600">Free 15 days trial</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <img
                src={FreeTrial}
                alt="Handshake"
                className="mx-auto mb-6"
              />
            </div>
            <Button
              className="w-full bg-[#C09239] hover:bg-[#C09239]/90 text-white"
              onClick={() => handlePlanSelection("free")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          </CardContent>
        </Card>

        {/* Paid Plan Card */}
        <Card className="relative border-2 hover:border-[#C09239] transition-all duration-300 dark:border-zinc-200 dark:bg-white dark:text-zinc-950 shadow dark:hover:border-[#C09239]">
          <CardHeader className="text-center">
            <CardTitle>Subscribe</CardTitle>
            <p className="text-sm text-gray-600">$20/Year</p>
          </CardHeader>
          <CardContent className="text-center">
            <div className="mb-6">
              <img
                src={Subscribe}
                alt="Money"
                className="mx-auto mb-4"
              />
            </div>
            <Button
              className="w-full bg-[#C09239] hover:bg-[#C09239]/90 text-white"
              onClick={() => handlePlanSelection("paid")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe"}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <AlertBox
        showDialog={showDialog}
        setShowDialog={setShowDialog}
        onstepComplete={() => {
          setShowDialog(false);
          navigate("/home");
        }}
        title="Success!"
        description="You have successfully subscribed to the 14-day free trial!"
      />
    </div>
  );
};

export default SignUpStep4;