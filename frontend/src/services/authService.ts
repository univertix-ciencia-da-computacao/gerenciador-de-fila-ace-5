import { fetchClient } from '../api/client';
import type { ApiResponse } from '../api/types/common';

export interface StaffUser {
  id: string;
  email: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: StaffUser;
}

const API_PREFIX = '/api/v1';

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetchClient<ApiResponse<LoginResponse>>(`${API_PREFIX}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return response.data;
  },
};
