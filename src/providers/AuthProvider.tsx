import { ReactNode, createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth } from '@/firebase';
import { 
  AuthStep, 
  LoginResponse, 
    
  UserDetails,
  
} from '@/types/auth';
 
import { FirebaseUser } from '@/types/firebase';
import { useSubscriptionData, useUserData } from '@/api/queryCLient';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userDetails: UserDetails | null;
  login: (email: string, password: string) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  loading: boolean;
  initialStep: AuthStep;
  setLoading: (loading: boolean) => void;
  refreshUserDetails: () => Promise<UserDetails | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialStep, setInitialStep] = useState<AuthStep>("1");

  // Using TanStack Query hooks
  const { getUserByEmail, refetchUserData } = useUserData();
  const { getSubscriptionByEmail } = useSubscriptionData();

  const refreshUserDetails = async (): Promise<UserDetails | null> => {
    try {
      if (!currentUser?.email) return null;
      
      const userData = await refetchUserData(currentUser.email);
      if (userData) {
        setUserDetails(userData as UserDetails);
      }
      return userData as UserDetails;
    } catch (error) {
      console.error("Error refreshing user details:", error);
      return null;
    }
  };

  const determineInitialStep = async (email: string): Promise<AuthStep> => {
    try {
      const userData = await getUserByEmail(email);
      const subscriptionData = await getSubscriptionByEmail(email);

      // Set combined user details
      if (userData) {
        setUserDetails({
          ...userData,
          subscription: subscriptionData || undefined
        });
      }

      // If no user data found, start from beginning
      if (!userData) {
        return "1";
      }

      // Determine which step to show
      if (!userData.emailVerified) {
        return "2";
      }

      if (!userData.first_name || !userData.last_name ||
          userData.first_name.trim() === "" || userData.last_name.trim() === "") {
        return "3";
      }

      if (!subscriptionData) {
        return "4";
      }

      return "complete";
    } catch (error) {
      console.error("Error determining initial step:", error);
      return "1";
    }
  };

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const step = await determineInitialStep(email);

      return {
        user: userCredential.user,
        initialStep: step,
        redirectPath: step === "complete" ? "/home" : "/user_sign_up"
      };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth);
      setUserDetails(null);
      setInitialStep("1");
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error as Error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const step = await determineInitialStep(user.email || "");
        setInitialStep(step);
        setCurrentUser(user);
      } else {
        setUserDetails(null);
        setInitialStep("1");
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userDetails,
    login,
    logout,
    loading,
    initialStep,
    setLoading,
    refreshUserDetails
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;