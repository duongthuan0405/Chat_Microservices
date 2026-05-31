import { useState, useEffect } from "react";
import { MessageCircle, Clock, Loader2 } from "lucide-react";
import { notificationApi, NotificationItem } from "../../api/notificationApi";
import { signalrService } from "../../api/signalrClient";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchNotifications(1);

    const pageNotificationHandler = (newNoti: NotificationItem) => {
      setNotifications((prev) => [newNoti, ...prev]);
      setTotalCount((prev) => prev + 1);
    };

    signalrService.onReceiveNotification(pageNotificationHandler);

    return () => {
      signalrService.offReceiveNotification(pageNotificationHandler);
    };
  }, []);

  const fetchNotifications = async (pageNumber: number) => {
    try {
      if (pageNumber === 1) setLoading(true);
      else setLoadingMore(true);

      const data = await notificationApi.getNotifications(pageNumber, 10);
      if (pageNumber === 1) {
        setNotifications(data.items || []);
      } else {
        setNotifications(prev => [...prev, ...(data.items || [])]);
      }
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNotifications(nextPage);
  };

  const handleMarkAsRead = async (id: string, isRead: boolean) => {
    if (isRead) return;
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="h-full overflow-y-auto pb-20 md:pb-0 custom-scrollbar">
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
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleMarkAsRead(notification.id, notification.isRead)}
              className={`flex items-start gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                notification.isRead
                  ? "bg-slate-900/30 hover:bg-slate-900/50"
                  : "bg-slate-800/50 hover:bg-slate-800/70 border border-cyan-500/20"
              }`}
            >
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-white">
                    <span className="font-semibold">{notification.title}</span>{" "}
                    <span className="text-white/60">{notification.content}</span>
                  </p>
                  {!notification.isRead && (
                    <div className="w-2 h-2 bg-cyan-500 rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-white/40">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(notification.createdAt).toLocaleString("vi-VN")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        )}

        {loadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          </div>
        )}

        {!loading && notifications.length < totalCount && (
          <div className="mt-6 flex justify-center pb-4">
            <button 
              onClick={loadMore}
              disabled={loadingMore}
              className="px-6 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 font-semibold hover:bg-cyan-500/20 transition-all disabled:opacity-50"
            >
              Xem thêm thông báo
            </button>
          </div>
        )}

        {!loading && notifications.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-10 h-10 text-white/40" />
            </div>
            <h3 className="text-white font-semibold text-lg mb-2">
              Không có thông báo
            </h3>
            <p className="text-white/60">
              Bạn chưa có thông báo nào cả.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
