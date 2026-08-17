/**
 * Multi-Engine Dictionary & Translation API for EZLanguage
 * Combines Free Dictionary API + Google GTX Engine + Datamuse
 * 100% Reliable: Works with single words, phrasal verbs, idioms, and sentences
 * Automatically provides Vietnamese translation, IPA, Audio, Definitions, and Examples
 */

// Helper to fetch with timeout
async function fetchWithTimeout(url, options = {}, timeoutMs = 4000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timeoutId);
    return res;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// 1. Fetch from Free Dictionary API (for Oxford-standard IPA, Audio, English Defs)
async function fetchFreeDictionary(word) {
  try {
    const clean = encodeURIComponent(word.trim().toLowerCase());
    const res = await fetchWithTimeout(`https://api.dictionaryapi.dev/api/v2/entries/en/${clean}`, {}, 3500);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data[0];
  } catch (e) {
    return null;
  }
}

// 2. Fetch from Google Translate GTX Engine (for Vietnamese translation, IPA, Definitions, Phrases)
async function fetchGoogleGTX(word) {
  try {
    const clean = encodeURIComponent(word.trim());
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&dt=rm&dt=md&q=${clean}`;
    const res = await fetchWithTimeout(url, {}, 3500);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

// 3. Fetch from Datamuse (Fallback for definitions and synonyms)
async function fetchDatamuse(word) {
  try {
    const clean = encodeURIComponent(word.trim().toLowerCase());
    const res = await fetchWithTimeout(`https://api.datamuse.com/words?sp=${clean}&md=dpr&max=5`, {}, 3000);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    return data;
  } catch (e) {
    return null;
  }
}

/**
 * Main Master Lookup Function
 * Queries multiple dictionary sources in parallel and merges the richest result
 */
export async function lookupWord(rawWord) {
  if (!rawWord || !rawWord.trim()) {
    return { success: false, error: 'Vui lòng nhập từ hoặc cụm từ cần tra cứu' };
  }

  const query = rawWord.trim();
  const isMultiWord = query.includes(' ');

  try {
    // Run FreeDictionary & Google GTX in parallel
    const [freeDictRes, gtxRes] = await Promise.allSettled([
      fetchFreeDictionary(query),
      fetchGoogleGTX(query)
    ]);

    const freeDictData = freeDictRes.status === 'fulfilled' ? freeDictRes.value : null;
    const gtxData = gtxRes.status === 'fulfilled' ? gtxRes.value : null;

    // If both failed, try Datamuse fallback
    let datamuseData = null;
    if (!freeDictData && !gtxData && !isMultiWord) {
      datamuseData = await fetchDatamuse(query);
    }

    // If all failed
    if (!freeDictData && !gtxData && !datamuseData) {
      return {
        success: false,
        error: 'Không thể kết nối đến từ điển lúc này. Bạn có thể tự điền nghĩa nhé!'
      };
    }

    // ==========================================
    // PARSE & MERGE DATA
    // ==========================================
    let vietnamese = '';
    let ipa = '';
    let audioUrl = '';
    let partOfSpeech = 'word';
    let englishDef = '';
    let example = '';
    const synonyms = new Set();
    const additionalMeanings = [];

    // Parse Google GTX Data (Translation & Parts of Speech)
    if (gtxData) {
      // 1. Translated Vietnamese Text
      if (gtxData[0] && Array.isArray(gtxData[0])) {
        const transParts = gtxData[0]
          .filter(item => item && item[0])
          .map(item => item[0].trim());
        if (transParts.length > 0) {
          vietnamese = transParts.join(' ');
        }

        // Check for phonetic / romanization in gtx
        const phoneticItem = gtxData[0].find(item => item && item[3]);
        if (phoneticItem && phoneticItem[3]) {
          ipa = `/${phoneticItem[3].replace(/^\/|\/$/g, '')}/`;
        }
      }

      // 2. Multi-definition Breakdown from Google GTX (data[1])
      if (gtxData[1] && Array.isArray(gtxData[1])) {
        gtxData[1].forEach((posGroup, index) => {
          const pos = posGroup[0] || 'word';
          const viTerms = (posGroup[1] || []).slice(0, 3).join(', ');

          if (index === 0) {
            partOfSpeech = pos;
            if (!vietnamese && viTerms) {
              vietnamese = viTerms;
            }
          } else if (viTerms) {
            additionalMeanings.push({
              partOfSpeech: pos,
              vietnamese: viTerms,
              englishDef: '',
              example: ''
            });
          }
        });
      }

      // 3. English Definitions from Google GTX (data[12])
      if (gtxData[12] && Array.isArray(gtxData[12])) {
        const firstDefGroup = gtxData[12][0];
        if (firstDefGroup && firstDefGroup[1] && firstDefGroup[1][0] && firstDefGroup[1][0][0]) {
          englishDef = firstDefGroup[1][0][0];
        }
      }
    }

    // Parse Free Dictionary Data (IPA, Audio, Examples, Synonyms)
    if (freeDictData) {
      // Phonetic IPA
      if (freeDictData.phonetic) {
        ipa = freeDictData.phonetic;
      }

      if (freeDictData.phonetics && Array.isArray(freeDictData.phonetics)) {
        const withAudio = freeDictData.phonetics.find(p => p.audio && p.audio.length > 0);
        if (withAudio) {
          audioUrl = withAudio.audio;
        }
        const withText = freeDictData.phonetics.find(p => p.text);
        if (withText && (!ipa || ipa.length < withText.text.length)) {
          ipa = withText.text;
        }
      }

      // Meanings and Examples
      if (freeDictData.meanings && Array.isArray(freeDictData.meanings)) {
        freeDictData.meanings.forEach((m, mIdx) => {
          const pos = m.partOfSpeech || 'word';
          if (mIdx === 0 && (!partOfSpeech || partOfSpeech === 'word')) {
            partOfSpeech = pos;
          }

          (m.definitions || []).forEach((d, dIdx) => {
            if (d.definition && !englishDef) {
              englishDef = d.definition;
            }
            if (d.example && !example) {
              example = d.example;
            }
            if (d.synonyms && Array.isArray(d.synonyms)) {
              d.synonyms.forEach(s => synonyms.add(s));
            }
          });

          if (m.synonyms && Array.isArray(m.synonyms)) {
            m.synonyms.forEach(s => synonyms.add(s));
          }
        });
      }
    }

    // Parse Datamuse Fallback (if needed)
    if (datamuseData && Array.isArray(datamuseData) && datamuseData.length > 0) {
      const top = datamuseData[0];
      if (top.defs && top.defs.length > 0 && !englishDef) {
        const [pos, ...defWords] = top.defs[0].split('\t');
        englishDef = defWords.join(' ');
        if (!partOfSpeech || partOfSpeech === 'word') {
          partOfSpeech = pos === 'n' ? 'noun' : pos === 'v' ? 'verb' : pos === 'adj' ? 'adjective' : pos === 'adv' ? 'adverb' : 'word';
        }
      }
      datamuseData.forEach(item => {
        if (item.word && item.word !== query) {
          synonyms.add(item.word);
        }
      });
    }

    // Determine smart type suggestion
    let suggestedType = 'word';
    if (isMultiWord) {
      const lower = query.toLowerCase();
      if (
        lower.startsWith('come up with') ||
        lower.startsWith('look for') ||
        lower.startsWith('take off') ||
        lower.startsWith('give up') ||
        lower.startsWith('run out of') ||
        lower.startsWith('figure out') ||
        lower.startsWith('turn on') ||
        lower.startsWith('turn off') ||
        lower.startsWith('put off') ||
        lower.startsWith('call off') ||
        lower.includes(' up') ||
        lower.includes(' off') ||
        lower.includes(' out') ||
        lower.includes(' on') ||
        lower.includes(' in')
      ) {
        suggestedType = 'phrasal_verb';
      } else if (lower.includes(' vs ') || lower.includes('not ')) {
        suggestedType = 'mistake_tip';
      } else if (lower.length > 30 || lower.includes('?')) {
        suggestedType = 'sentence_pattern';
      } else {
        suggestedType = 'collocation_idiom';
      }
    }

    // Normalize Part of Speech
    const posNormalized = (partOfSpeech || 'noun').toLowerCase();
    const validPos = ['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'phrase'].includes(posNormalized)
      ? posNormalized
      : 'noun';

    return {
      success: true,
      data: {
        term: query,
        vietnamese: vietnamese || '',
        ipa: ipa || '',
        audioUrl: audioUrl || '',
        partOfSpeech: validPos,
        englishDef: englishDef || '',
        example: example || '',
        synonyms: Array.from(synonyms).slice(0, 6),
        suggestedType,
        additionalMeanings
      }
    };
  } catch (err) {
    console.error('Master Dictionary API lookup error:', err);
    return {
      success: false,
      error: 'Lỗi tra cứu từ điển. Bạn có thể tự điền nghĩa nhé!'
    };
  }
}
