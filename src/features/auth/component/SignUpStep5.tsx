/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase"; 
import { Button } from "@/components/ui/button"; 
import CurrentArtist from "../../../assets/image/Subscription/CurrentArtist.jpg";
import NewArtist from "../../../assets/image/Subscription/NewArtist.jpg"; 
import { UserDetails } from "@/types/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SignUpStep5Props {
  onBack: () => void;
  onStepComplete: (artistType: string) => void;
  userData: UserDetails | null;
}

type ArtistType = 'new' | 'current';
type SubscriptionType = 'monthly' | 'yearly';

const SignUpStep5 = ({ onBack, onStepComplete, userData }: SignUpStep5Props) => {
  const navigate = useNavigate();
 
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const calculateExpiryDate = (subscriptionType: SubscriptionType): string => {
    const date = new Date();
    if (subscriptionType === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else if (subscriptionType === 'yearly') {
      date.setFullYear(date.getFullYear() + 1);
    }
    return date.toISOString();
  };

  const updateSubscription = async (
    artistType: ArtistType, 
    subscriptionType: SubscriptionType
  ): Promise<void> => {
    setIsLoading(true);
    try {
      if (!userData?.id) {
        throw new Error("User ID is required");
      }

      const currentDate = new Date().toISOString();
      const subscriptionData = {
        paymentMethod: 'card',
        subscriptionStarted: currentDate,
        subscription_method: subscriptionType,
        subscription_type: 'subscribe',
        subscriptionsExpiry: calculateExpiryDate(subscriptionType),
        updatedAt: currentDate,
        artistType: artistType
      };

      const subscriptionRef = doc(db, "subscriptions", userData.id);
      await updateDoc(subscriptionRef, subscriptionData); 
       
      navigate('/home');
    } catch (error) {
      console.error("Error updating subscription:", error);
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscription = (
    artistType: ArtistType, 
    subscriptionType: SubscriptionType
  ): void => {
    updateSubscription(artistType, subscriptionType);
    onStepComplete(artistType);
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="text-right">
        <Button
          variant="destructive"
          size="sm"
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          Logout
        </Button>
      </div>

      <div className="space-y-4 text-center mb-8">
        <h2 className="text-2xl text-[#C09239] font-bold">FIRST THINGS FIRST.</h2>
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4, 5].map((dot) => (
            <div
              key={dot}
              className={`w-3 h-3 rounded-full ${
                dot === 5 ? "bg-[#C09239]" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
        <p className="text-gray-600">Choose the right option here for you</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* New Artist Card */}
        <Card
          className="relative border-2 hover:border-[#C09239] transition-all duration-300 cursor-pointer"
          style={{
            backgroundImage: `url(${NewArtist})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#f5b83e]">
              NEW ARTIST
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-semibold text-white mb-2">$10/MONTH</p>
            <p className="text-sm text-white mb-6">
              Entry level creator gearing up for releasing and distributing my music.
            </p>
            <Button
              className="w-full bg-[#C09239] hover:bg-[#C09239]/90 text-white"
              onClick={() => handleSubscription('new', 'monthly')}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe Monthly"}
            </Button>
          </CardContent>
        </Card>

        {/* Current Artist Card */}
        <Card
          className="relative border-2 hover:border-[#C09239] transition-all duration-300 cursor-pointer"
          style={{
            backgroundImage: `url(${CurrentArtist})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-[#f5b83e]">
              CURRENT ARTIST
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-semibold text-white mb-2">$20/YEAR</p>
            <p className="text-sm text-white mb-6">
              Moving my existing catalog from distributor one and distributing my music.
            </p>
            <Button
              className="w-full bg-[#C09239] hover:bg-[#C09239]/90 text-white"
              onClick={() => handleSubscription('current', 'yearly')}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Subscribe Yearly"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SignUpStep5;