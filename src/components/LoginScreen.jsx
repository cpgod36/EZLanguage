import React, { useState } from 'react';
import { BookOpen, Sparkles, Layers, Cloud, ArrowRight, ShieldCheck, AlertCircle, Loader2, Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../utils/firebase';

export default function LoginScreen({ onLoginWithGoogle, onContinueAsGuest, onAuthSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [authMode, setAuthMode] = useState('google'); // 'google' | 'email_login' | 'email_register'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleClick = async () => {
    setLoading(true);
    setErrorMessage(null);
    const res = await onLoginWithGoogle();
    setLoading(false);
    if (res && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    let res;
    if (authMode === 'email_register') {
      res = await registerWithEmail(email, password);
    } else {
      res = await loginWithEmail(email, password);
    }

    setLoading(false);

    if (res.success && res.user) {
      if (onAuthSuccess) onAuthSuccess(res.user);
    } else {
      setErrorMessage(res.error || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="ambient-blob blob-1" />
      <div className="ambient-blob blob-2" />

      <div className="login-card-container">
        {/* App Logo & Hero Title */}
        <div className="login-hero">
          <div className="login-logo-glow">
            <BookOpen size={36} color="white" strokeWidth={2.2} />
          </div>
          <h1 className="login-title">
            EZ<span>Language</span>
          </h1>
          <p className="login-subtitle">
            Sổ tay ghi chú & ôn tập tiếng Anh cá nhân thông minh, tối ưu trải nghiệm trên iPhone.
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div
            style={{
              width: '100%',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 12,
              padding: '12px 14px',
              color: '#991B1B',
              fontSize: '0.82rem',
              lineHeight: 1.45,
              textAlign: 'left',
              display: 'flex',
              gap: 8,
              alignItems: 'flex-start',
              marginBottom: 16
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1, color: '#DC2626' }} />
            <div>
              <strong>Lưu ý:</strong>
              <div style={{ marginTop: 2 }}>{errorMessage}</div>
            </div>
          </div>
        )}

        {/* Feature Highlights Grid (hidden when in email form to save height) */}
        {authMode === 'google' && (
          <div className="features-preview-grid">
            <div className="feature-mini-card">
              <div className="feature-mini-icon mint">
                <BookOpen size={18} />
              </div>
              <div className="feature-mini-text">
                <strong>Ghi chú đa dạng</strong>
                <span>Từ vựng, Phrasal, Idioms, Mẫu câu</span>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon sky">
                <Sparkles size={18} />
              </div>
              <div className="feature-mini-text">
                <strong>Tra từ tự động</strong>
                <span>Điền nhanh IPA, định nghĩa & phát âm</span>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon lavender">
                <Layers size={18} />
              </div>
              <div className="feature-mini-text">
                <strong>Flashcard 3D</strong>
                <span>Ôn tập lật thẻ theo ngày & thể loại</span>
              </div>
            </div>

            <div className="feature-mini-card">
              <div className="feature-mini-icon honey">
                <Cloud size={18} />
              </div>
              <div className="feature-mini-text">
                <strong>Đồng bộ Đám mây</strong>
                <span>Tự động cập nhật iPhone ⇄ Máy tính</span>
              </div>
            </div>
          </div>
        )}

        {/* Auth Mode Tabs: Google vs Email */}
        {authMode !== 'google' ? (
          <form className="login-actions-group" onSubmit={handleEmailSubmit}>
            <div style={{ display: 'flex', gap: 6, width: '100%', marginBottom: 6 }}>
              <button
                type="button"
                className={`filter-chip ${authMode === 'email_login' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setAuthMode('email_login'); setErrorMessage(null); }}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={`filter-chip ${authMode === 'email_register' ? 'active' : ''}`}
                style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => { setAuthMode('email_register'); setErrorMessage(null); }}
              >
                Đăng ký tài khoản
              </button>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Email (Gmail hoặc email của bạn)</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  className="form-input"
                  placeholder="yourname@gmail.com"
                  style={{ paddingLeft: 36 }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'left' }}>
              <label className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 12, top: 14, color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mật khẩu từ 6 ký tự..."
                  style={{ paddingLeft: 36 }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 6 }} disabled={loading}>
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : authMode === 'email_register' ? (
                <><UserPlus size={18} /> Tạo tài khoản & Đồng bộ</>
              ) : (
                <><LogIn size={18} /> Đăng nhập & Đồng bộ</>
              )}
            </button>

            <button
              type="button"
              style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', marginTop: 4 }}
              onClick={() => { setAuthMode('google'); setErrorMessage(null); }}
            >
              ← Quay lại đăng nhập bằng Google
            </button>
          </form>
        ) : (
          /* Google Login Primary View */
          <div className="login-actions-group">
            <button
              className="btn-google-login"
              onClick={handleGoogleClick}
              disabled={loading}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <svg className="google-icon" viewBox="0 0 24 24" width="20" height="20">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              )}
              <span>Đăng nhập với Google (Gmail)</span>
            </button>

            <button
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.88rem', background: '#F1F5F9', border: '1px solid #E2E8F0' }}
              onClick={() => { setAuthMode('email_login'); setErrorMessage(null); }}
            >
              <Mail size={16} color="#4F46E5" />
              <span>Đăng nhập bằng Email & Mật khẩu</span>
            </button>

            <button
              className="btn-guest-mode"
              onClick={onContinueAsGuest}
            >
              <span>Dùng thử chế độ Khách (Offline trên máy)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Security footer */}
        <div className="login-footer-trust">
          <ShieldCheck size={15} color="#16A34A" />
          <span>Bảo mật 100% qua Google Firebase Cloud</span>
        </div>
      </div>
    </div>
  );
}
