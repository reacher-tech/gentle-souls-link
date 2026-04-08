export interface EnvVariable {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export interface Environment {
  id: string;
  name: string;
  projectId: string;
  variables: EnvVariable[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  environments: Environment[];
  createdAt: string;
  updatedAt: string;
}
