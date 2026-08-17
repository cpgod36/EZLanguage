import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import NoteList from './components/NoteList';
import AddNoteModal from './components/AddNoteModal';
import FlashcardReview from './components/FlashcardReview';
import StatsView from './components/StatsView';
import BackupSettings from './components/BackupSettings';
import { Plus, Trash2, RotateCcw } from 'lucide-react';
import {
  getStoredNotes,
  saveNotes,
  addOrUpdateNote,
  deleteNote,
  toggleStarNote,
  updateNoteMastery,
  getStreakInfo
} from './utils/storage';

export default function App() {
  const [notes, setNotes] = useState(() => getStoredNotes());
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo());
  const [activeTab, setActiveTab] = useState('notes');

  // Filters and Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('a-z');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Modal & Action Sheet States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [pendingDeleteNote, setPendingDeleteNote] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Update streak on mount
  useEffect(() => {
    setStreakInfo(getStreakInfo());
  }, []);

  const handleSaveNote = (noteData) => {
    const updated = addOrUpdateNote(noteData, notes);
    setNotes(updated);
    setStreakInfo(getStreakInfo());
  };

  const handleTriggerDelete = (note) => {
    setPendingDeleteNote(note);
  };

  const handleConfirmDelete = () => {
    if (!pendingDeleteNote) return;
    const deletedItem = pendingDeleteNote;
    const previousList = [...notes];
    const updated = deleteNote(deletedItem.id, notes);
    setNotes(updated);
    setPendingDeleteNote(null);

    // Show instant Undo Toast
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({
      text: `Đã xóa "${deletedItem.term}"`,
      undo: () => {
        saveNotes(previousList);
        setNotes(previousList);
        setToastMessage(null);
      }
    });

    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleToggleStar = (id) => {
    const updated = toggleStarNote(id, notes);
    setNotes(updated);
  };

  const handleUpdateMastery = (id, isMastered) => {
    const updated = updateNoteMastery(id, isMastered, notes);
    setNotes(updated);
    setStreakInfo(getStreakInfo());
  };

  const handleOpenAddModal = () => {
    setEditNote(null);
    setIsAddModalOpen(true);
  };

  const handleEditNote = (note) => {
    setEditNote(note);
    setIsAddModalOpen(true);
  };

  const handleAddMeaningDirectly = (note) => {
    setEditNote(note);
    setIsAddModalOpen(true);
  };

  const handleSwitchToEditNote = (targetNote) => {
    setEditNote(targetNote);
  };

  return (
    <div className="app-container">
      {/* Dynamic Header */}
      <Header
        streakInfo={streakInfo}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
        showStarredOnly={showStarredOnly}
        setShowStarredOnly={setShowStarredOnly}
        activeTab={activeTab}
      />

      {/* Main Tab Content */}
      <main className="main-content">
        {activeTab === 'notes' && (
          <NoteList
            notes={notes}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            showStarredOnly={showStarredOnly}
            sortBy={sortBy}
            onEditNote={handleEditNote}
            onTriggerDelete={handleTriggerDelete}
            onToggleStar={handleToggleStar}
            onAddMeaningDirectly={handleAddMeaningDirectly}
            onOpenAddModal={handleOpenAddModal}
          />
        )}

        {activeTab === 'flashcard' && (
          <FlashcardReview
            notes={notes}
            onUpdateMastery={handleUpdateMastery}
          />
        )}

        {activeTab === 'stats' && (
          <StatsView
            notes={notes}
            streakInfo={streakInfo}
          />
        )}

        {activeTab === 'settings' && (
          <BackupSettings
            notes={notes}
            onNotesChange={(newNotes) => setNotes(newNotes)}
          />
        )}
      </main>

      {/* Floating Action Button (Add Note) */}
      {activeTab === 'notes' && (
        <button
          className="fab-add"
          onClick={handleOpenAddModal}
          title="Thêm ghi chú mới"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Add / Edit Note Modal */}
      <AddNoteModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditNote(null);
        }}
        onSave={handleSaveNote}
        editNote={editNote}
        allNotes={notes}
        onSwitchToEditNote={handleSwitchToEditNote}
      />

      {/* iOS Action Sheet for Delete Confirmation (Zero Lag) */}
      {pendingDeleteNote && (
        <div className="action-sheet-overlay" onClick={() => setPendingDeleteNote(null)}>
          <div className="action-sheet-card" onClick={(e) => e.stopPropagation()}>
            <div className="action-sheet-group">
              <div className="action-sheet-title">
                Bạn có chắc muốn xóa ghi chú "{pendingDeleteNote.term}"?
              </div>
              <button
                className="action-sheet-btn danger"
                onClick={handleConfirmDelete}
              >
                <Trash2 size={18} /> Xóa ghi chú
              </button>
            </div>
            <button
              className="action-sheet-btn cancel"
              onClick={() => setPendingDeleteNote(null)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Instant Undo Toast */}
      {toastMessage && (
        <div className="toast-container">
          <span style={{ fontSize: '0.88rem' }}>{toastMessage.text}</span>
          <button className="toast-undo-btn" onClick={toastMessage.undo}>
            <RotateCcw size={13} style={{ display: 'inline', marginRight: 4 }} /> Hoàn tác
          </button>
        </div>
      )}
    </div>
  );
}
