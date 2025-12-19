import { api } from './auth.service';

export interface ShareResponse {
  id: string;
  fileId: string;
  ownerId: string;
  token: string;
  isActive: boolean;
  createdAt: string;
  shareUrl: string;
  file?: {
    id: string;
    name: string;
    size: number;
    mimeType: string;
  };
}

export const sharesService = {
  createShare: async (fileId: string): Promise<ShareResponse> => {
    const response = await api.post('/shares', { fileId });
    return response.data;
  },

  getMyShares: async (): Promise<ShareResponse[]> => {
    const response = await api.get('/shares/my');
    return response.data;
  },

  getShareByToken: async (token: string): Promise<ShareResponse> => {
    const response = await api.get(`/shares/${token}`);
    return response.data;
  },

  getDownloadUrl: async (token: string): Promise<string> => {
    const response = await api.get(`/shares/${token}/download`);
    return response.data.url;
  },

  deleteShare: async (shareId: string): Promise<void> => {
    await api.delete(`/shares/${shareId}`);
  },

  createDirectShare: async (fileId: string, email: string): Promise<ShareResponse> => {
    const response = await api.post('/shares/direct', { fileId, email });
    return response.data;
  },

  getReceivedShares: async (): Promise<ShareResponse[]> => {
    const response = await api.get('/shares/received/all');
    return response.data;
  },

  getPendingShares: async (): Promise<ShareResponse[]> => {
    const response = await api.get('/shares/received/pending');
    return response.data;
  },
};
