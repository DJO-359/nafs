import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/Layout";
import RouteError from "../components/ui/RouteError";
import DayPage from "../pages/DayPage";
import DayHistoryPage from "../pages/DayHistoryPage";
import HistoryPage from "../pages/HistoryPage";
import StatsPage from "../pages/StatsPage";
import CalendarPage from "../pages/CalendarPage";
import HabitsPage from "../pages/HabitsPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    // Без errorElement падение внутри роута показывало служебный экран
    // react-router без навигации и без возможности вернуться
    errorElement: <RouteError />,
    children: [
      { path: "/", element: <DayPage /> },
      { path: "/history", element: <HistoryPage /> },
      { path: "/stats", element: <StatsPage /> },
      { path: "/day/:date", element: <DayHistoryPage /> },
      { path: "/calendar", element: <CalendarPage /> },
      { path: "/habits", element: <HabitsPage /> },
      { path: "*", element: <RouteError notFound /> },
    ],
  },
]);
