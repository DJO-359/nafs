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
    <nav className="fixed inset-x-0 bottom-0 border-t border-[var(--app-border)] bg-[var(--app-surface)]">
      <div className="safe-bottom mx-auto flex max-w-md justify-around px-2 pt-2">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => haptic("selection")}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 text-xs transition ${
                isActive
                  ? "font-semibold text-emerald-600"
                  : "text-[var(--app-hint)]"
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
