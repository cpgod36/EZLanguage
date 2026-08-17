import React, { useState } from 'react';
import { Volume2, Star, MoreVertical, Edit2, Trash2, PlusCircle, Sparkles, Lightbulb, Tag, CheckCircle2 } from 'lucide-react';
import { NOTE_TYPES } from '../utils/storage';
import { playPronunciation } from '../utils/speech';

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onToggleStar,
  onAddMeaningDirectly
}) {
  const [showMenu, setShowMenu] = useState(false);
  const typeConfig = NOTE_TYPES[note.type] || NOTE_TYPES.word;

  const handleAudio = (e) => {
    e.stopPropagation();
    playPronunciation(note.term, note.audioUrl);
  };

  return (
    <div className="note-card">
      {/* Top Header: Badge, Term, IPA, Audio, Star & Options */}
      <div className="note-card-header">
        <div className="note-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span className={`badge ${typeConfig.badgeClass}`}>
              {typeConfig.label}
            </span>
            {note.masteryLevel === 'mastered' && (
              <span className="badge" style={{ background: '#DCFCE7', color: '#15803D', border: '1px solid #BBF7D0' }}>
                <CheckCircle2 size={12} /> Đã thuộc
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <h3 className="note-term">{note.term}</h3>
            {note.ipa && (
              <span className="note-ipa font-mono">{note.ipa}</span>
            )}
            <button className="audio-btn" onClick={handleAudio} title="Nghe phát âm">
              <Volume2 size={15} />
            </button>
          </div>
        </div>

        {/* Card Actions: Star & Menu */}
        <div className="note-card-actions">
          <button
            className={`icon-btn ${note.isStarred ? 'starred' : ''}`}
            onClick={() => onToggleStar(note.id)}
            title={note.isStarred ? "Bỏ gắn sao" : "Gắn sao"}
          >
            <Star size={20} fill={note.isStarred ? "#F59E0B" : "none"} />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="icon-btn"
              onClick={() => setShowMenu(!showMenu)}
              title="Tùy chọn"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 20 }}
                  onClick={() => setShowMenu(false)}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: 'white',
                    borderRadius: 12,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.08)',
                    padding: '6px 0',
                    zIndex: 25,
                    minWidth: 160,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1E293B',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onClick={() => {
                      setShowMenu(false);
                      onAddMeaningDirectly(note);
                    }}
                  >
                    <PlusCircle size={15} color="#4F46E5" />
                    Thêm nét nghĩa
                  </button>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1E293B',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(note);
                    }}
                  >
                    <Edit2 size={15} color="#64748B" />
                    Chỉnh sửa thẻ
                  </button>

                  <button
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '8px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#DC2626',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onClick={() => {
                      setShowMenu(false);
                      if (confirm(`Bạn có chắc muốn xóa ghi chú "${note.term}"?`)) {
                        onDelete(note.id);
                      }
                    }}
                  >
                    <Trash2 size={15} color="#DC2626" />
                    Xóa thẻ
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Sense Meanings List */}
      <div className="meanings-container">
        {(note.meanings || []).map((m, idx) => (
          <div key={m.id || idx} className="meaning-item">
            <div className="meaning-header">
              {m.partOfSpeech && (
                <span className="meaning-pos">{m.partOfSpeech}</span>
              )}
              {note.meanings.length > 1 && (
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6366F1' }}>
                  #{idx + 1}
                </span>
              )}
              <span className="meaning-vi">{m.vietnamese}</span>
            </div>

            {m.englishDef && (
              <div className="meaning-en">{m.englishDef}</div>
            )}

            {m.example && (
              <div className="meaning-example">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6 }}>
                  <span>"{m.example}"</span>
                  <button
                    className="audio-btn"
                    style={{ width: 22, height: 22, flexShrink: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      playPronunciation(m.example);
                    }}
                    title="Nghe câu ví dụ"
                  >
                    <Volume2 size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Extras: Collocations, Mnemonic & Tags */}
      {(note.collocations || note.mnemonic || (note.tags && note.tags.length > 0)) && (
        <div className="note-extras">
          {note.collocations && (
            <div className="extra-row">
              <Sparkles size={14} className="extra-icon" color="#F59E0B" />
              <span><strong>Cụm từ đi kèm:</strong> {note.collocations}</span>
            </div>
          )}

          {note.mnemonic && (
            <div className="extra-row">
              <Lightbulb size={14} className="extra-icon" color="#10B981" />
              <span><strong>Mẹo nhớ / Ngữ cảnh:</strong> {note.mnemonic}</span>
            </div>
          )}

          {note.tags && note.tags.length > 0 && (
            <div className="extra-tags">
              {note.tags.map((tag, i) => (
                <span key={i} className="tag-pill">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
