import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,  
      gcTime: 5 * 60 * 1000,  
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

 import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { User, Subscription, UserDetails } from '@/types/auth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

 export const authKeys = {
  all: ['auth'] as const,
  user: (email: string) => [...authKeys.all, 'user', email] as const,
  subscription: (email: string) => [...authKeys.all, 'subscription', email] as const,
};

 export const getUserByEmail = async (email: string): Promise<User | null> => {
  if (!email) return null;
  
  try {
     const q = query(
      collection(db, "user_registration"),
      where("email", "==", email.toLowerCase())
    );
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return {
        id: docData.id,
        ...docData.data(),
      } as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

export const getSubscriptionByEmail = async (email: string): Promise<Subscription | null> => {
  if (!email) return null;
  
  try {
     const q = query(
      collection(db, "subscriptions"),
      where("emailAddress", "==", email.toLowerCase())
    );
    
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const docData = querySnapshot.docs[0];
      return {
        id: docData.id,
        ...docData.data(),
      } as Subscription;
    }
    return null;
  } catch (error) {
    console.error("Error fetching subscription:", error);
    throw error;
  }
};

 export const useUserData = () => {
  const queryClient = useQueryClient();
  
   const useUser = (email: string | undefined) => {
    return useQuery({
      queryKey: authKeys.user(email || ''),
      queryFn: () => getUserByEmail(email || ''),
      enabled: !!email,
    });
  };
  
   const refetchUserData = async (email: string) => {
    const data = await getUserByEmail(email);
    queryClient.setQueryData(authKeys.user(email), data);
    return data;
  };
  
   const useUpdateUser = () => {
    return useMutation({
      mutationFn: async ({ userId, data }: { userId: string; data: Partial<User> }) => {
        const userRef = doc(db, "user_registration", userId);
        await updateDoc(userRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
        return true;
      },
      onSuccess: (_, variables) => {
         const email = variables.data.email;
        if (email) {
           queryClient.invalidateQueries({ queryKey: authKeys.user(email) });
        }
      },
    });
  };
  
  return {
    useUser,
    getUserByEmail,
    refetchUserData,
    useUpdateUser,
  };
};

export const useSubscriptionData = () => {
  const queryClient = useQueryClient();
  
   const useSubscription = (email: string | undefined) => {
    return useQuery({
      queryKey: authKeys.subscription(email || ''),
      queryFn: () => getSubscriptionByEmail(email || ''),
      enabled: !!email,
    });
  };
  
   const refetchSubscriptionData = async (email: string) => {
    const data = await getSubscriptionByEmail(email);
    queryClient.setQueryData(authKeys.subscription(email), data);
    return data;
  };
  
   const useUpdateSubscription = () => {
    return useMutation({
      mutationFn: async ({ subscriptionId, data }: { subscriptionId: string; data: Partial<Subscription> }) => {
        const subscriptionRef = doc(db, "subscriptions", subscriptionId);
        await updateDoc(subscriptionRef, {
          ...data,
          updatedAt: Timestamp.now(),
        });
        return true;
      },
      onSuccess: (_, variables) => {
         const email = variables.data.emailAddress;
        if (email) {
           queryClient.invalidateQueries({ queryKey: authKeys.subscription(email) });
        }
      },
    });
  };
  
  return {
    useSubscription,
    getSubscriptionByEmail,
    refetchSubscriptionData,
    useUpdateSubscription,
  };
};

 export const useUserWithSubscription = (email: string | undefined) => {
  const { useUser } = useUserData();
  const { useSubscription } = useSubscriptionData();
  
  const userQuery = useUser(email);
  const subscriptionQuery = useSubscription(email);
  
  return {
    data: userQuery.data
      ? {
          ...userQuery.data,
          subscription: subscriptionQuery.data || undefined,
        } as UserDetails
      : null,
    isLoading: userQuery.isLoading || subscriptionQuery.isLoading,
    isError: userQuery.isError || subscriptionQuery.isError,
    error: userQuery.error || subscriptionQuery.error,
    refetch: async () => {
      const [userData, subscriptionData] = await Promise.all([
        userQuery.refetch(),
        subscriptionQuery.refetch(),
      ]);
      return {
        ...userData.data,
        subscription: subscriptionData.data || undefined,
      } as UserDetails;
    },
  };
};