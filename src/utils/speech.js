/**
 * Speech synthesis utility for native pronunciation playback
 */
let currentAudio = null;

export function playPronunciation(text, audioUrl = null, options = {}) {
  // If there is an external audio URL from dictionary API, try playing that first
  if (audioUrl) {
    try {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      currentAudio = new Audio(audioUrl);
      currentAudio.play().catch(e => {
        console.warn('Audio URL playback failed, falling back to Web Speech:', e);
        speakWithBrowser(text, options);
      });
      return;
    } catch (e) {
      console.warn('Audio constructor failed, fallback to Web Speech:', e);
    }
  }

  speakWithBrowser(text, options);
}

function speakWithBrowser(text, options = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported on this browser');
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const lang = options.lang || localStorage.getItem('ez_voice_lang') || 'en-US';
  utterance.lang = lang;
  utterance.rate = parseFloat(options.rate || localStorage.getItem('ez_voice_rate') || '0.9');
  utterance.pitch = 1.0;

  // Try to find a native voice matching the language
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) {
    const matchedVoice = voices.find(v => v.lang.startsWith(lang.split('-')[0]) && (v.name.includes('Natural') || v.name.includes('Siri') || v.name.includes('Google') || v.name.includes('Samantha') || v.default));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }
  }

  window.speechSynthesis.speak(utterance);
}

// Pre-load voices if possible
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
