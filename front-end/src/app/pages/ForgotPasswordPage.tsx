import { useState } from "react";
import { Link } from "react-router";
import { MessageCircle, Mail, ArrowLeft, Check } from "lucide-react";

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep(2);
      startCountdown();
    }
  };

  const startCountdown = () => {
    setCanResend(false);
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every((digit) => digit !== "")) {
      setStep(3);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      setStep(4);
    }
  };

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return { strength: 0, label: "", color: "" };
    if (password.length < 6) return { strength: 25, label: "Yếu", color: "bg-red-500" };
    if (password.length < 10) return { strength: 50, label: "Trung bình", color: "bg-yellow-500" };
    if (password.length < 14) return { strength: 75, label: "Tốt", color: "bg-blue-500" };
    return { strength: 100, label: "Mạnh", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">VietChat</span>
          </div>

          {step === 1 && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Quên mật khẩu</h1>
              <p className="text-white/60 mb-8">
                Nhập email của bạn để nhận mã xác nhận
              </p>

              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-2 text-sm font-medium">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                >
                  Gửi mã xác nhận
                </button>

                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại đăng nhập
                </Link>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Xác minh mã OTP</h1>
              <p className="text-white/60 mb-8">
                Nhập mã 6 chữ số được gửi đến <span className="text-white font-semibold">{email}</span>
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-3 text-sm font-medium">
                    Mã xác nhận
                  </label>
                  <div className="flex gap-2 justify-between">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-full aspect-square text-center text-2xl font-bold bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                      />
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  {!canResend ? (
                    <p className="text-white/60 text-sm">
                      Gửi lại mã sau <span className="text-cyan-400 font-semibold">{countdown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        startCountdown();
                      }}
                      className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors"
                    >
                      Gửi lại mã
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={otp.some((digit) => digit === "")}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Xác nhận
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Quay lại
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-3xl font-bold text-white mb-2">Đặt lại mật khẩu</h1>
              <p className="text-white/60 mb-8">
                Tạo mật khẩu mới cho tài khoản của bạn
              </p>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-white/80 mb-2 text-sm font-medium">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    required
                  />
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-white/60">Độ mạnh mật khẩu</span>
                        <span className={`text-xs ${passwordStrength.strength >= 75 ? 'text-green-400' : passwordStrength.strength >= 50 ? 'text-blue-400' : passwordStrength.strength >= 25 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 mb-2 text-sm font-medium">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                    required
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1">Mật khẩu không khớp</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Đặt lại mật khẩu
                </button>
              </form>
            </>
          )}

          {step === 4 && (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-6">
                <Check className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">
                Đổi mật khẩu thành công!
              </h1>
              <p className="text-white/60 mb-8">
                Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
              </p>
              <Link
                to="/login"
                className="inline-block w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
