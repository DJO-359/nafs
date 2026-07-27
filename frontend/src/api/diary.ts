import { api } from "../api/axios";

export async function saveDiary(text: string) {
  const { data } = await api.post("/diary", {
    content: text,
  });

  return data;
}

export async function getDiaryHistory() {
  const { data } = await api.get("/diary/history");
  return data;
}
