import axiosClient from "./axiosClient";

export const messageApi = {
  getLatestMessages: async (conversationIds: string[]) => {
    const res = await axiosClient.post("/api/messages/conversations/latest", {
      conversationIds,
    });
    return res.data?.data || res.data || {};
  },

  getMessagesByConversationId: async (conversationId: string, pageNumber: number = 1, pageSize: number = 50) => {
    const res = await axiosClient.get(`/api/messages/conversation/${conversationId}?pageNumber=${pageNumber}&pageSize=${pageSize}`);
    return res.data?.data || res.data || {};
  },

  sendMessage: async (conversationId: string, content: string, type: string = "Text") => {
    const res = await axiosClient.post("/api/messages", {
      conversationId,
      content,
      type
    });
    return res.data?.data || res.data || {};
  }
};
