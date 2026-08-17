import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Mail, RefreshCw, CheckCircle2, AlertCircle, LogOut,
  ShieldCheck, ArrowRight, ExternalLink, Sparkles, HelpCircle, Check
} from 'lucide-react';
import { reloadUserAuth, sendVerificationEmailToUser } from '../utils/firebase';

export default function EmailVerificationScreen({
  user,
  onVerified,
  onLogout
}) {
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [copied, setCopied] = useState(false);

  // 60-second cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle checking if email has been verified
  const handleCheckVerification = async () => {
    setIsChecking(true);
    setFeedbackMessage(null);

    const res = await reloadUserAuth();
    setIsChecking(false);

    if (res.success && res.user) {
      if (res.user.emailVerified) {
        // Celebration fireworks
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#10B981', '#4F46E5', '#F59E0B', '#3B82F6', '#EC4899']
          });
        } catch (e) {}

        setFeedbackMessage({
          type: 'success',
          text: 'Xác thực email thành công! Đang chuyển vào Sổ tay...'
        });

        setTimeout(() => {
          onVerified(res.user);
        }, 1000);
      } else {
        setFeedbackMessage({
          type: 'warning',
          text: 'Hệ thống chưa nhận được xác thực. Bạn hãy mở email và nhấn vào link kích hoạt trước nhé!'
        });
      }
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.error || 'Không thể kiểm tra trạng thái lúc này. Vui lòng thử lại.'
      });
    }
  };

  // Handle resending verification email
  const handleResendEmail = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setFeedbackMessage(null);

    const res = await sendVerificationEmailToUser(user);
    setIsResending(false);

    if (res.success) {
      setResendCooldown(60);
      setFeedbackMessage({
        type: 'success',
        text: 'Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư đến và cả mục Spam/Rác.'
      });
    } else {
      setFeedbackMessage({
        type: 'error',
        text: res.error || 'Không thể gửi lại email lúc này. Vui lòng thử lại sau.'
      });
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = () => {
    if (user?.email) {
      navigator.clipboard.writeText(user.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="login-page">
      {/* Ambient background glows */}
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />
      <div className="bg-glow bg-glow-3" />

      <div className="verify-card">
        {/* Top Floating Hero Icon with concentric pulse */}
        <div className="verify-hero-wrapper">
          <div className="verify-pulse-ring ring-1" />
          <div className="verify-pulse-ring ring-2" />
          <div className="verify-hero-icon-box">
            <Mail size={38} color="#4F46E5" />
            <div className="verify-shield-badge">
              <ShieldCheck size={14} color="white" />
            </div>
          </div>
        </div>

        {/* Security Capsule Status */}
        <div className="verify-status-badge">
          <span className="verify-status-dot" />
          <span>Chờ xác thực tài khoản</span>
        </div>

        {/* Headline */}
        <h1 className="verify-title">Kích hoạt Tài khoản</h1>
        <p className="verify-subtitle">
          Liên kết xác thực bảo mật đã được gửi tới địa chỉ:
        </p>

        {/* Recipient Email Capsule */}
        <div className="verify-email-pill" onClick={handleCopyEmail} title="Nhấn để sao chép email">
          <div className="verify-email-content">
            <Mail size={15} color="#4F46E5" style={{ flexShrink: 0 }} />
            <span className="verify-email-text">{user?.email || 'email của bạn'}</span>
          </div>
          <span className="verify-copy-badge">
            {copied ? <Check size={12} color="#15803D" /> : 'Sao chép'}
          </span>
        </div>

        {/* Feedback Alert Message */}
        {feedbackMessage && (
          <div className={`verify-alert-box alert-${feedbackMessage.type}`}>
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 size={16} className="alert-icon" />
            ) : (
              <AlertCircle size={16} className="alert-icon" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Primary Action Button */}
        <button
          type="button"
          className="btn-verify-primary"
          onClick={handleCheckVerification}
          disabled={isChecking}
        >
          {isChecking ? (
            <>
              <RefreshCw size={18} className="spin-slow" />
              <span>Đang kiểm tra tín hiệu...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={18} />
              <span>Tôi đã nhấn vào liên kết trong email</span>
            </>
          )}
        </button>

        {/* Secondary Action Row */}
        <div className="verify-actions-row">
          <button
            type="button"
            className="btn-verify-secondary"
            onClick={handleResendEmail}
            disabled={resendCooldown > 0 || isResending}
          >
            <RefreshCw size={14} className={isResending ? 'spin-slow' : ''} />
            <span>
              {resendCooldown > 0 ? `Gửi lại sau (${resendCooldown}s)` : 'Gửi lại email xác thực'}
            </span>
          </button>

          <button
            type="button"
            className="btn-verify-ghost"
            onClick={onLogout}
            title="Đăng xuất và đăng nhập bằng tài khoản khác"
          >
            <LogOut size={14} />
            <span>Đổi tài khoản</span>
          </button>
        </div>

        {/* Friendly Hint Box */}
        <div className="verify-hint-box">
          <HelpCircle size={15} color="#6366F1" style={{ flexShrink: 0, marginTop: 1 }} />
          <div className="verify-hint-text">
            <strong>Chưa thấy email?</strong> Hãy kiểm tra mục <strong>Spam / Thư rác</strong> hoặc mục <strong>Quảng cáo (Promotions)</strong> trong hộp thư của bạn nhé.
          </div>
        </div>
      </div>
    </div>
  );
}
