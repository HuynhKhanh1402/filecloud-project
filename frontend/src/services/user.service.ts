import api from './auth.service';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  avatar?: string | null;
  usedStorage: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalFiles: number;
  totalFolders: number;
  usedStorage: number;
  maxStorage: number;
}

class UserService {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get('/users/profile');
    return response.data;
  }

  async getStats(): Promise<UserStats> {
    const response = await api.get('/users/stats');
    return response.data;
  }

  async updateProfile(data: { fullName?: string; avatar?: string }): Promise<UserProfile> {
    const response = await api.patch('/users/profile', data);
    return response.data;
  }

  async uploadAvatar(file: File): Promise<UserProfile> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async deleteAvatar(): Promise<void> {
    await api.delete('/users/avatar');
  }
}

export const userService = new UserService();
