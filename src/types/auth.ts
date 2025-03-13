import { FirebaseTimestamp, FirebaseUser } from "./firebase";

export interface User {
    id: string;
    email: string;
    emailVerified: boolean;
    first_name?: string;
    last_name?: string;
    createdAt?: FirebaseTimestamp;
    updatedAt?: FirebaseTimestamp;
  }
  
  export interface Subscription {
    id: string;
    emailAddress: string;
    planType?: string;
    status?: string;
    createdAt?: FirebaseTimestamp;
    updatedAt?: FirebaseTimestamp;
  }
  
  export interface UserDetails extends User {
    subscription?: Subscription;
  }
  
  export type AuthStep = "1" | "2" | "3" | "4" | "complete";
  
  export interface LoginResponse {
    user: FirebaseUser;
    initialStep: AuthStep;
    redirectPath: string;
  }