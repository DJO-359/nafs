import { api } from "./axios";

export async function createIntention(text: string) {
  const { data } = await api.post("/intention", {
    text,
  });

  return data;
}

export async function completeIntention() {
  const { data } = await api.patch("/intention/complete");

  return data;
}
