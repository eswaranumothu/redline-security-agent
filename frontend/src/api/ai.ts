import { axiosClient } from './axiosClient';

export interface GenerateVulnerabilityResponse {
  title: string;
  description: string;
  impact: string;
  recommendation: string;
  solution: string;
  severity: string;
  cvss_score: number;
  cvss_vector: string;
  cwe: string;
  owasp: string;
}

export const aiApi = {
  generateVulnerability: async (title: string): Promise<GenerateVulnerabilityResponse> => {
    const res = await axiosClient.post<GenerateVulnerabilityResponse>(
      '/ai/generate-vulnerability',
      { title }
    );
    return res.data;
  },
};
