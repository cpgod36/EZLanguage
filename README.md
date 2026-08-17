# 📘 EZLanguage — Personal Smart English Notebook & Flashcard Companion

<p align="center">
  <img src="public/icons/icon-192.png" width="96" height="96" alt="EZLanguage Logo" style="border-radius: 22px; box-shadow: 0 10px 25px rgba(79, 70, 229, 0.25);" />
</p>

<p align="center">
  <strong>A premium, offline-first Progressive Web App (PWA) tailored specifically for personal English vocabulary curation, active recall, and spaced learning on iOS and modern browsers.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React 18" />
  <img src="https://img.shields.io/badge/Vite-6.1-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Firebase-Auth%20%26%20Firestore-FFCA28?style=flat-square&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?style=flat-square&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/iOS-Tuned%20for%20iPhone-000000?style=flat-square&logo=apple&logoColor=white" alt="iOS" />
  <img src="https://img.shields.io/badge/Design-Vanilla%20CSS%20Design%20System-4F46E5?style=flat-square" alt="CSS" />
</p>

---

## 🎯 About The Project

**EZLanguage** is a bespoke, **personal-use language learning tool** built to eliminate the noise and friction of generic dictionary apps. It acts as an intelligent digital pocket notebook where I curate, organize, and practice English vocabulary, phrasal verbs, idioms, collocations, grammar patterns, and common mistakes.

Crafted with a **Local-First, Cloud-Synced** philosophy, it delivers a lightning-fast native app experience on iPhone (PWA Standalone) with real-time cloud backup, audio pronunciation, multi-engine lookup, and 3D flashcards.

---

## ✨ Core Features

### 🔍 1. Multi-Engine Quick Lookup (Tra Nhanh Đa Luồng)
- **Parallel Querying**: Simultaneously leverages Google Translate GTX, Free Dictionary (Oxford API), and Datamuse.
- **100% Coverage**: Look up single words, complex phrasal verbs, idioms, or full sentences.
- **Auto-Population**: Fetches accurate Vietnamese translations, phonetic IPA, native audio pronunciation (MP3 / SpeechSynthesis fallback), English definitions, and contextual examples with 1 click.

### 📂 2. Structured Folder Hubs & Concept Guide
- Categorize notes into 5 dedicated knowledge hubs:
  - 📖 **Vocabulary** (Single words)
  - 🧩 **Phrasal Verb** (Verb + Particle combinations)
  - 🌟 **Collocation & Idiom** (Natural word pairings and figurative expressions)
  - 💬 **Sentence Pattern** (Grammar structures and conversational templates)
  - 💡 **Mistake & Tip** (Common pitfalls, confusing pairs, and pro tips)
- **Interactive Concept Explainer `(i)`**: Modal providing definitions, formulas, real-world examples, and memory tricks for each category.
- **Today's Notes Hero**: Highlights cards created today using local timezone precision.

### 🔤 3. 4-Way Sorting & Alphabetical Jump Bar
- Seamless sorting via 4 quick chips: **Newest**, **Oldest**, **A → Z**, and **Z → A**.
- Grouped alphabetical view with a vertical **Alphabet Jump Bar** for rapid scrubbing.

### 🃏 4. 3D Active Recall Flashcards
- Dedicated study decks for **All Notes**, **Starred Notes**, **Needs Review**, and each category folder.
- Smooth 3D card flip animation with interactive mastery evaluation (*"Remembered"* vs *"Forgot"*).
- Instant review stats, percentage accuracy, and gamified **confetti celebration bursts**.

### 📜 5. Card Timestamps & Activity Timeline
- Detailed creation timestamp on every note card (`Added: HH:mm, DD/MM/YYYY`).
- Interactive **History Modal** logging total reviews, mastery level, star toggles, and edit events.

### 🔒 6. Real-Time Cloud Sync & Email Verification
- Google OAuth and Email/Password authentication powered by **Firebase**.
- **Security-First Email Verification**: Frosted glass verification screen with one-tap copy, 60s cooldown timer, live signal reload, and full spam protection.
- Instant, multi-device **Firestore sync** with offline fallback.

### 📱 7. Apple-Grade iOS PWA Optimization
- **Pixel-Perfect for iPhone 14/15**: Optimized for 390px logical viewport and Safe Area Insets (Notch & Home Bar).
- **Anti-Zoom Lock**: Inputs strictly sized at 16px to eliminate unwanted Safari viewport shifting.
- **Center Elevated Action Button (FAB)**: Floating dock center `+` button with breathing aura pulse and 180° rotational micro-interaction.
- **Strict Vector SVG Standard**: 100% vector icons powered by Lucide React and `Be Vietnam Pro` Vietnamese diacritics typography.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) + [Vite 6](https://vitejs.dev/) |
| **Styling & Design System** | Vanilla CSS (Pastel Light / Frosted Glassmorphism / Mobile-First) |
| **Authentication & Database** | [Google Firebase](https://firebase.google.com/) (Auth + Cloud Firestore) |
| **Icons & Visuals** | [Lucide React](https://lucide.dev/) (Strict Vector SVGs) |
| **Effects & Celebrations** | [Canvas Confetti](https://github.com/catdad/canvas-confetti) |
| **PWA & Offline Storage** | Service Worker + Web App Manifest + `localStorage` fallback |
| **Hosting & Deployment** | [Vercel](https://vercel.com/) |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/cpgod36/EZLanguage.git
   cd EZLanguage
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev -- --host
   ```
   - Local: `http://localhost:5173`
   - Mobile (Same Wi-Fi network): `http://<YOUR_LOCAL_IP>:5173`

4. **Build for production**:
   ```bash
   npm run build
   ```

---

## 📲 Installing as an iOS App (PWA)

1. Open **Safari** on your iPhone and navigate to your deployed URL.
2. Tap the **Share** button (the square with an upward arrow) at the bottom toolbar.
3. Scroll down and tap **Add to Home Screen** (*Thêm vào MH chính*).
4. Tap **Add**. The app will now launch full-screen without Safari browser address bars!

---

## 👤 Author

* **Cao Phan** ([@cpgod36](https://github.com/cpgod36))
* *Personal Project — Built with care for daily English mastery.*

---

<p align="center">
  <sub>Made with ❤️ for personal productivity and continuous learning.</sub>
</p>
