import { Outlet } from "react-router-dom";
import BottomNavigation from "./BottomNavigation";

export default function Layout() {
  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-md p-4 pb-24">
        <Outlet />
      </div>

      <BottomNavigation />
    </main>
  );
}
