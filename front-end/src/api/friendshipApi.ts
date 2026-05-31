import axiosClient from "./axiosClient";

export interface FriendResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isOnline?: boolean;
}

const extractData = (response: any) => {
  if (response && response.data !== undefined) {
    return response.data;
  }
  return response;
};

export const friendshipApi = {
  getFriends: async (): Promise<FriendResponse[]> => {
    const response = await axiosClient.get("/api/friendships");
    return extractData(response);
  },

  getIncomingRequests: async (): Promise<FriendResponse[]> => {
    const response = await axiosClient.get("/api/friendships/requests/incoming");
    return extractData(response);
  },

  getOutgoingRequests: async (): Promise<FriendResponse[]> => {
    const response = await axiosClient.get("/api/friendships/requests/outgoing");
    return extractData(response);
  },

  acceptRequest: async (friendId: string): Promise<any> => {
    const response = await axiosClient.post("/api/friendships/accept", { friend_id: friendId });
    return extractData(response);
  },

  rejectRequest: async (friendId: string): Promise<any> => {
    const response = await axiosClient.post("/api/friendships/reject", { friend_id: friendId });
    return extractData(response);
  },

  sendRequest: async (friendId: string): Promise<any> => {
    const response = await axiosClient.post("/api/friendships/request", { friend_id: friendId });
    return extractData(response);
  },

  removeFriend: async (friendId: string): Promise<any> => {
    const response = await axiosClient.delete("/api/friendships", { data: { friend_id: friendId } });
    return extractData(response);
  }
};
