import { createBrowserRouter } from "react-router-dom";

import Layout from "../components/Layout";
import DayPage from "../pages/DayPage";
import DayHistoryPage from "../pages/DayHistoryPage"; // импорт новой страницы
import HistoryPage from "../pages/HistoryPage";
import StatsPage from "../pages/StatsPage";
import CalendarPage from "../pages/CalendarPage";

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <DayPage />,
      },
      {
        path: "/history",
        element: <HistoryPage />,
      },
      {
        path: "/stats",
        element: <StatsPage />,
      },
      // ----- добавленный маршрут для просмотра дня по дате -----
      {
        path: "/day/:date",
        element: <DayHistoryPage />,
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
      },
    ],
  },
]);
