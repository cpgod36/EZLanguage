import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  Volume2, RotateCw, CheckCircle2, XCircle, Trophy, Star,
  Layers, Calendar, Flame, Sparkles, ArrowLeft, ArrowRight,
  BookOpen, MessageSquareText, AlertCircle, Play, ChevronRight, BarChart2, GitFork
} from 'lucide-react';
import { NOTE_TYPES, isToday, parseWordFamilyEntries } from '../utils/storage';
import { playPronunciation } from '../utils/speech';

export default function FlashcardReview({
  notes,
  onUpdateMastery
}) {
  // selectedDeck: null => Deck Selection Hub; { id, title, filterFn, badgeClass, icon, color } => Active Flashcard Session
  const [selectedDeck, setSelectedDeck] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionResults, setSessionResults] = useState({ remembered: 0, forgotten: 0 });
  const [isFinished, setIsFinished] = useState(false);

  // Define Available Decks
  const decks = useMemo(() => {
    const todayNotes = notes.filter(n => isToday(n.createdAt));
    const unmasteredNotes = notes.filter(n => n.masteryLevel !== 'mastered');
    const starredNotes = notes.filter(n => n.isStarred);
    const wordFamilyNotes = notes.filter(n =>
      n.wordFamily && (
        n.wordFamily.verb ||
        n.wordFamily.noun ||
        n.wordFamily.adjective ||
        n.wordFamily.adverb ||
        n.wordFamily.opposite
      )
    );

    // Goal & Scope Decks
    const featuredDecks = [
      {
        id: 'today',
        title: 'Mới thêm Hôm nay',
        description: 'Ôn tập ngay các từ và cụm từ bạn vừa lưu trong ngày',
        icon: Flame,
        iconColor: '#EA580C',
        iconBg: '#FFF7ED',
        badgeClass: 'badge-coral',
        tagText: 'Hôm nay',
        filterFn: (n) => isToday(n.createdAt),
        count: todayNotes.length,
        masteredCount: todayNotes.filter(n => n.masteryLevel === 'mastered').length
      },
      {
        id: 'word_formation',
        title: 'Luyện Biến Đổi Họ Từ',
        shortTitle: 'Word Formation',
        description: 'Rèn phản xạ nhớ các dạng Noun, Verb, Adj, Adv của từ gốc',
        icon: GitFork,
        iconColor: '#6366F1',
        iconBg: '#EEF2FF',
        badgeClass: 'badge-sky',
        tagText: 'Họ từ',
        filterFn: (n) => n.wordFamily && (n.wordFamily.verb || n.wordFamily.noun || n.wordFamily.adjective || n.wordFamily.adverb || n.wordFamily.opposite),
        count: wordFamilyNotes.length,
        masteredCount: wordFamilyNotes.filter(n => n.masteryLevel === 'mastered').length
      },
      {
        id: 'unmastered',
        title: 'Cần ôn tập gấp',
        description: 'Những từ bạn đang học hoặc chưa ghi nhớ vững',
        icon: RotateCw,
        iconColor: '#D97706',
        iconBg: '#FEF3C7',
        badgeClass: 'badge-honey',
        tagText: 'Chưa thuộc',
        filterFn: (n) => n.masteryLevel !== 'mastered',
        count: unmasteredNotes.length,
        masteredCount: 0
      },
      {
        id: 'starred',
        title: 'Mục Yêu thích',
        description: 'Các từ vựng và câu tâm đắc bạn đã đánh dấu sao',
        icon: Star,
        iconColor: '#F59E0B',
        iconBg: '#FEF9C3',
        badgeClass: 'badge-honey',
        tagText: 'Đã gắn sao',
        filterFn: (n) => n.isStarred,
        count: starredNotes.length,
        masteredCount: starredNotes.filter(n => n.masteryLevel === 'mastered').length
      },
      {
        id: 'all',
        title: 'Tất cả Kho kiến thức',
        description: 'Ôn tập toàn bộ từ vựng, cụm từ và ngữ pháp đã lưu',
        icon: Layers,
        iconColor: '#4F46E5',
        iconBg: '#EEF2FF',
        badgeClass: 'badge-sky',
        tagText: 'Tất cả',
        filterFn: () => true,
        count: notes.length,
        masteredCount: notes.filter(n => n.masteryLevel === 'mastered').length
      }
    ];

    // Category Decks
    const categoryDecks = Object.values(NOTE_TYPES).map(type => {
      const categoryNotes = notes.filter(n => n.type === type.id);
      const iconMap = {
        word: BookOpen,
        phrasal_verb: Layers,
        collocation_idiom: Sparkles,
        sentence_pattern: MessageSquareText,
        mistake_tip: AlertCircle
      };
      const IconComponent = iconMap[type.id] || BookOpen;

      return {
        id: `cat_${type.id}`,
        title: type.label,
        shortTitle: type.shortTitle || type.englishLabel,
        englishLabel: type.englishLabel,
        description: type.description || `Ôn tập riêng các mục ${type.label.toLowerCase()}`,
        icon: IconComponent,
        badgeClass: type.badgeClass,
        colorKey: type.colorKey,
        filterFn: (n) => n.type === type.id,
        count: categoryNotes.length,
        masteredCount: categoryNotes.filter(n => n.masteryLevel === 'mastered').length
      };
    });

    return { featuredDecks, categoryDecks };
  }, [notes]);

  // Cards for Currently Selected Deck
  const activeDeckCards = useMemo(() => {
    if (!selectedDeck) return [];
    const list = notes.filter(selectedDeck.filterFn);
    // Shuffle for dynamic active recall
    return list.sort(() => Math.random() - 0.5);
  }, [notes, selectedDeck]);

  // Reset Session when entering a deck
  const handleStartDeck = (deck) => {
    if (deck.count === 0) return;
    setSelectedDeck(deck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setSessionResults({ remembered: 0, forgotten: 0 });
  };

  const handleBackToDecks = () => {
    setSelectedDeck(null);
    setIsFlipped(false);
    setIsFinished(false);
  };

  const currentCard = activeDeckCards[currentIndex];
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
    if (currentIndex + 1 < activeDeckCards.length) {
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

  // =========================================================================
  // VIEW 1: DECK SELECTION HUB (Danh sách các Bộ Thẻ)
  // =========================================================================
  if (!selectedDeck) {
    return (
      <div className="decks-hub-container">
        {/* Hub Header */}
        <div className="decks-hub-header">
          <h2 className="decks-hub-title">Bộ Thẻ Ôn Tập</h2>
          <p className="decks-hub-desc">
            Chọn một chủ đề hoặc mục tiêu bên dưới để bắt đầu lật thẻ ghi nhớ
          </p>
        </div>

        {/* Section 1: Featured Target Decks */}
        <div className="decks-section">
          <div className="decks-section-title">
            <Calendar size={16} color="#4F46E5" />
            <span>Mục tiêu ôn tập</span>
          </div>

          <div className="decks-grid">
            {decks.featuredDecks.map(deck => {
              const Icon = deck.icon;
              const hasCards = deck.count > 0;
              const percent = deck.count > 0 ? Math.round((deck.masteredCount / deck.count) * 100) : 0;

              return (
                <div
                  key={deck.id}
                  className={`deck-card ${!hasCards ? 'disabled' : ''}`}
                  onClick={() => hasCards && handleStartDeck(deck)}
                >
                  <div className="deck-card-top">
                    <div className="deck-icon-badge" style={{ background: deck.iconBg, color: deck.iconColor }}>
                      <Icon size={20} />
                    </div>
                    <span className="deck-count-pill">
                      {deck.count} thẻ
                    </span>
                  </div>

                  <div className="deck-card-info">
                    <h3 className="deck-title">{deck.title}</h3>
                    <p className="deck-desc">{deck.description}</p>
                  </div>

                  <div className="deck-card-footer">
                    {hasCards ? (
                      <>
                        <div className="deck-progress-bar">
                          <div className="deck-progress-fill" style={{ width: `${percent}%` }} />
                        </div>
                        <div className="deck-action-row">
                          <span className="deck-progress-text">{percent}% đã thuộc</span>
                          <span className="deck-start-btn">
                            Bắt đầu <ChevronRight size={14} />
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="deck-empty-text">Chưa có thẻ nào</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Category Decks */}
        <div className="decks-section" style={{ marginTop: 22 }}>
          <div className="decks-section-title">
            <Layers size={16} color="#4F46E5" />
            <span>Ôn theo thể loại</span>
          </div>

          <div className="decks-grid">
            {decks.categoryDecks.map(deck => {
              const Icon = deck.icon;
              const hasCards = deck.count > 0;
              const percent = deck.count > 0 ? Math.round((deck.masteredCount / deck.count) * 100) : 0;

              return (
                <div
                  key={deck.id}
                  className={`deck-card ${!hasCards ? 'disabled' : ''}`}
                  onClick={() => hasCards && handleStartDeck(deck)}
                >
                  <div className="deck-card-top">
                    <span className={`badge ${deck.badgeClass}`}>
                      {deck.title}
                    </span>
                    <span className="deck-count-pill">
                      {deck.count} thẻ
                    </span>
                  </div>

                  <div className="deck-card-info">
                    <h3 className="deck-title">{deck.shortTitle}</h3>
                    <p className="deck-desc">{deck.description}</p>
                  </div>

                  <div className="deck-card-footer">
                    {hasCards ? (
                      <>
                        <div className="deck-progress-bar">
                          <div
                            className="deck-progress-fill"
                            style={{
                              width: `${percent}%`,
                              background: deck.colorKey === 'mint' ? '#10B981' : deck.colorKey === 'sky' ? '#3B82F6' : deck.colorKey === 'honey' ? '#F59E0B' : deck.colorKey === 'lavender' ? '#8B5CF6' : '#EF4444'
                            }}
                          />
                        </div>
                        <div className="deck-action-row">
                          <span className="deck-progress-text">{percent}% đã thuộc</span>
                          <span className="deck-start-btn">
                            Bắt đầu <ChevronRight size={14} />
                          </span>
                        </div>
                      </>
                    ) : (
                      <span className="deck-empty-text">Chưa có mục nào</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: ACTIVE FLASHCARD SESSION
  // =========================================================================
  return (
    <div className="flashcard-session-view">
      {/* Session Top Navigation */}
      <div className="session-top-nav">
        <button className="btn-back-decks" onClick={handleBackToDecks}>
          <ArrowLeft size={16} />
          <span>Danh sách bộ thẻ</span>
        </button>

        <div className="session-deck-badge">
          <span className="session-deck-name">{selectedDeck.shortTitle || selectedDeck.title}</span>
        </div>
      </div>

      {/* Finished Summary Screen */}
      {isFinished ? (
        <div className="session-finished-card">
          <div className="finished-trophy">
            <Trophy size={40} color="white" />
          </div>

          <h2 className="finished-title">Hoàn thành bài ôn tập!</h2>
          <p className="finished-subtitle">
            Bạn đã ôn tập xong bộ <strong>{selectedDeck.title}</strong> ({activeDeckCards.length} thẻ).
          </p>

          <div className="finished-stats-box">
            <div className="stat-item success">
              <div className="stat-num">{sessionResults.remembered}</div>
              <div className="stat-label">
                <CheckCircle2 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} /> Đã nhớ
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item danger">
              <div className="stat-num">{sessionResults.forgotten}</div>
              <div className="stat-label">
                <XCircle size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} /> Cần ôn lại
              </div>
            </div>
            <div className="stat-divider" />
            <div className="stat-item primary">
              <div className="stat-num">
                {Math.round((sessionResults.remembered / activeDeckCards.length) * 100) || 0}%
              </div>
              <div className="stat-label">Chính xác</div>
            </div>
          </div>

          <div className="finished-actions">
            <button className="btn btn-primary" onClick={restartSession}>
              <RotateCw size={16} /> Ôn lại bộ này
            </button>
            <button className="btn btn-secondary" onClick={handleBackToDecks}>
              Chọn bộ thẻ khác
            </button>
          </div>
        </div>
      ) : (
        /* Active Flashcard Player */
        <div className="flashcard-player-area">
          {/* Progress Indicator */}
          <div className="session-progress-header">
            <span className="progress-count">
              Thẻ <strong>{currentIndex + 1}</strong> / {activeDeckCards.length}
            </span>
            <span className="progress-percent">
              {Math.round(((currentIndex + 1) / activeDeckCards.length) * 100)}%
            </span>
          </div>

          <div className="session-progress-track">
            <div
              className="session-progress-fill"
              style={{ width: `${((currentIndex + 1) / activeDeckCards.length) * 100}%` }}
            />
          </div>

          {/* 3D Flip Flashcard */}
          <div className="flashcard-container" onClick={handleCardClick}>
            <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* FRONT SIDE */}
              <div className="flashcard-front">
                <div className="card-top-row">
                  <span className={`badge ${typeConfig?.badgeClass || 'badge-mint'}`}>
                    {typeConfig?.label || 'Từ vựng'}
                  </span>
                  {currentCard?.isStarred && (
                    <Star size={18} fill="#F59E0B" color="#F59E0B" />
                  )}
                </div>

                <div className="card-center-content">
                  <h2 className="card-term">{currentCard?.term}</h2>
                  {currentCard?.ipa && (
                    <div className="card-ipa-group">
                      <span className="note-ipa font-mono">{currentCard.ipa}</span>
                      <button className="audio-btn" onClick={handleAudio} title="Phát âm">
                        <Volume2 size={16} />
                      </button>
                    </div>
                  )}

                  {/* Special Word Formation Challenge Prompt on Front */}
                  {selectedDeck?.id === 'word_formation' && (
                    <div className="formation-challenge-box">
                      <div className="formation-challenge-title">
                        <GitFork size={13} color="#4F46E5" />
                        <span>Thử thách biến đổi họ từ:</span>
                      </div>
                      <div className="formation-challenge-targets">
                        {currentCard?.wordFamily?.verb && <span className="target-pill target-v">Verb ?</span>}
                        {currentCard?.wordFamily?.noun && <span className="target-pill target-n">Noun ?</span>}
                        {currentCard?.wordFamily?.adjective && <span className="target-pill target-adj">Adj ?</span>}
                        {currentCard?.wordFamily?.adverb && <span className="target-pill target-adv">Adv ?</span>}
                        {currentCard?.wordFamily?.opposite && <span className="target-pill target-opp">Opposite ?</span>}
                      </div>
                      <p className="formation-hint-text">Đọc nhẩm các dạng biến thể rồi chạm để kiểm tra đáp án!</p>
                    </div>
                  )}
                </div>

                <div className="card-flip-hint">
                  <RotateCw size={14} /> Chạm vào thẻ để xem đáp án
                </div>
              </div>

              {/* BACK SIDE */}
              <div className="flashcard-back">
                <div className="card-top-row">
                  <span className="back-term-title">{currentCard?.term}</span>
                  <button className="audio-btn" style={{ width: 28, height: 28 }} onClick={handleAudio} title="Phát âm">
                    <Volume2 size={14} />
                  </button>
                </div>

                {/* Meanings */}
                <div className="back-meanings-list">
                  {(currentCard?.meanings || []).map((m, idx) => (
                    <div key={idx} className="back-meaning-box">
                      <div className="back-meaning-title-row">
                        {m.partOfSpeech && (
                          <span className="meaning-pos">{m.partOfSpeech}</span>
                        )}
                        <span className="meaning-vi">{m.vietnamese}</span>
                      </div>
                      {m.example && (
                        <div className="meaning-example">
                          "{m.example}"
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Word Family on Card Back */}
                  {currentCard?.wordFamily && (currentCard.wordFamily.verb || currentCard.wordFamily.noun || currentCard.wordFamily.adjective || currentCard.wordFamily.adverb || currentCard.wordFamily.opposite) && (
                    <div className="flashcard-word-family">
                      <div className="word-family-header" style={{ marginBottom: 4 }}>
                        <GitFork size={13} color="#4F46E5" />
                        <span>Họ từ vựng (Word Family)</span>
                      </div>
                      <div className="word-family-chips-wrapper">
                        {[
                          { pos: 'V', text: currentCard.wordFamily.verb, cls: 'chip-v' },
                          { pos: 'N', text: currentCard.wordFamily.noun, cls: 'chip-n' },
                          { pos: 'Adj', text: currentCard.wordFamily.adjective, cls: 'chip-adj' },
                          { pos: 'Adv', text: currentCard.wordFamily.adverb, cls: 'chip-adv' },
                          { pos: 'Opp', text: currentCard.wordFamily.opposite, cls: 'chip-opp' }
                        ].map(({ pos, text, cls }) => {
                          if (!text || !text.trim()) return null;
                          const entries = parseWordFamilyEntries(text);

                          return entries.map(({ enWord, viMeaning }, pIdx) => {
                            return (
                              <button
                                key={`${pos}_${pIdx}_${enWord}`}
                                type="button"
                                className={`family-chip ${cls}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  playPronunciation(enWord);
                                }}
                                title={`Phát âm: ${enWord}${viMeaning ? ' (' + viMeaning + ')' : ''}`}
                              >
                                <span className="chip-pos">{pos}</span>
                                <span className="chip-word">{enWord}</span>
                                {viMeaning && <span className="chip-meaning">({viMeaning})</span>}
                                <Volume2 size={11} className="chip-speaker" />
                              </button>
                            );
                          });
                        })}
                      </div>
                    </div>
                  )}

                  {currentCard?.collocations && (
                    <div className="back-extra-note">
                      <strong>Cụm từ:</strong> {currentCard.collocations}
                    </div>
                  )}

                  {currentCard?.mnemonic && (
                    <div className="back-extra-note mnemonic">
                      <strong>Mẹo nhớ:</strong> {currentCard.mnemonic}
                    </div>
                  )}
                </div>

                <div className="card-flip-hint">
                  <RotateCw size={14} /> Chạm để lật lại mặt trước
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons: Forgotten vs Remembered */}
          <div className="flashcard-actions-grid">
            <button
              className="btn btn-action-forgotten"
              onClick={() => handleAnswer(false)}
            >
              <XCircle size={20} /> Chưa nhớ
            </button>

            <button
              className="btn btn-action-mastered"
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
