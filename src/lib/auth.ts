// Demo auth module — replace internals with real API calls later
// All auth state is stored in localStorage for demo purposes

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

const AUTH_KEY = "jodna-auth-user";

export function getCurrentUser(): User | null {
  const data = localStorage.getItem(AUTH_KEY);
  return data ? JSON.parse(data) : null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

export async function login(email: string, password: string): Promise<User> {
  // TODO: Replace with real API call
  await new Promise((r) => setTimeout(r, 800)); // simulate network
  if (!email || !password) throw new Error("Email and password are required");
  if (password.length < 6) throw new Error("Invalid credentials");

  const user: User = {
    id: crypto.randomUUID(),
    name: email.split("@")[0],
    email,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  // TODO: Replace with real API call
  await new Promise((r) => setTimeout(r, 800));
  if (!name || !email || !password) throw new Error("All fields are required");
  if (password.length < 6) throw new Error("Password must be at least 6 characters");

  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
  };
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}
