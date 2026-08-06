import { NavLink } from "react-router-dom";

import { haptic } from "../lib/telegram";

const ITEMS = [
  { to: "/", label: "Сегодня", icon: "🏠" },
  { to: "/habits", label: "Привычки", icon: "🔁" },
  { to: "/calendar", label: "Календарь", icon: "📅" },
  { to: "/stats", label: "Статистика", icon: "📊" },
  { to: "/history", label: "История", icon: "📖" },
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
                  className={`text-lg transition duration-[250ms] ease-out ${
                    isActive ? "scale-[1.08]" : "scale-100"
                  }`}
                >
                  {item.icon}
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
