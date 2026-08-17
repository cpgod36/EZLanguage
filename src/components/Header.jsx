import React, { useState } from 'react';
import { Flame, Search, X, BookOpen, LogIn, LogOut, Cloud, User } from 'lucide-react';

export default function Header({
  streakInfo,
  searchQuery,
  setSearchQuery,
  activeTab,
  currentUser,
  onLogin,
  onLogout
}) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="app-header">
      {/* Top row: Brand, Streak & User Auth */}
      <div className="header-top">
        <div className="brand-wrapper">
          <div className="brand-icon">
            <BookOpen size={22} />
          </div>
          <div className="brand-title">
            EZ<span>Language</span>
          </div>
        </div>

        <div className="header-actions">
          {/* Streak pill */}
          <div className="streak-pill" title="Chuỗi ngày học liên tục">
            <Flame size={17} fill="#EA580C" />
            <span>{streakInfo?.currentStreak || 1}</span>
          </div>

          {/* User Auth Button */}
          {currentUser ? (
            <div style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                style={{
                  padding: 2,
                  border: '2px solid #4F46E5',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  overflow: 'hidden'
                }}
                onClick={() => setShowUserMenu(!showUserMenu)}
                title={currentUser.email || 'Tài khoản Google'}
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={18} color="#4F46E5" />
                )}
              </button>

              {showUserMenu && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '110%',
                      background: 'white',
                      borderRadius: 14,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.18)',
                      border: '1px solid var(--border-light)',
                      padding: '12px 14px',
                      zIndex: 50,
                      minWidth: 210,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8
                    }}
                  >
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Đang đồng bộ với:
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                      {currentUser.displayName || currentUser.email}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        fontSize: '0.75rem',
                        color: '#15803D',
                        background: '#DCFCE7',
                        padding: '4px 8px',
                        borderRadius: 6,
                        fontWeight: 600
                      }}
                    >
                      <Cloud size={14} /> Tự động đồng bộ Đám mây
                    </div>
                    <div style={{ height: 1, background: '#E2E8F0', margin: '4px 0' }} />
                    <button
                      style={{
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: 8,
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                    >
                      <LogOut size={15} /> Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              className="btn"
              style={{
                background: 'linear-gradient(135deg, #4285F4, #3367D6)',
                color: 'white',
                padding: '6px 12px',
                fontSize: '0.8rem',
                fontWeight: 700,
                borderRadius: 999,
                boxShadow: '0 2px 8px rgba(66, 133, 244, 0.3)'
              }}
              onClick={onLogin}
              title="Đăng nhập Gmail để đồng bộ giữa máy tính và điện thoại"
            >
              <LogIn size={14} /> Đăng nhập Gmail
            </button>
          )}
        </div>
      </div>

      {/* Search Bar (Only shown on Sổ tay tab) */}
      {activeTab === 'notes' && (
        <div className="search-bar-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Tìm từ vựng, nghĩa tiếng Việt, tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
      )}
    </header>
  );
}
