import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
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

// Check redirect result on mobile devices
export async function checkRedirectAuth() {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return { success: true, user: result.user };
    }
  } catch (err) {
    console.error('Redirect auth error:', err);
    return { success: false, error: formatAuthError(err) };
  }
  return null;
}

// Convert Firebase Auth error codes to helpful Vietnamese messages
export function formatAuthError(err) {
  if (!err) return 'Đã có lỗi xảy ra khi đăng nhập.';
  const code = err.code || '';
  const message = err.message || '';

  if (code === 'auth/unauthorized-domain') {
    const currentHost = window.location.hostname;
    return `Tên miền "${currentHost}" chưa được thêm vào Authorized Domains trên Firebase Console. Vui lòng vào Firebase > Authentication > Settings > Authorized domains và thêm "${currentHost}".`;
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Chưa BẬT phương thức đăng nhập này trên Firebase Console! Vui lòng vào Firebase > Authentication > Sign-in method và Bật (Enable) Google hoặc Email/Password.';
  }
  if (code === 'auth/user-not-found' || code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
    return 'Email hoặc mật khẩu không chính xác. Nếu chưa có tài khoản, vui lòng chọn "Đăng ký".';
  }
  if (code === 'auth/email-already-in-use') {
    return 'Email này đã được đăng ký tài khoản. Vui lòng chuyển sang tab "Đăng nhập".';
  }
  if (code === 'auth/weak-password') {
    return 'Mật khẩu quá ngắn, vui lòng đặt từ 6 ký tự trở lên.';
  }
  if (code === 'auth/invalid-email') {
    return 'Địa chỉ Email không hợp lệ.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Bạn đã đóng cửa sổ đăng nhập Google trước khi hoàn tất.';
  }
  if (code === 'auth/cancelled-popup-request') {
    return 'Yêu cầu đăng nhập bị hủy do có cửa sổ khác mở cùng lúc.';
  }
  if (code === 'auth/network-request-failed') {
    return 'Không thể kết nối tới máy chủ. Vui lòng kiểm tra lại mạng Internet.';
  }

  return `Lỗi đăng nhập (${code}): ${message}`;
}

// Google Sign-In with smart iOS Standalone detection
export async function loginWithGoogle() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  const isStandalone = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

  // On iOS standalone PWA (Home screen), popups are blocked by iOS WebKit, so use redirect
  if (isIOS && isStandalone) {
    try {
      await signInWithRedirect(auth, googleProvider);
      return { success: true, redirecting: true };
    } catch (redirectErr) {
      return { success: false, error: formatAuthError(redirectErr) };
    }
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (err) {
    console.warn('Popup sign in error:', err);

    if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return { success: true, redirecting: true };
      } catch (redirectErr) {
        return { success: false, error: formatAuthError(redirectErr) };
      }
    }

    return { success: false, error: formatAuthError(err) };
  }
}

// Email & Password Auth (100% Guaranteed on iOS PWA Standalone)
export async function loginWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    return { success: true, user: result.user };
  } catch (err) {
    return { success: false, error: formatAuthError(err) };
  }
}

export async function registerWithEmail(email, password) {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    return { success: true, user: result.user };
  } catch (err) {
    return { success: false, error: formatAuthError(err) };
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
