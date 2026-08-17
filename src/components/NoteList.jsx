import React, { useMemo } from 'react';
import NoteCard from './NoteCard';
import { BookOpen, SearchX, Plus } from 'lucide-react';

export default function NoteList({
  notes,
  searchQuery,
  selectedCategory,
  showStarredOnly,
  sortBy,
  onEditNote,
  onDeleteNote,
  onToggleStar,
  onAddMeaningDirectly,
  onOpenAddModal
}) {
  // Filter Notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Category filter
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter(n => n.type === selectedCategory);
    }

    // Starred filter
    if (showStarredOnly) {
      result = result.filter(n => n.isStarred);
    }

    // Search query filter
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(n => {
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

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'a-z') {
        return a.term.localeCompare(b.term, 'en', { sensitivity: 'base' });
      } else if (sortBy === 'z-a') {
        return b.term.localeCompare(a.term, 'en', { sensitivity: 'base' });
      } else if (sortBy === 'newest') {
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      return 0;
    });

    return result;
  }, [notes, searchQuery, selectedCategory, showStarredOnly, sortBy]);

  // Group by first letter for A-Z mode
  const letterGroups = useMemo(() => {
    if (sortBy !== 'a-z' || searchQuery) return null;

    const groups = {};
    filteredNotes.forEach(note => {
      const firstChar = (note.term[0] || '#').toUpperCase();
      const key = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!groups[key]) groups[key] = [];
      groups[key].push(note);
    });

    return groups;
  }, [filteredNotes, sortBy, searchQuery]);

  // Unique letters present for the jump bar
  const availableLetters = useMemo(() => {
    if (!letterGroups) return [];
    return Object.keys(letterGroups).sort();
  }, [letterGroups]);

  const scrollToLetter = (letter) => {
    const el = document.getElementById(`letter-${letter}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (filteredNotes.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">
          {searchQuery ? <SearchX size={32} /> : <BookOpen size={32} />}
        </div>
        <h3 className="empty-title">
          {searchQuery ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có ghi chú nào trong mục này'}
        </h3>
        <p className="empty-desc">
          {searchQuery
            ? 'Hãy thử tìm kiếm bằng từ tiếng Anh, nghĩa tiếng Việt hoặc từ khóa khác.'
            : 'Nhấn nút dấu cộng (+) bên dưới để thêm từ vựng hoặc kiến thức tiếng Anh mới!'}
        </p>
        {!searchQuery && (
          <button className="btn btn-primary" onClick={onOpenAddModal} style={{ marginTop: 8 }}>
            <Plus size={18} /> Thêm ghi chú đầu tiên
          </button>
        )}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Alphabet Index Jump Bar (Visible in A-Z mode on iPhone) */}
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

      {/* Render Grouped (A-Z) or Flat list */}
      {letterGroups ? (
        Object.entries(letterGroups).map(([letter, groupNotes]) => (
          <div key={letter} id={`letter-${letter}`} style={{ marginBottom: 16 }}>
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
                onDelete={onDeleteNote}
                onToggleStar={onToggleStar}
                onAddMeaningDirectly={onAddMeaningDirectly}
              />
            ))}
          </div>
        ))
      ) : (
        <div>
          {filteredNotes.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={onEditNote}
              onDelete={onDeleteNote}
              onToggleStar={onToggleStar}
              onAddMeaningDirectly={onAddMeaningDirectly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
