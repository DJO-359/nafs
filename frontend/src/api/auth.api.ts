import { api } from "./axios";

export interface LoginResponse {
  user: {
    id: string;
    telegramId: string;
    username?: string;
    firstName?: string;
    lastName?: string;
  };
  accessToken: string;
}

export async function loginDev(): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/telegram", {
    telegramId: "533519962",
    username: "GabrieL_359",
    firstName: "Джабраил",
    lastName: "",
  });

  return data;
}

export async function loginTelegram(dto: {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
}): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/telegram", dto);

  return data;
}
