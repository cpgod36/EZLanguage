import React, { useState, useMemo } from 'react';
import NoteCard from './NoteCard';
import {
  BookOpen, SearchX, Plus, Flame, Star, Layers, Sparkles,
  MessageSquareText, AlertCircle, ArrowLeft, ChevronRight,
  ArrowDownAZ, ArrowUpAZ, Clock, Folder, Info, X, Lightbulb,
  CheckCircle2, Compass
} from 'lucide-react';
import { NOTE_TYPES, isToday } from '../utils/storage';

export default function NoteList({
  notes,
  searchQuery,
  selectedCategory,
  showStarredOnly,
  sortBy,
  onEditNote,
  onTriggerDelete,
  onToggleStar,
  onAddMeaningDirectly,
  onOpenAddModal
}) {
  // selectedFolder: null => Folders / Category Collection Hub; { id, title, filterFn, badgeClass, icon, count } => Notes List View
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [internalSortBy, setInternalSortBy] = useState('a-z');
  const [selectedTypeInfo, setSelectedTypeInfo] = useState(null);

  // Today's Notes (Timezone-safe)
  const todayNotes = useMemo(() => {
    return notes.filter(n => isToday(n.createdAt));
  }, [notes]);

  // Folders Definition
  const folders = useMemo(() => {
    const starredNotes = notes.filter(n => n.isStarred);

    // Category folders
    const categoryFolders = Object.values(NOTE_TYPES).map(type => {
      const catNotes = notes.filter(n => n.type === type.id);
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
        description: type.description || `Kho ghi chú các ${type.label.toLowerCase()}`,
        icon: IconComponent,
        badgeClass: type.badgeClass,
        colorKey: type.colorKey,
        typeConfig: type,
        filterFn: (n) => n.type === type.id,
        count: catNotes.length
      };
    });

    return {
      starredCount: starredNotes.length,
      categoryFolders
    };
  }, [notes]);

  // When a search query exists, auto-switch to search results list mode
  const isSearchActive = Boolean(searchQuery && searchQuery.trim());

  // Filtered Notes for the Active View
  const activeNotes = useMemo(() => {
    let result = [...notes];

    // If searching, search across all notes
    if (isSearchActive) {
      const q = searchQuery.toLowerCase().trim();
      return result.filter(n => {
        const matchTerm = n.term?.toLowerCase().includes(q);
        const matchIpa = n.ipa?.toLowerCase().includes(q);
        const matchCollocation = n.collocations?.toLowerCase().includes(q);
        const matchMnemonic = n.mnemonic?.toLowerCase().includes(q);
        const matchTags = (n.tags || []).some(t => t.toLowerCase().includes(q));
        const matchMeanings = (n.meanings || []).some(m =>
          m.vietnamese?.toLowerCase().includes(q) ||
          m.englishDef?.toLowerCase().includes(q) ||
          m.example?.toLowerCase().includes(q)
        );
        return matchTerm || matchIpa || matchCollocation || matchMnemonic || matchTags || matchMeanings;
      });
    }

    // If in a folder, filter by folder
    if (selectedFolder) {
      result = result.filter(selectedFolder.filterFn);
    }

    // Apply sorting
    const activeSort = internalSortBy;
    result.sort((a, b) => {
      const termA = (a.term || '').trim();
      const termB = (b.term || '').trim();

      if (activeSort === 'a-z') {
        return termA.localeCompare(termB, 'en', { sensitivity: 'base', numeric: true });
      } else if (activeSort === 'z-a') {
        return termB.localeCompare(termA, 'en', { sensitivity: 'base', numeric: true });
      } else if (activeSort === 'newest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      } else if (activeSort === 'oldest') {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeA - timeB;
      }
      return 0;
    });

    return result;
  }, [notes, isSearchActive, searchQuery, selectedFolder, internalSortBy]);

  // Group by first letter for both A-Z and Z-A modes
  const isAlphabeticalMode = (internalSortBy === 'a-z' || internalSortBy === 'z-a') && !isSearchActive;

  const letterGroups = useMemo(() => {
    if (!isAlphabeticalMode) return null;

    const groups = {};
    activeNotes.forEach(note => {
      const firstChar = ((note.term || '')[0] || '#').toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(note);
    });

    return groups;
  }, [activeNotes, isAlphabeticalMode]);

  const availableLetters = useMemo(() => {
    if (!letterGroups) return [];
    const keys = Object.keys(letterGroups);
    if (internalSortBy === 'z-a') {
      return keys.sort().reverse();
    }
    return keys.sort();
  }, [letterGroups, internalSortBy]);

  const scrollToLetter = (letter) => {
    const el = document.getElementById(`letter-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleOpenFolder = (folder) => {
    setSelectedFolder(folder);
  };

  const handleBackToFolders = () => {
    setSelectedFolder(null);
  };

  // =========================================================================
  // VIEW 1: FOLDER / CATEGORY COLLECTION HUB (Tập hợp các Thẻ Thư Mục)
  // (Rendered when not searching and no folder is currently opened)
  // =========================================================================
  if (!selectedFolder && !isSearchActive) {
    return (
      <div className="notebook-hub-container">
        {/* Section 1: Hero Card - Ghi chú Hôm nay (Today's Notes) */}
        <div
          className="today-notes-card"
          onClick={() => {
            handleOpenFolder({
              id: 'today',
              title: 'Ghi chú Hôm nay',
              description: 'Các từ vựng và kiến thức bạn vừa tạo trong ngày hôm nay',
              icon: Flame,
              badgeClass: 'badge-coral',
              filterFn: (n) => isToday(n.createdAt),
              count: todayNotes.length
            });
          }}
        >
          <div className="today-card-header">
            <div className="today-badge-row">
              <div className="today-icon-glow">
                <Flame size={20} color="#EA580C" />
              </div>
              <span className="today-label-text">GHI CHÚ HÔM NAY</span>
            </div>
            <span className="today-count-badge">
              {todayNotes.length} mục
            </span>
          </div>

          <div className="today-card-body">
            {todayNotes.length > 0 ? (
              <>
                <p className="today-summary-text">
                  Hôm nay bạn đã nạp thêm <strong>{todayNotes.length}</strong> từ vựng mới:
                </p>
                <div className="today-chips-preview">
                  {todayNotes.slice(0, 5).map(n => (
                    <span key={n.id} className="today-word-chip">
                      {n.term}
                    </span>
                  ))}
                  {todayNotes.length > 5 && (
                    <span className="today-word-chip more">
                      +{todayNotes.length - 5} từ nữa
                    </span>
                  )}
                </div>
              </>
            ) : (
              <p className="today-empty-text">
                Hôm nay bạn chưa thêm ghi chú nào. Hãy nhấn nút (+) bên dưới để nạp từ mới ngay nhé!
              </p>
            )}
          </div>

          <div className="today-card-footer">
            <span>Mở xem chi tiết hôm nay</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Section 2: Special Collections (Starred & All Notes) */}
        <div className="notebook-section">
          <div className="notebook-section-title">
            <Folder size={15} color="#4F46E5" />
            <span>Bộ sưu tập nhanh</span>
          </div>

          <div className="folders-grid">
            {/* Starred Notes Folder */}
            <div
              className="folder-card"
              onClick={() => {
                handleOpenFolder({
                  id: 'starred',
                  title: 'Mục Yêu thích',
                  description: 'Các từ và mẫu câu bạn đã đánh dấu sao',
                  icon: Star,
                  badgeClass: 'badge-honey',
                  filterFn: (n) => n.isStarred,
                  count: folders.starredCount
                });
              }}
            >
              <div className="folder-card-top">
                <div className="folder-icon-badge" style={{ background: '#FEF9C3', color: '#F59E0B' }}>
                  <Star size={20} fill="#F59E0B" />
                </div>
                <span className="folder-count-pill">{folders.starredCount} mục</span>
              </div>
              <div className="folder-card-info">
                <h3 className="folder-title">Đã gắn sao</h3>
                <p className="folder-desc">Các từ vựng yêu thích cần lưu ý</p>
              </div>
              <div className="folder-card-footer">
                <span>Mở thư mục</span>
                <ChevronRight size={14} />
              </div>
            </div>

            {/* All Notes Folder */}
            <div
              className="folder-card"
              onClick={() => {
                handleOpenFolder({
                  id: 'all',
                  title: 'Tất cả Ghi chú',
                  description: 'Toàn bộ từ vựng và cấu trúc ngữ pháp trong sổ tay',
                  icon: BookOpen,
                  badgeClass: 'badge-sky',
                  filterFn: () => true,
                  count: notes.length
                });
              }}
            >
              <div className="folder-card-top">
                <div className="folder-icon-badge" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                  <BookOpen size={20} />
                </div>
                <span className="folder-count-pill">{notes.length} mục</span>
              </div>
              <div className="folder-card-info">
                <h3 className="folder-title">Tất cả ghi chú (A-Z)</h3>
                <p className="folder-desc">Toàn bộ kho từ vựng và ngữ pháp</p>
              </div>
              <div className="folder-card-footer">
                <span>Mở thư mục</span>
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Category Folders Grid */}
        <div className="notebook-section" style={{ marginTop: 10 }}>
          <div className="notebook-section-title">
            <Layers size={15} color="#4F46E5" />
            <span>Thư mục theo thể loại</span>
          </div>

          <div className="folders-grid">
            {folders.categoryFolders.map(cat => {
              const Icon = cat.icon;

              return (
                <div
                  key={cat.id}
                  className="folder-card"
                  onClick={() => handleOpenFolder(cat)}
                >
                  <div className="folder-card-top">
                    <span className={`badge ${cat.badgeClass}`}>
                      {cat.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        className="btn-info-circle"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTypeInfo(cat.typeConfig);
                        }}
                        title={`Tìm hiểu về ${cat.shortTitle}`}
                      >
                        <Info size={13} />
                      </button>
                      <span className="folder-count-pill">{cat.count} mục</span>
                    </div>
                  </div>

                  <div className="folder-card-info">
                    <h3 className="folder-title">{cat.shortTitle}</h3>
                    <p className="folder-desc">{cat.description}</p>
                  </div>

                  <div className="folder-card-footer">
                    <span>Mở thư mục</span>
                    <ChevronRight size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Type Explainer Modal Sheet */}
        {selectedTypeInfo && (
          <div className="modal-overlay" onClick={() => setSelectedTypeInfo(null)}>
            <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '88vh' }}>
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge ${selectedTypeInfo.badgeClass}`}>
                    {selectedTypeInfo.label}
                  </span>
                  <h3 className="modal-title">{selectedTypeInfo.shortTitle}</h3>
                </div>
                <button className="icon-btn" onClick={() => setSelectedTypeInfo(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="modal-body" style={{ gap: 14 }}>
                {/* Section 1: Concept */}
                <div className="explainer-section">
                  <div className="explainer-section-title">
                    <Info size={15} color="#4F46E5" />
                    <span>Nó là gì? (Khái niệm cốt lõi)</span>
                  </div>
                  <p className="explainer-text">{selectedTypeInfo.explanation.concept}</p>
                </div>

                {/* Section 2: Format & Structure */}
                <div className="explainer-section">
                  <div className="explainer-section-title">
                    <Layers size={15} color="#059669" />
                    <span>Dạng thức & Cấu trúc nhận diện</span>
                  </div>
                  <p className="explainer-text">{selectedTypeInfo.explanation.format}</p>
                </div>

                {/* Section 3: Examples */}
                <div className="explainer-section">
                  <div className="explainer-section-title">
                    <Sparkles size={15} color="#D97706" />
                    <span>Ví dụ minh họa tiêu biểu</span>
                  </div>
                  <div className="explainer-examples-list">
                    {selectedTypeInfo.explanation.examples.map((ex, i) => (
                      <div key={i} className="explainer-example-item">
                        <div className="explainer-example-term">{ex.term}</div>
                        <div className="explainer-example-meaning">{ex.meaning}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section 4: Pro Tip */}
                <div className="explainer-tip-box">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: '#047857', fontSize: '0.84rem' }}>
                    <Lightbulb size={16} /> Mẹo học & Ứng dụng phản xạ
                  </div>
                  <p style={{ fontSize: '0.82rem', color: '#065F46', marginTop: 4, lineHeight: 1.45 }}>
                    {selectedTypeInfo.explanation.tip}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                    onClick={() => {
                      const targetCat = folders.categoryFolders.find(c => c.typeConfig.id === selectedTypeInfo.id);
                      setSelectedTypeInfo(null);
                      if (targetCat) handleOpenFolder(targetCat);
                    }}
                  >
                    Mở thư mục {selectedTypeInfo.shortTitle}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSelectedTypeInfo(null)}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: FOLDER DETAIL LIST VIEW / SEARCH RESULTS VIEW
  // (Rendered when inside a specific folder OR when searching)
  // =========================================================================
  return (
    <div className="folder-detail-view" style={{ position: 'relative' }}>
      {/* Top Header Row in Folder View */}
      <div className="folder-top-nav">
        <button
          className="btn-back-folders"
          onClick={() => {
            handleBackToFolders();
          }}
        >
          <ArrowLeft size={16} />
          <span>Tất cả thư mục</span>
        </button>

        <div className="folder-active-title">
          {isSearchActive ? (
            <span>Tìm kiếm ({activeNotes.length})</span>
          ) : (
            <span>{selectedFolder?.title} ({activeNotes.length})</span>
          )}
        </div>
      </div>

      {/* 4-Way Sort Selector Chips Bar */}
      <div className="folder-sort-bar">
        <span className="sort-label">Sắp xếp:</span>
        <div className="sort-chips-group">
          <button
            type="button"
            className={`sort-chip ${internalSortBy === 'newest' ? 'active' : ''}`}
            onClick={() => setInternalSortBy('newest')}
          >
            <Clock size={13} />
            <span>Mới nhất</span>
          </button>

          <button
            type="button"
            className={`sort-chip ${internalSortBy === 'oldest' ? 'active' : ''}`}
            onClick={() => setInternalSortBy('oldest')}
          >
            <Clock size={13} />
            <span>Cũ nhất</span>
          </button>

          <button
            type="button"
            className={`sort-chip ${internalSortBy === 'a-z' ? 'active' : ''}`}
            onClick={() => setInternalSortBy('a-z')}
          >
            <ArrowDownAZ size={14} />
            <span>A → Z</span>
          </button>

          <button
            type="button"
            className={`sort-chip ${internalSortBy === 'z-a' ? 'active' : ''}`}
            onClick={() => setInternalSortBy('z-a')}
          >
            <ArrowUpAZ size={14} />
            <span>Z → A</span>
          </button>
        </div>
      </div>

      {/* Alphabet Index Jump Bar (Visible in A-Z or Z-A mode) */}
      {availableLetters.length > 2 && (
        <div className="alphabet-jump-bar">
          {availableLetters.map(letter => (
            <button
              key={letter}
              className="alphabet-letter-btn"
              onClick={() => scrollToLetter(letter)}
              title={`Nhảy tới chữ ${letter}`}
            >
              {letter}
            </button>
          ))}
        </div>
      )}

      {/* Empty State in Folder */}
      {activeNotes.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            {isSearchActive ? <SearchX size={32} /> : <BookOpen size={32} />}
          </div>
          <h3 className="empty-title">
            {isSearchActive ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có ghi chú nào trong mục này'}
          </h3>
          <p className="empty-desc">
            {isSearchActive
              ? 'Thử tìm kiếm bằng từ khóa khác hoặc xóa bớt ký tự tìm kiếm'
              : 'Nhấn nút dấu cộng (+) bên dưới để thêm ghi chú mới vào thư mục này!'}
          </p>
          {!isSearchActive && (
            <button className="btn btn-primary" onClick={onOpenAddModal} style={{ marginTop: 8 }}>
              <Plus size={18} /> Thêm ghi chú mới
            </button>
          )}
        </div>
      ) : (
        /* Note Cards List */
        <div>
          {letterGroups ? (
            availableLetters.map(letter => {
              const groupNotes = letterGroups[letter] || [];
              return (
                <div key={letter} id={`letter-${letter}`} className="letter-group-container">
                  <div className="letter-group-header">
                    <span>{letter}</span>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                      ({groupNotes.length})
                    </span>
                  </div>
                  {groupNotes.map(note => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onEdit={onEditNote}
                      onTriggerDelete={onTriggerDelete}
                      onToggleStar={onToggleStar}
                      onAddMeaningDirectly={onAddMeaningDirectly}
                    />
                  ))}
                </div>
              );
            })
          ) : (
            <div>
              {activeNotes.map(note => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={onEditNote}
                  onTriggerDelete={onTriggerDelete}
                  onToggleStar={onToggleStar}
                  onAddMeaningDirectly={onAddMeaningDirectly}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
