import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Volume2, RotateCw, CheckCircle2, XCircle, ChevronLeft, ChevronRight, Trophy, Sparkles, Star, BookOpen, Layers } from 'lucide-react';
import { NOTE_TYPES } from '../utils/storage';
import { playPronunciation } from '../utils/speech';

export default function FlashcardReview({
  notes,
  onUpdateMastery
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'starred' | 'unmastered' | 'today'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState({ remembered: 0, forgotten: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Filter cards for the review session
  const reviewDeck = useMemo(() => {
    let list = [...notes];
    if (filterMode === 'starred') {
      list = list.filter(n => n.isStarred);
    } else if (filterMode === 'unmastered') {
      list = list.filter(n => n.masteryLevel !== 'mastered');
    } else if (filterMode === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      list = list.filter(n => n.createdAt && n.createdAt.startsWith(todayStr));
    }
    // Shuffle cards for review
    return list.sort(() => Math.random() - 0.5);
  }, [notes, filterMode]);

  // Reset state when deck changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionResults({ remembered: 0, forgotten: 0 });
  }, [filterMode, reviewDeck.length]);

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
      }, 150);
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

  if (reviewDeck.length === 0) {
    return (
      <div>
        {/* Filter modes bar */}
        <div className="filter-scroll-container" style={{ marginBottom: 16 }}>
          <button
            className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
            onClick={() => setFilterMode('all')}
          >
            Tất cả ({notes.length})
          </button>
          <button
            className={`filter-chip ${filterMode === 'starred' ? 'active' : ''}`}
            onClick={() => setFilterMode('starred')}
          >
            ⭐ Đã gắn sao ({notes.filter(n => n.isStarred).length})
          </button>
          <button
            className={`filter-chip ${filterMode === 'unmastered' ? 'active' : ''}`}
            onClick={() => setFilterMode('unmastered')}
          >
            🔄 Chưa thuộc ({notes.filter(n => n.masteryLevel !== 'mastered').length})
          </button>
          <button
            className={`filter-chip ${filterMode === 'today' ? 'active' : ''}`}
            onClick={() => setFilterMode('today')}
          >
            📅 Mới thêm hôm nay
          </button>
        </div>

        <div className="empty-state">
          <div className="empty-icon">
            <Layers size={32} />
          </div>
          <h3 className="empty-title">Không có thẻ nào trong bộ lọc này</h3>
          <p className="empty-desc">
            Hãy chọn chế độ "Tất cả" hoặc thêm từ vựng mới để bắt đầu ôn tập Flashcard!
          </p>
        </div>
      </div>
    );
  }

  // Finished Screen
  if (isFinished) {
    const accuracy = Math.round((sessionResults.remembered / reviewDeck.length) * 100) || 0;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '30px 16px', gap: 16 }}>
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #FEF08A, #F59E0B)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245, 158, 11, 0.3)'
          }}
        >
          <Trophy size={42} color="white" />
        </div>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
          Hoàn thành buổi ôn tập!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
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
            margin: '12px 0'
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#16A34A' }}>
              {sessionResults.remembered}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Đã nhớ ✅</div>
          </div>
          <div style={{ width: 1, background: '#E2E8F0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#DC2626' }}>
              {sessionResults.forgotten}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Cần ôn lại ❌</div>
          </div>
          <div style={{ width: 1, background: '#E2E8F0' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#4F46E5' }}>
              {accuracy}%
            </div>
            <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>Chính xác</div>
          </div>
        </div>

        <button className="btn btn-primary" onClick={restartSession} style={{ width: '100%', maxWidth: 280, marginTop: 8 }}>
          <RotateCw size={18} /> Ôn tập lại bộ này
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Mode Selector */}
      <div className="filter-scroll-container" style={{ marginBottom: 12 }}>
        <button
          className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          Tất cả ({notes.length})
        </button>
        <button
          className={`filter-chip ${filterMode === 'starred' ? 'active' : ''}`}
          onClick={() => setFilterMode('starred')}
        >
          ⭐ Đã gắn sao ({notes.filter(n => n.isStarred).length})
        </button>
        <button
          className={`filter-chip ${filterMode === 'unmastered' ? 'active' : ''}`}
          onClick={() => setFilterMode('unmastered')}
        >
          🔄 Chưa thuộc ({notes.filter(n => n.masteryLevel !== 'mastered').length})
        </button>
        <button
          className={`filter-chip ${filterMode === 'today' ? 'active' : ''}`}
          onClick={() => setFilterMode('today')}
        >
          📅 Mới hôm nay
        </button>
      </div>

      {/* Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <span>Thẻ <strong>{currentIndex + 1}</strong> / {reviewDeck.length}</span>
        <span>{Math.round(((currentIndex + 1) / reviewDeck.length) * 100)}%</span>
      </div>
      <div style={{ width: '100%', height: 6, background: '#E2E8F0', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, my: 'auto' }}>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                {currentCard?.term}
              </h2>
              {currentCard?.ipa && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="note-ipa font-mono" style={{ fontSize: '0.95rem' }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: 12 }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#6366F1' }}>
                {currentCard?.term}
              </span>
              <button
                className="audio-btn"
                style={{ width: 26, height: 26 }}
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
  );
}
