import { useMemo, useState } from "react";
import { RouterProvider } from "react-router-dom";

import AuthGate from "./AuthGate";
import { router } from "./router";
import OnboardingPage from "../pages/OnboardingPage";
import { useUserProfile } from "../hooks/useUserProfile";

export default function App() {
  const { data: user, isLoading, isError } = useUserProfile();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  const showOnboarding = useMemo(() => {
    if (isLoading || isError) return false;
    return user ? !user.onboardingCompleted : false;
  }, [isLoading, isError, user]);

  const handleComplete = () => {
    setOnboardingCompleted(true);
  };

  return (
    <AuthGate>
      {showOnboarding && !onboardingCompleted ? (
        <OnboardingPage onComplete={handleComplete} />
      ) : (
        <RouterProvider router={router} />
      )}
    </AuthGate>
  );
}
