import StatsView from "../components/StatsPage";

/**
 * Раньше этот роут рендерил <Calendar/> — вкладка «Статистика» показывала
 * второй календарь, а готовый экран статистики был недостижим.
 */
export default function StatsPage() {
  return <StatsView />;
}
