import { Outlet, Link, useLocation } from "react-router";
import { MessageCircle, Users, Settings, Bell, UserCircle, UsersRound } from "lucide-react";
import { useState } from "react";

export function DashboardLayout() {
  const location = useLocation();
  const [showMobileNav, setShowMobileNav] = useState(false);

  const navItems = [
    { path: "/app", icon: MessageCircle, label: "Tin nhắn", exact: true, badge: 5 },
    { path: "/app/friends", icon: Users, label: "Bạn bè", badge: 3 },
    { path: "/app/groups", icon: UsersRound, label: "Nhóm", badge: 15 },
    { path: "/app/notifications", icon: Bell, label: "Thông báo", badge: 8 },
    { path: "/app/profile", icon: UserCircle, label: "Hồ sơ" },
    { path: "/app/settings", icon: Settings, label: "Cài đặt" },
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
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
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
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
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
