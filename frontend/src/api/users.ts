import { axiosClient } from './axiosClient';

export interface UserItem {
  id: number;
  full_name: string;
  email: string;
  role: 'ADMIN' | 'AUDITOR';
  is_active: boolean;
  must_change_password: boolean;
  last_login?: string;
  created_at: string;
}

export interface UserCreate {
  full_name: string;
  email: string;
  role: 'ADMIN' | 'AUDITOR';
  password: string;
}

export interface UserUpdate {
  full_name?: string;
  role?: 'ADMIN' | 'AUDITOR';
  is_active?: boolean;
}

export const usersApi = {
  list: async (): Promise<UserItem[]> => {
    const res = await axiosClient.get<UserItem[]>('/users');
    return res.data;
  },
  create: async (data: UserCreate): Promise<UserItem> => {
    const res = await axiosClient.post<UserItem>('/users', data);
    return res.data;
  },
  update: async (id: number, data: UserUpdate): Promise<UserItem> => {
    const res = await axiosClient.put<UserItem>(`/users/${id}`, data);
    return res.data;
  },
  delete: async (id: number): Promise<void> => {
    await axiosClient.delete(`/users/${id}`);
  },
  changePassword: async (current_password: string, new_password: string): Promise<void> => {
    await axiosClient.patch('/users/change-password', {
      current_password,
      new_password,
    });
  },
};
