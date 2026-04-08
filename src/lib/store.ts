import { Project, Environment, EnvVariable } from "./types";

const STORAGE_KEY = "jodna-env-store";

function generateId(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export function getProjects(): Project[] {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveProjects(projects: Project[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

// Projects
export function createProject(name: string, description: string): Project {
  const projects = getProjects();
  const project: Project = {
    id: generateId(),
    name,
    description,
    environments: [],
    createdAt: now(),
    updatedAt: now(),
  };
  projects.push(project);
  saveProjects(projects);
  return project;
}

export function updateProject(id: string, name: string, description: string): Project | null {
  const projects = getProjects();
  const idx = projects.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  projects[idx] = { ...projects[idx], name, description, updatedAt: now() };
  saveProjects(projects);
  return projects[idx];
}

export function deleteProject(id: string) {
  const projects = getProjects().filter((p) => p.id !== id);
  saveProjects(projects);
}

export function getProject(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id);
}

// Environments
export function createEnvironment(projectId: string, name: string): Environment | null {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;
  const env: Environment = {
    id: generateId(),
    name,
    projectId,
    variables: [],
    createdAt: now(),
    updatedAt: now(),
  };
  project.environments.push(env);
  project.updatedAt = now();
  saveProjects(projects);
  return env;
}

export function updateEnvironment(projectId: string, envId: string, name: string): Environment | null {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;
  const env = project.environments.find((e) => e.id === envId);
  if (!env) return null;
  env.name = name;
  env.updatedAt = now();
  project.updatedAt = now();
  saveProjects(projects);
  return env;
}

export function deleteEnvironment(projectId: string, envId: string) {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;
  project.environments = project.environments.filter((e) => e.id !== envId);
  project.updatedAt = now();
  saveProjects(projects);
}

export function getEnvironment(projectId: string, envId: string): Environment | undefined {
  const project = getProject(projectId);
  return project?.environments.find((e) => e.id === envId);
}

// Variables
export function createVariable(projectId: string, envId: string, key: string, value: string): EnvVariable | null {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;
  const env = project.environments.find((e) => e.id === envId);
  if (!env) return null;
  const variable: EnvVariable = { id: generateId(), key, value, createdAt: now(), updatedAt: now() };
  env.variables.push(variable);
  env.updatedAt = now();
  project.updatedAt = now();
  saveProjects(projects);
  return variable;
}

export function updateVariable(projectId: string, envId: string, varId: string, key: string, value: string): EnvVariable | null {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return null;
  const env = project.environments.find((e) => e.id === envId);
  if (!env) return null;
  const variable = env.variables.find((v) => v.id === varId);
  if (!variable) return null;
  variable.key = key;
  variable.value = value;
  variable.updatedAt = now();
  env.updatedAt = now();
  project.updatedAt = now();
  saveProjects(projects);
  return variable;
}

export function deleteVariable(projectId: string, envId: string, varId: string) {
  const projects = getProjects();
  const project = projects.find((p) => p.id === projectId);
  if (!project) return;
  const env = project.environments.find((e) => e.id === envId);
  if (!env) return;
  env.variables = env.variables.filter((v) => v.id !== varId);
  env.updatedAt = now();
  project.updatedAt = now();
  saveProjects(projects);
}
