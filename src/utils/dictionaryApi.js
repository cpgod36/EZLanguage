/**
 * Free Dictionary API integration for EZLanguage
 * Fetches IPA, audio, meanings, part of speech, examples and synonyms
 */
export async function lookupWord(word) {
  if (!word || !word.trim()) {
    return { success: false, error: 'Vui lòng nhập từ cần tra' };
  }

  const cleanWord = word.trim().toLowerCase();
  
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Không tìm thấy từ này trong từ điển. Bạn có thể tự nhập tay nhé!' };
      }
      return { success: false, error: `Lỗi kết nối từ điển (${response.status})` };
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return { success: false, error: 'Không có dữ liệu trả về' };
    }

    const entry = data[0];
    
    // Find best phonetic IPA
    let ipa = entry.phonetic || '';
    let audioUrl = '';
    
    if (entry.phonetics && entry.phonetics.length > 0) {
      // Find phonetic with text and audio
      const withAudio = entry.phonetics.find(p => p.audio && p.audio.length > 0);
      if (withAudio) {
        audioUrl = withAudio.audio;
      }
      const withText = entry.phonetics.find(p => p.text);
      if (withText && !ipa) {
        ipa = withText.text;
      }
    }

    // Extract meanings, examples, synonyms
    const meaningsList = [];
    let primaryExample = '';
    let primaryPartOfSpeech = 'word';
    const allSynonyms = new Set();

    if (entry.meanings && Array.isArray(entry.meanings)) {
      entry.meanings.forEach(m => {
        const pos = m.partOfSpeech || 'general';
        const defs = m.definitions || [];
        
        defs.forEach(d => {
          if (d.definition) {
            meaningsList.push({
              partOfSpeech: pos,
              definition: d.definition,
              example: d.example || ''
            });

            if (!primaryExample && d.example) {
              primaryExample = d.example;
            }
          }
          if (d.synonyms && Array.isArray(d.synonyms)) {
            d.synonyms.forEach(s => allSynonyms.add(s));
          }
        });

        if (m.synonyms && Array.isArray(m.synonyms)) {
          m.synonyms.forEach(s => allSynonyms.add(s));
        }
      });

      if (entry.meanings[0]?.partOfSpeech) {
        primaryPartOfSpeech = entry.meanings[0].partOfSpeech;
      }
    }

    return {
      success: true,
      data: {
        term: entry.word || cleanWord,
        ipa: ipa || '',
        audioUrl: audioUrl || '',
        partOfSpeech: primaryPartOfSpeech,
        example: primaryExample || (meaningsList[0]?.example || ''),
        englishDefinitions: meaningsList.slice(0, 3),
        synonyms: Array.from(allSynonyms).slice(0, 5)
      }
    };
  } catch (err) {
    console.error('Dictionary API lookup error:', err);
    return { success: false, error: 'Không thể kết nối mạng tới từ điển. Vui lòng thử lại sau.' };
  }
}
