import { UserPlus, MessageCircle, Users, Settings, Clock } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    type: "friend_request",
    title: "Hoàng Văn E",
    message: "đã gửi lời mời kết bạn",
    time: "5 phút trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5",
    read: false,
    actionable: true,
  },
  {
    id: 2,
    type: "message",
    title: "Nguyễn Văn A",
    message: "đã gửi tin nhắn cho bạn",
    time: "10 phút trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    read: false,
    actionable: false,
  },
  {
    id: 3,
    type: "group_invite",
    title: "Nhóm Dự Án",
    message: "Bạn đã được thêm vào nhóm",
    time: "1 giờ trước",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group1",
    read: false,
    actionable: false,
  },
  {
    id: 4,
    type: "message",
    title: "Trần Thị B",
    message: "đã trả lời tin nhắn của bạn",
    time: "2 giờ trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    read: true,
    actionable: false,
  },
  {
    id: 5,
    type: "friend_request",
    title: "Vũ Thị F",
    message: "đã gửi lời mời kết bạn",
    time: "3 giờ trước",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user6",
    read: true,
    actionable: true,
  },
  {
    id: 6,
    type: "system",
    title: "Cập nhật hệ thống",
    message: "VietChat đã được cập nhật lên phiên bản 2.0",
    time: "Hôm qua",
    avatar: null,
    read: true,
    actionable: false,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "friend_request":
      return <UserPlus className="w-5 h-5 text-cyan-400" />;
    case "message":
      return <MessageCircle className="w-5 h-5 text-blue-400" />;
    case "group_invite":
      return <Users className="w-5 h-5 text-purple-400" />;
    case "system":
      return <Settings className="w-5 h-5 text-green-400" />;
    default:
      return <MessageCircle className="w-5 h-5 text-white/40" />;
  }
};

export function NotificationsPage() {
  const unreadCount = mockNotifications.filter((n) => !n.read).length;

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Thông báo</h1>
            <p className="text-white/60">
              Bạn có {unreadCount} thông báo chưa đọc
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg text-cyan-400 hover:bg-white/10 transition-all">
            Đánh dấu tất cả là đã đọc
          </button>
        </div>

        <div className="space-y-2">
          {mockNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                notification.read
                  ? "bg-slate-900/30 hover:bg-slate-900/50"
                  : "bg-slate-800/50 hover:bg-slate-800/70 border border-cyan-500/20"
              }`}
            >
              <div className="flex-shrink-0">
                {notification.avatar ? (
                  <div className="relative">
                    <img
                      src={notification.avatar}
                      alt={notification.title}
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                    {getNotificationIcon(notification.type)}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white">
                    <span className="font-semibold">{notification.title}</span>{" "}
                    <span className="text-white/60">{notification.message}</span>
                  </p>
                  {!notification.read && (
                    <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Clock className="w-4 h-4" />
                  <span>{notification.time}</span>
                </div>

                {notification.actionable && notification.type === "friend_request" && (
                  <div className="flex gap-2 mt-3">
                    <button className="px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white text-sm font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all">
                      Chấp nhận
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all">
                      Từ chối
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {mockNotifications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Không có thông báo
            </h3>
            <p className="text-white/60">
              Bạn đã xem hết tất cả thông báo
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
