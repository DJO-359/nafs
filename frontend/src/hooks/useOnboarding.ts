import { useState } from "react";

export interface OnboardingSettings {
  wakeTime: string;
  sleepTime: string;
  eveningReminderEnabled: boolean | null;
}

export const DEFAULT_ONBOARDING_SETTINGS: OnboardingSettings = {
  wakeTime: "",
  sleepTime: "",
  eveningReminderEnabled: null,
};

export function useOnboardingSettings() {
  return useState<OnboardingSettings>(DEFAULT_ONBOARDING_SETTINGS);
}
