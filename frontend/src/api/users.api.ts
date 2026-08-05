import { api } from "./axios";

export interface UserProfile {
  id: string;
  telegramId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  timezone: string;
  onboardingCompleted: boolean;
  wakeTime: string | null;
  sleepTime: string | null;
  eveningReminderEnabled: boolean;
}

export interface CompleteOnboardingRequest {
  wakeTime: string;
  sleepTime: string;
  eveningReminderEnabled: boolean;
}

export async function getUserProfile(): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/users/me");
  return data;
}

export async function completeOnboarding(
  payload: CompleteOnboardingRequest,
): Promise<UserProfile> {
  const { data } = await api.post<UserProfile>("/users/onboarding", payload);
  return data;
}
