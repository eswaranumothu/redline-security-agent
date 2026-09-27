import { axiosClient } from './axiosClient';

export interface LoginUser {
  id: number;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'AUDITOR';
  must_change_password: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: LoginUser;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },
  register: async (username: string, password: string, confirm_password: string): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>('/auth/register', {
      username,
      password,
      confirm_password,
    });
    return response.data;
  },
};

