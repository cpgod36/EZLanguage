import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Trash2, Loader2, AlertTriangle, Check, BookOpen, Volume2, Eye } from 'lucide-react';
import { NOTE_TYPES, findExistingNoteByTerm } from '../utils/storage';
import { lookupWord } from '../utils/dictionaryApi';
import { playPronunciation } from '../utils/speech';

export default function AddNoteModal({
  isOpen,
  onClose,
  onSave,
  editNote,
  allNotes,
  onSwitchToEditNote
}) {
  const [type, setType] = useState('word');
  const [term, setTerm] = useState('');
  const [ipa, setIpa] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [meanings, setMeanings] = useState([
    { partOfSpeech: 'noun', vietnamese: '', englishDef: '', example: '' }
  ]);
  const [collocations, setCollocations] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isStarred, setIsStarred] = useState(false);

  // Dictionary Lookup & Duplicate States
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupMessage, setLookupMessage] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [ignoreDuplicate, setIgnoreDuplicate] = useState(false);

  // Sync editNote if editing
  useEffect(() => {
    if (editNote) {
      setType(editNote.type || 'word');
      setTerm(editNote.term || '');
      setIpa(editNote.ipa || '');
      setAudioUrl(editNote.audioUrl || '');
      setMeanings(
        editNote.meanings && editNote.meanings.length > 0
          ? editNote.meanings
          : [{ partOfSpeech: 'noun', vietnamese: '', englishDef: '', example: '' }]
      );
      setCollocations(editNote.collocations || '');
      setMnemonic(editNote.mnemonic || '');
      setTags(editNote.tags || []);
      setIsStarred(editNote.isStarred || false);
      setDuplicateWarning(null);
      setIgnoreDuplicate(true);
    } else {
      // Reset form
      setType('word');
      setTerm('');
      setIpa('');
      setAudioUrl('');
      setMeanings([{ partOfSpeech: 'noun', vietnamese: '', englishDef: '', example: '' }]);
      setCollocations('');
      setMnemonic('');
      setTags([]);
      setIsStarred(false);
      setDuplicateWarning(null);
      setIgnoreDuplicate(false);
    }
    setLookupMessage(null);
  }, [editNote, isOpen]);

  // Check duplicates while typing term
  const handleTermChange = (value) => {
    setTerm(value);
    if (!editNote && !ignoreDuplicate && value.trim().length > 1) {
      const existing = findExistingNoteByTerm(value, allNotes);
      if (existing) {
        setDuplicateWarning(existing);
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setDuplicateWarning(null);
    }
  };

  // Quick Dictionary Lookup
  const handleLookup = async () => {
    if (!term.trim()) {
      setLookupMessage({ type: 'error', text: 'Vui lòng nhập từ tiếng Anh trước khi tra cứu' });
      return;
    }

    setIsLookingUp(true);
    setLookupMessage(null);

    const result = await lookupWord(term);
    setIsLookingUp(false);

    if (result.success && result.data) {
      const {
        vietnamese,
        ipa: newIpa,
        audioUrl: newAudio,
        partOfSpeech,
        englishDef,
        example,
        synonyms,
        suggestedType,
        additionalMeanings
      } = result.data;

      if (newIpa) setIpa(newIpa);
      if (newAudio) setAudioUrl(newAudio);

      // Auto-switch type if user is currently on default 'word' and a phrasal verb / idiom is detected
      if (type === 'word' && suggestedType && suggestedType !== 'word') {
        setType(suggestedType);
      }

      // Update primary meaning
      setMeanings((prev) => {
        const updated = [...prev];
        if (updated[0]) {
          if (partOfSpeech) updated[0].partOfSpeech = partOfSpeech;
          if (!updated[0].vietnamese && vietnamese) updated[0].vietnamese = vietnamese;
          if (!updated[0].englishDef && englishDef) updated[0].englishDef = englishDef;
          if (!updated[0].example && example) updated[0].example = example;
        }

        // If user had only 1 empty meaning and API has additional senses, append them
        if (prev.length === 1 && (!prev[0].vietnamese || prev[0].vietnamese === vietnamese) && additionalMeanings && additionalMeanings.length > 0) {
          additionalMeanings.forEach(am => {
            if (am.vietnamese && am.vietnamese !== vietnamese) {
              updated.push(am);
            }
          });
        }

        return updated;
      });

      if (synonyms && synonyms.length > 0 && !collocations) {
        setCollocations(`Từ đồng nghĩa: ${synonyms.join(', ')}`);
      }

      setLookupMessage({
        type: 'success',
        text: 'Đã tự động điền nghĩa tiếng Việt, phát âm IPA và định nghĩa!'
      });

      // Play pronunciation preview
      playPronunciation(term, newAudio);
    } else {
      setLookupMessage({
        type: 'error',
        text: result.error || 'Không tìm thấy dữ liệu từ điển.'
      });
    }
  };

  // Meanings Array Handlers
  const handleMeaningChange = (index, field, value) => {
    setMeanings((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddMeaning = () => {
    setMeanings((prev) => [
      ...prev,
      { partOfSpeech: 'noun', vietnamese: '', englishDef: '', example: '' }
    ]);
  };

  const handleRemoveMeaning = (index) => {
    if (meanings.length <= 1) return;
    setMeanings((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Tags Handler
  const handleAddTag = (tagToAdd) => {
    const clean = tagToAdd.replace('#', '').trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!term.trim()) {
      alert('Vui lòng nhập từ hoặc thuật ngữ cần ghi chú!');
      return;
    }

    const validMeanings = meanings.filter((m) => m.vietnamese && m.vietnamese.trim());
    if (validMeanings.length === 0) {
      alert('Vui lòng nhập ít nhất 1 nghĩa tiếng Việt!');
      return;
    }

    const notePayload = {
      ...(editNote || {}),
      term: term.trim(),
      type,
      ipa: ipa.trim(),
      audioUrl,
      meanings: validMeanings,
      collocations: collocations.trim(),
      mnemonic: mnemonic.trim(),
      tags,
      isStarred
    };

    onSave(notePayload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {editNote ? 'Chỉnh sửa ghi chú' : 'Thêm ghi chú mới'}
          </h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Form Body */}
        <form className="modal-body" onSubmit={handleSubmit}>
          {/* Type Selector */}
          <div className="form-group">
            <label className="form-label">Thể loại ghi chú</label>
            <div className="filter-scroll-container" style={{ padding: 0 }}>
              {Object.values(NOTE_TYPES).map((t) => (
                <button
                  type="button"
                  key={t.id}
                  className={`filter-chip ${type === t.id ? 'active' : ''}`}
                  onClick={() => setType(t.id)}
                >
                  <span className={`badge ${t.badgeClass}`} style={{ padding: '1px 6px', fontSize: '0.7rem' }}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Term Input & Quick Lookup */}
          <div className="form-group">
            <label className="form-label">
              Từ / Cụm từ / Mẫu câu <span style={{ color: '#DC2626' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder={NOTE_TYPES[type]?.placeholder || 'Nhập từ tiếng Anh...'}
                value={term}
                onChange={(e) => handleTermChange(e.target.value)}
                autoFocus
              />
              <button
                type="button"
                className="btn btn-lookup"
                onClick={handleLookup}
                disabled={isLookingUp || !term.trim()}
                title="Tự động tra phiên âm IPA và ví dụ từ điển"
              >
                {isLookingUp ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} color="#4F46E5" />
                )}
                <span>Tra nhanh</span>
              </button>
            </div>
          </div>

          {/* Duplicate Alert Banner if word already exists */}
          {duplicateWarning && !editNote && (
            <div className="duplicate-alert-box">
              <div className="duplicate-alert-header">
                <AlertTriangle size={18} color="#D97706" />
                <span>Từ "{duplicateWarning.term}" đã có trong sổ tay của bạn!</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#78350F' }}>
                Đã lưu {duplicateWarning.meanings?.length || 1} nét nghĩa: <strong>{duplicateWarning.meanings?.[0]?.vietnamese}</strong>
              </div>
              <div className="duplicate-options-grid">
                <button
                  type="button"
                  className="btn-duplicate-action"
                  onClick={() => {
                    // Switch to edit existing note
                    onSwitchToEditNote(duplicateWarning);
                  }}
                >
                  <Eye size={15} /> Mở thẻ cũ để sửa
                </button>
                <button
                  type="button"
                  className="btn-duplicate-action"
                  onClick={() => {
                    setIgnoreDuplicate(true);
                    setDuplicateWarning(null);
                  }}
                >
                  <Plus size={15} /> Vẫn tạo thẻ mới
                </button>
              </div>
            </div>
          )}

          {/* Lookup message */}
          {lookupMessage && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                fontSize: '0.82rem',
                background: lookupMessage.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                color: lookupMessage.type === 'success' ? '#15803D' : '#B91C1C'
              }}
            >
              {lookupMessage.text}
            </div>
          )}

          {/* IPA & Pronunciation */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Phiên âm IPA</label>
              {term && (
                <button
                  type="button"
                  style={{ background: 'none', border: 'none', color: '#4F46E5', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
                  onClick={() => playPronunciation(term, audioUrl)}
                >
                  <Volume2 size={14} /> Thử phát âm
                </button>
              )}
            </div>
            <input
              type="text"
              className="form-input font-mono"
              placeholder="/prəˌnʌn.siˈeɪ.ʃən/"
              value={ipa}
              onChange={(e) => setIpa(e.target.value)}
            />
          </div>

          {/* Meanings List (Multi-sense Support) */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">
                Nghĩa tiếng Việt & Ví dụ <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <button
                type="button"
                style={{
                  background: '#EEF2FF',
                  border: 'none',
                  color: '#4F46E5',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 999,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
                onClick={handleAddMeaning}
              >
                <Plus size={14} /> Thêm nét nghĩa #{meanings.length + 1}
              </button>
            </div>

            {meanings.map((m, idx) => (
              <div
                key={idx}
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 12,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  marginTop: 6
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <select
                    className="form-select"
                    style={{ width: 110, padding: '8px 10px', fontSize: '0.85rem' }}
                    value={m.partOfSpeech}
                    onChange={(e) => handleMeaningChange(idx, 'partOfSpeech', e.target.value)}
                  >
                    <option value="noun">Danh từ (n)</option>
                    <option value="verb">Động từ (v)</option>
                    <option value="adj">Tính từ (adj)</option>
                    <option value="adv">Phó từ (adv)</option>
                    <option value="phrasal verb">Phrasal Verb</option>
                    <option value="idiom">Thành ngữ</option>
                    <option value="pattern">Mẫu câu</option>
                    <option value="other">Khác</option>
                  </select>

                  <input
                    type="text"
                    className="form-input"
                    placeholder="Nghĩa tiếng Việt (bắt buộc)..."
                    value={m.vietnamese}
                    onChange={(e) => handleMeaningChange(idx, 'vietnamese', e.target.value)}
                    style={{ flex: 1 }}
                  />

                  {meanings.length > 1 && (
                    <button
                      type="button"
                      className="icon-btn"
                      style={{ color: '#EF4444' }}
                      onClick={() => handleRemoveMeaning(idx)}
                      title="Xóa nét nghĩa này"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  className="form-input"
                  placeholder="Định nghĩa tiếng Anh (tùy chọn)..."
                  value={m.englishDef}
                  onChange={(e) => handleMeaningChange(idx, 'englishDef', e.target.value)}
                  style={{ fontSize: '0.88rem' }}
                />

                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="Câu ví dụ thực tế (tùy chọn)..."
                  value={m.example}
                  onChange={(e) => handleMeaningChange(idx, 'example', e.target.value)}
                  style={{ fontSize: '0.88rem', resize: 'vertical' }}
                />
              </div>
            ))}
          </div>

          {/* Collocations */}
          <div className="form-group">
            <label className="form-label">Cụm từ đi kèm (Collocations / Synonyms)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. come up with an idea / solution / plan"
              value={collocations}
              onChange={(e) => setCollocations(e.target.value)}
            />
          </div>

          {/* Mnemonic / Personal Note */}
          <div className="form-group">
            <label className="form-label">Mẹo ghi nhớ / Ngữ cảnh bắt gặp</label>
            <textarea
              className="form-textarea"
              rows={2}
              placeholder="e.g. Nghe trong podcast The Daily, hoặc mẹo liên tưởng vui..."
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Chủ đề (Tags)</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
              {['IELTS', 'Work', 'Daily', 'Grammar', 'Speaking', 'Listening'].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className="tag-pill"
                  style={{
                    cursor: 'pointer',
                    background: tags.includes(preset) ? '#4F46E5' : '#F1F5F9',
                    color: tags.includes(preset) ? 'white' : '#475569',
                    border: 'none'
                  }}
                  onClick={() => (tags.includes(preset) ? handleRemoveTag(preset) : handleAddTag(preset))}
                >
                  #{preset}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Thêm tag mới (gõ rồi bấm Thêm)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag(tagInput);
                  }
                }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => handleAddTag(tagInput)}
              >
                Thêm
              </button>
            </div>

            {tags.length > 0 && (
              <div className="extra-tags" style={{ marginTop: 8 }}>
                {tags.map((t) => (
                  <span
                    key={t}
                    className="tag-pill"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E0E7FF', color: '#4338CA' }}
                  >
                    #{t}
                    <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRemoveTag(t)} />
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Submit Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ flex: 1 }}>
              Hủy
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
              <Check size={18} /> {editNote ? 'Lưu cập nhật' : 'Thêm vào sổ tay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
