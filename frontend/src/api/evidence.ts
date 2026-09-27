import { axiosClient } from './axiosClient';
import type { FindingEvidenceItem } from './projectFindings';

export const evidenceApi = {
  create: async (finding_id: number, display_order = 1, case_label = 'Case 1'): Promise<FindingEvidenceItem> => {
    const res = await axiosClient.post<FindingEvidenceItem>('/finding-evidence', {
      finding_id,
      display_order,
      case_label,
    });
    return res.data;
  },

  listByFinding: async (finding_id: number): Promise<FindingEvidenceItem[]> => {
    const res = await axiosClient.get<FindingEvidenceItem[]>(
      `/finding-evidence/finding/${finding_id}`,
    );
    return res.data;
  },

  uploadScreenshot: async (evidenceId: number, file: File): Promise<FindingEvidenceItem> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axiosClient.post<FindingEvidenceItem>(
      `/finding-evidence/${evidenceId}/upload`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return res.data;
  },

  generateDescription: async (evidenceId: number): Promise<FindingEvidenceItem> => {
    const res = await axiosClient.post<FindingEvidenceItem>(
      `/finding-evidence/${evidenceId}/generate-description`,
    );
    return res.data;
  },

  update: async (evidenceId: number, data: Partial<FindingEvidenceItem>): Promise<FindingEvidenceItem> => {
    const res = await axiosClient.put<FindingEvidenceItem>(
      `/finding-evidence/${evidenceId}`,
      data,
    );
    return res.data;
  },

  delete: async (evidenceId: number): Promise<void> => {
    await axiosClient.delete(`/finding-evidence/${evidenceId}`);
  },
};
