import { useState } from "react";
import { Plus, Search, Users, Crown, Shield, User, Settings as SettingsIcon, X } from "lucide-react";

const mockGroups = [
  {
    id: 1,
    name: "Nhóm Dự Án",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group1",
    members: 24,
    lastActivity: "5 phút trước",
    unread: 3,
    category: "Công việc",
  },
  {
    id: 2,
    name: "Team Marketing",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group2",
    members: 15,
    lastActivity: "1 giờ trước",
    unread: 0,
    category: "Công việc",
  },
  {
    id: 3,
    name: "Bạn Học",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group3",
    members: 48,
    lastActivity: "2 giờ trước",
    unread: 12,
    category: "Học tập",
  },
];

const mockSuggestedGroups = [
  {
    id: 4,
    name: "Lập Trình Viên Việt Nam",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group4",
    members: 1240,
    category: "Công nghệ",
    description: "Cộng đồng các lập trình viên Việt Nam",
  },
  {
    id: 5,
    name: "Startup Việt",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group5",
    members: 856,
    category: "Kinh doanh",
    description: "Kết nối các startup và doanh nhân",
  },
  {
    id: 6,
    name: "Du lịch Việt Nam",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group6",
    members: 2340,
    category: "Du lịch",
    description: "Chia sẻ kinh nghiệm du lịch trong nước",
  },
];

const mockRecentActivity = [
  {
    id: 1,
    groupName: "Nhóm Dự Án",
    userName: "Nguyễn Văn A",
    action: "đã gửi tin nhắn mới",
    time: "5 phút trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
  },
  {
    id: 2,
    groupName: "Bạn Học",
    userName: "Trần Thị B",
    action: "đã chia sẻ một ảnh",
    time: "30 phút trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
  },
  {
    id: 3,
    groupName: "Team Marketing",
    userName: "Lê Văn C",
    action: "đã thêm 2 thành viên mới",
    time: "1 giờ trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
  },
];

const mockGroupMembers = [
  { id: 1, name: "Nguyễn Văn A", role: "admin", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1" },
  { id: 2, name: "Trần Thị B", role: "moderator", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2" },
  { id: 3, name: "Lê Văn C", role: "member", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3" },
  { id: 4, name: "Phạm Thị D", role: "member", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4" },
];

export function GroupsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showGroupDetails, setShowGroupDetails] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"joined" | "suggested" | "activity">("joined");

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      setShowCreateModal(false);
      setNewGroupName("");
      setNewGroupDescription("");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="w-4 h-4 text-yellow-400" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-blue-400" />;
      default:
        return <User className="w-4 h-4 text-white/40" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Quản trị viên";
      case "moderator":
        return "Người điều hành";
      default:
        return "Thành viên";
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Nhóm</h1>
            <p className="text-white/60">Quản lý và tạo nhóm trò chuyện</p>
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

        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab("joined")}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === "joined"
                ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                : "bg-slate-800/50 text-white/60 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            Nhóm của bạn
          </button>
          <button
            onClick={() => setActiveTab("suggested")}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === "suggested"
                ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                : "bg-slate-800/50 text-white/60 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            Khám phá nhóm
          </button>
          <button
            onClick={() => setActiveTab("activity")}
            className={`px-6 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeTab === "activity"
                ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                : "bg-slate-800/50 text-white/60 hover:text-white hover:bg-slate-800/70"
            }`}
          >
            Hoạt động gần đây
          </button>
        </div>

        {activeTab === "joined" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockGroups.map((group) => (
              <div
                key={group.id}
                className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-cyan-500/50 transition-all cursor-pointer"
                onClick={() => {
                  setSelectedGroup(group);
                  setShowGroupDetails(true);
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <img
                    src={group.avatar}
                    alt={group.name}
                    className="w-16 h-16 rounded-xl"
                  />
                  {group.unread > 0 && (
                    <span className="px-2.5 py-1 bg-cyan-500 text-white text-xs font-semibold rounded-full">
                      {group.unread}
                    </span>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">
                  {group.name}
                </h3>
                <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-semibold mb-3">
                  {group.category}
                </span>
                <div className="flex items-center gap-4 text-sm text-white/60">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{group.members} thành viên</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-white/40">{group.lastActivity}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "suggested" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockSuggestedGroups.map((group) => (
              <div
                key={group.id}
                className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6 hover:border-cyan-500/50 transition-all"
              >
                <img
                  src={group.avatar}
                  alt={group.name}
                  className="w-16 h-16 rounded-xl mb-4"
                />
                <h3 className="text-white font-bold text-lg mb-2">
                  {group.name}
                </h3>
                <span className="inline-block px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-semibold mb-3">
                  {group.category}
                </span>
                <p className="text-white/60 text-sm mb-4">{group.description}</p>
                <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                  <Users className="w-4 h-4" />
                  <span>{group.members.toLocaleString()} thành viên</span>
                </div>
                <button className="w-full py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                  Tham gia nhóm
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Hoạt động gần đây</h2>
            <div className="space-y-3">
              {mockRecentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                >
                  <img
                    src={activity.avatar}
                    alt={activity.userName}
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <p className="text-white">
                      <span className="font-semibold">{activity.userName}</span>{" "}
                      {activity.action} trong{" "}
                      <span className="font-semibold text-cyan-400">
                        {activity.groupName}
                      </span>
                    </p>
                    <p className="text-white/60 text-sm">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Tạo nhóm mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">
                  Tên nhóm
                </label>
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
                  Mô tả (tùy chọn)
                </label>
                <textarea
                  value={newGroupDescription}
                  onChange={(e) => setNewGroupDescription(e.target.value)}
                  placeholder="Mô tả về nhóm..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">
                  Ảnh nhóm
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-slate-800/50 border border-white/10 flex items-center justify-center">
                    <Users className="w-8 h-8 text-white/40" />
                  </div>
                  <button className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all">
                    Tải lên
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateGroup}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Tạo nhóm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showGroupDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={selectedGroup.avatar}
                  alt={selectedGroup.name}
                  className="w-16 h-16 rounded-xl"
                />
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-white/60">
                    {selectedGroup.members} thành viên
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

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Thành viên</h3>
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Thêm
                  </button>
                </div>
                <div className="space-y-2">
                  {mockGroupMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors"
                    >
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">
                          {member.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-sm text-white/60">
                          {getRoleIcon(member.role)}
                          <span>{getRoleLabel(member.role)}</span>
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
                        <SettingsIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-4">
                  Cài đặt nhóm
                </h3>
                <div className="space-y-2">
                  <button className="w-full p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors text-left text-white">
                    Chỉnh sửa thông tin nhóm
                  </button>
                  <button className="w-full p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors text-left text-white">
                    Quyền riêng tư
                  </button>
                  <button className="w-full p-3 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-colors text-left text-red-400">
                    Rời khỏi nhóm
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
