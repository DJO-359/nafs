import type { ReactNode } from "react";

export default function OnboardingShell({ children }: { children: ReactNode }) {
  return (
    <div className="safe-top min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-6 pt-6">
        {children}
      </div>
    </div>
  );
}
