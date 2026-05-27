import { useState } from "react";
import { Camera, MapPin, Calendar, Mail, Phone, Edit2, Users, MessageCircle, Image as ImageIcon } from "lucide-react";

export function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);

  const mockPhotos = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    url: `https://api.dicebear.com/7.x/shapes/svg?seed=photo${i + 1}`,
  }));

  const mockFriends = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    name: `Bạn bè ${i + 1}`,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=friend${i + 1}`,
  }));

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-5xl mx-auto">
        <div className="relative">
          <div className="h-64 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-500/20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950" />
            <button className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-slate-900/80 backdrop-blur-sm text-white font-medium hover:bg-slate-900 transition-all flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Đổi ảnh bìa
            </button>
          </div>

          <div className="px-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between -mt-20 relative">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="relative">
                  <img
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser"
                    alt="Profile"
                    className="w-40 h-40 rounded-3xl ring-4 ring-slate-950 bg-slate-900"
                  />
                  <button className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="pb-4">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    Người dùng hiện tại
                  </h1>
                  <p className="text-white/60 mb-3">
                    Xin chào! Tôi đang sử dụng VietChat
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-white/60">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-4 h-4" />
                      <span>Hà Nội, Việt Nam</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>Tham gia tháng 1, 2024</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pb-4 mt-4 md:mt-0">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh sửa
                </button>
              </div>
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
                    <p className="font-medium">user@example.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-xs text-white/60">Điện thoại</p>
                    <p className="font-medium">+84 123 456 789</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-xs text-white/60">Địa chỉ</p>
                    <p className="font-medium">Hà Nội, Việt Nam</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-white/80">
                  <Calendar className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-xs text-white/60">Ngày tham gia</p>
                    <p className="font-medium">15 Tháng 1, 2024</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Bạn bè</h2>
                <span className="text-cyan-400 text-sm font-semibold">
                  {mockFriends.length * 10} bạn bè
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {mockFriends.map((friend) => (
                  <div key={friend.id} className="group cursor-pointer">
                    <img
                      src={friend.avatar}
                      alt={friend.name}
                      className="w-full aspect-square rounded-xl bg-slate-800/50 group-hover:ring-2 group-hover:ring-cyan-500/50 transition-all"
                    />
                  </div>
                ))}
              </div>
              <button className="w-full py-2 rounded-lg bg-white/10 text-white font-medium hover:bg-white/20 transition-all">
                Xem tất cả bạn bè
              </button>
            </div>
          </div>

          <div className="md:col-span-2 space-y-6">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Ảnh</h2>
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors">
                  Xem tất cả
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {mockPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity group"
                  >
                    <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <ImageIcon className="w-8 h-8 text-white/40" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Hoạt động gần đây</h2>
              </div>
              <div className="space-y-4">
                {[
                  {
                    id: 1,
                    type: "post",
                    text: "Đã cập nhật ảnh đại diện",
                    time: "2 giờ trước",
                  },
                  {
                    id: 2,
                    type: "friend",
                    text: "Đã kết bạn với 3 người",
                    time: "1 ngày trước",
                  },
                  {
                    id: 3,
                    type: "group",
                    text: "Đã tham gia nhóm Dự Án",
                    time: "2 ngày trước",
                  },
                ].map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      {activity.type === "post" && <MessageCircle className="w-5 h-5 text-cyan-400" />}
                      {activity.type === "friend" && <Users className="w-5 h-5 text-blue-400" />}
                      {activity.type === "group" && <Users className="w-5 h-5 text-purple-400" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-white">{activity.text}</p>
                      <p className="text-white/60 text-sm">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
