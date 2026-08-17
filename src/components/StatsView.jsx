import React from 'react';
import { Flame, Trophy, Star, CheckCircle2, BookOpen, Sparkles, TrendingUp } from 'lucide-react';
import { NOTE_TYPES, isToday } from '../utils/storage';

export default function StatsView({ notes, streakInfo }) {
  const totalNotes = notes.length;
  const masteredNotes = notes.filter(n => n.masteryLevel === 'mastered').length;
  const learningNotes = notes.filter(n => n.masteryLevel === 'learning').length;
  const newNotes = notes.filter(n => n.masteryLevel === 'new').length;
  const starredNotes = notes.filter(n => n.isStarred).length;

  const addedToday = notes.filter(n => isToday(n.createdAt)).length;
  const dailyGoal = 5;
  const dailyGoalPercent = Math.min(100, Math.round((addedToday / dailyGoal) * 100));

  // Category counts
  const categoryStats = Object.values(NOTE_TYPES).map(type => {
    const count = notes.filter(n => n.type === type.id).length;
    const percent = totalNotes > 0 ? Math.round((count / totalNotes) * 100) : 0;
    return { ...type, count, percent };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Streak Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, #FFF7ED, #FFEDD5)',
          borderRadius: 20,
          padding: '20px',
          border: '1px solid #FED7AA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#EA580C', fontWeight: 800, fontSize: '0.85rem' }}>
            <Flame size={20} fill="#EA580C" />
            <span>CHUỖI HỌC LIÊN TỤC</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 900, color: '#9A3412', lineHeight: 1.1 }}>
            {streakInfo?.currentStreak || 1} <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>ngày liên tiếp</span>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#C2410C' }}>
            Tổng cộng đã hoạt động {streakInfo?.totalActiveDays || 1} ngày
          </div>
        </div>

        <div
          style={{
            width: 54,
            height: 54,
            borderRadius: '50%',
            background: '#EA580C',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(234, 88, 12, 0.3)'
          }}
        >
          <Flame size={30} color="white" fill="white" />
        </div>
      </div>

      {/* Daily Goal Card */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '16px',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: 'var(--text-primary)' }}>
            <TrendingUp size={18} color="#4F46E5" />
            <span>Mục tiêu nạp từ hôm nay</span>
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4F46E5' }}>
            {addedToday} / {dailyGoal} mục
          </span>
        </div>

        <div style={{ width: '100%', height: 8, background: '#EEF2FF', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${dailyGoalPercent}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #6366F1, #4F46E5)',
              borderRadius: 999,
              transition: 'width 0.4s ease'
            }}
          />
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ background: 'white', padding: '14px', borderRadius: 16, border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
            <BookOpen size={16} color="#4F46E5" />
            Tổng ghi chú
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
            {totalNotes}
          </div>
        </div>

        <div style={{ background: 'white', padding: '14px', borderRadius: 16, border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
            <CheckCircle2 size={16} color="#16A34A" />
            Đã thuộc hoàn toàn
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16A34A', marginTop: 4 }}>
            {masteredNotes}
          </div>
        </div>

        <div style={{ background: 'white', padding: '14px', borderRadius: 16, border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
            <Star size={16} color="#F59E0B" fill="#F59E0B" />
            Mục yêu thích
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#D97706', marginTop: 4 }}>
            {starredNotes}
          </div>
        </div>

        <div style={{ background: 'white', padding: '14px', borderRadius: 16, border: '1px solid var(--border-card)', boxShadow: 'var(--shadow-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', fontSize: '0.8rem', fontWeight: 600 }}>
            <Sparkles size={16} color="#8B5CF6" />
            Đang trau dồi
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#7C3AED', marginTop: 4 }}>
            {learningNotes + newNotes}
          </div>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '18px',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)'
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
          Phân bố theo thể loại
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {categoryStats.map(cat => (
            <div key={cat.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', marginBottom: 4 }}>
                <span className={`badge ${cat.badgeClass}`}>
                  {cat.label}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {cat.count} ({cat.percent}%)
                </span>
              </div>
              <div style={{ width: '100%', height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${cat.percent}%`,
                    height: '100%',
                    background: cat.colorKey === 'mint' ? '#10B981' : cat.colorKey === 'sky' ? '#3B82F6' : cat.colorKey === 'honey' ? '#F59E0B' : cat.colorKey === 'lavender' ? '#8B5CF6' : '#EF4444',
                    borderRadius: 999
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
