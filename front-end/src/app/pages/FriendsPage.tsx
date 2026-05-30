import { useState, useEffect } from "react";
import { Search, Check, X, UserMinus, Trash2, Users, Loader2 } from "lucide-react";
import { friendshipApi, FriendResponse } from "../../api/friendshipApi";
import { userApi } from "../../api/userApi";
import { toast } from "sonner";

export function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState<FriendResponse[]>([]);
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<FriendResponse | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [friendsData, requestsData] = await Promise.all([
        friendshipApi.getFriends(),
        friendshipApi.getIncomingRequests()
      ]);
      setFriends(friendsData || []);
      setRequests(requestsData || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bạn bè:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const data = await userApi.searchUsers(searchQuery);
        // API có thể trả về array trực tiếp hoặc qua field data
        setSearchResults(data?.items || data || []);
      } catch (error) {
        console.error("Lỗi tìm kiếm user:", error);
      } finally {
        setIsSearching(false);
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSendFriendRequest = async (targetUserId: string) => {
    try {
      await friendshipApi.sendRequest(targetUserId);
      toast.success("Đã gửi lời mời kết bạn");
      // Có thể lọc user vừa gửi ra khỏi list tìm kiếm nếu muốn
    } catch (error) {
      console.error("Lỗi gửi kết bạn:", error);
      toast.error("Không thể gửi lời mời kết bạn");
    }
  };

  const handleAcceptRequest = async (id: string) => {
    try {
      await friendshipApi.acceptRequest(id);
      toast.success("Đã chấp nhận lời mời kết bạn");
      fetchData();
    } catch (error) {
      console.error("Lỗi chấp nhận:", error);
      toast.error("Không thể chấp nhận lời mời");
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await friendshipApi.rejectRequest(id);
      toast.info("Đã từ chối lời mời kết bạn");
      fetchData();
    } catch (error) {
      console.error("Lỗi từ chối:", error);
      toast.error("Lỗi khi từ chối lời mời");
    }
  };

  const handleUnfriendClick = (friend: FriendResponse) => {
    setSelectedFriend(friend);
    setShowUnfriendModal(true);
  };

  const handleConfirmUnfriend = async () => {
    if (selectedFriend) {
      try {
        await friendshipApi.removeFriend(selectedFriend.id);
        toast.success(`Đã hủy kết bạn với ${selectedFriend.name}`);
        setShowUnfriendModal(false);
        setSelectedFriend(null);
        fetchData();
      } catch (error) {
        console.error("Lỗi xóa bạn:", error);
        toast.error("Hủy kết bạn thất bại");
      }
    }
  };

  const handleCancelUnfriend = () => {
    setShowUnfriendModal(false);
    setSelectedFriend(null);
  };

  const filteredFriends = friends.filter((f) =>
    f.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0 custom-scrollbar">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bạn bè</h1>
          <p className="text-white/60">Quản lý bạn bè và lời mời kết bạn</p>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bạn bè..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : (
          <>
            {requests.length > 0 && (
              <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Lời mời kết bạn</h2>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">
                    {requests.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <img
                        src={request.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.id}`}
                        alt={request.name}
                        className="w-14 h-14 rounded-full bg-slate-800"
                      />
                      <div className="flex-1">
                        <h3 className="text-white font-semibold">{request.name}</h3>
                        <p className="text-white/60 text-sm">{request.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request.id)}
                          className="px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Chấp nhận
                        </button>
                        <button
                          onClick={() => handleRejectRequest(request.id)}
                          className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bảng kết quả tìm kiếm user từ hệ thống */}
            {searchQuery.trim() !== "" && (
              <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    Kết quả tìm kiếm từ hệ thống
                  </h2>
                  {isSearching && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                </div>
                
                {!isSearching && searchResults.length === 0 ? (
                  <p className="text-white/60 text-center py-4">Không tìm thấy người dùng nào phù hợp</p>
                ) : (
                  <div className="space-y-3">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors border border-white/5"
                      >
                        <img
                          src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                          alt={user.name || user.email}
                          className="w-12 h-12 rounded-full bg-slate-800"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold mb-1">{user.name || "Người dùng ẩn danh"}</h3>
                          <p className="text-white/60 text-sm truncate">{user.email}</p>
                        </div>
                        <button
                          onClick={() => handleSendFriendRequest(user.id)}
                          className="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 font-medium hover:bg-cyan-500 hover:text-white transition-all flex items-center gap-2"
                        >
                          <UserMinus className="w-4 h-4 hidden" /> {/* Chỉ để icon align đúng kích thước nếu cần */}
                          <Users className="w-4 h-4" />
                          Kết bạn
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Tất cả bạn bè</h2>
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">
                  {filteredFriends.length} bạn bè
                </span>
              </div>
              
              {filteredFriends.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-white/40" />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">Chưa có bạn bè</h3>
                  <p className="text-white/60 mb-4">Bạn chưa kết bạn với ai hoặc không tìm thấy kết quả</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="relative">
                        <img
                          src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                          alt={friend.name}
                          className="w-14 h-14 rounded-full bg-slate-800"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-semibold mb-1">{friend.name}</h3>
                        <p className="text-white/60 text-sm">{friend.email}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUnfriendClick(friend)}
                          className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 font-medium hover:bg-red-500/10 hover:border-red-500/50 transition-all flex items-center gap-2"
                        >
                          <UserMinus className="w-4 h-4" />
                          Hủy kết bạn
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showUnfriendModal && selectedFriend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Hủy kết bạn</h2>
              <p className="text-white/60">
                Bạn có chắc muốn hủy kết bạn với <span className="text-white font-semibold">{selectedFriend.name}</span>?
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl mb-6">
              <img
                src={selectedFriend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedFriend.id}`}
                alt={selectedFriend.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h4 className="text-white font-semibold">{selectedFriend.name}</h4>
                <p className="text-white/60 text-sm">{selectedFriend.email}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelUnfriend}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmUnfriend}
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-all"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
