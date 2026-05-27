import { Link } from "react-router";
import { MessageCircle, Users, Video, Shield, Zap, Globe } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      <nav className="fixed top-0 w-full bg-slate-950/50 backdrop-blur-xl border-b border-white/10 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">VietChat</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-6 py-2.5 text-white/80 hover:text-white transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
            >
              Đăng ký
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h1 className="text-6xl font-bold text-white mb-6 leading-tight">
              Trò chuyện thời gian thực
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                cho cộng đồng Việt Nam
              </span>
            </h1>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Kết nối với bạn bè, gia đình và cộng đồng của bạn với nền tảng nhắn tin hiện đại,
              bảo mật và nhanh chóng.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link
                to="/register"
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
              >
                Bắt đầu ngay
              </Link>
              <Link
                to="/app"
                className="px-8 py-4 rounded-xl bg-white/10 backdrop-blur-xl text-white font-semibold text-lg hover:bg-white/20 transition-all"
              >
                Xem demo
              </Link>
            </div>
          </div>

          <div className="relative mb-32">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl" />
            <div className="relative bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-slate-800/50 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4">
                    <MessageCircle className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded mb-2 w-3/4" />
                  <div className="h-2 bg-slate-700/30 rounded w-1/2" />
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded mb-2 w-2/3" />
                  <div className="h-2 bg-slate-700/30 rounded w-full" />
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-6">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
                    <Video className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="h-3 bg-slate-700/50 rounded mb-2 w-4/5" />
                  <div className="h-2 bg-slate-700/30 rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-32">
            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-6">
                <Zap className="w-7 h-7 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Cực nhanh</h3>
              <p className="text-white/60">
                Tin nhắn được gửi và nhận ngay lập tức với công nghệ thời gian thực tiên tiến.
              </p>
            </div>

            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-blue-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center mb-6">
                <Shield className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Bảo mật</h3>
              <p className="text-white/60">
                Mã hóa đầu cuối đảm bảo cuộc trò chuyện của bạn luôn riêng tư và an toàn.
              </p>
            </div>

            <div className="bg-slate-900/30 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
                <Globe className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Toàn cầu</h3>
              <p className="text-white/60">
                Kết nối với người Việt khắp nơi trên thế giới, mọi lúc mọi nơi.
              </p>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Sẵn sàng kết nối?
            </h2>
            <p className="text-white/60 mb-8 text-lg">
              Tham gia hàng triệu người dùng đang sử dụng VietChat mỗi ngày
            </p>
            <Link
              to="/register"
              className="inline-block px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-cyan-500/50 transition-all"
            >
              Tạo tài khoản miễn phí
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-white">VietChat</span>
              </div>
              <p className="text-white/60 text-sm">
                Nền tảng trò chuyện hiện đại cho người Việt
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Sản phẩm</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Tính năng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Bảo mật</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Doanh nghiệp</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Liên hệ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Trạng thái</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Pháp lý</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li><a href="#" className="hover:text-white transition-colors">Điều khoản</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Quyền riêng tư</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm text-white/40">
            © 2026 VietChat. Tất cả quyền được bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
}
