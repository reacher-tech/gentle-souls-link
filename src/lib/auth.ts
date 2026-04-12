import { apiLogin, apiRegister, apiGetMe, setToken, clearToken, ApiUser } from "./api";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const USER_KEY = "jodna-auth-user";

function mapUser(u: ApiUser): User {
  return { id: u._id, name: u.name, email: u.email, role: u.role };
}

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export async function login(email: string, password: string): Promise<User> {
  if (!email || !password) throw new Error("Email and password are required");
  const { user, token } = await apiLogin(email, password);
  setToken(token);
  const mapped = mapUser(user);
  localStorage.setItem(USER_KEY, JSON.stringify(mapped));
  return mapped;
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  if (!name || !email || !password) throw new Error("All fields are required");
  const { user, token } = await apiRegister(name, email, password);
  setToken(token);
  const mapped = mapUser(user);
  localStorage.setItem(USER_KEY, JSON.stringify(mapped));
  return mapped;
}

export function logout() {
  localStorage.removeItem(USER_KEY);
  clearToken();
}
