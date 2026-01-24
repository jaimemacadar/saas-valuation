// src/types/user.ts
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: UserRole;
  subscription?: SubscriptionTier;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = "user" | "admin";

export type SubscriptionTier = "free" | "pro" | "enterprise";

export interface UserProfile {
  id: string;
  userId: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  position?: string;
  country?: string;
  timezone?: string;
  language?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  currency: string;
  dateFormat: string;
  numberFormat: string;
  emailNotifications: boolean;
}

export interface AuthSession {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}
