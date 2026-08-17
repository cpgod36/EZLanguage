import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, RotateCw, CheckCircle2, XCircle, Trophy, Star, Layers, Calendar, Filter } from 'lucide-react';
import { NOTE_TYPES } from '../utils/storage';
import { playPronunciation } from '../utils/speech';

export default function FlashcardReview({
  notes,
  onUpdateMastery
}) {
  const [scopeFilter, setScopeFilter] = useState('all'); // 'all' | 'today' | 'unmastered' | 'starred'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'word' | 'phrasal_verb' | 'collocation_idiom' | 'sentence_pattern' | 'mistake_tip'
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState({ remembered: 0, forgotten: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Today Date String (Local time YYYY-MM-DD)
  const todayStr = useMemo(() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Filter cards for the review session
  const reviewDeck = useMemo(() => {
    let list = [...notes];

    // Filter by Scope (Today, Starred, Unmastered)
    if (scopeFilter === 'today') {
      list = list.filter(n => n.createdAt && n.createdAt.startsWith(todayStr));
    } else if (scopeFilter === 'unmastered') {
      list = list.filter(n => n.masteryLevel !== 'mastered');
    } else if (scopeFilter === 'starred') {
      list = list.filter(n => n.isStarred);
    }

    // Filter by Category
    if (categoryFilter !== 'all') {
      list = list.filter(n => n.type === categoryFilter);
    }

    // Shuffle cards for dynamic review
    return list.sort(() => Math.random() - 0.5);
  }, [notes, scopeFilter, categoryFilter, todayStr]);

  // Counts for Badges
  const counts = useMemo(() => {
    const todayNotes = notes.filter(n => n.createdAt && n.createdAt.startsWith(todayStr));
    const unmasteredNotes = notes.filter(n => n.masteryLevel !== 'mastered');
    const starredNotes = notes.filter(n => n.isStarred);

    return {
      all: notes.length,
      today: todayNotes.length,
      unmastered: unmasteredNotes.length,
      starred: starredNotes.length,
      word: notes.filter(n => n.type === 'word').length,
      phrasal_verb: notes.filter(n => n.type === 'phrasal_verb').length,
      collocation_idiom: notes.filter(n => n.type === 'collocation_idiom').length,
      sentence_pattern: notes.filter(n => n.type === 'sentence_pattern').length,
      mistake_tip: notes.filter(n => n.type === 'mistake_tip').length
    };
  }, [notes, todayStr]);

  // Reset state when deck changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionResults({ remembered: 0, forgotten: 0 });
  }, [scopeFilter, categoryFilter, reviewDeck.length]);

  const currentCard = reviewDeck[currentIndex];
  const typeConfig = currentCard ? (NOTE_TYPES[currentCard.type] || NOTE_TYPES.word) : null;

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAudio = (e) => {
    e.stopPropagation();
    if (currentCard) {
      playPronunciation(currentCard.term, currentCard.audioUrl);
    }
  };

  const handleAnswer = (remembered) => {
    if (!currentCard) return;

    onUpdateMastery(currentCard.id, remembered);

    setSessionResults(prev => ({
      remembered: prev.remembered + (remembered ? 1 : 0),
      forgotten: prev.forgotten + (remembered ? 0 : 1)
    }));

    // Move to next card
    if (currentIndex + 1 < reviewDeck.length) {
      setIsFlipped(false);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 120);
    } else {
      // Session finished
      setIsFinished(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.log('Confetti trigger', e);
      }
    }
  };

  const restartSession = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionResults({ remembered: 0, forgotten: 0 });
  };

  return (
    <div>
      {/* Scope Filter Bar (Hôm nay, Chưa thuộc, Gắn sao, Tất cả) */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Calendar size={13} color="#4F46E5" /> Mục tiêu ôn tập
        </div>
        <div className="filter-scroll-container">
          <button
            className={`filter-chip ${scopeFilter === 'today' ? 'active' : ''}`}
            onClick={() => setScopeFilter('today')}
            style={scopeFilter === 'today' ? { background: '#EA580C', borderColor: '#EA580C' } : {}}
          >
            🔥 Hôm nay ({counts.today})
          </button>

          <button
            className={`filter-chip ${scopeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setScopeFilter('all')}
          >
            Tất cả ({counts.all})
          </button>

          <button
            className={`filter-chip ${scopeFilter === 'unmastered' ? 'active' : ''}`}
            onClick={() => setScopeFilter('unmastered')}
          >
            🔄 Chưa thuộc ({counts.unmastered})
          </button>

          <button
            className={`filter-chip ${scopeFilter === 'starred' ? 'active' : ''}`}
            onClick={() => setScopeFilter('starred')}
          >
            ⭐ Gắn sao ({counts.starred})
          </button>
        </div>
      </div>

      {/* Category Filter Bar (Từ vựng, Phrasal verbs, Idioms,...) */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
          <Filter size={13} color="#4F46E5" /> Theo thể loại
        </div>
        <div className="filter-scroll-container">
          <button
            className={`filter-chip ${categoryFilter === 'all' ? 'active' : ''}`}
            onClick={() => setCategoryFilter('all')}
          >
            Tất cả loại
          </button>

          {Object.values(NOTE_TYPES).map(type => (
            <button
              key={type.id}
              className={`filter-chip ${categoryFilter === type.id ? 'active' : ''}`}
              onClick={() => setCategoryFilter(type.id)}
            >
              <span className={`badge ${type.badgeClass}`} style={{ padding: '1px 6px', fontSize: '0.7rem' }}>
                {type.label}
              </span>
              <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>({counts[type.id] || 0})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Empty State if no cards match */}
      {reviewDeck.length === 0 ? (
        <div className="empty-state" style={{ padding: '36px 16px' }}>
          <div className="empty-icon">
            <Layers size={32} />
          </div>
          <h3 className="empty-title">
            {scopeFilter === 'today'
              ? 'Hôm nay bạn chưa thêm mục nào'
              : 'Không có thẻ nào phù hợp với bộ lọc này'}
          </h3>
          <p className="empty-desc">
            {scopeFilter === 'today'
              ? 'Hãy qua tab "Sổ tay" bấm dấu (+) để thêm từ mới học hôm nay nhé!'
              : 'Hãy chọn chế độ "Tất cả" hoặc chuyển thể loại khác để tiếp tục ôn tập.'}
          </p>
          {scopeFilter !== 'all' && (
            <button
              className="btn btn-secondary"
              onClick={() => {
                setScopeFilter('all');
                setCategoryFilter('all');
              }}
              style={{ marginTop: 8 }}
            >
              Xem tất cả ({counts.all} thẻ)
            </button>
          )}
        </div>
      ) : isFinished ? (
        /* Finished Screen */
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '24px 16px', gap: 16 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FEF08A, #F59E0B)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
            }}
          >
            <Trophy size={38} color="white" />
          </div>

          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Hoàn thành buổi ôn tập!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Bạn đã ôn tập xong <strong>{reviewDeck.length}</strong> thẻ kiến thức.
          </p>

          {/* Score Card */}
          <div
            style={{
              background: 'white',
              borderRadius: 16,
              padding: '16px 24px',
              border: '1px solid var(--border-light)',
              boxShadow: 'var(--shadow-card)',
              display: 'flex',
              justifyContent: 'space-around',
              width: '100%',
              maxWidth: 340,
              margin: '8px 0'
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#16A34A' }}>
                {sessionResults.remembered}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Đã nhớ ✅</div>
            </div>
            <div style={{ width: 1, background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#DC2626' }}>
                {sessionResults.forgotten}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Cần ôn lại ❌</div>
            </div>
            <div style={{ width: 1, background: '#E2E8F0' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#4F46E5' }}>
                {Math.round((sessionResults.remembered / reviewDeck.length) * 100) || 0}%
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Chính xác</div>
            </div>
          </div>

          <button className="btn btn-primary" onClick={restartSession} style={{ width: '100%', maxWidth: 280, marginTop: 4 }}>
            <RotateCw size={18} /> Ôn tập lại bộ này
          </button>
        </div>
      ) : (
        /* Active Flashcard Review */
        <div>
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            <span>Thẻ <strong>{currentIndex + 1}</strong> / {reviewDeck.length}</span>
            <span>{Math.round(((currentIndex + 1) / reviewDeck.length) * 100)}%</span>
          </div>
          <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
            <div
              style={{
                width: `${((currentIndex + 1) / reviewDeck.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #6366F1, #4F46E5)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>

          {/* 3D Flip Flashcard */}
          <div className="flashcard-container" onClick={handleCardClick}>
            <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* FRONT SIDE */}
              <div className="flashcard-front">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span className={`badge ${typeConfig?.badgeClass || 'badge-mint'}`}>
                    {typeConfig?.label || 'Từ vựng'}
                  </span>
                  {currentCard?.isStarred && (
                    <Star size={18} fill="#F59E0B" color="#F59E0B" />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, margin: 'auto 0' }}>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25 }}>
                    {currentCard?.term}
                  </h2>
                  {currentCard?.ipa && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="note-ipa font-mono" style={{ fontSize: '0.92rem' }}>
                        {currentCard.ipa}
                      </span>
                      <button className="audio-btn" onClick={handleAudio} title="Phát âm">
                        <Volume2 size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="card-flip-hint">
                  <RotateCw size={14} /> Chạm vào thẻ để xem nghĩa
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="flashcard-back">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#6366F1' }}>
                    {currentCard?.term}
                  </span>
                  <button
                    className="audio-btn"
                    style={{ width: 28, height: 28 }}
                    onClick={handleAudio}
                    title="Phát âm"
                  >
                    <Volume2 size={14} />
                  </button>
                </div>

                {/* Meanings */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', flex: 1, maxHeight: 220, paddingRight: 4 }}>
                  {(currentCard?.meanings || []).map((m, idx) => (
                    <div key={idx} style={{ background: 'white', padding: '8px 10px', borderRadius: 8, borderLeft: '3px solid #7C3AED' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                        {m.partOfSpeech && (
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: '#6B21A8', background: '#F3E8FD', padding: '1px 4px', borderRadius: 3 }}>
                            {m.partOfSpeech}
                          </span>
                        )}
                        <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1E293B' }}>
                          {m.vietnamese}
                        </span>
                      </div>
                      {m.example && (
                        <div style={{ fontSize: '0.82rem', color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
                          "{m.example}"
                        </div>
                      )}
                    </div>
                  ))}

                  {currentCard?.collocations && (
                    <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4 }}>
                      <strong>Cụm từ:</strong> {currentCard.collocations}
                    </div>
                  )}

                  {currentCard?.mnemonic && (
                    <div style={{ fontSize: '0.8rem', color: '#047857', marginTop: 2 }}>
                      <strong>Mẹo nhớ:</strong> {currentCard.mnemonic}
                    </div>
                  )}
                </div>

                <div className="card-flip-hint" style={{ marginTop: 8 }}>
                  <RotateCw size={14} /> Chạm để lật lại mặt trước
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Forgotten vs Remembered */}
          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button
              className="btn"
              style={{
                flex: 1,
                background: '#FEE2E2',
                color: '#B91C1C',
                border: '1px solid #FECACA',
                boxShadow: '0 2px 8px rgba(239, 68, 68, 0.12)'
              }}
              onClick={() => handleAnswer(false)}
            >
              <XCircle size={20} /> Chưa nhớ
            </button>

            <button
              className="btn"
              style={{
                flex: 1,
                background: '#DCFCE7',
                color: '#15803D',
                border: '1px solid #BBF7D0',
                boxShadow: '0 2px 8px rgba(34, 197, 94, 0.12)'
              }}
              onClick={() => handleAnswer(true)}
            >
              <CheckCircle2 size={20} /> Đã thuộc
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
