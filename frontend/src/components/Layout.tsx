import { Outlet, useLocation } from "react-router-dom";

import BottomNavigation from "./BottomNavigation";

export default function Layout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <main
      className={`${
        isHome ? "bg-[#08151d]" : "bg-[var(--app-bg)]"
      } min-h-screen text-[var(--app-text)]`}
    >
      {/* pb-28 + safe-area, иначе последний блок прячется под навигацией */}
      <div
        className={`${
          isHome ? "w-full max-w-none" : "mx-auto max-w-md p-4"
        } safe-top pb-[calc(92px+env(safe-area-inset-bottom)+12px)]`}
      >
        <Outlet />
      </div>

      <BottomNavigation />
    </main>
  );
}
