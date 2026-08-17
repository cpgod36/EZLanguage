import React from 'react';
import { Sparkles, Flame, Search, X, Star, ArrowDownAZ, ArrowUpAZ, Clock, BookOpen } from 'lucide-react';
import { NOTE_TYPES } from '../utils/storage';

export default function Header({
  streakInfo,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  showStarredOnly,
  setShowStarredOnly,
  activeTab
}) {
  if (activeTab !== 'notes') {
    return (
      <header className="app-header">
        <div className="header-top">
          <div className="brand-wrapper">
            <div className="brand-icon">
              <BookOpen size={22} />
            </div>
            <div className="brand-title">
              EZ<span>Language</span>
            </div>
          </div>
          <div className="streak-pill">
            <Flame size={18} fill="#EA580C" />
            <span>{streakInfo?.currentStreak || 1} Ngày</span>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="app-header">
      {/* Top row: Brand & Streak */}
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
          <div className="streak-pill" title="Chuỗi ngày học liên tục">
            <Flame size={18} fill="#EA580C" />
            <span>{streakInfo?.currentStreak || 1} Ngày</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
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

      {/* Filter and Sort bar */}
      <div className="filter-scroll-container">
        <button
          className={`filter-chip ${selectedCategory === 'all' && !showStarredOnly ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory('all');
            setShowStarredOnly(false);
          }}
        >
          Tất cả
        </button>

        <button
          className={`filter-chip ${showStarredOnly ? 'active' : ''}`}
          onClick={() => setShowStarredOnly(!showStarredOnly)}
        >
          <Star size={14} fill={showStarredOnly ? "#F59E0B" : "none"} color={showStarredOnly ? "#F59E0B" : "currentColor"} />
          Đã gắn sao
        </button>

        {Object.values(NOTE_TYPES).map((type) => (
          <button
            key={type.id}
            className={`filter-chip ${selectedCategory === type.id && !showStarredOnly ? 'active' : ''}`}
            onClick={() => {
              setSelectedCategory(type.id);
              setShowStarredOnly(false);
            }}
          >
            <span className={`badge ${type.badgeClass}`} style={{ padding: '1px 6px', fontSize: '0.7rem' }}>
              {type.label}
            </span>
          </button>
        ))}

        {/* Sort selector pill */}
        <button
          className="filter-chip"
          style={{ marginLeft: 'auto', background: '#F1F5F9', border: '1px solid #CBD5E1' }}
          onClick={() => {
            const nextSort = sortBy === 'a-z' ? 'z-a' : sortBy === 'z-a' ? 'newest' : sortBy === 'newest' ? 'oldest' : 'a-z';
            setSortBy(nextSort);
          }}
        >
          {sortBy === 'a-z' && <><ArrowDownAZ size={15} color="#4F46E5" /> A → Z</>}
          {sortBy === 'z-a' && <><ArrowUpAZ size={15} color="#4F46E5" /> Z → A</>}
          {sortBy === 'newest' && <><Clock size={15} color="#059669" /> Mới nhất</>}
          {sortBy === 'oldest' && <><Clock size={15} color="#64748B" /> Cũ nhất</>}
        </button>
      </div>
    </header>
  );
}
