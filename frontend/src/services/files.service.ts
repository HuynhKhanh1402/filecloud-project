import api from './auth.service';
import type { FileItem } from './dashboard.service';

export const filesService = {
  async downloadFile(id: string, name: string) {
    const response = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  async renameFile(id: string, newName: string): Promise<FileItem> {
    const response = await api.patch(`/files/${id}/rename`, { name: newName });
    return response.data;
  },

  async deleteFile(id: string) {
    await api.delete(`/files/${id}/permanent`);
  },

  async moveFile(id: string, folderId: string | null): Promise<FileItem> {
    const response = await api.patch(`/files/${id}/move`, { folderId });
    return response.data;
  },

  async moveToTrash(id: string) {
    await api.delete(`/files/${id}`);
  },

  async uploadFile(file: File, folderId?: string): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
