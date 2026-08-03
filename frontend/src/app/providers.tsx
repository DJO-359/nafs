import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import ErrorBoundary from "../components/ui/ErrorBoundary";
import { describeError } from "../lib/errors";

/**
 * Раньше QueryClient создавался без настроек, а <Toaster/> не монтировался
 * вовсе — из-за этого все вызовы toast.success в хуках были мертвы,
 * а упавшая мутация не показывала пользователю ничего.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      console.error("Ошибка запроса:", describeError(error));
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      console.error("Ошибка мутации:", describeError(error));
    },
  }),
});

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
