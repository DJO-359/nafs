import { api } from "./axios";

export interface HabitCompletion {
  id: string;
  completedDate: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  icon: string;
  color: string;
  periodType: "30_DAYS" | "3_MONTHS" | "6_MONTHS" | "1_YEAR" | "CUSTOM";
  customPeriodDays?: number | null;
  startDate: string;
  endDate: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  completedDays: number;
  totalDays: number;
  progress: number;
  remainingDays: number;
  isCompletedToday: boolean;
  isCompleted: boolean;
  completions: HabitCompletion[];
}

export interface CreateHabitDto {
  title: string;
  description?: string;
  icon: string;
  color: string;
  periodType: Habit["periodType"];
  customPeriodDays?: number;
  startDate: string;
  endDate: string;
  isArchived?: boolean;
}

export interface UpdateHabitDto extends Partial<CreateHabitDto> {}

export async function getHabits(): Promise<Habit[]> {
  const { data } = await api.get<Habit[]>("/habits");
  return data;
}

export async function createHabit(dto: CreateHabitDto): Promise<Habit> {
  const { data } = await api.post<Habit>("/habits", dto);
  return data;
}

export async function updateHabit(
  id: string,
  dto: UpdateHabitDto,
): Promise<Habit> {
  const { data } = await api.patch<Habit>(`/habits/${id}`, dto);
  return data;
}

export async function deleteHabit(id: string): Promise<{ deleted: boolean }> {
  const { data } = await api.delete<{ deleted: boolean }>(`/habits/${id}`);
  return data;
}

export async function toggleHabit(id: string): Promise<Habit> {
  const { data } = await api.post<Habit>(`/habits/${id}/toggle`);
  return data;
}
