import { NavLink } from "react-router-dom";

import { haptic } from "../lib/telegram";

type IconProps = { className?: string };

function HomeIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="m3.5 10.8 8.5-7 8.5 7v8.2a1.5 1.5 0 0 1-1.5 1.5H5a1.5 1.5 0 0 1-1.5-1.5z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 20.5v-5.8h6v5.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatsIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 19.5V5.8M4 19.5h16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="m7.5 15 3.2-3.5 2.5 2 4.3-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5 8.5H19v1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HistoryIcon({ className = "" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M4 12a8 8 0 1 0 2.35-5.65"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 4.5v4.8h4.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8.2v4l2.7 1.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ITEMS = [
  { to: "/", label: "Дом", icon: <HomeIcon /> },
  { to: "/stats", label: "Статистика", icon: <StatsIcon /> },
  { to: "/history", label: "История", icon: <HistoryIcon /> },
];

export default function BottomNavigation() {
  return (
    <nav className="bottom-navigation fixed bottom-4 left-1/2 z-50 -translate-x-1/2">
      <div className="bottom-navigation__panel">
        {ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={() => haptic("selection")}
            aria-label={item.label}
            className="bottom-navigation__link"
          >
            {({ isActive }) => (
              <span
                className={`bottom-navigation__item ${isActive ? "is-active" : ""}`}
              >
                <span className="bottom-navigation__icon">{item.icon}</span>
                <span className="bottom-navigation__label">{item.label}</span>
              </span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
