import { FirebaseTimestamp, FirebaseUser } from "./firebase";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  firstName?: string;
  lastName?: string;
  middleName?: string;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  currentStep?: string;
  status?: string;
  phone?: string;
  password?: string;
  authId?: string;
  
  // Address fields
  streetAddress1?: string;
  streetAddress2?: string;
  streetCity?: string;
  streetState?: string;
  streetCountry?: string;
  streetZip?: string;
  
  mailingAddress1?: string;
  mailingAddress2?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingCountry?: string;
  mailingZip?: string;
  
  // Profile data
  accountName?: string;
  accountType?: string;
  age18orAbove?: boolean;
  altName?: string;
  artistBandName?: string;
  bankName?: string;
  bio?: string;
  businessTitle?: string;
  citizenship?: string;
  completeDetails?: boolean;
  dob?: string;
  facebookLink?: string;
  instagramLink?: string;
  labelOrganization?: string;
  performerChBoth?: string;
  publishingCompany?: string;
  registeringType?: string;
  routingNumber?: string;
  searchableName?: string;
  ssn?: string;
  tiktokLink?: string;
  twitterLink?: string;
  websiteLink?: string;
  youtubeLink?: string;
}

export interface Subscription {
  id: string;
  emailAddress: string;
  ownerId?: string;
  planType?: string;
  status?: string;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  autoRenew?: boolean;
  paymentMethod?: string | null;
  subscriptionStarted?: string;
  subscription_method?: string | null;
  subscription_type?: string | null;
  subscriptionsExpiry?: string | null;
  artistType?: string;
}

export interface UserDetails extends User {
  subscription?: Subscription;
}

export type AuthStep = "1" | "2" | "3" | "4" | "5" | "complete";

export interface LoginResponse {
  user: FirebaseUser;
  initialStep: AuthStep;
  redirectPath: string;
}