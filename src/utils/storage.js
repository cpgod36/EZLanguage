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
    label: 'Từ vựng',
    englishLabel: 'Word',
    colorKey: 'mint',
    badgeClass: 'badge-mint',
    iconName: 'BookA',
    placeholder: 'e.g. articulate, versatile, resilient'
  },
  phrasal_verb: {
    id: 'phrasal_verb',
    label: 'Cụm động từ',
    englishLabel: 'Phrasal Verb',
    colorKey: 'sky',
    badgeClass: 'badge-sky',
    iconName: 'Layers',
    placeholder: 'e.g. come up with, call off, figure out'
  },
  collocation_idiom: {
    id: 'collocation_idiom',
    label: 'Cụm từ & Thành ngữ',
    englishLabel: 'Collocation & Idiom',
    colorKey: 'honey',
    badgeClass: 'badge-honey',
    iconName: 'Sparkles',
    placeholder: 'e.g. heavy rain, break the ice, under the weather'
  },
  sentence_pattern: {
    id: 'sentence_pattern',
    label: 'Mẫu câu & Ngữ pháp',
    englishLabel: 'Pattern',
    colorKey: 'lavender',
    badgeClass: 'badge-lavender',
    iconName: 'MessageSquareText',
    placeholder: "e.g. It's high time + S + V-past, How come...?"
  },
  mistake_tip: {
    id: 'mistake_tip',
    label: 'Lỗi hay sai & Mẹo nhớ',
    englishLabel: 'Tip & Mistake',
    colorKey: 'coral',
    badgeClass: 'badge-coral',
    iconName: 'AlertCircle',
    placeholder: 'e.g. affect vs effect, I agree (not I am agree)'
  }
};

export const INITIAL_SAMPLE_NOTES = [
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

export function findExistingNoteByTerm(term, notes) {
  if (!term || !term.trim()) return null;
  const clean = term.trim().toLowerCase();
  return notes.find(n => n.term.trim().toLowerCase() === clean);
}

export function addOrUpdateNote(noteData, notes) {
  const now = new Date().toISOString();
  let updatedList;
  
  if (noteData.id) {
    // Updating existing note
    updatedList = notes.map(n => n.id === noteData.id ? { ...noteData, updatedAt: now } : n);
  } else {
    // Create new
    const newNote = {
      ...noteData,
      id: 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      masteryLevel: noteData.masteryLevel || 'new',
      isStarred: noteData.isStarred || false,
      lastReviewedAt: null
    };
    updatedList = [newNote, ...notes];
  }

  saveNotes(updatedList);
  return updatedList;
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
