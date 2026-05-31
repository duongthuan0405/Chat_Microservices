import { useState, useEffect } from "react";
import { Camera, Calendar, Mail, Phone, Edit2, Users, MessageCircle, User as UserIcon, X } from "lucide-react";
import { authApi } from "../../api/authApi";
import { friendshipApi, FriendResponse } from "../../api/friendshipApi";
import { conversationApi } from "../../api/conversationApi";
import { useNavigate } from "react-router";

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editForm, setEditForm] = useState({
    name: "",
    phoneNumber: "",
    gender: "Male",
  });

  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);
  const [friendDetail, setFriendDetail] = useState<FriendResponse | null>(null);
  const [friendsPage, setFriendsPage] = useState(1);
  const FRIENDS_PAGE_SIZE = 12;

  useEffect(() => {
    const fetchProfileAndFriends = async () => {
      try {
        const userId = localStorage.getItem("user_id");
        if (userId) {
          const [profileData, friendsIds] = await Promise.all([
            authApi.getProfile(userId),
            friendshipApi.getFriends()
          ]);
          setProfile(profileData);
          setEditForm({
            name: profileData.name || "",
            phoneNumber: profileData.phoneNumber || "",
            gender: profileData.gender || "Male",
          });

          // Fetch profiles for friends
          if (friendsIds && Array.isArray(friendsIds)) {
            const stringIds = friendsIds.map(item => typeof item === "string" ? item : item.id);
            const profiles = await Promise.all(
              stringIds.map(id => authApi.getProfile(id).catch(() => null))
            );
            const validProfiles = profiles.filter(p => p !== null).map(p => p.data || p) as FriendResponse[];
            setFriends(validProfiles);
          } else {
            setFriends([]);
          }
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndFriends();
  }, []);

  const handleSave = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (userId) {
        setLoading(true);
        const data = await authApi.updateProfile(userId, editForm);
        setProfile(data);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Lỗi cập nhật profile:", error);
      alert("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleMessageFriend = async (friend: FriendResponse) => {
    try {
      await conversationApi.createDirect(friend.id);
      navigate("/app");
    } catch (error) {
      console.error("Lỗi tạo/chuyển đến tin nhắn:", error);
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto">
        <div className="relative pt-12 px-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="relative shrink-0">
                <img
                  src={profile?.avatarUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser"}
                  alt="Profile"
                  className="w-32 h-32 md:w-40 md:h-40 rounded-3xl ring-4 ring-slate-950 bg-slate-900 object-cover"
                />
                <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {loading ? "Đang tải..." : profile?.name || "Người dùng VietChat"}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4" />
                    <span>{profile?.gender === "Male" ? "Nam" : profile?.gender === "Female" ? "Nữ" : "Chưa xác định"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Tham gia {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "..."}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex shrink-0">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 p-6">
          <div className="md:col-span-1 space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Giới thiệu</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <div>
                    <p className="text-xs text-white/60">Email</p>
                    <p className="font-medium">{loading ? "..." : profile?.email || "Chưa cập nhật"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-xs text-white/60">Điện thoại</p>
                    <p className="font-medium">{loading ? "..." : profile?.phoneNumber || "Chưa cập nhật"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <UserIcon className="w-5 h-5 text-purple-400" />
                  <div className="flex-1">
                    <p className="text-xs text-white/60">Giới tính</p>
                    <p className="font-medium">{loading ? "..." : profile?.gender === "Male" ? "Nam" : profile?.gender === "Female" ? "Nữ" : "Chưa xác định"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-white/60">Ngày tham gia</p>
                    <p className="font-medium">{loading ? "..." : profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("vi-VN") : "Chưa cập nhật"}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Bạn bè</h2>
                <span className="text-cyan-400 text-sm font-semibold px-3 py-1 rounded-full bg-cyan-500/10">
                  {friends.length} người bạn
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {friends.slice(0, 10).map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => setFriendDetail(friend)}
                    className="flex flex-col items-center p-4 bg-slate-800/30 rounded-2xl hover:bg-slate-800/60 transition-all cursor-pointer border border-white/5 hover:border-cyan-500/30 group hover:-translate-y-1"
                  >
                    <div className="relative mb-3">
                      <img
                        src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                        alt={friend.name}
                        className="w-16 h-16 rounded-full bg-slate-800 object-cover ring-2 ring-white/10 group-hover:ring-cyan-500/50 transition-all"
                      />
                    </div>
                    <span className="text-white/80 text-sm font-medium text-center truncate w-full group-hover:text-cyan-400 transition-colors">
                      {friend.name}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t border-white/5">
                <button 
                  onClick={() => setShowFriendsModal(true)}
                  className="w-full py-3 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-all"
                >
                  Xem tất cả bạn bè
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Chỉnh sửa hồ sơ</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Tên hiển thị</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="Nhập tên của bạn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Số điện thoại</label>
                <input
                  type="text"
                  value={editForm.phoneNumber}
                  onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white/80 mb-1.5">Giới tính</label>
                <select
                  value={editForm.gender}
                  onChange={(e) => setEditForm({...editForm, gender: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-800/50 border border-white/10 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all appearance-none"
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                  <option value="Other">Khác</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({
                    name: profile?.name || "",
                    phoneNumber: profile?.phoneNumber || "",
                    gender: profile?.gender || "Male",
                  });
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50"
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Friends Modal */}
      {showFriendsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowFriendsModal(false)} />
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-2xl relative z-10 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-xl font-bold text-white">Tất cả bạn bè ({friends.length})</h2>
              <button 
                onClick={() => setShowFriendsModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {friends.slice(0, friendsPage * FRIENDS_PAGE_SIZE).map((friend) => (
                  <div
                    key={friend.id}
                    onClick={() => {
                      setShowFriendsModal(false);
                      setFriendDetail(friend);
                    }}
                    className="flex flex-col items-center p-5 bg-slate-800/30 rounded-2xl hover:bg-slate-800/60 transition-all cursor-pointer border border-white/5 hover:border-cyan-500/30 group hover:-translate-y-1"
                  >
                    <div className="relative mb-3">
                      <img
                        src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                        alt={friend.name}
                        className="w-20 h-20 rounded-full bg-slate-800 object-cover ring-2 ring-white/10 group-hover:ring-cyan-500/50 transition-all"
                      />
                    </div>
                    <h3 className="text-white font-semibold text-center w-full truncate px-2">{friend.name || "Người dùng"}</h3>
                  </div>
                ))}
              </div>
              
              {friends.length > friendsPage * FRIENDS_PAGE_SIZE && (
                <div className="mt-8 flex justify-center pb-4">
                  <button 
                    onClick={() => setFriendsPage(prev => prev + 1)}
                    className="px-6 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all"
                  >
                    Xem thêm
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CHI TIẾT BẠN BÈ */}
      {friendDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4" onClick={() => setFriendDetail(null)}>
          <div 
            className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-sm w-full relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setFriendDetail(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center mt-2 mb-2">
              <img
                src={friendDetail.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friendDetail.id}`}
                alt={friendDetail.name}
                className="w-28 h-28 rounded-full bg-slate-800 object-cover ring-4 ring-cyan-500/20 mb-4"
              />
              <h2 className="text-2xl font-bold text-white mb-1 text-center">{friendDetail.name}</h2>
              <p className="text-white/60 text-center mb-6">{friendDetail.email}</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleMessageFriend(friendDetail)}
                className="w-full py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Nhắn tin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
