import axiosClient from "./axiosClient";

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  content: string;
  isRead: boolean;
  status: string;
  createdAt: string;
}

export interface NotificationResponse {
  items: NotificationItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export const notificationApi = {
  getNotifications: async (pageNumber: number = 1, pageSize: number = 10): Promise<NotificationResponse> => {
    const res: any = await axiosClient.get(`/api/notifications?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    // Because the interceptor returns response.data, 'res' is { success: true, message: "...", data: {...} }
    // We want to return just the pagination object inside 'data'
    if (res && res.data) {
      return res.data;
    }
    return res;
  },
  
  markAsRead: async (id: string): Promise<any> => {
    return await axiosClient.post(`/api/notifications/${id}/read`);
  }
};
