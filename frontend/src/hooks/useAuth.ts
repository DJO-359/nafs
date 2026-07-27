import { loginDev } from "../api/auth.api";

export async function ensureAuth() {
  let token = localStorage.getItem("token");

  if (token) {
    return token;
  }

  const auth = await loginDev();

  localStorage.setItem("token", auth.accessToken);

  return auth.accessToken;
}
