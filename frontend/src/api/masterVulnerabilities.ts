import { axiosClient } from './axiosClient';

export interface MasterVulnerability {
  id: number;
  title: string;
  description?: string;
  impact?: string;
  recommendation?: string;
  solution?: string;
  severity?: string;
  cvss_score?: number;
  cvss_vector?: string;
  cwe?: string;
  owasp?: string;
  references?: string;
  ai_prompt?: string;
  is_active: boolean;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface MasterVulnerabilityCreate {
  title: string;
  description?: string;
  impact?: string;
  recommendation?: string;
  solution?: string;
  severity?: string;
  cvss_score?: number;
  cvss_vector?: string;
  cwe?: string;
  owasp?: string;
  references?: string;
}

export const masterVulnerabilitiesApi = {
  list: async (): Promise<MasterVulnerability[]> => {
    const res = await axiosClient.get<MasterVulnerability[]>('/master-vulnerabilities');
    return res.data;
  },
  getById: async (id: number): Promise<MasterVulnerability> => {
    const res = await axiosClient.get<MasterVulnerability>(`/master-vulnerabilities/${id}`);
    return res.data;
  },
  create: async (data: MasterVulnerabilityCreate, allowDuplicate = false): Promise<MasterVulnerability> => {
    const res = await axiosClient.post<MasterVulnerability>('/master-vulnerabilities', data, {
      params: { allow_duplicate: allowDuplicate },
    });
    return res.data;
  },
  update: async (id: number, data: Partial<MasterVulnerabilityCreate>): Promise<MasterVulnerability> => {
    const res = await axiosClient.put<MasterVulnerability>(`/master-vulnerabilities/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/master-vulnerabilities/${id}`);
  },
};
