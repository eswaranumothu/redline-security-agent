import { axiosClient } from './axiosClient';

export const reportsApi = {
  // Returns a blob URL suitable for embedding in an <iframe> or <object>
  previewReport: async (projectId: number): Promise<string> => {
    const response = await axiosClient.post(
      `/reports/projects/${projectId}/generate`,
      {},
      { responseType: 'blob' },
    );
    const blob = new Blob([response.data], { type: 'application/pdf' });
    return window.URL.createObjectURL(blob);
  },

  // Triggers a direct file download
  generateReport: async (projectId: number, projectCode = 'VAPT_Report'): Promise<void> => {
    const blobUrl = await reportsApi.previewReport(projectId);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', `${projectCode}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
  },
};
