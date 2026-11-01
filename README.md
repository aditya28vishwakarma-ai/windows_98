# 🖥️ Windows 98 Web Experience (VERMA-PC)

> *"If you are reading this, you found the Verma family computer. Please do not delete anything. Especially Minesweeper."* — Papa (Anil Verma)

A pixel-perfect, nostalgic recreation of Windows 98 built with modern web technologies, packed with authentic UI/UX, retro sound synthesizers, CRT monitor shaders, interactive apps, and 30+ delightful Easter eggs.

---

## ✨ Features & Enhancements

### 🪟 Authentic Windows 98 Desktop & Shell
- **Dynamic Window Chrome**: True active/inactive gradient title bars, window minimizing, maximizing, restoring, dragging, and resizing with authentic Windows 98 bevels.
- **Rubber-band Selection Box**: Classic translucent blue selection box with dotted borders when dragging across the desktop.
- **Custom Display Properties**: Right-click desktop &rarr; Properties to customize wallpapers (*Classic Teal, Windows 98 Clouds, Navy Blue, MS-DOS Setup Blue, Pitch Black*) and toggle visual effects.
- **CRT Monitor Scanline Filter**: Optional cathode ray tube filter featuring realistic scanlines, phosphor glow, curvature vignette, and retro tint.
- **Desktop Context Menu**: Arrange icons, refresh, create new folders, open display properties, and "Undo Delete Everything".
- **Authentic Modal Dialogs**: Custom pixel-perfect Windows 98 message boxes with authentic sound effects replacing standard modern browser popups.

### 🔊 16-Bit Web Audio Sound Synthesizer (Zero External Files)
- Pure Web Audio API synthesized sound effects:
  - **Windows 98 Startup Chord**: Shimmering ambient startup chime.
  - **Chord / Critical Stop**: Classic Sound Blaster style warning tone.
  - **Asterisk / Ding**: Bell ding on achievements and hints.
  - **Click Ticks**: Authentic mechanical mouse click sounds.
  - **Mine Explosion**: Filtered white-noise burst for Minesweeper.
  - **Recycle Crumple**: Paper crumple effect when emptying trash.
- **Taskbar Volume Tray**: Click the speaker icon to open the authentic vertical volume slider and mute toggle.

### 📦 Applications Included
1. **Internet Explorer 5**:
   - Simulated 56k dial-up connection sequence with authentic modem status.
   - Fully browsable retro web pages: *Googol Search, GeoCities (Chintu's homepage with guestbook), Bhilai Steel Plant, IIT Bhilai (1998 preview), Hotmailer, Yahu!, AskJeeves, Y2K Survival Guide, Latent Hackathon*.
2. **Outlook Express**:
   - 3-pane email client seeded with Verma family lore (Dadaji, Mummy's secret Dal Makhani recipe, Sharmaji's chain emails, Nigerian Prince, and the ILOVEYOU virus).
3. **Minesweeper**:
   - Classic 9×9 beginner board with animated face button, 7-segment LED counters, flags, sound effects, and win/loss animations.
4. **Solitaire (Klondike)**:
   - Full drag/click Klondike card game with stock, waste, 4 foundation piles, 7 tableau columns, and victory celebration.
5. **MS Paint**:
   - Drawing canvas with pencil, eraser, flood fill (bucket), color picker, lines, rectangles, ellipses, brush size selection, and 32-color Windows 98 palette.
6. **Notepad**:
   - Functional text editor with Word Wrap, Save / Save As to the Virtual File System, dirty state tracking, and hidden judge easter eggs.
7. **MS-DOS Prompt**:
   - Interactive command-line supporting `DIR`, `DIR /A`, `CLS`, `VER`, `FORMAT C:`, `CHINTU`, `HACK IITBHILAI`, `LATENT`, and command history (`↑` / `↓`).
8. **Calculator**:
   - Classic standard calculator with memory registers (MC, MR, MS, M+), square root, percentage, reciprocal, and easter eggs.
9. **My Computer (Explorer)**:
   - Drive navigation (`C:`, `D:`, `A:` Floppy), folder tree, file execution, and seeded virtual file system.
10. **Run... Dialog**:
    - Launch any app or command directly via the classic Run dialog.

---

## 🛠️ Tech Stack

- **React 19**
- **TypeScript**
- **Vite 8**
- **Zustand** (Window management, achievements, themes, dialogs)
- **98.css** + Custom Retro Bevel Styles
- **Web Audio API** (Procedural retro audio synthesis)
- **HTML5 Canvas** (Paint, Starfield screensaver, Minesweeper, CRT overlays)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/aditya28vishwakarma-ai/windows_98.git

# Navigate into the project directory
cd windows_98

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

---

## 📜 License

MIT License. Created for the Gandhi Hackathon / OpenLake × Meraz event.
No Microsoft assets or proprietary files were used. CC0 icons and custom synthesized audio.
