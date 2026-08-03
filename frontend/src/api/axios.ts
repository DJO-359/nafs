import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  // Иначе запросы молча уходят на origin фронтенда и падают с 404
  console.error("VITE_API_URL не задан — запросы к API работать не будут");
}

export const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

/**
 * Обработка 401: сбрасываем протухший токен, перелогиниваемся один раз
 * и повторяем запрос. Раньше response-интерцептора не было вовсе, поэтому
 * истёкший через неделю токен намертво ломал приложение.
 *
 * Импорт useAuth ленивый — иначе получается цикл axios -> useAuth -> axios.
 */
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;
    const isAuthRequest = config?.url?.startsWith("/auth");

    if (
      error.response?.status !== 401 ||
      !config ||
      config._retried ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    config._retried = true;

    const { clearSession, login } = await import("../hooks/useAuth");

    try {
      clearSession();
      await login();
    } catch {
      return Promise.reject(error);
    }

    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return api.request(config);
  },
);
