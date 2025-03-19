import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp as FirebaseTimestamp } from 'firebase/firestore';

export type { FirebaseUser, FirebaseTimestamp };
 
export type SidebarType = 
  | "home" 
  | "music" 
  | "community" 
  | "assets" 
  | "promote" 
  | "analytics" 
  | "royalty";

export interface RouteConfig {
  path: string;
  label: string;
  icon?: string;
  children?: RouteConfig[];
}
