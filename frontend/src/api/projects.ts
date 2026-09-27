import { axiosClient } from './axiosClient';

export const PROJECT_TYPES = [
  { value: 'WEB', label: 'Web Application VAPT' },
  { value: 'MOBILE', label: 'Mobile App VAPT' },
  { value: 'API', label: 'API Security Assessment' },
  { value: 'NETWORK', label: 'Network Penetration Testing' },
  { value: 'CLOUD', label: 'Cloud Security Assessment' },
  { value: 'DESKTOP', label: 'Desktop Application VAPT' },
] as const;

export const PROJECT_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'STAGE1', label: 'Stage 1' },
] as const;

export type ProjectTypeValue = typeof PROJECT_TYPES[number]['value'];
export type ProjectStatusValue = typeof PROJECT_STATUSES[number]['value'];

export function getProjectTypeLabel(value: string): string {
  return PROJECT_TYPES.find((t) => t.value === value)?.label ?? value;
}

export function getProjectStatusLabel(value: string): string {
  return PROJECT_STATUSES.find((s) => s.value === value)?.label ?? value;
}

export interface Project {
  id: number;
  project_code: string;
  project_name: string;
  client_name: string;
  application_name: string;
  application_url?: string;
  ip_address?: string;
  operating_system?: string;
  language?: string;
  web_server?: string;
  ports_scanned?: string;
  project_type: string;
  description?: string;
  scope?: string;
  start_date: string;
  end_date?: string;
  status: string;
  assigned_to?: number;
  created_by: number;
  created_at: string;
  updated_at: string;
  report_generated_at?: string;
  assigned_user_name?: string;
  assigned_user_email?: string;
  created_by_name?: string;
}

export interface ProjectCreate {
  project_name: string;
  client_name: string;
  application_name: string;
  application_url?: string;
  ip_address?: string;
  operating_system?: string;
  language?: string;
  web_server?: string;
  ports_scanned?: string;
  project_type: string;
  description?: string;
  scope?: string;
  start_date: string;
  end_date?: string;
  status?: string;
  assigned_to?: number;
}

export interface ProjectUpdate {
  project_name?: string;
  client_name?: string;
  application_name?: string;
  application_url?: string;
  ip_address?: string;
  operating_system?: string;
  language?: string;
  web_server?: string;
  ports_scanned?: string;
  project_type?: string;
  description?: string;
  scope?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
  assigned_to?: number;
}

export const projectsApi = {
  list: async (): Promise<Project[]> => {
    const res = await axiosClient.get<Project[]>('/projects');
    return res.data;
  },
  getById: async (id: number): Promise<Project> => {
    const res = await axiosClient.get<Project>(`/projects/${id}`);
    return res.data;
  },
  create: async (data: ProjectCreate): Promise<Project> => {
    const res = await axiosClient.post<Project>('/projects', data);
    return res.data;
  },
  update: async (id: number, data: ProjectUpdate): Promise<Project> => {
    const res = await axiosClient.put<Project>(`/projects/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/projects/${id}`);
  },
};
