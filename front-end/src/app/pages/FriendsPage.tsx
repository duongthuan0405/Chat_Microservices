import { useState } from "react";
import { Search, UserPlus, Check, X, Circle, MessageCircle, Eye, UserMinus, Trash2, Clock, Users } from "lucide-react";
import { toast } from "sonner";

const mockFriendRequests = [
  {
    id: 1,
    name: "Hoàng Văn E",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5",
    mutualFriends: 12,
  },
  {
    id: 2,
    name: "Vũ Thị F",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user6",
    mutualFriends: 8,
  },
  {
    id: 3,
    name: "Đỗ Văn G",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user7",
    mutualFriends: 5,
  },
];

const mockAllFriends = [
  {
    id: 11,
    name: "Nguyễn Văn A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    status: "Đang làm việc",
    online: true,
    mutualFriends: 20,
    lastActive: "Đang hoạt động",
  },
  {
    id: 12,
    name: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    status: "Rảnh rỗi",
    online: true,
    mutualFriends: 15,
    lastActive: "Đang hoạt động",
  },
  {
    id: 13,
    name: "Lê Văn C",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    status: "Bận",
    online: false,
    mutualFriends: 18,
    lastActive: "30 phút trước",
  },
  {
    id: 14,
    name: "Phạm Thị D",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
    status: "Đang hoạt động",
    online: true,
    mutualFriends: 22,
    lastActive: "Đang hoạt động",
  },
  {
    id: 15,
    name: "Hoàng Văn K",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user11",
    status: "Offline",
    online: false,
    mutualFriends: 10,
    lastActive: "2 giờ trước",
  },
  {
    id: 16,
    name: "Vũ Thị L",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user12",
    status: "Offline",
    online: false,
    mutualFriends: 14,
    lastActive: "1 ngày trước",
  },
];

const mockSuggestions = [
  {
    id: 4,
    name: "Bùi Thị H",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user8",
    mutualFriends: 15,
  },
  {
    id: 5,
    name: "Ngô Văn I",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user9",
    mutualFriends: 7,
  },
  {
    id: 6,
    name: "Lý Thị K",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user10",
    mutualFriends: 10,
  },
];

const mockOnlineFriends = [
  {
    id: 7,
    name: "Nguyễn Văn A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    status: "Đang làm việc",
    online: true,
  },
  {
    id: 8,
    name: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    status: "Rảnh rỗi",
    online: true,
  },
  {
    id: 9,
    name: "Lê Văn C",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    status: "Bận",
    online: true,
  },
  {
    id: 10,
    name: "Phạm Thị D",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
    status: "Đang hoạt động",
    online: true,
  },
];

export function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [requests, setRequests] = useState(mockFriendRequests);
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [friends, setFriends] = useState(mockAllFriends);
  const [showUnfriendModal, setShowUnfriendModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<any>(null);

  const handleAcceptRequest = (id: number) => {
    setRequests(requests.filter((req) => req.id !== id));
    toast.success("Đã chấp nhận lời mời kết bạn");
  };

  const handleRejectRequest = (id: number) => {
    setRequests(requests.filter((req) => req.id !== id));
    toast.info("Đã từ chối lời mời kết bạn");
  };

  const handleAddFriend = (id: number) => {
    setSuggestions(suggestions.filter((sug) => sug.id !== id));
    toast.success("Đã gửi lời mời kết bạn");
  };

  const handleUnfriendClick = (friend: any) => {
    setSelectedFriend(friend);
    setShowUnfriendModal(true);
  };

  const handleConfirmUnfriend = () => {
    if (selectedFriend) {
      setFriends(friends.filter((f) => f.id !== selectedFriend.id));
      toast.success(`Đã hủy kết bạn với ${selectedFriend.name}`);
      setShowUnfriendModal(false);
      setSelectedFriend(null);
    }
  };

  const handleCancelUnfriend = () => {
    setShowUnfriendModal(false);
    setSelectedFriend(null);
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Bạn bè</h1>
          <p className="text-white/60">Quản lý bạn bè và kết nối mới</p>
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
                    src={request.avatar}
                    alt={request.name}
                    className="w-14 h-14 rounded-full"
                  />
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">
                      {request.name}
                    </h3>
                    <p className="text-white/60 text-sm">
                      {request.mutualFriends} bạn chung
                    </p>
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

        <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h2 className="text-xl font-bold text-white mb-4">
            Gợi ý kết bạn
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="bg-slate-800/30 rounded-xl p-4 hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <img
                    src={suggestion.avatar}
                    alt={suggestion.name}
                    className="w-20 h-20 rounded-full mb-3"
                  />
                  <h3 className="text-white font-semibold mb-1">
                    {suggestion.name}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">
                    {suggestion.mutualFriends} bạn chung
                  </p>
                  <button
                    onClick={() => handleAddFriend(suggestion.id)}
                    className="w-full px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Kết bạn
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">
              Tất cả bạn bè
            </h2>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm font-semibold">
              {friends.length} bạn bè
            </span>
          </div>
          {friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-white/40" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">
                Chưa có bạn bè
              </h3>
              <p className="text-white/60 mb-4">
                Hãy bắt đầu kết nối với mọi người
              </p>
              <button className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                Tìm bạn bè
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-14 h-14 rounded-full"
                    />
                    {friend.online && (
                      <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 border-2 border-slate-950 rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold mb-1">
                      {friend.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-white/60">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {friend.mutualFriends} bạn chung
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {friend.lastActive}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
                      <MessageCircle className="w-4 h-4" />
                      Nhắn tin
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Hồ sơ
                    </button>
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
      </div>

      {showUnfriendModal && selectedFriend && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-red-500/20 p-8 max-w-md w-full">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Hủy kết bạn
              </h2>
              <p className="text-white/60">
                Bạn có chắc muốn hủy kết bạn với{" "}
                <span className="text-white font-semibold">{selectedFriend.name}</span>?
              </p>
            </div>

            <div className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl mb-6">
              <img
                src={selectedFriend.avatar}
                alt={selectedFriend.name}
                className="w-12 h-12 rounded-full"
              />
              <div className="flex-1">
                <h4 className="text-white font-semibold">
                  {selectedFriend.name}
                </h4>
                <p className="text-white/60 text-sm">
                  {selectedFriend.mutualFriends} bạn chung
                </p>
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
