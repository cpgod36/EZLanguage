import React, { useState } from 'react';
import { Download, Upload, Volume2, Smartphone, ShieldCheck, RefreshCw, CheckCircle2, AlertCircle, Cloud, LogIn, LogOut, User } from 'lucide-react';
import { exportNotesToJSON, importNotesFromJSON, INITIAL_SAMPLE_NOTES, saveNotes } from '../utils/storage';
import { playPronunciation } from '../utils/speech';

export default function BackupSettings({
  notes,
  onNotesChange,
  currentUser,
  onLogin,
  onLogout,
  onForceSyncToCloud
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Cloud Sync & Google Account Status */}
      <div
        style={{
          background: currentUser ? 'linear-gradient(135deg, #ECFDF5, #D1FAE5)' : 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
          borderRadius: 16,
          padding: '18px',
          border: currentUser ? '1px solid #A7F3D0' : '1px solid #BFDBFE',
          display: 'flex',
          flexDirection: 'column',
          gap: 12
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, color: currentUser ? '#065F46' : '#1E40AF' }}>
            <Cloud size={20} />
            <span>Đồng bộ Đám mây (Cloud Sync)</span>
          </div>
          {currentUser && (
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#047857', background: '#A7F3D0', padding: '2px 8px', borderRadius: 999 }}>
              ● Đang kết nối
            </span>
          )}
        </div>

        {currentUser ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.88rem', color: '#065F46' }}>
              Tài khoản: <strong>{currentUser.displayName || currentUser.email}</strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#047857' }}>
              Tất cả từ vựng bạn thêm/xóa/sửa sẽ <strong>tự động đồng bộ ngay lập tức</strong> giữa iPhone và Máy tính qua Firebase!
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button
                className="btn btn-secondary"
                style={{ fontSize: '0.82rem', padding: '8px 12px', background: 'white' }}
                onClick={onForceSyncToCloud}
              >
                <Cloud size={14} /> Đẩy toàn bộ dữ liệu lên Cloud
              </button>
              <button
                className="btn"
                style={{ fontSize: '0.82rem', padding: '8px 12px', background: '#FEE2E2', color: '#B91C1C' }}
                onClick={onLogout}
              >
                <LogOut size={14} /> Đăng xuất
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: '0.85rem', color: '#1E40AF' }}>
              Đăng nhập bằng Gmail để dữ liệu trên <strong>Điện thoại iPhone</strong> và <strong>Máy tính</strong> tự động đồng bộ realtime với nhau.
            </div>
            <button
              className="btn btn-primary"
              style={{ background: '#2563EB', padding: '10px 16px', fontSize: '0.9rem', width: 'fit-content' }}
              onClick={onLogin}
            >
              <LogIn size={16} /> Đăng nhập bằng Google (Gmail)
            </button>
          </div>
        )}
      </div>

      {/* iOS Installation Guide */}
      <div
        style={{
          background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
          borderRadius: 16,
          padding: '18px',
          border: '1px solid #C7D2FE',
          display: 'flex',
          flexDirection: 'column',
          gap: 10
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#3730A3', fontWeight: 800 }}>
          <Smartphone size={20} />
          <span>Cách cài đặt lên Màn hình chính iPhone</span>
        </div>
        <div style={{ fontSize: '0.85rem', color: '#4338CA', lineHeight: 1.5 }}>
          1. Mở trang web này bằng trình duyệt <strong>Safari trên iPhone</strong>.<br />
          2. Nhấn vào biểu tượng <strong>Chia sẻ (Share icon 📤)</strong> ở thanh dưới của Safari.<br />
          3. Cuộn xuống và chọn <strong>"Thêm vào Màn hình chính" (Add to Home Screen)</strong>.<br />
          👉 App sẽ xuất hiện như ứng dụng iPhone bình thường, dùng mượt và có thể học offline!
        </div>
      </div>

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
