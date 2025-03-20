import { FirebaseTimestamp, FirebaseUser } from "./firebase";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  createdAt?: FirebaseTimestamp;
  updatedAt?: FirebaseTimestamp;
  currentStep?: string;
  status?: string;
  phone?: string;
  created_pasword?: string;
  authId?: string;

  // Address fields
  street_address_1?: string;
  street_address_2?: string;
  street_city?: string;
  street_state?: string;
  street_country?: string;
  street_zip?: string;

  mailing_address_1?: string;
  mailing_address_2?: string;
  mailing_city?: string;
  mailing_state?: string;
  mailing_country?: string;
  mailing_zip?: string;

  // Profile data
  account_name?: string;
  account_type?: string;
  age18orAbove?: boolean;
  alt_name?: string;
  artist_band_name?: string;
  bank_name?: string;
  bio?: string;
  business_title?: string;
  citizenship?: string;
  completeDetails?: boolean;
  dob?: string;
  facebook_link?: string;
  instagram_link?: string;
  label_organization?: string;
  performer_ch_both?: string;
  publishing_company?: string;
  registering_type?: string;
  routingNumber?: string;
  searchableName?: string;
  ssn?: string;
  tiktok_link?: string;
  twitter_link?: string;
  website_link?: string;
  youtube_link?: string;
  profilePhotoUrl?: string;
  currency?: string;
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