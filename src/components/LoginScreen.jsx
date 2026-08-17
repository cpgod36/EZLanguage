import React, { useState } from 'react';
import { BookOpen, Mail, Lock, LogIn, UserPlus, ArrowRight, ShieldCheck, AlertCircle, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../utils/firebase';

export default function LoginScreen({ onLoginWithGoogle, onContinueAsGuest, onAuthSuccess }) {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleGoogleClick = async () => {
    setGoogleLoading(true);
    setErrorMessage(null);
    const res = await onLoginWithGoogle();
    setGoogleLoading(false);
    if (res && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    let res;
    if (authMode === 'register') {
      res = await registerWithEmail(email, password);
    } else {
      res = await loginWithEmail(email, password);
    }

    setLoading(false);

    if (res.success && res.user) {
      if (onAuthSuccess) onAuthSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Đã có lỗi xảy ra.');
    }
  };

  return (
    <div className="login-page">
      {/* Soft Ambient Background Circles */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      <div className="login-card">
        {/* Brand Header */}
        <div className="brand-header">
          <div className="app-logo">
            <BookOpen size={32} color="white" strokeWidth={2.4} />
          </div>
          <h1 className="app-name">
            EZ<span>Language</span>
          </h1>
          <p className="app-tagline">
            Sổ tay học & ghi chú tiếng Anh cá nhân trên iPhone
          </p>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="login-error-alert">
            <AlertCircle size={17} className="error-icon" />
            <div className="error-text">{errorMessage}</div>
          </div>
        )}

        {/* Google 1-Click Login Button */}
        <button
          type="button"
          className="google-auth-btn"
          onClick={handleGoogleClick}
          disabled={googleLoading || loading}
        >
          {googleLoading ? (
            <Loader2 size={19} className="spinner" />
          ) : (
            <svg viewBox="0 0 24 24" width="19" height="19" className="google-svg">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          )}
          <span>Tiếp tục với Google</span>
        </button>

        {/* Divider */}
        <div className="auth-divider">
          <span>hoặc dùng Email & Mật khẩu</span>
        </div>

        {/* Segmented Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${authMode === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthMode('login'); setErrorMessage(null); }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            className={`auth-tab ${authMode === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthMode('register'); setErrorMessage(null); }}
          >
            Đăng ký tài khoản
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label">Email của bạn</label>
            <div className="input-wrapper">
              <Mail size={17} className="input-icon" />
              <input
                type="email"
                className="clean-input"
                placeholder="name@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={17} className="input-icon" />
              <input
                type="password"
                className="clean-input"
                placeholder={authMode === 'register' ? "Đặt mật khẩu từ 6 ký tự..." : "Nhập mật khẩu..."}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={authMode === 'register' ? "new-password" : "current-password"}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="submit-auth-btn"
            disabled={loading || googleLoading}
          >
            {loading ? (
              <Loader2 size={19} className="spinner" />
            ) : authMode === 'register' ? (
              <>
                <UserPlus size={18} />
                <span>Tạo tài khoản & Bắt đầu</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Đăng nhập & Đồng bộ</span>
              </>
            )}
          </button>
        </form>

        {/* Guest Mode Link */}
        <div className="guest-action">
          <button
            type="button"
            className="guest-link-btn"
            onClick={onContinueAsGuest}
          >
            <span>Dùng thử chế độ Offline (Khách)</span>
            <ChevronRight size={15} />
          </button>
        </div>

        {/* Trust Badge */}
        <div className="trust-footer">
          <ShieldCheck size={14} color="#10B981" />
          <span>Tự động sao lưu & đồng bộ an toàn qua Google Cloud</span>
        </div>
      </div>
    </div>
  );
}
