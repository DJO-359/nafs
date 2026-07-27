import { NavLink } from "react-router-dom";

function navClass(isActive: boolean) {
  return isActive ? "font-semibold text-emerald-600" : "text-gray-500";
}

export default function BottomNavigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
      <div className="mx-auto flex max-w-md justify-around p-3">
        <NavLink to="/" className={({ isActive }) => navClass(isActive)}>
          🏠 Сегодня
        </NavLink>

        <NavLink
          to="/calendar"
          className={({ isActive }) => navClass(isActive)}
        >
          📅 Календарь
        </NavLink>

        <NavLink to="/stats" className={({ isActive }) => navClass(isActive)}>
          📊 Статистика
        </NavLink>

        <NavLink to="/history" className={({ isActive }) => navClass(isActive)}>
          📖 История
        </NavLink>
      </div>
    </nav>
  );
}
