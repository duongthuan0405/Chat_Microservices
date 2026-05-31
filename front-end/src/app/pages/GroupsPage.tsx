import { useState, useEffect } from "react";
import { Plus, Search, Users, Crown, Shield, User, Settings as SettingsIcon, X, Loader2, Check, UserPlus, UserMinus } from "lucide-react";
import { conversationApi, ConversationResponse, ConversationMember } from "../../api/conversationApi";
import { friendshipApi, FriendResponse } from "../../api/friendshipApi";
import { authApi } from "../../api/authApi";

export function GroupsPage() {
  const [groups, setGroups] = useState<ConversationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<ConversationResponse | null>(null);
  const [groupMembers, setGroupMembers] = useState<ConversationMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [friendsToAdd, setFriendsToAdd] = useState<string[]>([]);
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => {
    fetchGroups();
    fetchFriends();
    setCurrentUserId(localStorage.getItem("user_id"));
  }, []);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const data = await conversationApi.getConversations();
      // Lọc ra các hội thoại là nhóm
      setGroups(data.filter((c: any) => c.isGroup === true || c.type === "GROUP") || []);
    } catch (error) {
      console.error("Lỗi khi tải nhóm:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const data = await friendshipApi.getFriends();
      const ids = data || [];
      const stringIds = ids.map((item: any) => typeof item === "string" ? item : item.id);
      const profiles = await Promise.all(
        stringIds.map(id => authApi.getProfile(id).catch(() => null))
      );
      const friendsProfiles = profiles.filter(p => p !== null).map(p => p.data || p);
      setFriends(friendsProfiles);
    } catch (error) {
      console.error("Lỗi tải bạn bè:", error);
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      alert("Vui lòng nhập tên nhóm!");
      return;
    }
    if (selectedFriends.length === 0) {
      alert("Vui lòng chọn ít nhất 1 thành viên!");
      return;
    }
    try {
      setCreating(true);
      await conversationApi.createGroup(newGroupName, selectedFriends);
      setShowCreateModal(false);
      setNewGroupName("");
      setSelectedFriends([]);
      fetchGroups();
    } catch (error) {
      console.error("Lỗi tạo nhóm:", error);
      alert("Tạo nhóm thất bại");
    } finally {
      setCreating(false);
    }
  };

  const handleOpenGroupDetails = async (group: ConversationResponse) => {
    setSelectedGroup(group);
    setShowGroupDetails(true);
    try {
      setLoadingMembers(true);
      const members = await conversationApi.getMembers(group.id);
      
      // Fetch profiles for members to get names and avatars
      if (members && members.length > 0) {
        const membersWithProfiles = await Promise.all(
          members.map(async (m: any) => {
            const mId = m.userId || m.user_id || m.id;
            try {
              const profileReq = await authApi.getProfile(mId);
              const profile = profileReq.data || profileReq;
              return { ...m, name: profile.name || m.name, avatarUrl: profile.avatarUrl || m.avatarUrl };
            } catch (e) {
              return m;
            }
          })
        );
        setGroupMembers(membersWithProfiles);
      } else {
        setGroupMembers([]);
      }
    } catch (error) {
      console.error("Lỗi tải thành viên:", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleLeaveGroup = async () => {
    if (!selectedGroup) return;
    if (confirm(`Bạn có chắc chắn muốn rời nhóm "${selectedGroup.name}"?`)) {
      try {
        await conversationApi.leaveGroup(selectedGroup!.id);
        setShowGroupDetails(false);
        fetchGroups();
      } catch (error) {
        console.error("Lỗi rời nhóm:", error);
        alert("Rời nhóm thất bại!");
      }
    }
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!selectedGroup) return;
    if (confirm(`Bạn có chắc chắn muốn kick "${memberName}" ra khỏi nhóm?`)) {
      try {
        await conversationApi.removeMember(selectedGroup!.id, memberId);
        alert("Đã kick thành viên thành công!");
        const members = await conversationApi.getMembers(selectedGroup!.id);
      
        if (members && members.length > 0) {
          const membersWithProfiles = await Promise.all(
            members.map(async (m: any) => {
              const mId = m.userId || m.user_id || m.id;
              try {
                const profileReq = await authApi.getProfile(mId);
                const profile = profileReq.data || profileReq;
                return { ...m, name: profile.name || m.name, avatarUrl: profile.avatarUrl || m.avatarUrl };
              } catch (e) {
                return m;
              }
            })
          );
          setGroupMembers(membersWithProfiles);
        } else {
          setGroupMembers([]);
        }
      } catch (error) {
        console.error("Lỗi kick thành viên:", error);
        alert("Thao tác thất bại!");
      }
    }
  };

  const handleAddMember = async () => {
    if (!selectedGroup || friendsToAdd.length === 0) return;
    try {
      setAddingMember(true);
      await Promise.all(
        friendsToAdd.map(id => conversationApi.addMember(selectedGroup!.id, id))
      );
      alert("Đã thêm thành viên thành công!");
      setShowAddMemberModal(false);
      setFriendsToAdd([]);
      const members = await conversationApi.getMembers(selectedGroup!.id);
      
      if (members && members.length > 0) {
        const membersWithProfiles = await Promise.all(
          members.map(async (m: any) => {
            const mId = m.userId || m.user_id || m.id;
            try {
              const profileReq = await authApi.getProfile(mId);
              const profile = profileReq.data || profileReq;
              return { ...m, name: profile.name || m.name, avatarUrl: profile.avatarUrl || m.avatarUrl };
            } catch (e) {
              return m;
            }
          })
        );
        setGroupMembers(membersWithProfiles);
      } else {
        setGroupMembers([]);
      }
    } catch (error) {
      console.error("Lỗi thêm thành viên:", error);
      alert("Thêm thành viên thất bại!");
    } finally {
      setAddingMember(false);
    }
  };

  const toggleFriendToAdd = (id: string) => {
    setFriendsToAdd((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const toggleFriendSelection = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const filteredGroups = groups.filter((g) =>
    g.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-white/40" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role?.toLowerCase()) {
      case "owner":
      case "admin":
        return "Quản trị viên";
      case "moderator":
        return "Quản trị viên phó";
      default:
        return "Thành viên";
    }
  };

  const isCurrentUserAdmin = () => {
    if (!currentUserId) return false;
    return groupMembers.some(m => {
      const mId = m.userId || m.user_id || m.id;
      const role = (m.role || "").toUpperCase();
      return mId === currentUserId && (role === "OWNER" || role === "ADMIN");
    });
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0 custom-scrollbar">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Nhóm của bạn</h1>
            <p className="text-white/60">Quản lý và tạo nhóm trò chuyện mới</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tạo nhóm
          </button>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm nhóm..."
            className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">Chưa có nhóm nào</h3>
            <p className="text-white/60">Bạn chưa tham gia nhóm nào. Hãy tạo nhóm mới để bắt đầu!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => handleOpenGroupDetails(group)}
              >
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={group.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${group.id}`}
                    alt={group.name}
                    className="w-16 h-16 rounded-xl bg-slate-800"
                  />
                  {group.unreadCount && group.unreadCount > 0 ? (
                    <span className="px-2.5 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full">
                      {group.unreadCount}
                    </span>
                  ) : null}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{group.name}</h3>
                <div className="flex items-center gap-4 text-sm text-white/60 mt-4">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{group.membersCount || "..."} thành viên</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Tạo nhóm */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-2xl font-bold text-white">Tạo nhóm mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Tên nhóm</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="VD: Nhóm Dự Án ABC"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">
                  Chọn thành viên ({selectedFriends.length})
                </label>
                {friends.length === 0 ? (
                  <p className="text-white/40 text-sm">Bạn chưa có bạn bè nào để thêm.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 border border-white/10 p-2 rounded-xl bg-slate-800/20">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => toggleFriendSelection(friend.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedFriends.includes(friend.id) ? "bg-cyan-500/20 border border-cyan-500/50" : "hover:bg-slate-800/50 border border-transparent"
                        }`}
                      >
                        <img
                          src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                          alt={friend.name}
                          className="w-8 h-8 rounded-full bg-slate-800"
                        />
                        <span className="text-white text-sm flex-1">{friend.name}</span>
                        {selectedFriends.includes(friend.id) && (
                          <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6 shrink-0 mt-auto border-t border-white/10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tạo nhóm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chi tiết nhóm */}
      {showGroupDetails && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex items-start justify-between mb-6 shrink-0 border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedGroup.avatarUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${selectedGroup.id}`}
                  alt={selectedGroup.name}
                  className="w-16 h-16 rounded-xl bg-slate-800"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedGroup.name}</h2>
                  <p className="text-white/60">
                    {loadingMembers ? "Đang tải thành viên..." : `${groupMembers.length} thành viên`}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGroupDetails(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 min-h-0">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Thành viên</h3>
                  {isCurrentUserAdmin() && (
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold flex items-center gap-1 bg-cyan-500/10 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-4 h-4" /> Thêm
                    </button>
                  )}
                </div>
                {loadingMembers ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {groupMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                      >
                        <img
                          src={member.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.id}`}
                          alt={member.name}
                          className="w-10 h-10 rounded-full bg-slate-800"
                        />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold">{member.name}</h4>
                          <div className="flex items-center gap-1.5 text-sm text-white/60">
                            {getRoleIcon(member.role)}
                            <span>{getRoleLabel(member.role)}</span>
                          </div>
                        </div>
                        {currentUserId && 
                         (member.userId || member.user_id || member.id) !== currentUserId && 
                         isCurrentUserAdmin() && (
                          <button
                            onClick={() => handleRemoveMember((member.userId || member.user_id || member.id) as string, member.name || "thành viên")}
                            title="Kick thành viên"
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-white/10 pt-6">
                <h3 className="text-lg font-bold text-white mb-4">Cài đặt nhóm</h3>
                <div className="space-y-2">
                  <button 
                    onClick={handleLeaveGroup}
                    className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors text-left text-red-400 font-semibold flex items-center justify-between"
                  >
                    <span>Rời khỏi nhóm</span>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Thành Viên */}
      {showAddMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6 shrink-0 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Thêm thành viên</h2>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setFriendsToAdd([]);
                }}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 mb-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80 px-1 block">Chọn bạn bè</label>
                {friends.filter(f => !groupMembers.some(m => (m.userId || m.user_id || m.id) === f.id)).length === 0 ? (
                  <p className="text-white/40 text-sm">Không còn bạn bè nào để thêm.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 border border-white/10 p-2 rounded-xl bg-slate-800/20">
                    {friends.filter(f => !groupMembers.some(m => (m.userId || m.user_id || m.id) === f.id)).map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => toggleFriendToAdd(friend.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          friendsToAdd.includes(friend.id) ? "bg-cyan-500/20 border border-cyan-500/50" : "hover:bg-slate-800/50 border border-transparent"
                        }`}
                      >
                        <img
                          src={friend.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.id}`}
                          alt={friend.name}
                          className="w-8 h-8 rounded-full bg-slate-800"
                        />
                        <span className="text-white text-sm flex-1 truncate">{friend.name}</span>
                        {friendsToAdd.includes(friend.id) && (
                          <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6 shrink-0 mt-6 border-t border-white/10">
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setFriendsToAdd([]);
                }}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleAddMember}
                disabled={addingMember || friendsToAdd.length === 0}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {addingMember ? <Loader2 className="w-5 h-5 animate-spin" /> : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
