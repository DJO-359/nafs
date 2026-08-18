import { api } from "./axios";

/**
 * Счётчик Тасбих/Азкары.
 * Может быть с целевым числом (target) или бесконечный (isInfinite).
 */
export interface TasbihCounter {
  id: string;
  userId: string;
  name: string;
  target: number | null;
  count: number;
  isInfinite: boolean;
  countAtDayStart: number;
  dailyCompleted: number;
  lastActiveDate: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload для создания нового счётчика.
 */
export interface CreateTasbihCounterPayload {
  name: string;
  target?: number;
  count?: number;
  isInfinite?: boolean;
}

/**
 * Payload для обновления счётчика.
 * Все поля опциональны.
 */
export type UpdateTasbihCounterPayload = Partial<CreateTasbihCounterPayload>;

/**
 * GET /tasbih
 * Получить все счётчики пользователя.
 */
export async function getTasbihCounters(): Promise<TasbihCounter[]> {
  const { data } = await api.get<TasbihCounter[]>("/tasbih");
  return data;
}

/**
 * POST /tasbih
 * Создать новый счётчик.
 */
export async function createTasbihCounter(
  payload: CreateTasbihCounterPayload,
): Promise<TasbihCounter> {
  const { data } = await api.post<TasbihCounter>("/tasbih", payload);
  return data;
}

/**
 * PATCH /tasbih/:id
 * Обновить счётчик.
 */
export async function updateTasbihCounter(
  id: string,
  payload: UpdateTasbihCounterPayload,
): Promise<TasbihCounter> {
  const { data } = await api.patch<TasbihCounter>(`/tasbih/${id}`, payload);
  return data;
}

/**
 * DELETE /tasbih/:id
 * Удалить счётчик.
 */
export async function deleteTasbihCounter(
  id: string,
): Promise<{ deleted: boolean }> {
  const { data } = await api.delete<{ deleted: boolean }>(`/tasbih/${id}`);
  return data;
}

/**
 * POST /tasbih/:id/increment
 * Увеличить count на 1.
 */
export async function incrementTasbihCounter(
  id: string,
): Promise<TasbihCounter> {
  const { data } = await api.post<TasbihCounter>(`/tasbih/${id}/increment`);
  return data;
}

/**
 * POST /tasbih/:id/reset
 * Сбросить count в 0.
 */
export async function resetTasbihCounter(id: string): Promise<TasbihCounter> {
  const { data } = await api.post<TasbihCounter>(`/tasbih/${id}/reset`);
  return data;
}
