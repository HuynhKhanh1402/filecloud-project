import api from './auth.service';
import type { FileItem } from './dashboard.service';

export interface FolderItem {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FolderContents {
  folder: FolderItem;
  subfolders: FolderItem[];
  files: FileItem[];
}

export const filesService = {
  // File operations
  async getFiles(folderId?: string): Promise<FileItem[]> {
    const url = folderId ? `/files?folderId=${folderId}` : '/files';
    const response = await api.get(url);
    return response.data;
  },

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

  async deleteFilePermanently(id: string) {
    await api.delete(`/files/${id}/permanent`);
  },

  async getTrash(): Promise<FileItem[]> {
    const response = await api.get('/files/trash');
    return response.data;
  },

  async restoreFile(id: string): Promise<FileItem> {
    const response = await api.post(`/files/${id}/restore`);
    return response.data;
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
  },

  // Folder operations
  async getFolders(parentId?: string): Promise<FolderItem[]> {
    const url = parentId ? `/folders?parentId=${parentId}` : '/folders';
    const response = await api.get(url);
    return response.data;
  },

  async createFolder(name: string, parentId?: string): Promise<FolderItem> {
    const response = await api.post('/folders', { name, parentId });
    return response.data;
  },

  async getFolderContents(folderId: string): Promise<FolderContents> {
    const response = await api.get(`/folders/${folderId}/contents`);
    return response.data;
  },

  async getBreadcrumb(folderId: string): Promise<FolderItem[]> {
    const response = await api.get(`/folders/${folderId}/breadcrumb`);
    return response.data;
  },

  async renameFolder(id: string, newName: string): Promise<FolderItem> {
    const response = await api.patch(`/folders/${id}/rename`, { name: newName });
    return response.data;
  },

  async deleteFolder(id: string) {
    await api.delete(`/folders/${id}`);
  },

  async moveFolder(id: string, parentId: string | null): Promise<FolderItem> {
    const response = await api.patch(`/folders/${id}/move`, { parentId });
    return response.data;
  }
};
