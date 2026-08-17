import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import NoteList from './components/NoteList';
import AddNoteModal from './components/AddNoteModal';
import FlashcardReview from './components/FlashcardReview';
import StatsView from './components/StatsView';
import BackupSettings from './components/BackupSettings';
import LoginScreen from './components/LoginScreen';
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
import {
  auth,
  onAuthStateChanged,
  loginWithGoogle,
  logoutUser,
  subscribeToUserNotes,
  saveNoteToCloud,
  deleteNoteFromCloud,
  syncLocalNotesToCloud,
  checkRedirectAuth
} from './utils/firebase';

export default function App() {
  const [notes, setNotes] = useState(() => getStoredNotes());
  const [streakInfo, setStreakInfo] = useState(() => getStreakInfo());
  const [activeTab, setActiveTab] = useState('notes');
  const [currentUser, setCurrentUser] = useState(null);
  const [isGuestMode, setIsGuestMode] = useState(() => localStorage.getItem('ez_guest_mode') === 'true');
  const [isAuthChecking, setIsAuthChecking] = useState(true);

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

  // Auth Listener & Realtime Firestore Sync
  useEffect(() => {
    checkRedirectAuth().then((user) => {
      if (user) {
        setCurrentUser(user);
        setIsGuestMode(false);
      }
    });

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthChecking(false);
      if (user) {
        setIsGuestMode(false);
        localStorage.removeItem('ez_guest_mode');
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Realtime Cloud Sync when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    const unsubscribeFirestore = subscribeToUserNotes(currentUser.uid, (cloudNotes) => {
      if (cloudNotes && cloudNotes.length > 0) {
        setNotes(cloudNotes);
        saveNotes(cloudNotes);
      } else {
        // If cloud is empty, upload current local notes to cloud
        const currentLocal = getStoredNotes();
        if (currentLocal && currentLocal.length > 0) {
          syncLocalNotesToCloud(currentUser.uid, currentLocal);
        }
      }
    });

    return () => unsubscribeFirestore();
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = async () => {
    const res = await loginWithGoogle();
    if (res.success && res.user) {
      setCurrentUser(res.user);
      setIsGuestMode(false);
      localStorage.removeItem('ez_guest_mode');
      syncLocalNotesToCloud(res.user.uid, notes);
      setToastMessage({
        text: `Chào mừng ${res.user.displayName || res.user.email}! Đã bật đồng bộ Đám mây.`
      });
      setTimeout(() => setToastMessage(null), 4000);
    } else if (res.error) {
      alert('Đăng nhập không thành công: ' + res.error);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsGuestMode(false);
    localStorage.removeItem('ez_guest_mode');
    setToastMessage({ text: 'Đã đăng xuất tài khoản.' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleContinueAsGuest = () => {
    setIsGuestMode(true);
    localStorage.setItem('ez_guest_mode', 'true');
  };

  const handleForceSync = async () => {
    if (!currentUser) return;
    await syncLocalNotesToCloud(currentUser.uid, notes);
    setToastMessage({ text: 'Đã đồng bộ toàn bộ ghi chú lên Google Cloud!' });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // CRUD Operations
  const handleSaveNote = (noteData) => {
    const updated = addOrUpdateNote(noteData, notes);
    setNotes(updated);
    setStreakInfo(getStreakInfo());

    if (currentUser) {
      saveNoteToCloud(currentUser.uid, noteData);
    }
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

    if (currentUser) {
      deleteNoteFromCloud(currentUser.uid, deletedItem.id);
    }

    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({
      text: `Đã xóa "${deletedItem.term}"`,
      undo: () => {
        saveNotes(previousList);
        setNotes(previousList);
        if (currentUser) {
          saveNoteToCloud(currentUser.uid, deletedItem);
        }
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
    if (currentUser) {
      const target = updated.find(n => n.id === id);
      if (target) saveNoteToCloud(currentUser.uid, target);
    }
  };

  const handleUpdateMastery = (id, isMastered) => {
    const updated = updateNoteMastery(id, isMastered, notes);
    setNotes(updated);
    setStreakInfo(getStreakInfo());
    if (currentUser) {
      const target = updated.find(n => n.id === id);
      if (target) saveNoteToCloud(currentUser.uid, target);
    }
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

  // Show Welcome / Login Screen if not logged in and not in guest mode
  if (!isAuthChecking && !currentUser && !isGuestMode) {
    return (
      <LoginScreen
        onLoginWithGoogle={handleLogin}
        onContinueAsGuest={handleContinueAsGuest}
      />
    );
  }

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
        currentUser={currentUser}
        onLogin={handleLogin}
        onLogout={handleLogout}
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
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onForceSyncToCloud={handleForceSync}
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

      {/* iOS Action Sheet for Delete Confirmation */}
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
          {toastMessage.undo && (
            <button className="toast-undo-btn" onClick={toastMessage.undo}>
              <RotateCcw size={13} style={{ display: 'inline', marginRight: 4 }} /> Hoàn tác
            </button>
          )}
        </div>
      )}
    </div>
  );
}
