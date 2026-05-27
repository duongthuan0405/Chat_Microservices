import { useState } from "react";
import {
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  Globe,
  LogOut,
  Camera,
  Mail,
  Phone,
} from "lucide-react";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    username: "Người dùng hiện tại",
    email: "user@example.com",
    phone: "+84 123 456 789",
    bio: "Xin chào! Tôi đang sử dụng VietChat",
  });
  const [notificationSettings, setNotificationSettings] = useState({
    messages: true,
    friendRequests: true,
    groupInvites: true,
    mentions: true,
  });
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "friends",
    onlineStatus: true,
    readReceipts: true,
  });

  const tabs = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "security", label: "Bảo mật", icon: Lock },
    { id: "notifications", label: "Thông báo", icon: Bell },
    { id: "privacy", label: "Quyền riêng tư", icon: Shield },
    { id: "appearance", label: "Giao diện", icon: Palette },
  ];

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Cài đặt</h1>
          <p className="text-white/60">Quản lý tài khoản và tùy chỉnh trải nghiệm</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-2 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Thông tin cá nhân
                    </h2>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser"
                        alt="Avatar"
                        className="w-24 h-24 rounded-full ring-4 ring-cyan-500/50"
                      />
                      <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-1">Ảnh đại diện</h3>
                      <p className="text-white/60 text-sm mb-2">
                        PNG, JPG hoặc GIF, tối đa 5MB
                      </p>
                      <button className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all">
                        Thay đổi ảnh
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 mb-2 text-sm font-medium">
                        Tên người dùng
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="text"
                          value={formData.username}
                          onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 text-sm font-medium">
                        Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2 text-sm font-medium">
                        Số điện thoại
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm font-medium">
                      Giới thiệu
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                    />
                  </div>

                  <button className="px-6 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                    Lưu thay đổi
                  </button>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Bảo mật tài khoản
                    </h2>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Đổi mật khẩu</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white/80 mb-2 text-sm font-medium">
                          Mật khẩu hiện tại
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 mb-2 text-sm font-medium">
                          Mật khẩu mới
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                      <div>
                        <label className="block text-white/80 mb-2 text-sm font-medium">
                          Xác nhận mật khẩu mới
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-white font-semibold mb-3">
                      Xác thực hai yếu tố
                    </h3>
                    <p className="text-white/60 text-sm mb-4">
                      Thêm một lớp bảo mật bổ sung cho tài khoản của bạn
                    </p>
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all">
                      Kích hoạt 2FA
                    </button>
                  </div>

                  <button className="px-6 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                    Cập nhật mật khẩu
                  </button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Cài đặt thông báo
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Tin nhắn mới
                        </h4>
                        <p className="text-white/60 text-sm">
                          Nhận thông báo khi có tin nhắn mới
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.messages}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              messages: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Lời mời kết bạn
                        </h4>
                        <p className="text-white/60 text-sm">
                          Nhận thông báo khi có lời mời kết bạn
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.friendRequests}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              friendRequests: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="text-white font-semibold mb-1">
                          Lời mời nhóm
                        </h4>
                        <p className="text-white/60 text-sm">
                          Nhận thông báo khi được mời vào nhóm
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.groupInvites}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              groupInvites: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500" />
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                      <div>
                        <h4 className="text-white font-semibold mb-1">Nhắc đến</h4>
                        <p className="text-white/60 text-sm">
                          Nhận thông báo khi được nhắc đến
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings.mentions}
                          onChange={(e) =>
                            setNotificationSettings({
                              ...notificationSettings,
                              mentions: e.target.checked,
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500" />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Quyền riêng tư
                    </h2>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-2 text-sm font-medium">
                      Ai có thể xem hồ sơ của bạn?
                    </label>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) =>
                        setPrivacySettings({
                          ...privacySettings,
                          profileVisibility: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                    >
                      <option value="everyone">Mọi người</option>
                      <option value="friends">Chỉ bạn bè</option>
                      <option value="private">Riêng tư</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Hiển thị trạng thái hoạt động
                      </h4>
                      <p className="text-white/60 text-sm">
                        Cho phép người khác thấy bạn đang online
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.onlineStatus}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            onlineStatus: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500" />
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl">
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Xác nhận đã đọc
                      </h4>
                      <p className="text-white/60 text-sm">
                        Hiển thị khi bạn đã đọc tin nhắn
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacySettings.readReceipts}
                        onChange={(e) =>
                          setPrivacySettings({
                            ...privacySettings,
                            readReceipts: e.target.checked,
                          })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-cyan-500 peer-checked:to-blue-500" />
                    </label>
                  </div>
                </div>
              )}

              {activeTab === "appearance" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-4">
                      Giao diện
                    </h2>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-3 text-sm font-medium">
                      Chủ đề
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 bg-slate-800/30 border-2 border-cyan-500 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors">
                        <div className="w-full h-20 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 rounded-lg mb-2" />
                        <p className="text-white text-sm font-medium text-center">
                          Tối (Mặc định)
                        </p>
                      </div>
                      <div className="p-4 bg-slate-800/30 border-2 border-white/10 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors opacity-50">
                        <div className="w-full h-20 bg-gradient-to-br from-white to-gray-200 rounded-lg mb-2" />
                        <p className="text-white text-sm font-medium text-center">
                          Sáng
                        </p>
                      </div>
                      <div className="p-4 bg-slate-800/30 border-2 border-white/10 rounded-xl cursor-pointer hover:bg-slate-800/50 transition-colors opacity-50">
                        <div className="w-full h-20 bg-gradient-to-br from-purple-900 to-pink-900 rounded-lg mb-2" />
                        <p className="text-white text-sm font-medium text-center">
                          AMOLED
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-white/80 mb-3 text-sm font-medium">
                      Màu chủ đạo
                    </label>
                    <div className="flex gap-3">
                      <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 ring-4 ring-cyan-500/50" />
                      <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 opacity-50 hover:opacity-100 transition-opacity" />
                      <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 opacity-50 hover:opacity-100 transition-opacity" />
                      <button className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 opacity-50 hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-red-500/20 p-6">
              <h3 className="text-red-400 font-bold mb-2">Vùng nguy hiểm</h3>
              <p className="text-white/60 text-sm mb-4">
                Hành động này không thể hoàn tác
              </p>
              <button className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-all flex items-center gap-2">
                <LogOut className="w-5 h-5" />
                Xóa tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
