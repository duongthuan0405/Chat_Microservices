import axiosClient from "./axiosClient";

export interface ConversationResponse {
  id: string;
  name: string;
  isGroup: boolean;
  avatarUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  lastActivity?: string;
  membersCount?: number;
  unreadCount?: number;
}

export interface ConversationMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
}

const extractData = (response: any) => {
  if (response && response.data !== undefined) {
    return response.data;
  }
  return response;
};

export const conversationApi = {
  getConversations: async (): Promise<ConversationResponse[]> => {
    const res = await axiosClient.get("/api/conversations");
    return extractData(res);
  },

  createGroup: async (name: string, memberIds: string[]): Promise<ConversationResponse> => {
    const res = await axiosClient.post("/api/conversations/groups", { name, member_ids: memberIds });
    return extractData(res);
  },

  getMembers: async (conversationId: string): Promise<ConversationMember[]> => {
    const res = await axiosClient.get(`/api/conversations/${conversationId}/members`);
    return extractData(res);
  },

  addMember: async (conversationId: string, memberId: string): Promise<any> => {
    const res = await axiosClient.post(`/api/conversations/${conversationId}/members`, { member_id: memberId });
    return extractData(res);
  },

  removeMember: async (conversationId: string, memberId: string): Promise<any> => {
    const res = await axiosClient.delete(`/api/conversations/${conversationId}/members/${memberId}`);
    return extractData(res);
  },

  leaveGroup: async (conversationId: string): Promise<any> => {
    const res = await axiosClient.post(`/api/conversations/${conversationId}/leave`);
    return extractData(res);
  },
};
