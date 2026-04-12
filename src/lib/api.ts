const API_BASE = "https://jodna-env-store-backend.onrender.com/api/v1";
const TOKEN_KEY = "jodna-auth-token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const json = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.message || "Request failed");
  }

  return json.data as T;
}

// ---- Auth ----

export interface ApiUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface LoginResponse {
  user: ApiUser;
  token: string;
}

export async function apiLogin(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function apiRegister(name: string, email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

export async function apiGetMe(): Promise<ApiUser> {
  return request<ApiUser>("/users/me");
}

// ---- Projects ----

export interface ApiProject {
  _id: string;
  name: string;
  description: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetProjects(): Promise<ApiProject[]> {
  return request<ApiProject[]>("/projects");
}

export async function apiGetProject(id: string): Promise<ApiProject> {
  return request<ApiProject>(`/projects/${id}`);
}

export async function apiCreateProject(name: string, description: string): Promise<ApiProject> {
  return request<ApiProject>("/projects", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });
}

export async function apiUpdateProject(id: string, name: string, description: string): Promise<ApiProject> {
  return request<ApiProject>(`/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ name, description }),
  });
}

export async function apiDeleteProject(id: string): Promise<void> {
  await request(`/projects/${id}`, { method: "DELETE" });
}

// ---- Environments ----

export interface ApiEnvironment {
  _id: string;
  name: string;
  projectId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetEnvironments(projectId: string): Promise<ApiEnvironment[]> {
  return request<ApiEnvironment[]>(`/projects/${projectId}/environments`);
}

export async function apiGetEnvironment(projectId: string, envId: string): Promise<ApiEnvironment> {
  return request<ApiEnvironment>(`/projects/${projectId}/environments/${envId}`);
}

export async function apiCreateEnvironment(projectId: string, name: string): Promise<ApiEnvironment> {
  return request<ApiEnvironment>(`/projects/${projectId}/environments`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function apiUpdateEnvironment(projectId: string, envId: string, name: string): Promise<ApiEnvironment> {
  return request<ApiEnvironment>(`/projects/${projectId}/environments/${envId}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export async function apiDeleteEnvironment(projectId: string, envId: string): Promise<void> {
  await request(`/projects/${projectId}/environments/${envId}`, { method: "DELETE" });
}

// ---- Variables ----

export interface ApiVariable {
  _id: string;
  key: string;
  value: string;
  environmentId: string;
  projectId: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export async function apiGetVariables(projectId: string, envId: string): Promise<ApiVariable[]> {
  return request<ApiVariable[]>(`/projects/${projectId}/environments/${envId}/variables`);
}

export async function apiCreateVariable(projectId: string, envId: string, key: string, value: string): Promise<ApiVariable> {
  return request<ApiVariable>(`/projects/${projectId}/environments/${envId}/variables`, {
    method: "POST",
    body: JSON.stringify({ key, value }),
  });
}

export async function apiUpdateVariable(projectId: string, envId: string, varId: string, key: string, value: string): Promise<ApiVariable> {
  return request<ApiVariable>(`/projects/${projectId}/environments/${envId}/variables/${varId}`, {
    method: "PATCH",
    body: JSON.stringify({ key, value }),
  });
}

export async function apiDeleteVariable(projectId: string, envId: string, varId: string): Promise<void> {
  await request(`/projects/${projectId}/environments/${envId}/variables/${varId}`, { method: "DELETE" });
}
