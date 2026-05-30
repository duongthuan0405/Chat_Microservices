import axiosClient from "./axiosClient";

export interface AuthResponse {
  id: string;
  email: string;
  token: string;
  expiresAt: string;
}

export const authApi = {
  // 1. Đăng ký tài khoản
  register: async (data: any): Promise<AuthResponse> => {
    return await axiosClient.post("/api/auth/register", data);
  },

  // 2. Đăng nhập
  login: async (data: any): Promise<AuthResponse> => {
    // Trả về JSON chứa id, email, token, expiresAt
    return await axiosClient.post("/api/auth/login", data);
  },

  // 3. Lấy thông tin Profile
  getProfile: async (userId: string): Promise<any> => {
    return await axiosClient.get(`/api/profile/${userId}`);
  },

  // 4. Cập nhật thông tin Profile
  updateProfile: async (userId: string, data: any): Promise<any> => {
    return await axiosClient.put(`/api/profile/${userId}`, data);
  },
};
