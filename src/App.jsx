import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import NoteList from './components/NoteList';
import AddNoteModal from './components/AddNoteModal';
import FlashcardReview from './components/FlashcardReview';
import StatsView from './components/StatsView';
import BackupSettings from './components/BackupSettings';
import { Plus } from 'lucide-react';
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

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editNote, setEditNote] = useState(null);

  // Update streak on mount
  useEffect(() => {
    setStreakInfo(getStreakInfo());
  }, []);

  const handleSaveNote = (noteData) => {
    const updated = addOrUpdateNote(noteData, notes);
    setNotes(updated);
    setStreakInfo(getStreakInfo());
  };

  const handleDeleteNote = (id) => {
    const updated = deleteNote(id, notes);
    setNotes(updated);
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
            onDeleteNote={handleDeleteNote}
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
    </div>
  );
}
