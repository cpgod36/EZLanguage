/**
 * Storage and state persistence for EZLanguage
 * LocalStorage wrapper with backup/restore, multi-sense support, and streak tracking
 */

const STORAGE_KEY = 'ezlanguage_notes_v1';
const STREAK_KEY = 'ezlanguage_streak_v1';
const SETTINGS_KEY = 'ezlanguage_settings_v1';

export const NOTE_TYPES = {
  word: {
    id: 'word',
    shortTitle: 'Vocabulary',
    label: 'Từ vựng',
    englishLabel: 'Word',
    description: 'Từ đơn lẻ có nghĩa độc lập cấu tạo nên câu',
    colorKey: 'mint',
    badgeClass: 'badge-mint',
    iconName: 'BookA',
    placeholder: 'e.g. articulate, versatile, resilient',
    explanation: {
      concept: 'Từ đơn (Single Words) có ngữ nghĩa độc lập thuộc các từ loại như Danh từ, Động từ, Tính từ, Trạng từ... đóng vai trò là những viên gạch nền móng xây dựng nên câu văn.',
      format: 'Bao gồm từ gốc, phiên âm IPA, trọng âm, từ loại (n, v, adj, adv) và các dạng biến đổi số nhiều/thì quá khứ.',
      examples: [
        { term: 'resilient (adj)', meaning: 'kiên cường, có khả năng phục hồi nhanh sau khó khăn' },
        { term: 'articulate (adj/v)', meaning: 'ăn nói lưu loát, diễn đạt mạch lạc rõ ràng' }
      ],
      tip: 'Nên học từ vựng kèm phát âm IPA, câu ví dụ thực tế và các từ đồng nghĩa (synonyms) thay vì chỉ học dịch nghĩa đơn thuần.'
    }
  },
  phrasal_verb: {
    id: 'phrasal_verb',
    shortTitle: 'Phrasal Verb',
    label: 'Cụm động từ',
    englishLabel: 'Phrasal Verb',
    description: 'Động từ kết hợp tiểu từ tạo nên tầng nghĩa mới',
    colorKey: 'sky',
    badgeClass: 'badge-sky',
    iconName: 'Layers',
    placeholder: 'e.g. come up with, call off, figure out',
    explanation: {
      concept: 'Cụm động từ là sự kết hợp giữa một Động từ (Verb) + một hoặc hai Tiểu từ/Giới từ (Particle/Preposition). Khi kết hợp, cụm từ mang một ý nghĩa hoàn toàn mới, thường khác hẳn nghĩa đen của từng từ cấu tạo.',
      format: 'Cấu trúc: Verb + Particle (up, off, out, in, down, with...). Phân loại gồm: Cụm tách được (Separable) và Cụm không tách được (Inseparable).',
      examples: [
        { term: 'come up with', meaning: 'nghĩ ra, nảy ra (ý tưởng, giải pháp) — Không tách rời' },
        { term: 'call off', meaning: 'hủy bỏ (cuộc họp, sự kiện) — Có thể tách: call it off' },
        { term: 'figure out', meaning: 'tìm ra cách giải quyết, hiểu ra vấn đề' }
      ],
      tip: 'Tuyệt đối không dịch từng từ theo nghĩa đen. Hãy liên tưởng hành động đi kèm hướng của tiểu từ (up, out, off...) và học theo cụm trọn vẹn.'
    }
  },
  collocation_idiom: {
    id: 'collocation_idiom',
    shortTitle: 'Collocation & Idiom',
    label: 'Cụm từ & Thành ngữ',
    englishLabel: 'Collocation & Idiom',
    description: 'Cụm từ đi đôi tự nhiên & thành ngữ mang nghĩa bóng',
    colorKey: 'honey',
    badgeClass: 'badge-honey',
    iconName: 'Sparkles',
    placeholder: 'e.g. heavy rain, break the ice, under the weather',
    explanation: {
      concept: 'Collocation là sự kết hợp các từ đi đôi với nhau một cách tự nhiên theo thói quen của người bản ngữ. Idiom (Thành ngữ) là cụm từ cố định mang nghĩa bóng ẩn dụ sâu sắc, không thể hiểu theo nghĩa đen của từng từ đơn.',
      format: 'Collocation: Adjective + Noun (heavy rain, không dùng strong rain), Verb + Noun (make a mistake, take a break). Idiom: Các cụm cố định giàu hình ảnh.',
      examples: [
        { term: 'break the ice', meaning: 'phá vỡ bầu không khí ngại ngùng ban đầu' },
        { term: 'under the weather', meaning: 'cảm thấy hơi mệt mỏi, không được khỏe' },
        { term: 'make a decision', meaning: 'đưa ra quyết định (đi với make, không đi với do)' }
      ],
      tip: 'Collocation giúp câu nói tự nhiên chuẩn bản xứ, còn Idiom giúp nâng cao điểm số Speaking/Writing và làm lời nói thêm sinh động.'
    }
  },
  sentence_pattern: {
    id: 'sentence_pattern',
    shortTitle: 'Sentence Pattern',
    label: 'Mẫu câu & Ngữ pháp',
    englishLabel: 'Pattern',
    description: 'Khung cấu trúc câu & cú pháp ngữ pháp chuẩn',
    colorKey: 'lavender',
    badgeClass: 'badge-lavender',
    iconName: 'MessageSquareText',
    placeholder: "e.g. It's high time + S + V-past, How come...?",
    explanation: {
      concept: 'Khung mẫu câu (Sentence Patterns) và các cấu trúc ngữ pháp chuẩn hóa đóng vai trò như chiếc khuôn đúc, giúp bạn lắp ghép nhiều từ vựng khác nhau để tạo thành vô số câu nói đúng ngữ pháp và tự nhiên.',
      format: 'Dạng công thức: S + V + O, Cấu trúc đảo ngữ, Câu điều kiện, Cấu trúc nhấn mạnh (Cleft sentences), Cấu trúc thời gian.',
      examples: [
        { term: "It's high time + S + V-past", meaning: 'Đã đến lúc ai đó cần phải làm gì (diễn tả sự cấp thiết)' },
        { term: "How come + S + V?", meaning: 'Tại sao lại như thế? (Dùng trong văn nói thân mật thay cho Why)' },
        { term: "No sooner had + S + V3 than...", meaning: 'Vừa mới... thì đã...' }
      ],
      tip: 'Hãy ghi nhớ công thức kèm theo 2-3 câu ví dụ gắn liền với trải nghiệm công việc hoặc cuộc sống hàng ngày của chính bạn.'
    }
  },
  mistake_tip: {
    id: 'mistake_tip',
    shortTitle: 'Mistake & Tip',
    label: 'Lỗi hay sai & Mẹo nhớ',
    englishLabel: 'Tip & Mistake',
    description: 'Cặp từ dễ nhầm lẫn & mẹo nhớ siêu tốc',
    colorKey: 'coral',
    badgeClass: 'badge-coral',
    iconName: 'AlertCircle',
    placeholder: 'e.g. affect vs effect, I agree (not I am agree)',
    explanation: {
      concept: 'Nơi tổng hợp các cặp từ dễ gây nhầm lẫn (Confusing Words), các lỗi sai phổ biến do tư duy dịch từ tiếng Việt (Vietnamese interference), cùng những câu thần chú hoặc mẹo ghi nhớ mẹo (Mnemonics) độc đáo.',
      format: 'Dạng so sánh: Từ A vs Từ B, Lỗi sai phổ biến ❌ -> Cách dùng chuẩn ✅, Mẹo ghi nhớ hình ảnh/âm thanh tương tự.',
      examples: [
        { term: 'affect (verb) vs effect (noun)', meaning: 'affect là động từ (tác động), effect là danh từ (kết quả/ảnh hưởng)' },
        { term: '❌ I am agree ➔ ✅ I agree', meaning: 'agree bản thân nó đã là động từ, không dùng kèm am' },
        { term: '❌ She suggested me to go ➔ ✅ She suggested that I go', meaning: 'suggest không đi với to-V khi có tút từ chỉ người' }
      ],
      tip: 'Mỗi khi làm bài kiểm tra hoặc giao tiếp mà bị bắt lỗi, hãy lập tức lưu vào mục này để biến điểm yếu thành điểm mạnh.'
    }
  }
};

export const INITIAL_SAMPLE_NOTES = [
  {
    id: 'sample_0',
    term: 'transform',
    type: 'word',
    ipa: '/trænsˈfɔːm/',
    audioUrl: '',
    meanings: [
      {
        id: 'm0_1',
        partOfSpeech: 'verb',
        vietnamese: 'biến đổi, chuyển đổi hoàn toàn hình thức hoặc bản chất',
        englishDef: 'to change completely the appearance or character of something',
        example: 'Technology has completely transformed the way we learn English.',
        synonyms: ['convert', 'revolutionize', 'alter']
      }
    ],
    wordFamily: {
      verb: 'transform',
      noun: 'transformation, transformer',
      adjective: 'transformative, transformed',
      adverb: 'transformatively',
      opposite: 'untransformed'
    },
    collocations: 'transform into something, undergo a transformation',
    mnemonic: 'Trans (chuyển giao) + Form (hình thái) = Thay đổi toàn bộ diện mạo',
    tags: ['IELTS', 'Academic', 'Writing'],
    isStarred: true,
    masteryLevel: 'learning',
    reviewCount: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastReviewedAt: null
  },
  {
    id: 'sample_1',
    term: 'come up with',
    type: 'phrasal_verb',
    ipa: '/kʌm ʌp wɪð/',
    audioUrl: '',
    meanings: [
      {
        id: 'm1_1',
        partOfSpeech: 'verb',
        vietnamese: 'nảy ra, nghĩ ra (ý tưởng, kế hoạch, giải pháp)',
        englishDef: 'to suggest or think of an idea or plan',
        example: 'She came up with a brilliant idea for our marketing campaign.',
        synonyms: ['propose', 'devise', 'invent']
      }
    ],
    wordFamily: {
      verb: 'come up with',
      noun: '',
      adjective: '',
      adverb: '',
      opposite: ''
    },
    collocations: 'come up with a solution / an excuse / a name / a plan',
    mnemonic: 'Tưởng tượng bóng đèn ý tưởng bật "lên" (up) ngay trước mặt bạn',
    tags: ['Work', 'IELTS', 'Daily'],
    isStarred: true,
    masteryLevel: 'learning',
    reviewCount: 3,
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    lastReviewedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'sample_2',
    term: 'run',
    type: 'word',
    ipa: '/rʌn/',
    audioUrl: '',
    meanings: [
      {
        id: 'm2_1',
        partOfSpeech: 'verb',
        vietnamese: 'chạy bộ, di chuyển nhanh',
        englishDef: 'to move using your legs at a pace faster than walk',
        example: 'I like to run in the park every morning before work.',
        synonyms: ['jog', 'dash', 'sprint']
      },
      {
        id: 'm2_2',
        partOfSpeech: 'verb',
        vietnamese: 'vận hành, quản lý, điều hành (công ty, dự án)',
        englishDef: 'to be in charge of; manage',
        example: 'He has been running his own software company for five years.',
        synonyms: ['manage', 'operate', 'lead']
      }
    ],
    collocations: 'run a business, run late, run out of time',
    mnemonic: 'Chạy (run) để kịp giờ quản lý công ty!',
    tags: ['Work', 'Daily'],
    isStarred: false,
    masteryLevel: 'mastered',
    reviewCount: 5,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastReviewedAt: new Date().toISOString()
  },
  {
    id: 'sample_3',
    term: 'under the weather',
    type: 'collocation_idiom',
    ipa: '/ˈʌn.dər ðə ˈweð.ər/',
    audioUrl: '',
    meanings: [
      {
        id: 'm3_1',
        partOfSpeech: 'idiom',
        vietnamese: 'cảm thấy mệt mỏi, khó ở, ốm nhẹ',
        englishDef: 'slightly unwell or in low spirits',
        example: "I'm feeling a bit under the weather today, so I might stay home.",
        synonyms: ['unwell', 'sick', 'indisposed']
      }
    ],
    collocations: 'feel under the weather, look a bit under the weather',
    mnemonic: 'Thời tiết (weather) thay đổi làm mình nằm bẹp dí bên dưới (under)',
    tags: ['Daily', 'Conversation'],
    isStarred: true,
    masteryLevel: 'learning',
    reviewCount: 2,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    lastReviewedAt: null
  },
  {
    id: 'sample_4',
    term: "It's high time + S + V-ed",
    type: 'sentence_pattern',
    ipa: '',
    audioUrl: '',
    meanings: [
      {
        id: 'm4_1',
        partOfSpeech: 'structure',
        vietnamese: 'Đã đến lúc ai đó phải làm gì (mang tính khẩn trương/nhắc nhở)',
        englishDef: 'used to say that something should be done now or should have been done already',
        example: "It's high time we reviewed our monthly expenses.",
        synonyms: ["It's about time", "It's time"]
      }
    ],
    collocations: "It's high time you started studying / we left",
    mnemonic: 'High time = thời điểm đã lên mức "cao điểm", phải làm ngay!',
    tags: ['Grammar', 'IELTS'],
    isStarred: false,
    masteryLevel: 'new',
    reviewCount: 1,
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastReviewedAt: null
  },
  {
    id: 'sample_5',
    term: 'affect vs effect',
    type: 'mistake_tip',
    ipa: '/əˈfekt/ vs /ɪˈfekt/',
    audioUrl: '',
    meanings: [
      {
        id: 'm5_1',
        partOfSpeech: 'tip',
        vietnamese: 'Affect (Action - Động từ: tác động) vs Effect (End result - Danh từ: kết quả/ảnh hưởng)',
        englishDef: 'Affect is usually a verb (to influence); Effect is usually a noun (a result)',
        example: 'The weather affects my mood (v). The new law had a positive effect on sales (n).',
        synonyms: ['influence (affect)', 'impact / result (effect)']
      }
    ],
    collocations: 'RAVEN rule: Remember Affect is Verb, Effect is Noun',
    mnemonic: 'Mẹo nhớ RAVEN: A = Action/Verb (Affect), E = End result/Noun (Effect)',
    tags: ['Mistakes', 'Writing', 'IELTS'],
    isStarred: true,
    masteryLevel: 'learning',
    reviewCount: 4,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    lastReviewedAt: new Date().toISOString()
  }
];

export function getStoredNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_NOTES));
      return INITIAL_SAMPLE_NOTES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_NOTES;
  } catch (e) {
    console.error('Error loading notes from localStorage:', e);
    return INITIAL_SAMPLE_NOTES;
  }
}

export function saveNotes(notes) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    updateStreakOnActivity();
  } catch (e) {
    console.error('Error saving notes to localStorage:', e);
  }
}

export function isToday(dateString) {
  if (!dateString) return false;
  try {
    const noteDate = new Date(dateString);
    if (isNaN(noteDate.getTime())) return false;
    const today = new Date();
    return (
      noteDate.getFullYear() === today.getFullYear() &&
      noteDate.getMonth() === today.getMonth() &&
      noteDate.getDate() === today.getDate()
    );
  } catch (e) {
    return false;
  }
}

export function formatDateTime(isoString) {
  if (!isoString) return '';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${hours}:${mins}, ${day}/${month}/${year}`;
  } catch (e) {
    return '';
  }
}

export function findExistingNoteByTerm(term, notes) {
  if (!term || !term.trim()) return null;
  const clean = term.trim().toLowerCase();
  return notes.find(n => n.term.trim().toLowerCase() === clean);
}

/**
 * Cross-Family Duplicate Detection
 * Checks if the query term matches:
 * 1. An exact root term (e.g. term === 'transform') -> { note, matchType: 'exact' }
 * 2. Or a derivative in an existing note's Word Family (e.g. term === 'transformation' inside 'transform' card) -> { note, matchType: 'word_family', matchedWord: 'transformation', matchedPos: 'Noun' }
 */
export function checkDuplicateTerm(term, notes, currentNoteId = null) {
  if (!term || !term.trim() || !Array.isArray(notes)) return null;
  const clean = term.trim().toLowerCase();
  const searchWord = clean.replace(/[^a-z0-9]/g, '');
  if (searchWord.length < 2) return null;

  for (const n of notes) {
    if (currentNoteId && n.id === currentNoteId) continue;

    // 1. Direct Term Match
    const noteTermClean = n.term.trim().toLowerCase();
    if (noteTermClean === clean) {
      return { note: n, matchType: 'exact', matchedTerm: n.term };
    }

    // 2. Check Word Family Derivatives
    if (n.wordFamily) {
      const posEntries = [
        { pos: 'Verb', text: n.wordFamily.verb },
        { pos: 'Noun', text: n.wordFamily.noun },
        { pos: 'Adjective', text: n.wordFamily.adjective },
        { pos: 'Adverb', text: n.wordFamily.adverb },
        { pos: 'Opposite', text: n.wordFamily.opposite }
      ];

      for (const entry of posEntries) {
        if (!entry.text) continue;
        const words = entry.text.split(',').map(w => {
          const match = w.match(/^([^(]+)/);
          return (match ? match[1] : w).trim().toLowerCase();
        });

        for (const w of words) {
          if (w === clean) {
            return {
              note: n,
              matchType: 'word_family',
              matchedTerm: n.term,
              matchedWord: w,
              matchedPos: entry.pos
            };
          }
        }
      }
    }
  }

  return null;
}

export function addOrUpdateNote(noteData, notes) {
  const now = new Date().toISOString();
  let updatedList;
  let savedNote;
  
  if (noteData.id) {
    // Updating existing note
    savedNote = {
      ...noteData,
      updatedAt: now,
      createdAt: noteData.createdAt || now
    };
    updatedList = notes.map(n => n.id === noteData.id ? savedNote : n);
  } else {
    // Create new note
    savedNote = {
      ...noteData,
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      masteryLevel: noteData.masteryLevel || 'new',
      isStarred: noteData.isStarred || false,
      lastReviewedAt: null
    };
    updatedList = [savedNote, ...notes];
  }

  saveNotes(updatedList);
  return { updatedList, savedNote };
}

export function addMeaningToNote(existingNoteId, newMeaning, notes) {
  const now = new Date().toISOString();
  const updatedList = notes.map(n => {
    if (n.id === existingNoteId) {
      const currentMeanings = n.meanings || [];
      const meaningWithId = {
        ...newMeaning,
        id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 3)
      };
      return {
        ...n,
        meanings: [...currentMeanings, meaningWithId],
        updatedAt: now
      };
    }
    return n;
  });

  saveNotes(updatedList);
  return updatedList;
}

export function deleteNote(id, notes) {
  const updatedList = notes.filter(n => n.id !== id);
  saveNotes(updatedList);
  return updatedList;
}

export function toggleStarNote(id, notes) {
  const updatedList = notes.map(n => n.id === id ? { ...n, isStarred: !n.isStarred } : n);
  saveNotes(updatedList);
  return updatedList;
}

export function updateNoteMastery(id, isMastered, notes) {
  const now = new Date().toISOString();
  const updatedList = notes.map(n => {
    if (n.id === id) {
      const nextLevel = isMastered ? 'mastered' : 'learning';
      return {
        ...n,
        masteryLevel: nextLevel,
        reviewCount: (n.reviewCount || 0) + 1,
        lastReviewedAt: now,
        updatedAt: now
      };
    }
    return n;
  });

  saveNotes(updatedList);
  updateStreakOnActivity();
  return updatedList;
}

// Streak Tracker
export function getStreakInfo() {
  try {
    const raw = localStorage.getItem(STREAK_KEY);
    const todayStr = new Date().toDateString();
    
    if (!raw) {
      return { currentStreak: 1, lastActiveDate: todayStr, totalActiveDays: 1 };
    }

    const data = JSON.parse(raw);
    const lastDate = new Date(data.lastActiveDate);
    const today = new Date(todayStr);
    
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) {
      // Active today
      return data;
    } else if (diffDays === 1) {
      // Consecutive yesterday
      return data;
    } else {
      // Streak broken
      return { ...data, currentStreak: 0 };
    }
  } catch (e) {
    return { currentStreak: 1, lastActiveDate: new Date().toDateString(), totalActiveDays: 1 };
  }
}

export function updateStreakOnActivity() {
  try {
    const todayStr = new Date().toDateString();
    const raw = localStorage.getItem(STREAK_KEY);
    
    if (!raw) {
      const init = { currentStreak: 1, lastActiveDate: todayStr, totalActiveDays: 1 };
      localStorage.setItem(STREAK_KEY, JSON.stringify(init));
      return init;
    }

    const data = JSON.parse(raw);
    const lastDate = new Date(data.lastActiveDate);
    const today = new Date(todayStr);
    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));

    if (diffDays === 0) {
      return data;
    } else if (diffDays === 1) {
      const updated = {
        currentStreak: (data.currentStreak || 0) + 1,
        lastActiveDate: todayStr,
        totalActiveDays: (data.totalActiveDays || 0) + 1
      };
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
      return updated;
    } else {
      const reset = {
        currentStreak: 1,
        lastActiveDate: todayStr,
        totalActiveDays: (data.totalActiveDays || 0) + 1
      };
      localStorage.setItem(STREAK_KEY, JSON.stringify(reset));
      return reset;
    }
  } catch (e) {
    console.error('Streak update error:', e);
  }
}

// Export / Import
export function exportNotesToJSON(notes) {
  const exportData = {
    app: 'EZLanguage',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    notesCount: notes.length,
    notes: notes
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `EZLanguage_Backup_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importNotesFromJSON(jsonString, currentNotes, mode = 'merge') {
  try {
    const parsed = JSON.parse(jsonString);
    const incomingNotes = Array.isArray(parsed) ? parsed : (parsed.notes || []);

    if (!Array.isArray(incomingNotes)) {
      return { success: false, error: 'Tệp không đúng định dạng EZLanguage JSON' };
    }

    let result;
    if (mode === 'replace') {
      result = incomingNotes;
    } else {
      // Merge by matching term or id
      const existingMap = new Map(currentNotes.map(n => [n.term.toLowerCase(), n]));
      incomingNotes.forEach(item => {
        const key = item.term.toLowerCase();
        if (existingMap.has(key)) {
          // Merge meanings if not already present
          const exist = existingMap.get(key);
          const mergedMeanings = [...(exist.meanings || [])];
          (item.meanings || []).forEach(im => {
            if (!mergedMeanings.some(em => em.vietnamese === im.vietnamese)) {
              mergedMeanings.push(im);
            }
          });
          existingMap.set(key, { ...exist, meanings: mergedMeanings });
        } else {
          existingMap.set(key, item);
        }
      });
      result = Array.from(existingMap.values());
    }

    saveNotes(result);
    return { success: true, count: incomingNotes.length, result };
  } catch (err) {
    return { success: false, error: 'Lỗi đọc tệp JSON: ' + err.message };
  }
}
