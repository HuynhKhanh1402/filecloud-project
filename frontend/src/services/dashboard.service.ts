import api from './auth.service';

export interface UserStats {
  totalFiles: number;
  totalFolders: number;
  usedStorage: number;
  maxStorage: number;
}

export interface FileItem {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
  isFolder: boolean;
}

export const dashboardService = {
  async getStats(): Promise<UserStats> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  async getRecentFiles(limit: number = 5): Promise<FileItem[]> {
    const response = await api.get(`/files/recent?limit=${limit}`);
    return response.data;
  },
};
