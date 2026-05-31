import axiosClient from "./axiosClient";

export const userApi = {
  searchUsers: async (query: string): Promise<any> => {
    return await axiosClient.get(`/api/users/search?query=${encodeURIComponent(query)}`);
  }
};
