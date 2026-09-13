import { NavLink } from "react-router-dom";

import { haptic } from "../lib/telegram";

function HistoryIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M3.8 12a8.2 8.2 0 1 0 2.2-6.2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M4 4v7h7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v4l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ITEMS = [
  { to: "/", label: "", icon: "🏠" },
  { to: "/stats", label: "", icon: "📊" },
  { to: "/history", label: "", icon: <HistoryIcon className="h-5 w-5" /> },
];

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50">
      <div
        className="flex h-[72px] items-center justify-around rounded-[28px] border border-white/40 bg-white/72 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-[20px]"
        style={{
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => haptic("selection")}
          >
            {({ isActive }) => (
              <div
                className={`group flex h-[46px] items-center gap-2 rounded-full transition-all duration-[250ms] ease-out ${
                  isActive
                    ? "px-4 bg-white/92 shadow-[0_6px_20px_rgba(0,0,0,0.08)] text-[#2F855A] scale-[1.05]"
                    : "px-3 text-[#9CA3AF]"
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center transition duration-[250ms] ease-out ${
                    isActive ? "scale-[1.08]" : "scale-100"
                  }`}
                >
                  {typeof item.icon === "string" ? (
                    <span className="text-lg">{item.icon}</span>
                  ) : (
                    item.icon
                  )}
                </span>

                <span className="text-[11px] leading-4">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
