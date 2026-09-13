import { Outlet } from "react-router-dom";

import BottomNavigation from "./BottomNavigation";

export default function Layout() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* pb-28 + safe-area, иначе последний блок прячется под навигацией */}
      <div className="safe-top mx-auto max-w-md p-4 pb-[calc(92px+env(safe-area-inset-bottom)+12px)]">
        <Outlet />
      </div>

      <BottomNavigation />
    </main>
  );
}
