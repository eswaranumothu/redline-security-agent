import { axiosClient } from './axiosClient';

export interface FindingEvidenceItem {
  id: number;
  finding_id: number;
  display_order: number;
  case_label: string;
  screenshot_path?: string;
  original_filename?: string;
  caption?: string;
  action_performed?: string;
  expected_result?: string;
  ai_generated: boolean;
  created_at: string;
}

export interface ProjectFinding {
  id: number;
  project_id: number;
  master_vulnerability_id?: number;
  is_custom: boolean;
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
  status: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  evidences?: FindingEvidenceItem[];
}

export interface ProjectFindingFromMasterCreate {
  project_id: number;
  master_vulnerability_id: number;
  title?: string;
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

export interface ProjectFindingCustomCreate {
  project_id: number;
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

export const projectFindingsApi = {
  listByProject: async (projectId: number): Promise<ProjectFinding[]> => {
    const res = await axiosClient.get<ProjectFinding[]>(`/project-findings/project/${projectId}`);
    return res.data;
  },
  getById: async (id: number): Promise<ProjectFinding> => {
    const res = await axiosClient.get<ProjectFinding>(`/project-findings/${id}`);
    return res.data;
  },
  createFromMaster: async (data: ProjectFindingFromMasterCreate): Promise<ProjectFinding> => {
    const res = await axiosClient.post<ProjectFinding>('/project-findings/from-master', data);
    return res.data;
  },
  createCustom: async (data: ProjectFindingCustomCreate): Promise<ProjectFinding> => {
    const res = await axiosClient.post<ProjectFinding>('/project-findings/custom', data);
    return res.data;
  },
  update: async (id: number, data: Partial<ProjectFindingCustomCreate>): Promise<ProjectFinding> => {
    const res = await axiosClient.put<ProjectFinding>(`/project-findings/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/project-findings/${id}`);
  },
};
