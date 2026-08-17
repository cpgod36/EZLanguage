import React, { useState, memo } from 'react';
import {
  Volume2, Star, MoreVertical, Edit2, Trash2, PlusCircle,
  Sparkles, Lightbulb, CheckCircle2, Clock, History, Calendar,
  Trophy, RotateCw, X, ChevronRight, Check
} from 'lucide-react';
import { NOTE_TYPES, formatDateTime } from '../utils/storage';
import { playPronunciation } from '../utils/speech';

function NoteCard({
  note,
  onEdit,
  onTriggerDelete,
  onToggleStar,
  onAddMeaningDirectly
}) {
  const [showMenu, setShowMenu] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const typeConfig = NOTE_TYPES[note.type] || NOTE_TYPES.word;

  const handleAudio = (e) => {
    e.stopPropagation();
    playPronunciation(note.term, note.audioUrl);
  };

  const createdTimeFormatted = formatDateTime(note.createdAt);
  const updatedTimeFormatted = formatDateTime(note.updatedAt);
  const reviewedTimeFormatted = formatDateTime(note.lastReviewedAt);

  return (
    <>
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
                      minWidth: 175,
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
                        setShowHistoryModal(true);
                      }}
                    >
                      <History size={15} color="#4F46E5" />
                      Lịch sử hoạt động
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
                        onAddMeaningDirectly(note);
                      }}
                    >
                      <PlusCircle size={15} color="#059669" />
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
                        onTriggerDelete(note);
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
                      style={{ width: 24, height: 24, flexShrink: 0 }}
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

        {/* Card Metadata Footer: Added timestamp & History Button */}
        <div className="note-card-meta-footer">
          <div className="note-meta-time">
            <Clock size={12} color="var(--text-muted)" />
            <span>Đã thêm: {createdTimeFormatted || 'Gần đây'}</span>
          </div>

          <button
            type="button"
            className="btn-card-history"
            onClick={() => setShowHistoryModal(true)}
            title="Xem toàn bộ lịch sử học và hoạt động"
          >
            <History size={12} />
            <span>Lịch sử</span>
          </button>
        </div>
      </div>

      {/* Activity History Modal Sheet */}
      {showHistoryModal && (
        <div className="modal-overlay" onClick={() => setShowHistoryModal(false)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={20} color="#4F46E5" />
                <h3 className="modal-title">Lịch sử hoạt động: <span style={{ color: '#4F46E5' }}>{note.term}</span></h3>
              </div>
              <button className="icon-btn" onClick={() => setShowHistoryModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ gap: 14 }}>
              {/* Quick Status Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>TRẠNG THÁI GHI NHỚ</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 4, color: note.masteryLevel === 'mastered' ? '#15803D' : note.masteryLevel === 'learning' ? '#B45309' : '#4338CA' }}>
                    {note.masteryLevel === 'mastered' ? 'Đã thuộc hoàn toàn' : note.masteryLevel === 'learning' ? 'Đang trau dồi' : 'Mới thêm'}
                  </div>
                </div>

                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: 12, border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700 }}>SỐ LẦN ĐÃ ÔN TẬP</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 4, color: '#4F46E5' }}>
                    {note.reviewCount || 0} lần
                  </div>
                </div>
              </div>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 6 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Nhật ký chi tiết
                </div>

                {/* Event 1: Created */}
                <div className="history-timeline-item">
                  <div className="history-timeline-dot green">
                    <PlusCircle size={14} />
                  </div>
                  <div className="history-timeline-content">
                    <div className="history-item-title">Đã tạo thẻ từ vựng mới</div>
                    <div className="history-item-desc">Đã thêm từ "{note.term}" vào thể loại {typeConfig.label}</div>
                    <div className="history-item-time">{createdTimeFormatted || 'Gần đây'}</div>
                  </div>
                </div>

                {/* Event 2: Last Reviewed */}
                {note.lastReviewedAt && (
                  <div className="history-timeline-item">
                    <div className="history-timeline-dot blue">
                      <RotateCw size={14} />
                    </div>
                    <div className="history-timeline-content">
                      <div className="history-item-title">Lần ôn tập Flashcard gần nhất</div>
                      <div className="history-item-desc">
                        {note.masteryLevel === 'mastered' ? 'Đã trả lời thuộc thẻ trong bài ôn tập' : 'Đang tiếp tục rèn luyện phản xạ'}
                      </div>
                      <div className="history-item-time">{reviewedTimeFormatted}</div>
                    </div>
                  </div>
                )}

                {/* Event 3: Updated */}
                {note.updatedAt && note.updatedAt !== note.createdAt && (
                  <div className="history-timeline-item">
                    <div className="history-timeline-dot purple">
                      <Edit2 size={14} />
                    </div>
                    <div className="history-timeline-content">
                      <div className="history-item-title">Lần cập nhật nội dung cuối</div>
                      <div className="history-item-desc">Đã chỉnh sửa nét nghĩa, câu ví dụ hoặc mẹo nhớ</div>
                      <div className="history-item-time">{updatedTimeFormatted}</div>
                    </div>
                  </div>
                )}

                {/* Event 4: Starred */}
                {note.isStarred && (
                  <div className="history-timeline-item">
                    <div className="history-timeline-dot yellow">
                      <Star size={14} />
                    </div>
                    <div className="history-timeline-content">
                      <div className="history-item-title">Đã gắn dấu sao Yêu thích</div>
                      <div className="history-item-desc">Thẻ được đánh dấu ưu tiên xuất hiện trong danh sách Mục Yêu thích</div>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', marginTop: 8 }}
                onClick={() => setShowHistoryModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(NoteCard);
