import React from 'react';
import { BookOpen, Layers, Plus, BarChart3, Settings } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  return (
    <nav className="bottom-nav">
      {/* 1. Notes Tab */}
      <button
        className={`nav-item ${activeTab === 'notes' ? 'active' : ''}`}
        onClick={() => setActiveTab('notes')}
      >
        <BookOpen size={21} strokeWidth={activeTab === 'notes' ? 2.5 : 1.8} />
        <span>Sổ tay</span>
      </button>

      {/* 2. Review Tab */}
      <button
        className={`nav-item ${activeTab === 'flashcard' ? 'active' : ''}`}
        onClick={() => setActiveTab('flashcard')}
      >
        <Layers size={21} strokeWidth={activeTab === 'flashcard' ? 2.5 : 1.8} />
        <span>Ôn tập</span>
      </button>

      {/* 3. Center Elevated Add Button with Pulse & Animation */}
      <div className="nav-center-wrapper">
        <button
          className="nav-center-btn"
          onClick={onOpenAddModal}
          title="Thêm ghi chú mới"
          aria-label="Thêm ghi chú mới"
        >
          <div className="nav-center-pulse" />
          <div className="nav-center-inner">
            <Plus size={26} strokeWidth={2.6} className="nav-center-plus-icon" />
          </div>
        </button>
      </div>

      {/* 4. Stats Tab */}
      <button
        className={`nav-item ${activeTab === 'stats' ? 'active' : ''}`}
        onClick={() => setActiveTab('stats')}
      >
        <BarChart3 size={21} strokeWidth={activeTab === 'stats' ? 2.5 : 1.8} />
        <span>Thống kê</span>
      </button>

      {/* 5. Settings Tab */}
      <button
        className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
        onClick={() => setActiveTab('settings')}
      >
        <Settings size={21} strokeWidth={activeTab === 'settings' ? 2.5 : 1.8} />
        <span>Cài đặt</span>
      </button>
    </nav>
  );
}
