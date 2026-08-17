import React, { useState } from 'react';
import { Download, Upload, Volume2, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportNotesToJSON, importNotesFromJSON, INITIAL_SAMPLE_NOTES, saveNotes } from '../utils/storage';
import { playPronunciation } from '../utils/speech';

export default function BackupSettings({
  notes,
  onNotesChange
}) {
  const [voiceLang, setVoiceLang] = useState(localStorage.getItem('ez_voice_lang') || 'en-US');
  const [voiceRate, setVoiceRate] = useState(localStorage.getItem('ez_voice_rate') || '0.9');
  const [importStatus, setImportStatus] = useState(null);

  const handleVoiceLangChange = (lang) => {
    setVoiceLang(lang);
    localStorage.setItem('ez_voice_lang', lang);
  };

  const handleVoiceRateChange = (rate) => {
    setVoiceRate(rate);
    localStorage.setItem('ez_voice_rate', rate);
  };

  const handleTestVoice = () => {
    playPronunciation('Hello! Welcome to EZLanguage vocabulary notebook.', null, {
      lang: voiceLang,
      rate: voiceRate
    });
  };

  const handleExport = () => {
    exportNotesToJSON(notes);
  };

  const handleFileImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = importNotesFromJSON(content, notes, 'merge');
        if (res.success) {
          onNotesChange(res.result);
          setImportStatus({
            type: 'success',
            text: `Nhập thành công ${res.count} ghi chú từ tệp sao lưu!`
          });
        } else {
          setImportStatus({
            type: 'error',
            text: res.error || 'Lỗi khi nhập dữ liệu'
          });
        }
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    if (confirm('Bạn có chắc muốn nạp lại danh sách từ vựng mẫu ban đầu không? (Dữ liệu hiện tại sẽ được thay thế bằng bộ mẫu)')) {
      saveNotes(INITIAL_SAMPLE_NOTES);
      onNotesChange(INITIAL_SAMPLE_NOTES);
      setImportStatus({
        type: 'success',
        text: 'Đã nạp lại bộ dữ liệu từ vựng mẫu thành công!'
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}>
      {/* Voice Settings */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '18px',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Volume2 size={18} color="#4F46E5" /> Cài đặt giọng đọc & Phát âm
        </h3>

        <div className="form-group">
          <label className="form-label">Chất giọng phát âm</label>
          <select
            className="form-select"
            value={voiceLang}
            onChange={(e) => handleVoiceLangChange(e.target.value)}
          >
            <option value="en-US">Tiếng Anh - Mỹ (English US)</option>
            <option value="en-GB">Tiếng Anh - Anh (English UK)</option>
            <option value="en-AU">Tiếng Anh - Úc (English Australia)</option>
          </select>
        </div>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label className="form-label">Tốc độ đọc</label>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4F46E5' }}>{voiceRate}x</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.2"
            step="0.05"
            value={voiceRate}
            onChange={(e) => handleVoiceRateChange(e.target.value)}
            style={{ accentColor: '#4F46E5', cursor: 'pointer' }}
          />
        </div>

        <button className="btn btn-secondary" onClick={handleTestVoice}>
          <Volume2 size={16} /> Nghe thử giọng đọc
        </button>
      </div>

      {/* Backup & Restore Data */}
      <div
        style={{
          background: 'white',
          borderRadius: 16,
          padding: '18px',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldCheck size={18} color="#16A34A" /> Sao lưu & Khôi phục dữ liệu
        </h3>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          Toàn bộ dữ liệu của bạn ({notes.length} ghi chú). Bạn có thể xuất file JSON để lưu trữ dự phòng.
        </p>

        {importStatus && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: importStatus.type === 'success' ? '#DCFCE7' : '#FEE2E2',
              color: importStatus.type === 'success' ? '#15803D' : '#B91C1C'
            }}
          >
            {importStatus.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{importStatus.text}</span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={handleExport} style={{ flex: 1 }}>
            <Download size={16} /> Xuất file JSON
          </button>

          <label className="btn btn-secondary" style={{ flex: 1, cursor: 'pointer' }}>
            <Upload size={16} /> Nhập file JSON
            <input
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileImport}
            />
          </label>
        </div>

        <button
          className="btn"
          style={{ background: '#FFF1F2', color: '#E11D48', border: '1px solid #FFE4E6', marginTop: 4 }}
          onClick={handleResetSampleData}
        >
          <RefreshCw size={16} /> Nạp lại bộ từ vựng mẫu
        </button>
      </div>
    </div>
  );
}
