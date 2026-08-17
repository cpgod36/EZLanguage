import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

export { onAuthStateChanged };
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBLxZIYKDK9JUPa3OqU93KYu0q9FdjxZjs",
  authDomain: "ezlanguage-b9ded.firebaseapp.com",
  projectId: "ezlanguage-b9ded",
  storageBucket: "ezlanguage-b9ded.firebasestorage.app",
  messagingSenderId: "478242066808",
  appId: "1:478242066808:web:e3dcc6c00fe3bbcf84b88d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Check redirect result on mobile devices if popup was blocked
export async function checkRedirectAuth() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return result.user;
    }
  } catch (err) {
    console.error('Redirect auth error:', err);
  }
  return null;
}

// Google Sign-In (Try Popup first, fallback to Redirect on Safari if popup blocked)
export async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err) {
    console.warn('Popup sign in failed, trying redirect...', err);
    if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, redirecting: true };
      } catch (redirectErr) {
        return { success: false, error: redirectErr.message };
      }
    }
    return { success: false, error: err.message };
  }
}

// Logout
export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Subscribe to realtime notes changes for logged-in user
export function subscribeToUserNotes(userId, callback) {
  if (!userId) return () => {};
  
  const notesCol = collection(db, 'users', userId, 'notes');
  return onSnapshot(notesCol, (snapshot) => {
    const cloudNotes = [];
    snapshot.forEach((docSnap) => {
      cloudNotes.push({ id: docSnap.id, ...docSnap.data() });
    });
    callback(cloudNotes);
  }, (err) => {
    console.error('Firestore onSnapshot error:', err);
  });
}

// Save single note to Cloud Firestore
export async function saveNoteToCloud(userId, note) {
  if (!userId || !note) return;
  try {
    const noteId = note.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const noteDoc = doc(db, 'users', userId, 'notes', noteId);
    
    // Clean undefined fields before writing
    const cleanedNote = JSON.parse(JSON.stringify({
      ...note,
      id: noteId,
      updatedAt: new Date().toISOString()
    }));

    await setDoc(noteDoc, cleanedNote, { merge: true });
    return noteId;
  } catch (err) {
    console.error('Save to cloud error:', err);
  }
}

// Delete note from Cloud Firestore
export async function deleteNoteFromCloud(userId, noteId) {
  if (!userId || !noteId) return;
  try {
    const noteDoc = doc(db, 'users', userId, 'notes', noteId);
    await deleteDoc(noteDoc);
  } catch (err) {
    console.error('Delete from cloud error:', err);
  }
}

// Bulk upload local notes to Cloud when user signs in for first time
export async function syncLocalNotesToCloud(userId, localNotes) {
  if (!userId || !localNotes || localNotes.length === 0) return;
  try {
    const batch = writeBatch(db);
    localNotes.forEach(note => {
      const noteId = note.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const noteDoc = doc(db, 'users', userId, 'notes', noteId);
      const cleaned = JSON.parse(JSON.stringify({ ...note, id: noteId }));
      batch.set(noteDoc, cleaned, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Batch sync to cloud error:', err);
  }
}
