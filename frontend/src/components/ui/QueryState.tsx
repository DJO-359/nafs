import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { describeError } from "../../lib/errors";
import EmptyState from "./EmptyState";

interface Props<T> {
  query: UseQueryResult<T>;
  children: (data: T) => ReactNode;
  emptyTitle?: string;
  isEmpty?: (data: T) => boolean;
}

/**
 * Общая обёртка состояний запроса.
 *
 * Раньше каждый экран проверял isLoading вручную, а при ошибке возвращал
 * null — пользователь видел пустоту без объяснения и без кнопки повтора.
 */
export default function QueryState<T>({
  query,
  children,
  emptyTitle,
  isEmpty,
}: Props<T>) {
  if (query.isPending) {
    return (
      <div className="flex items-center justify-center py-10 text-[var(--app-hint)]">
        Загрузка…
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-center">
        <p className="text-sm text-red-700">{describeError(query.error)}</p>
        <button
          type="button"
          onClick={() => void query.refetch()}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
        >
          Повторить
        </button>
      </div>
    );
  }

  const data = query.data as T;

  if (isEmpty?.(data)) {
    return <EmptyState icon="🗂" title={emptyTitle ?? "Пока пусто"} />;
  }

  return <>{children(data)}</>;
}
