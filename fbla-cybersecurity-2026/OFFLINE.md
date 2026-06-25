# FBLA Cybersecurity Study App — Offline Setup

## Quick Start (No WiFi Needed After Initial Setup)

### Prerequisites
- **Node.js** (v18+): [nodejs.org](https://nodejs.org) — download the LTS installer
- **Git**: [git-scm.com](https://git-scm.com)

### One-Time Setup (Do this BEFORE the plane, while you have WiFi)

```bash
# 1. Clone the repo
git clone https://github.com/tundra-node/tundra-node.github.io.git
cd tundra-node.github.io/fbla-cybersecurity-2026

# 2. Install dependencies
npm install

# 3. Build for production (generates static files in dist/)
npm run build
```

### Running Locally (Offline, No WiFi Needed)

#### Option A: Simple HTTP Server (Easiest)
```bash
# From the fbla-cybersecurity-2026 directory:
npx serve dist
```
Then open `http://localhost:3000` in your browser.

#### Option B: Vite Dev Server (Hot reload)
```bash
# From the fbla-cybersecurity-2026 directory:
npm run dev
```
Then open `http://localhost:5173` in your browser.

#### Option C: Python (If Node isn't available)
```bash
cd dist
python3 -m http.server 3000
```
Then open `http://localhost:3000`.

#### Option D: Just open the HTML file
```bash
# macOS
open dist/index.html

# Linux
xdg-open dist/index.html

# Windows
start dist/index.html
```
Note: Option D may have issues with some browsers due to CORS. Option A or B is recommended.

### Project Structure
```
fbla-cybersecurity-2026/
├── src/
│   ├── App.tsx          # Main app component (quiz, flashcards, progress)
│   ├── data.ts          # 523 questions + 144 flashcards
│   ├── main.tsx         # Entry point
│   └── lib/utils.ts     # Utility functions
├── dist/                # Built static files (after npm run build)
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Available Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Build production files to dist/ |
| `npm run preview` | Preview production build locally |

### How to Use (Offline)
1. **Quiz Mode**: Take 100-question mock exams (50 min), speed quizzes (10q/3min), or cram on wrong answers
2. **Flashcards**: Flip through cards, mark "Got It" or "Still Learning"
3. **Reference Sheet**: Full cheat sheet covering all 6 knowledge areas
4. **Progress Tracker**: See accuracy by category, session history, streak counter

### Troubleshooting
- **Blank page?** Make sure you ran `npm run build` first (for Option A/C/D)
- **Port already in use?** Change the port: `npx serve dist -l 8080`
- **Stale data?** Your progress is saved in browser localStorage — it persists between sessions

### Pre-Flight Checklist
- [ ] Clone repo
- [ ] `npm install`
- [ ] `npm run build`
- [ ] Test that `npx serve dist` works and you can open in browser
- [ ] Bookmark the local URL (http://localhost:3000)
- [ ] You're good to go offline! ✈️
