import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { MessageCircle, Users, Bell, UserCircle, UsersRound, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { signalrService } from "../../api/signalrClient";
import { chatHubService } from "../../api/chatHubClient";
import { notificationApi } from "../../api/notificationApi";
import { conversationApi } from "../../api/conversationApi";
import { toast } from "sonner";

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [hasUnreadNoti, setHasUnreadNoti] = useState(false);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Fetch initial unread status
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const notiData = await notificationApi.getNotifications(1, 20);
        if (notiData && notiData.items) {
          const hasUnread = notiData.items.some((n: any) => !n.isRead);
          setHasUnreadNoti(hasUnread);
        }

        const convData = await conversationApi.getConversations();
        if (convData && Array.isArray(convData)) {
          const hasUnreadMsg = convData.some((c: any) => c.unreadCount && c.unreadCount > 0);
          setHasUnreadMessages(hasUnreadMsg);
        }
      } catch (err) {
        console.error("Lỗi kiểm tra thông báo/tin nhắn:", err);
      }
    };
    fetchUnread();
  }, []);

  // Reset when visiting pages
  useEffect(() => {
    if (location.pathname.includes("/notifications")) {
      setHasUnreadNoti(false);
    }
    if (location.pathname === "/app") {
      setHasUnreadMessages(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const notificationHandler = (newNoti: any) => {
      console.log("📬 Nhận được thông báo mới:", newNoti);
      setHasUnreadNoti(true);
      toast.info(`🔔 ${newNoti.title || "Thông báo mới"}`, {
        description: newNoti.content || "Bạn có một thông báo mới",
      });
    };

    const chatHandler = (newMsg: any) => {
      const currentUserId = localStorage.getItem("user_id");
      if (newMsg.senderId === currentUserId) return;

      setHasUnreadMessages(true);

      console.log("💬 Nhận được tin nhắn mới:", newMsg);
      toast.message(`Tin nhắn từ ${newMsg.senderName || "Ai đó"}`, {
        description: newMsg.content || "Có một tin nhắn mới",
        icon: <MessageCircle className="w-4 h-4 text-cyan-400" />,
      });
    };

    const handleClearUnread = () => setHasUnreadMessages(false);
    window.addEventListener("clearUnreadMessages", handleClearUnread);

    if (token) {
      signalrService.startConnection(token);
      signalrService.onReceiveNotification(notificationHandler);

      chatHubService.startConnection(token);
      chatHubService.onReceiveMessage(chatHandler);
    }

    return () => {
      window.removeEventListener("clearUnreadMessages", handleClearUnread);
      signalrService.offReceiveNotification(notificationHandler);
      chatHubService.offReceiveMessage(chatHandler);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_id");
    navigate("/login");
  };

  const navItems = [
    { path: "/app", icon: MessageCircle, label: "Tin nhắn", exact: true, hasUnread: hasUnreadMessages },
    { path: "/app/friends", icon: Users, label: "Bạn bè" },
    { path: "/app/notifications", icon: Bell, label: "Thông báo", hasUnread: hasUnreadNoti },
    { path: "/app/profile", icon: UserCircle, label: "Hồ sơ" },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col overflow-hidden">
      <div className="hidden md:flex items-center justify-between px-6 py-4 bg-slate-950/50 backdrop-blur-xl border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">VietChat</span>
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:flex w-20 flex-col items-center py-6 bg-slate-950/30 backdrop-blur-xl border-r border-white/10">
          <nav className="flex-1 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all relative ${
                  isActive(item.path, item.exact)
                    ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
                title={item.label}
              >
                <item.icon className="w-6 h-6" />
                {item.hasUnread && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                )}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto mb-2">
            <button
              onClick={handleLogout}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
              title="Đăng xuất"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 z-50">
        <div className="grid grid-cols-5 gap-1 p-2">
          {navItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all relative ${
                isActive(item.path, item.exact)
                  ? "text-cyan-400 bg-cyan-500/10"
                  : "text-white/60"
              }`}
            >
              <div className="relative">
                <item.icon className="w-5 h-5" />
                {item.hasUnread && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
                )}
              </div>
              <span className="text-[10px]">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
