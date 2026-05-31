/// <reference types="vite/client" />
import axios, { InternalAxiosRequestConfig, AxiosResponse } from "axios";

// Dùng relative path ("") để kích hoạt Vite Proxy (giải quyết lỗi CORS)
const API_URL = import.meta.env.VITE_API_URL || "";

const axiosClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  // Tuỳ chọn timeout 10 giây
  timeout: 10000,
});

// INTERCEPTOR: Tự động đính kèm Token trước khi gửi Request
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage (hoặc Zustand/Redux nếu bạn lưu ở đó)
    const token = localStorage.getItem("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// INTERCEPTOR: Xử lý Response trả về
axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Rút gọn Response, chỉ lấy data trả về
    return response.data;
  },
  (error: any) => {
    // Xử lý tập trung các lỗi (ví dụ: Hết hạn token -> đăng xuất)
    if (error.response?.status === 401) {
      console.warn("Token hết hạn hoặc không hợp lệ. Đăng xuất...");
      localStorage.removeItem("access_token");
      // window.location.href = "/login"; // Bật dòng này nếu muốn ép đá về trang Login
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
